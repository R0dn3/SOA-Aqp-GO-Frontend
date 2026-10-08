//app/api/soap/reservar-y-pagar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function escapeXml(value: string | undefined | null): string {
    if (!value) return "";
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

export async function POST(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // ID de correlación: viaja BFF -> backend y vuelve al navegador
    const correlationId = randomUUID();
    const corrHeaders = { "X-Correlation-Id": correlationId };

    // 1. Resolver el usuarioId (mismo patrón que crear-reserva)
    const perfilRes = await fetch(`${API_URL}/api/usuarios/perfil`, {
        headers: { Authorization: authHeader },
        cache: "no-store",
    });
    if (!perfilRes.ok) {
        return NextResponse.json(
            { error: "No se pudo verificar el usuario" },
            { status: perfilRes.status, headers: corrHeaders }
        );
    }
    const perfil = await perfilRes.json();
    const usuarioId = perfil.id;

    // 2. Leer los datos de la reserva + del pago, todo en un solo body
    const data = await request.json();
    const {
        paqueteId,
        fechaSalida,
        numPersonas,
        acompanantes = [],
        monto,
        metodo,
        referencia,
    } = data;

    // 3. Bloque de acompañantes: el wrapper <orq:acompanante> va en el
    //    namespace del orquestador, pero sus campos internos reusan el tipo
    //    acompananteItem importado de reserva.xsd, en namespace "res".
    const acompanantesXml = acompanantes
        .map(
            (a: any) => `
      <orq:acompanante>
         <res:nombreCompleto>${escapeXml(a.nombreCompleto)}</res:nombreCompleto>
         <res:dniPasaporte>${escapeXml(a.dniPasaporte)}</res:dniPasaporte>
         <res:pais>${escapeXml(a.pais)}</res:pais>
         <res:fechaNacimiento>${escapeXml(a.fechaNacimiento)}</res:fechaNacimiento>
         <res:genero>${escapeXml(a.genero)}</res:genero>
         <res:datosAdicionales>${escapeXml(a.datosAdicionales)}</res:datosAdicionales>
      </orq:acompanante>`
        )
        .join("");

    const envelope = `<?xml version="1.0"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                   xmlns:orq="http://aqpgo.com/orquestador"
                   xmlns:res="http://aqpgo.com/reservas">
   <soapenv:Header/>
   <soapenv:Body>
      <orq:reservarYPagarRequest>
         <orq:usuarioId>${usuarioId}</orq:usuarioId>
         <orq:paqueteId>${escapeXml(paqueteId)}</orq:paqueteId>
         <orq:fechaSalida>${escapeXml(fechaSalida)}</orq:fechaSalida>
         <orq:numPersonas>${numPersonas}</orq:numPersonas>${acompanantesXml}
         <orq:monto>${monto}</orq:monto>
         <orq:metodo>${escapeXml(metodo)}</orq:metodo>
         <orq:referencia>${escapeXml(referencia)}</orq:referencia>
      </orq:reservarYPagarRequest>
   </soapenv:Body>
</soapenv:Envelope>`;

    console.log(`\n🔗 [BFF] correlationId=${correlationId}`);
    console.log("📤 SOAP REQUEST (reservarYPagar) enviado al backend:\n" + envelope + "\n");

    // 4. Mandarlo al servicio SOAP del orquestador, con identidad (JWT) y correlación
    const soapRes = await fetch(`${API_URL}/ws`, {
        method: "POST",
        headers: {
            "Content-Type": "text/xml",
            Authorization: authHeader,
            "X-Correlation-Id": correlationId,
        },
        body: envelope,
        cache: "no-store",
    });

    const xmlText = await soapRes.text();
    console.log("📥 SOAP RESPONSE (reservarYPagar) recibido del backend:\n" + xmlText + "\n");

    // 5. Traducir XML -> JSON
    const parser = new XMLParser({ removeNSPrefix: true });
    const parsed = parser.parse(xmlText);
    const body = parsed?.Envelope?.Body;

    if (body?.Fault) {
        return NextResponse.json(
            { error: body.Fault.faultstring || "No se pudo procesar la reserva y el pago" },
            { status: 500, headers: corrHeaders }
        );
    }

    const r = body?.reservarYPagarResponse;
    if (!r) {
        return NextResponse.json(
            { error: "Respuesta SOAP inesperada del backend" },
            { status: 502, headers: corrHeaders }
        );
    }

    return NextResponse.json(
        {
            reservaId: r.reservaId,
            estadoReserva: r.estadoReserva,
            pagoId: r.pagoId,
            estadoPago: r.estadoPago,
            mensaje: r.mensaje,
        },
        { headers: corrHeaders }
    );
}
import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

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

    // 1. Resolver el usuarioId (mismo patrón que mis-reservas)
    const perfilRes = await fetch(`${API_URL}/api/usuarios/perfil`, {
        headers: { Authorization: authHeader },
        cache: "no-store",
    });
    if (!perfilRes.ok) {
        return NextResponse.json({ error: "No se pudo verificar el usuario" }, { status: perfilRes.status });
    }
    const perfil = await perfilRes.json();
    const usuarioId = perfil.id;

    // 2. Leer los datos que mandó el formulario
    const data = await request.json();
    const { paqueteId, fechaSalida, numPersonas, acompanantes = [] } = data;

    // 3. Armar el bloque XML de acompañantes (repetible)
    const acompanantesXml = acompanantes
        .map(
            (a: any) => `
      <res:acompanante>
         <res:nombreCompleto>${escapeXml(a.nombreCompleto)}</res:nombreCompleto>
         <res:dniPasaporte>${escapeXml(a.dniPasaporte)}</res:dniPasaporte>
         <res:pais>${escapeXml(a.pais)}</res:pais>
         <res:fechaNacimiento>${escapeXml(a.fechaNacimiento)}</res:fechaNacimiento>
         <res:genero>${escapeXml(a.genero)}</res:genero>
         <res:datosAdicionales>${escapeXml(a.datosAdicionales)}</res:datosAdicionales>
      </res:acompanante>`
        )
        .join("");

    const envelope = `<?xml version="1.0"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:res="http://aqpgo.com/reservas">
   <soapenv:Header/>
   <soapenv:Body>
      <res:crearReservaRequest>
         <res:usuarioId>${usuarioId}</res:usuarioId>
         <res:paqueteId>${escapeXml(paqueteId)}</res:paqueteId>
         <res:fechaSalida>${escapeXml(fechaSalida)}</res:fechaSalida>
         <res:numPersonas>${numPersonas}</res:numPersonas>${acompanantesXml}
      </res:crearReservaRequest>
   </soapenv:Body>
</soapenv:Envelope>`;

    console.log("\n📤 SOAP REQUEST (crearReserva) enviado al backend:\n" + envelope + "\n");

    // 4. Mandarlo al servicio SOAP
    const soapRes = await fetch(`${API_URL}/ws`, {
        method: "POST",
        headers: { "Content-Type": "text/xml" },
        body: envelope,
        cache: "no-store",
    });

    const xmlText = await soapRes.text();
    console.log("📥 SOAP RESPONSE (crearReserva) recibido del backend:\n" + xmlText + "\n");

    // 5. Traducir XML -> JSON
    const parser = new XMLParser({ removeNSPrefix: true });
    const parsed = parser.parse(xmlText);
    const body = parsed?.Envelope?.Body;

    if (body?.Fault) {
        return NextResponse.json({ error: body.Fault.faultstring || "No se pudo crear la reserva" }, { status: 500 });
    }

    const r = body?.crearReservaResponse;

    return NextResponse.json({
        id: r.id,
        paqueteNombre: r.paqueteNombre,
        fechaSalida: r.fechaSalida,
        numPersonas: Number(r.numPersonas),
        precioTotal: Number(r.precioTotal),
        estado: r.estado,
    });
}
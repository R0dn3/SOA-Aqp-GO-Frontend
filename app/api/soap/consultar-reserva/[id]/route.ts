import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

export const dynamic = "force-dynamic";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Definimos el tipo de params como una Promesa según el estándar de Next.js 15+
interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    // CORRECCIÓN: Desempaquetamos la promesa 'params' usando await antes de usar 'id'
    const { id } = await params;

    const envelope = `<?xml version="1.0"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:res="http://aqpgo.com/reservas">
   <soapenv:Header/>
   <soapenv:Body>
      <res:consultarReservaRequest>
         <res:id>${id}</res:id>
      </res:consultarReservaRequest>
   </soapenv:Body>
</soapenv:Envelope>`;

    console.log("\n📤 SOAP REQUEST (consultarReserva) enviado al backend:\n" + envelope + "\n");

    const soapRes = await fetch(`${API_URL}/ws`, {
        method: "POST",
        headers: { "Content-Type": "text/xml" },
        body: envelope,
        cache: "no-store",
    });

    const xmlText = await soapRes.text();
    console.log("📥 SOAP RESPONSE (consultarReserva) recibido del backend:\n" + xmlText + "\n");

    const parser = new XMLParser({ removeNSPrefix: true, isArray: (name) => name === "acompanante" });
    const parsed = parser.parse(xmlText);
    const body = parsed?.Envelope?.Body;

    if (body?.Fault) {
        return NextResponse.json({ error: body.Fault.faultstring || "Reserva no encontrada" }, { status: 404 });
    }

    const r = body?.consultarReservaResponse;

    if (!r) {
        return NextResponse.json({ error: "Estructura de respuesta inválida" }, { status: 500 });
    }

    return NextResponse.json({
        id: r.id,
        paqueteId: r.paqueteId,
        paqueteNombre: r.paqueteNombre,
        fotoPrincipal: r.fotoPrincipal || undefined,
        fechaSalida: r.fechaSalida,
        numPersonas: Number(r.numPersonas),
        precioTotal: Number(r.precioTotal),
        estado: r.estado,
        createdAt: r.createdAt,
        acompanantes: (r.acompanante ?? []).map((a: any) => ({
            nombreCompleto: a.nombreCompleto,
            dniPasaporte: a.dniPasaporte,
            pais: a.pais,
            fechaNacimiento: a.fechaNacimiento,
            genero: a.genero,
            datosAdicionales: a.datosAdicionales,
        })),
    });
}

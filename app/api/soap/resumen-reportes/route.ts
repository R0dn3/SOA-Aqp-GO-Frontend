import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

export const dynamic = "force-dynamic";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const token = authHeader.replace(/^Bearer\s+/i, "");

    const envelope = `<?xml version="1.0"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:res="http://aqpgo.com/reportes">
   <soapenv:Header/>
   <soapenv:Body>
      <res:resumenReportesRequest>
         <res:token>${token}</res:token>
      </res:resumenReportesRequest>
   </soapenv:Body>
</soapenv:Envelope>`;

    console.log("\n📤 SOAP REQUEST (Reportes) enviado al backend:\n" + envelope + "\n");

    const soapRes = await fetch(`${API_URL}/ws`, {
        method: "POST",
        headers: { "Content-Type": "text/xml" },
        body: envelope,
        cache: "no-store",
    });

    const xmlText = await soapRes.text();
    console.log("📥 SOAP RESPONSE (Reportes) recibido del backend:\n" + xmlText + "\n");

    const parser = new XMLParser({ removeNSPrefix: true });
    const parsed = parser.parse(xmlText);
    const body = parsed?.Envelope?.Body;

    if (body?.Fault) {
        return NextResponse.json({ error: body.Fault.faultstring || "Error en el servicio SOAP" }, { status: 403 });
    }

    const r = body?.resumenReportesResponse;

    return NextResponse.json({
        ingresosEsteMes: Number(r.ingresosEsteMes),
        totalReservas: Number(r.totalReservas),
        confirmadas: Number(r.confirmadas),
        crecimientoIngresos: Number(r.crecimientoIngresos),
        nuevosClientesMes: Number(r.nuevosClientesMes),
    });
}
import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

export const dynamic = "force-dynamic";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // 1. Preguntarle al backend REST quién es el usuario logueado (ya existe, no se toca)
    const perfilRes = await fetch(`${API_URL}/api/usuarios/perfil`, {
        headers: { Authorization: authHeader },
        cache: "no-store",
    });

    if (!perfilRes.ok) {
        return NextResponse.json({ error: "No se pudo verificar el usuario" }, { status: perfilRes.status });
    }

    const perfil = await perfilRes.json();
    const usuarioId = perfil.id;

    // 2. Armar el sobre SOAP con ese usuarioId
    const envelope = `<?xml version="1.0"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:res="http://aqpgo.com/reservas">
   <soapenv:Header/>
   <soapenv:Body>
      <res:listarReservasPorUsuarioRequest>
         <res:usuarioId>${usuarioId}</res:usuarioId>
      </res:listarReservasPorUsuarioRequest>
   </soapenv:Body>
</soapenv:Envelope>`;

    // 3. Mandarlo al servicio SOAP
    const soapRes = await fetch(`${API_URL}/ws`, {
        method: "POST",
        headers: { "Content-Type": "text/xml" },
        body: envelope,
        cache: "no-store",
    });

    const xmlText = await soapRes.text();

    // 4. Traducir XML -> JSON
    const parser = new XMLParser({
        removeNSPrefix: true,
        isArray: (name) => ["reserva", "acompanante"].includes(name),
    });
    const parsed = parser.parse(xmlText);

    const body = parsed?.Envelope?.Body;

    if (body?.Fault) {
        return NextResponse.json({ error: body.Fault.faultstring || "Error en el servicio SOAP" }, { status: 500 });
    }

    const items = body?.listarReservasPorUsuarioResponse?.reserva ?? [];

    const reservas = items.map((r: any) => ({
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
    }));

    return NextResponse.json(reservas);
}
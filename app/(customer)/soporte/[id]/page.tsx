"use client";
export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getTicketDetalle, responderTicket, TicketDetalle,
} from "@/lib/tickets";
import {
  ArrowLeft, Send, Loader2, AlertCircle,
  User, ShieldCheck,
} from "lucide-react";

const ESTADO_COLOR: Record<string, string> = {
  ABIERTO:    "bg-blue-100 text-blue-700",
  EN_PROCESO: "bg-amber-100 text-amber-700",
  RESUELTO:   "bg-emerald-100 text-emerald-700",
  CERRADO:    "bg-gray-100 text-gray-500",
};

export default function TicketChatClientePage() {
  const params   = useParams();
  const router   = useRouter();
  const id       = params.id as string;
  const bottomRef = useRef<HTMLDivElement>(null);

  const [ticket, setTicket]     = useState<TicketDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje]   = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => { cargar(); }, [id]);

  // Scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.mensajes]);

  async function cargar() {
    try {
      const data = await getTicketDetalle(id);
      setTicket(data);
    } catch {
      setError("No se pudo cargar la solicitud");
    } finally {
      setCargando(false);
    }
  }

  async function enviar() {
    if (!mensaje.trim() || !ticket) return;
    if (ticket.estado === "CERRADO") return;

    setEnviando(true);
    setError("");
    try {
      const actualizado = await responderTicket(id, mensaje);
      setTicket(actualizado);
      setMensaje("");
    } catch {
      setError("Error al enviar el mensaje");
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) return (
    <div className="flex items-center justify-center min-h-screen bg-[#f5eee6]">
      <Loader2 className="h-8 w-8 animate-spin text-[#d4663a]" />
    </div>
  );

  if (!ticket) return (
    <div className="flex items-center justify-center min-h-screen bg-[#f5eee6]">
      <p className="text-gray-500">{error || "Solicitud no encontrada"}</p>
    </div>
  );

  const cerrado = ticket.estado === "CERRADO";

  return (
    <div className="bg-[#f5eee6] min-h-screen flex flex-col">

      {/* Header fijo */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push("/soporte")}
            className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 truncate text-sm">{ticket.asunto}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ESTADO_COLOR[ticket.estado]}`}>
                {ticket.estado.replace("_", " ")}
              </span>
              {ticket.adminNombre && (
                <span className="text-xs text-gray-400">Atendido por {ticket.adminNombre}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {ticket.mensajes.map((m) => (
            <div key={m.id}
              className={`flex gap-3 ${m.esAdmin ? "flex-row" : "flex-row-reverse"}`}>

              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                m.esAdmin ? "bg-[#d4663a]" : "bg-gray-300"
              }`}>
                {m.esAdmin
                  ? <ShieldCheck className="h-4 w-4 text-white" />
                  : <User className="h-4 w-4 text-white" />}
              </div>

              {/* Burbuja */}
              <div className={`max-w-[75%] ${m.esAdmin ? "items-start" : "items-end"} flex flex-col`}>
                <span className="text-xs text-gray-400 mb-1 px-1">
                  {m.autorNombre} · {new Date(m.createdAt).toLocaleString("es-PE", {
                    dateStyle: "short", timeStyle: "short",
                  })}
                </span>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  m.esAdmin
                    ? "bg-white text-gray-800 rounded-tl-sm shadow-sm"
                    : "bg-[#d4663a] text-white rounded-tr-sm"
                }`}>
                  {m.mensaje}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input de respuesta */}
      <div className="bg-white border-t px-4 py-4 sticky bottom-0">
        <div className="max-w-3xl mx-auto">
          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1 mb-2">
              <AlertCircle className="h-3 w-3" /> {error}
            </p>
          )}

          {cerrado ? (
            <p className="text-center text-sm text-gray-400 py-2">
              Esta solicitud está cerrada
            </p>
          ) : (
            <div className="flex gap-2">
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    enviar();
                  }
                }}
                placeholder="Escribe tu mensaje... (Enter para enviar)"
                rows={2}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#d4663a]/30 focus:border-[#d4663a]"
              />
              <button onClick={enviar} disabled={enviando || !mensaje.trim()}
                className="px-4 bg-[#d4663a] hover:bg-[#b8532e] disabled:opacity-40 text-white rounded-xl transition-all flex items-center justify-center">
                {enviando
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Send className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
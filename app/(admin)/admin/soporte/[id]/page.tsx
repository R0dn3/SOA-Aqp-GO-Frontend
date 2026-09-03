"use client";
export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getTicketDetalleAdmin, responderTicketAdmin,
  cambiarEstadoTicket, cambiarPrioridadTicket,
  TicketDetalle, EstadoTicket, PrioridadTicket,
} from "@/lib/tickets";
import {
  ArrowLeft, Send, Loader2, AlertCircle,
  User, ShieldCheck, ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ESTADO_STYLES: Record<string, string> = {
  ABIERTO:    "bg-blue-100 text-blue-700 border-blue-200",
  EN_PROCESO: "bg-amber-100 text-amber-700 border-amber-200",
  RESUELTO:   "bg-emerald-100 text-emerald-700 border-emerald-200",
  CERRADO:    "bg-gray-100 text-gray-500 border-gray-200",
};

const PRIORIDAD_STYLES: Record<string, string> = {
  ALTA:  "bg-red-100 text-red-600 border-red-200",
  MEDIA: "bg-amber-100 text-amber-600 border-amber-200",
  BAJA:  "bg-gray-100 text-gray-500 border-gray-200",
};

const TIPO_LABELS: Record<string, string> = {
  SERVICIO:    "Solicitud de servicio",
  INFORMACION: "Consulta / Información",
  ACCESO:      "Solicitud de acceso",
};

const ESTADOS: EstadoTicket[]       = ["ABIERTO", "EN_PROCESO", "RESUELTO", "CERRADO"];
const PRIORIDADES: PrioridadTicket[] = ["ALTA", "MEDIA", "BAJA"];

export default function TicketChatAdminPage() {
  const params    = useParams();
  const router    = useRouter();
  const id        = params.id as string;
  const bottomRef = useRef<HTMLDivElement>(null);

  const [ticket, setTicket]         = useState<TicketDetalle | null>(null);
  const [cargando, setCargando]     = useState(true);
  const [mensaje, setMensaje]       = useState("");
  const [enviando, setEnviando]     = useState(false);
  const [error, setError]           = useState("");
  const [cambiando, setCambiando]   = useState(false);

  useEffect(() => { cargar(); }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.mensajes]);

  async function cargar() {
    try {
      setTicket(await getTicketDetalleAdmin(id));
    } catch {
      setError("No se pudo cargar la solicitud");
    } finally {
      setCargando(false);
    }
  }

  async function enviar() {
    if (!mensaje.trim() || !ticket) return;
    setEnviando(true);
    setError("");
    try {
      setTicket(await responderTicketAdmin(id, mensaje));
      setMensaje("");
    } catch {
      setError("Error al enviar el mensaje");
    } finally {
      setEnviando(false);
    }
  }

  async function cambiarEstado(estado: EstadoTicket) {
    setCambiando(true);
    try {
      setTicket(await cambiarEstadoTicket(id, estado));
    } catch {
      setError("Error al cambiar el estado");
    } finally {
      setCambiando(false);
    }
  }

  async function cambiarPrioridad(prioridad: PrioridadTicket) {
    setCambiando(true);
    try {
      setTicket(await cambiarPrioridadTicket(id, prioridad));
    } catch {
      setError("Error al cambiar la prioridad");
    } finally {
      setCambiando(false);
    }
  }

  if (cargando) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="h-8 w-8 animate-spin text-[#d4663a]" />
    </div>
  );

  if (!ticket) return (
    <div className="flex items-center justify-center h-96 text-gray-400">{error}</div>
  );

  const cerrado = ticket.estado === "CERRADO";

  return (
    <div className="flex gap-6 h-[calc(100vh-7rem)]">

      {/* ── Panel izquierdo: chat ── */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border overflow-hidden">

        {/* Header del chat */}
        <div className="px-5 py-3.5 border-b flex items-center gap-3">
          <button onClick={() => router.push("/admin/soporte")}
            className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate">{ticket.asunto}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <Badge variant="outline" className={`text-xs ${ESTADO_STYLES[ticket.estado]}`}>
                {ticket.estado.replace("_", " ")}
              </Badge>
              <span className="text-xs text-gray-400">{TIPO_LABELS[ticket.tipo]}</span>
            </div>
          </div>
          {cambiando && <Loader2 className="h-4 w-4 animate-spin text-[#d4663a]" />}
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30">
          {ticket.mensajes.map((m) => (
            <div key={m.id}
              className={`flex gap-3 ${m.esAdmin ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                m.esAdmin ? "bg-[#d4663a]" : "bg-gray-300"
              }`}>
                {m.esAdmin
                  ? <ShieldCheck className="h-4 w-4 text-white" />
                  : <User className="h-4 w-4 text-white" />}
              </div>
              <div className={`max-w-[70%] flex flex-col ${m.esAdmin ? "items-end" : "items-start"}`}>
                <span className="text-xs text-gray-400 mb-1 px-1">
                  {m.autorNombre} · {new Date(m.createdAt).toLocaleString("es-PE", {
                    dateStyle: "short", timeStyle: "short",
                  })}
                </span>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  m.esAdmin
                    ? "bg-[#d4663a] text-white rounded-tr-sm"
                    : "bg-white text-gray-800 rounded-tl-sm shadow-sm border"
                }`}>
                  {m.mensaje}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white">
          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1 mb-2">
              <AlertCircle className="h-3 w-3" /> {error}
            </p>
          )}
          {cerrado ? (
            <p className="text-center text-sm text-gray-400 py-2">
              Ticket cerrado — no se pueden agregar más mensajes
            </p>
          ) : (
            <div className="flex gap-2">
              <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); }
                }}
                placeholder="Escribe tu respuesta... (Enter para enviar)"
                rows={2}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#d4663a]/30 focus:border-[#d4663a]" />
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

      {/* ── Panel derecho: gestión ── */}
      <div className="w-72 flex-shrink-0 space-y-4">

        {/* Info del cliente */}
        <div className="bg-white rounded-xl border p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600 font-bold text-sm">
                {ticket.usuarioNombre.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-800 text-sm truncate">{ticket.usuarioNombre}</p>
              <p className="text-xs text-gray-400 truncate">{ticket.usuarioEmail}</p>
            </div>
          </div>
          {ticket.reservaId && (
            <div className="bg-gray-50 rounded-lg p-2.5 text-xs text-gray-500">
              <span className="font-medium">Reserva vinculada:</span>
              <br />
              <span className="font-mono text-gray-400">{ticket.reservaId.slice(0, 16)}...</span>
            </div>
          )}
        </div>

        {/* Cambiar estado */}
        <div className="bg-white rounded-xl border p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</p>
          <div className="space-y-1.5">
            {ESTADOS.map((e) => (
              <button key={e}
                onClick={() => cambiarEstado(e)}
                disabled={cambiando || ticket.estado === e}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                  ticket.estado === e
                    ? ESTADO_STYLES[e] + " cursor-default"
                    : "border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50"
                }`}>
                {ticket.estado === e && "✓ "}
                {e.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Cambiar prioridad */}
        <div className="bg-white rounded-xl border p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Prioridad</p>
          <div className="space-y-1.5">
            {PRIORIDADES.map((p) => (
              <button key={p}
                onClick={() => cambiarPrioridad(p)}
                disabled={cambiando || ticket.prioridad === p}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                  ticket.prioridad === p
                    ? PRIORIDAD_STYLES[p] + " cursor-default"
                    : "border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50"
                }`}>
                {ticket.prioridad === p && "✓ "}
                {p.charAt(0) + p.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Info del ticket */}
        <div className="bg-white rounded-xl border p-4 space-y-2 text-xs text-gray-500">
          <p className="font-semibold text-gray-600 uppercase tracking-wide text-xs">Detalles</p>
          <p><span className="font-medium">Tipo:</span> {TIPO_LABELS[ticket.tipo]}</p>
          <p><span className="font-medium">Creado:</span>{" "}
            {new Date(ticket.createdAt).toLocaleDateString("es-PE", { dateStyle: "long" })}
          </p>
          <p><span className="font-medium">Actualizado:</span>{" "}
            {new Date(ticket.updatedAt).toLocaleDateString("es-PE", { dateStyle: "long" })}
          </p>
          <p><span className="font-medium">Mensajes:</span> {ticket.mensajes.length}</p>
          {ticket.adminNombre && (
            <p><span className="font-medium">Asignado a:</span> {ticket.adminNombre}</p>
          )}
        </div>

        {/* Acciones rápidas */}
        {!cerrado && (
          <div className="space-y-2">
            <button
              onClick={() => cambiarEstado("RESUELTO")}
              disabled={cambiando || ticket.estado === "RESUELTO"}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-all">
              Marcar como resuelto
            </button>
            <button
              onClick={() => cambiarEstado("CERRADO")}
              disabled={cambiando}
              className="w-full py-2.5 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-xl text-sm font-medium transition-all">
              Cerrar ticket
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
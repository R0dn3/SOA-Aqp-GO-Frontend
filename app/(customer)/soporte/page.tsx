"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMisTickets, TicketResumen } from "@/lib/tickets";
import NuevoTicketModal from "@/components/layout/NuevoTicketModal";
import {
  MessageSquarePlus, MessageSquare, ChevronRight,
  Loader2, Clock, CheckCircle2, AlertCircle, XCircle,
} from "lucide-react";

const ESTADO_STYLES: Record<string, { color: string; icon: React.ReactNode }> = {
  ABIERTO:    { color: "bg-blue-100 text-blue-700",    icon: <MessageSquare className="h-3 w-3" /> },
  EN_PROCESO: { color: "bg-amber-100 text-amber-700",  icon: <Clock className="h-3 w-3" /> },
  RESUELTO:   { color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  CERRADO:    { color: "bg-gray-100 text-gray-500",    icon: <XCircle className="h-3 w-3" /> },
};

const TIPO_LABELS: Record<string, string> = {
  SERVICIO:    "Solicitud de servicio",
  INFORMACION: "Consulta",
  ACCESO:      "Solicitud de acceso",
};

export default function SoporteClientePage() {
  const router = useRouter();
  const [tickets, setTickets]       = useState<TicketResumen[]>([]);
  const [cargando, setCargando]     = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setCargando(true);
    try {
      const data = await getMisTickets();
      setTickets(data);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="bg-[#f5eee6] min-h-screen py-10 px-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#2a1810]">Mis solicitudes</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Gestiona tus consultas y solicitudes de servicio
            </p>
          </div>
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#d4663a] hover:bg-[#b8532e] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#d4663a]/20">
            <MessageSquarePlus className="h-4 w-4" /> Nueva solicitud
          </button>
        </div>

        {/* Lista de tickets */}
        {cargando ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#d4663a]" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No tienes solicitudes aún</p>
            <button onClick={() => setModalOpen(true)}
              className="mt-4 text-[#d4663a] text-sm font-semibold hover:underline">
              Crear primera solicitud →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => {
              const estilo = ESTADO_STYLES[t.estado];
              return (
                <div key={t.id}
                  onClick={() => router.push(`/soporte/${t.id}`)}
                  className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${estilo.color}`}>
                          {estilo.icon}
                          {t.estado.replace("_", " ")}
                        </span>
                        <span className="text-xs text-gray-400">{TIPO_LABELS[t.tipo]}</span>
                        {t.reservaId && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            Con reserva
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-gray-800 truncate">{t.asunto}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {t.totalMensajes} mensaje{t.totalMensajes !== 1 ? "s" : ""} ·{" "}
                        {new Date(t.updatedAt).toLocaleDateString("es-PE")}
                        {t.adminNombre && ` · Atendido por ${t.adminNombre}`}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-[#d4663a] transition-colors flex-shrink-0 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <NuevoTicketModal
          onCerrar={() => { setModalOpen(false); cargar(); }}
        />
      )}
    </div>
  );
}
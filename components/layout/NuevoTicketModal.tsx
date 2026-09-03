"use client";

import { useEffect, useState } from "react";
import { X, Loader2, AlertCircle, MessageSquarePlus } from "lucide-react";
import { crearTicket, TipoTicket } from "@/lib/tickets";
import { getMisReservas, ReservaResponse } from "@/lib/reservas";
import { useRouter } from "next/navigation";

interface Props {
  onCerrar: () => void;
}

const TIPOS: { value: TipoTicket; label: string; desc: string }[] = [
  { value: "SERVICIO",    label: "Solicitud de servicio",    desc: "Cambio de fecha, agregar personas, factura..." },
  { value: "INFORMACION", label: "Consulta / Información",   desc: "Preguntas sobre tours, precios, itinerarios..." },
  { value: "ACCESO",      label: "Solicitud de acceso",      desc: "Permisos especiales, acceso a documentos..." },
];

export default function NuevoTicketModal({ onCerrar }: Props) {
  const router = useRouter();
  const [tipo, setTipo]                 = useState<TipoTicket>("INFORMACION");
  const [asunto, setAsunto]             = useState("");
  const [mensaje, setMensaje]           = useState("");
  const [reservaId, setReservaId]       = useState("");
  const [reservas, setReservas]         = useState<ReservaResponse[]>([]);
  const [guardando, setGuardando]       = useState(false);
  const [error, setError]               = useState("");

  /*useEffect(() => {
    // Carga las reservas del cliente para el selector
    getMisReservas().then(setReservas).catch(() => {});
  }, []);*/

  useEffect(() => {
  getMisReservas()
    .then((data) => {
      console.log("Reservas:", data);
      setReservas(data);
    })
    .catch(console.error);
}, []);

  async function crear() {
    if (!asunto.trim()) { setError("El asunto es obligatorio"); return; }
    if (!mensaje.trim()) { setError("Describe tu solicitud"); return; }

    setGuardando(true);
    setError("");
    try {
      const ticket = await crearTicket({
        tipo,
        asunto,
        mensajeInicial: mensaje,
        reservaId: reservaId || undefined,
      });
      onCerrar();
      // Navega al chat del ticket recién creado
      router.push(`/soporte/${ticket.id}`);
    } catch {
      setError("Error al crear la solicitud. Intenta nuevamente.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5 text-[#d4663a]" />
            <h3 className="font-bold text-gray-800">Nueva solicitud</h3>
          </div>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          {/* Tipo de solicitud */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de solicitud <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {TIPOS.map((t) => (
                <label key={t.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    tipo === t.value
                      ? "border-[#d4663a]/40 bg-[#d4663a]/5"
                      : "border-gray-100 hover:border-gray-200"
                  }`}>
                  <input type="radio" name="tipo" value={t.value}
                    checked={tipo === t.value}
                    onChange={() => setTipo(t.value)}
                    className="mt-0.5 accent-[#d4663a]" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{t.label}</p>
                    <p className="text-xs text-gray-400">{t.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Reserva relacionada — solo si es SERVICIO */}
          {tipo === "SERVICIO" && reservas.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reserva relacionada <span className="text-gray-400 text-xs">(opcional)</span>
              </label>
              {reservas.filter(r => r.estado !== "CANCELADA").length === 0 ? (
                <div className="border border-amber-200 bg-amber-50 rounded-xl p-3 text-sm text-amber-700">
                  No tienes reservas activas para asociar a esta solicitud.
                </div>
              ) : (
                <select
                  value={reservaId}
                  onChange={(e) => setReservaId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4663a]/30 focus:border-[#d4663a]"
                >
                  <option value="">Sin reserva específica</option>

                  {reservas
                    .filter((r) => r.estado !== "CANCELADA")
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.paqueteNombre} — {r.fechaSalida}
                      </option>
                    ))}
                </select>
              )}
            </div>
          )}

          {/* Asunto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asunto <span className="text-red-500">*</span>
            </label>
            <input type="text" value={asunto} onChange={(e) => setAsunto(e.target.value)}
              placeholder="Ej. Quiero cambiar la fecha de mi reserva"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4663a]/30 focus:border-[#d4663a]" />
          </div>

          {/* Mensaje */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)}
              placeholder="Describe detalladamente tu solicitud..."
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4663a]/30 focus:border-[#d4663a] resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onCerrar} disabled={guardando}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all">
            Cancelar
          </button>
          <button onClick={crear} disabled={guardando}
            className="flex-1 py-2.5 bg-[#d4663a] hover:bg-[#b8532e] disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all">
            {guardando
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
              : "Enviar solicitud"}
          </button>
        </div>
      </div>
    </div>
  );
}
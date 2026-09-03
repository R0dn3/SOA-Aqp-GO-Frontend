
"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import {
  Map, CalendarCheck, Users, Truck,
  TrendingUp, Clock, AlertCircle, Loader2,
} from "lucide-react";
import { getStats, getActividadReciente, StatsDto, ActividadRecienteDto } from "@/lib/admin";
import BackupButton from "@/components/layout/BackupButton";


// ── Badge de estado ───────────────────────────────────────────
function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    PENDIENTE_PAGO:  "bg-amber-100 text-amber-700",
    CONFIRMADA:      "bg-emerald-100 text-emerald-700",
    CANCELADA:       "bg-red-100 text-red-600",
    COMPLETADA:      "bg-blue-100 text-blue-700",
  };
  const labels: Record<string, string> = {
    PENDIENTE_PAGO: "Pend. pago",
    CONFIRMADA:     "Confirmada",
    CANCELADA:      "Cancelada",
    COMPLETADA:     "Completada",
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${map[estado] ?? "bg-gray-100 text-gray-500"}`}>
      {labels[estado] ?? estado}
    </span>
  );
}

// ── Página ────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats]           = useState<StatsDto | null>(null);
  const [actividad, setActividad]   = useState<ActividadRecienteDto[]>([]);
  const [cargando, setCargando]     = useState(true);
  const [error, setError]           = useState("");

  useEffect(() => {
    Promise.all([getStats(), getActividadReciente()])
      .then(([s, a]) => { setStats(s); setActividad(a); })
      .catch(() => setError("Error al cargar los datos del dashboard"))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-[#d4663a]" />
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-2 text-red-600 p-4 bg-red-50 rounded-xl border border-red-200">
      <AlertCircle className="h-5 w-5" /> {error}
    </div>
  );

  const statCards = [
    {
      label: "Paquetes activos",
      value: stats?.totalPaquetes ?? 0,
      icon: <Map className="h-5 w-5" />,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total reservas",
      value: stats?.totalReservas ?? 0,
      icon: <CalendarCheck className="h-5 w-5" />,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Usuarios registrados",
      value: stats?.totalUsuarios ?? 0,
      icon: <Users className="h-5 w-5" />,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Proveedores",
      value: stats?.totalProveedores ?? 0,
      icon: <Truck className="h-5 w-5" />,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">

      {/* Título */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-0.5">Resumen general del sistema</p>
        </div>
        <BackupButton />
      </div>

      {/* Tarjetas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tarjetas secundarias */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats?.reservasHoy ?? 0}</p>
            <p className="text-xs text-gray-500">Reservas hoy</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats?.reservasPendientesPago ?? 0}</p>
            <p className="text-xs text-gray-500">Pendientes de pago</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              ${stats?.ingresosTotales?.toLocaleString() ?? 0}
            </p>
            <p className="text-xs text-gray-500">Ingresos confirmados</p>
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-base font-semibold text-gray-800">Actividad reciente</h3>
          <p className="text-xs text-gray-500 mt-0.5">Últimas 10 reservas registradas en el sistema</p>
        </div>

        {actividad.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            No hay reservas registradas aún
          </div>
        ) : (
          <div className="divide-y">
            {actividad.map((a) => (
              <div key={a.id} className="px-6 py-3 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{a.clienteNombre}</p>
                  <p className="text-xs text-gray-400 truncate">{a.paqueteNombre}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-800">${a.precioTotal}</p>
                  <p className="text-xs text-gray-400">{a.fechaSalida}</p>
                </div>
                <EstadoBadge estado={a.estado} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
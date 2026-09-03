"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getTicketsAdmin, getTicketStats,
  TicketResumen, TicketStatsDto, EstadoTicket, TipoTicket,
} from "@/lib/tickets";
import {
  MessageSquare, Clock, CheckCircle2, XCircle,
  Search, ChevronRight, Loader2, AlertCircle,
  ShieldAlert, Users, Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ESTADO_STYLES: Record<string, string> = {
  ABIERTO:    "bg-blue-100 text-blue-700 border-blue-200",
  EN_PROCESO: "bg-amber-100 text-amber-700 border-amber-200",
  RESUELTO:   "bg-emerald-100 text-emerald-700 border-emerald-200",
  CERRADO:    "bg-gray-100 text-gray-500 border-gray-200",
};

const PRIORIDAD_STYLES: Record<string, string> = {
  ALTA:  "bg-red-100 text-red-600",
  MEDIA: "bg-amber-50 text-amber-600",
  BAJA:  "bg-gray-100 text-gray-500",
};

const TIPO_LABELS: Record<string, string> = {
  SERVICIO:    "Servicio",
  INFORMACION: "Consulta",
  ACCESO:      "Acceso",
};

const ESTADOS: EstadoTicket[] = ["ABIERTO", "EN_PROCESO", "RESUELTO", "CERRADO"];

export default function SoporteAdminPage() {
  const router = useRouter();

  const [tickets, setTickets]           = useState<TicketResumen[]>([]);
  const [stats, setStats]               = useState<TicketStatsDto | null>(null);
  const [cargando, setCargando]         = useState(true);
  const [error, setError]               = useState("");
  const [search, setSearch]             = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoTicket | "todos">("todos");
  const [filtroTipo, setFiltroTipo]     = useState<TipoTicket | "todos">("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState<"todos" | "ALTA" | "MEDIA" | "BAJA">("todos");

  useEffect(() => { cargar(); }, [filtroEstado]);

  async function cargar() {
    setCargando(true);
    try {
      const [data, s] = await Promise.all([
        getTicketsAdmin(0, 50, filtroEstado === "todos" ? undefined : filtroEstado),
        getTicketStats(),
      ]);
      setTickets(data.content ?? data);
      setStats(s);
    } catch {
      setError("Error al cargar las solicitudes");
    } finally {
      setCargando(false);
    }
  }

  // Filtrado local adicional
  const filtered = tickets.filter((t) => {
    const matchSearch =
      t.asunto.toLowerCase().includes(search.toLowerCase()) ||
      t.usuarioNombre.toLowerCase().includes(search.toLowerCase()) ||
      t.usuarioEmail.toLowerCase().includes(search.toLowerCase());
    const matchTipo      = filtroTipo === "todos" || t.tipo === filtroTipo;
    const matchPrioridad = filtroPrioridad === "todos" || t.prioridad === filtroPrioridad;
    return matchSearch && matchTipo && matchPrioridad;
  });

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Solicitudes de soporte</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Gestiona y responde las solicitudes de los clientes
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm p-3 bg-red-50 rounded-xl border border-red-200">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Cards de stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Abiertas",    value: stats.abiertos,    color: "text-blue-600 bg-blue-50",    icon: <MessageSquare className="h-4 w-4" /> },
            { label: "En proceso",  value: stats.enProceso,   color: "text-amber-600 bg-amber-50",  icon: <Clock className="h-4 w-4" /> },
            { label: "Resueltas",   value: stats.resueltos,   color: "text-emerald-600 bg-emerald-50", icon: <CheckCircle2 className="h-4 w-4" /> },
            { label: "Cerradas",    value: stats.cerrados,    color: "text-gray-500 bg-gray-100",   icon: <XCircle className="h-4 w-4" /> },
            { label: "Total",       value: stats.totalTickets,color: "text-purple-600 bg-purple-50",icon: <Users className="h-4 w-4" /> },
            { label: "Sin asignar", value: stats.sinAsignar,  color: "text-red-600 bg-red-50",      icon: <ShieldAlert className="h-4 w-4" /> },
          ].map((s) => (
            <div key={s.label} className="bg-white border rounded-xl p-3 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
                {s.icon}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800 leading-none">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col gap-3">
        {/* Búsqueda */}
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Buscar por asunto, cliente o email..."
            className="pl-8" value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* Filtros por estado */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-400 flex items-center gap-1 mr-1">
            <Filter className="h-3 w-3" /> Estado:
          </span>
          {(["todos", ...ESTADOS] as const).map((e) => (
            <Button key={e} size="sm"
              variant={filtroEstado === e ? "default" : "outline"}
              className={filtroEstado === e ? "bg-[#d4663a] hover:bg-[#b8532e]" : ""}
              onClick={() => setFiltroEstado(e)}>
              {e === "todos" ? "Todos" : e.replace("_", " ")}
            </Button>
          ))}
        </div>

        {/* Filtros por tipo y prioridad */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-400 flex items-center gap-1 mr-1">
            <Filter className="h-3 w-3" /> Tipo:
          </span>
          {(["todos", "SERVICIO", "INFORMACION", "ACCESO"] as const).map((t) => (
            <Button key={t} size="sm"
              variant={filtroTipo === t ? "default" : "outline"}
              className={`text-xs h-7 ${filtroTipo === t ? "bg-[#d4663a] hover:bg-[#b8532e]" : ""}`}
              onClick={() => setFiltroTipo(t)}>
              {t === "todos" ? "Todos" : TIPO_LABELS[t]}
            </Button>
          ))}
          <span className="text-xs text-gray-400 flex items-center gap-1 ml-2 mr-1">
            Prioridad:
          </span>
          {(["todos", "ALTA", "MEDIA", "BAJA"] as const).map((p) => (
            <Button key={p} size="sm"
              variant={filtroPrioridad === p ? "default" : "outline"}
              className={`text-xs h-7 ${filtroPrioridad === p ? "bg-[#d4663a] hover:bg-[#b8532e]" : ""}`}
              onClick={() => setFiltroPrioridad(p)}>
              {p === "todos" ? "Todas" : p.charAt(0) + p.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Lista de tickets */}
      {cargando ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#d4663a]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border">
          <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No hay solicitudes con estos filtros</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          {filtered.map((t, i) => (
            <div key={t.id}
              onClick={() => router.push(`/admin/soporte/${t.id}`)}
              className={`flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50/80 transition-colors group ${
                i !== 0 ? "border-t" : ""
              }`}>

              {/* Indicador de prioridad */}
              <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${
                t.prioridad === "ALTA" ? "bg-red-400" :
                t.prioridad === "MEDIA" ? "bg-amber-300" : "bg-gray-200"
              }`} />

              {/* Info principal */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant="outline" className={`text-xs ${ESTADO_STYLES[t.estado]}`}>
                    {t.estado.replace("_", " ")}
                  </Badge>
                  <span className="text-xs text-gray-400">{TIPO_LABELS[t.tipo]}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRIORIDAD_STYLES[t.prioridad]}`}>
                    {t.prioridad}
                  </span>
                  {!t.adminNombre && (
                    <span className="text-xs bg-red-50 text-red-500 px-1.5 py-0.5 rounded font-medium">
                      Sin asignar
                    </span>
                  )}
                </div>
                <p className="font-medium text-gray-800 text-sm truncate">{t.asunto}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {t.usuarioNombre} · {t.usuarioEmail}
                  {t.reservaId && " · Con reserva"}
                  {t.adminNombre && ` · Asignado a ${t.adminNombre}`}
                </p>
              </div>

              {/* Derecha */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-400">
                  {new Date(t.updatedAt).toLocaleDateString("es-PE")}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {t.totalMensajes} msg
                </p>
              </div>

              <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#d4663a] transition-colors flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
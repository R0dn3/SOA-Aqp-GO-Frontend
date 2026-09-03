
"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, CheckCircle2, Clock, XCircle,
  TrendingUp, Loader2, AlertCircle,
} from "lucide-react";
import { getPagosAdmin, getPagoStats, PagoAdminDto, PagoStatsDto } from "@/lib/admin";
import { Button } from "@/components/ui/button";

const ESTADO_STYLES: Record<string, string> = {
  VERIFICADO: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PENDIENTE:  "bg-amber-100 text-amber-700 border-amber-200",
  RECHAZADO:  "bg-red-100 text-red-600 border-red-200",
};

const METODO_LABELS: Record<string, string> = {
  TARJETA:       "Tarjeta",
  YAPE:          "Yape",
  PLIN:          "Plin",
  TRANSFERENCIA: "Transferencia",
  EFECTIVO:      "Efectivo",
};

export default function PagosAdminPage() {
  const [pagos, setPagos]           = useState<PagoAdminDto[]>([]);
  const [stats, setStats]           = useState<PagoStatsDto | null>(null);
  const [cargando, setCargando]     = useState(true);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroMetodo, setFiltroMetodo] = useState("todos");

  useEffect(() => {
    Promise.all([getPagosAdmin(), getPagoStats()])
      .then(([p, s]) => { setPagos(p); setStats(s); })
      .catch(() => setError("Error al cargar los pagos"))
      .finally(() => setCargando(false));
  }, []);

  const filtered = pagos.filter((p) => {
    const matchSearch =
      p.clienteNombre.toLowerCase().includes(search.toLowerCase()) ||
      p.paqueteNombre.toLowerCase().includes(search.toLowerCase()) ||
      p.referencia?.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filtroEstado === "todos" || p.estado === filtroEstado;
    const matchMetodo = filtroMetodo === "todos" || p.metodo === filtroMetodo;
    return matchSearch && matchEstado && matchMetodo;
  });

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Pagos</h2>
        <p className="text-sm text-gray-500 mt-0.5">Historial de todos los pagos procesados</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm p-3 bg-red-50 rounded-xl border border-red-200">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Verificados",   value: stats?.pagosVerificados ?? 0,  icon: <CheckCircle2 className="h-4 w-4" />, color: "text-emerald-600 bg-emerald-50" },
          { label: "Pendientes",    value: stats?.pagosPendientes ?? 0,   icon: <Clock className="h-4 w-4" />,        color: "text-amber-600 bg-amber-50" },
          { label: "Rechazados",    value: stats?.pagosRechazados ?? 0,   icon: <XCircle className="h-4 w-4" />,      color: "text-red-600 bg-red-50" },
          { label: "Monto cobrado", value: `$${(stats?.montoTotalVerificado ?? 0).toLocaleString()}`,
            icon: <TrendingUp className="h-4 w-4" />, color: "text-purple-600 bg-purple-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Buscar por cliente, paquete o referencia..." className="pl-8"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["todos", "VERIFICADO", "PENDIENTE", "RECHAZADO"].map((f) => (
            <Button key={f} size="sm"
              variant={filtroEstado === f ? "default" : "outline"}
              className={filtroEstado === f ? "bg-[#d4663a] hover:bg-[#b8532e]" : ""}
              onClick={() => setFiltroEstado(f)}>
              {f === "todos" ? "Todos" : f.charAt(0) + f.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Cliente</TableHead>
              <TableHead>Paquete</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargando ? (
              <TableRow><TableCell colSpan={7} className="text-center py-12">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#d4663a]" />
              </TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-12 text-gray-400">
                No se encontraron pagos
              </TableCell></TableRow>
            ) : filtered.map((p) => (
              <TableRow key={p.id} className="hover:bg-gray-50/50">
                <TableCell>
                  <p className="font-medium text-sm text-gray-800">{p.clienteNombre}</p>
                  <p className="text-xs text-gray-400">{p.clienteEmail}</p>
                </TableCell>
                <TableCell className="text-sm text-gray-600 max-w-[160px] truncate">
                  {p.paqueteNombre}
                </TableCell>
                <TableCell className="text-sm font-semibold text-gray-800">
                  ${p.monto}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {METODO_LABELS[p.metodo] ?? p.metodo}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-gray-500 font-mono">
                  {p.referencia || "—"}
                </TableCell>
                <TableCell className="text-xs text-gray-500">
                  {p.fechaPago ? new Date(p.fechaPago).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={ESTADO_STYLES[p.estado] ?? ""}>
                    {p.estado === "VERIFICADO" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {p.estado === "PENDIENTE"  && <Clock className="h-3 w-3 mr-1" />}
                    {p.estado === "RECHAZADO"  && <XCircle className="h-3 w-3 mr-1" />}
                    {p.estado.charAt(0) + p.estado.slice(1).toLowerCase()}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Nota informativa */}
      <p className="text-xs text-gray-400 text-center">
        Los pagos son de solo lectura. Para gestionar un pago contacta al administrador del sistema.
      </p>
    </div>
  );
}
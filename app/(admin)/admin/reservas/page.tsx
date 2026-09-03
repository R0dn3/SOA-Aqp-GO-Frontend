
"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Search, MoreHorizontal, Eye, CheckCircle2,
  XCircle, Clock, Users, CalendarCheck,
  TrendingUp, Loader2, AlertCircle,
} from "lucide-react";
import api from "@/lib/axios";
import { ReservaResponse } from "@/lib/reservas";

const ESTADO_STYLES: Record<string, string> = {
  PENDIENTE_PAGO: "bg-amber-100 text-amber-700 border-amber-200",
  CONFIRMADA:     "bg-emerald-100 text-emerald-700 border-emerald-200",
  CANCELADA:      "bg-red-100 text-red-600 border-red-200",
  COMPLETADA:     "bg-blue-100 text-blue-700 border-blue-200",
};

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE_PAGO: "Pend. pago",
  CONFIRMADA:     "Confirmada",
  CANCELADA:      "Cancelada",
  COMPLETADA:     "Completada",
};

const ESTADOS = ["PENDIENTE_PAGO", "CONFIRMADA", "CANCELADA", "COMPLETADA"];

export default function ReservasAdminPage() {
  const [reservas, setReservas]           = useState<ReservaResponse[]>([]);
  const [cargando, setCargando]           = useState(true);
  const [error, setError]                 = useState("");
  const [search, setSearch]               = useState("");
  const [filtroEstado, setFiltroEstado]   = useState("todos");

  // Modal detalle
  const [detalle, setDetalle]             = useState<ReservaResponse | null>(null);

  // Modal cambiar estado
  const [cambioEstado, setCambioEstado]   = useState<{ reserva: ReservaResponse; nuevoEstado: string } | null>(null);
  const [cambiando, setCambiando]         = useState(false);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setCargando(true);
    try {
      const res = await api.get<ReservaResponse[]>("/api/reservas");
      setReservas(res.data);
    } catch {
      setError("Error al cargar las reservas");
    } finally {
      setCargando(false);
    }
  }

  async function confirmarCambioEstado() {
    if (!cambioEstado) return;
    setCambiando(true);
    try {
      await api.patch(`/api/reservas/${cambioEstado.reserva.id}/estado`,
        { estado: cambioEstado.nuevoEstado },
        { headers: { "Content-Type": "application/json" } }
      );
      setCambioEstado(null);
      await cargar();
    } catch (error: any) {
      console.error("Error completo:", error);
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
        setError(`Error ${error.response.status}: ${error.response.data?.error || error.response.data || "Desconocido"}`);
      } else {
        setError("Error al cambiar el estado");
      }
    } finally {
      setCambiando(false);
    }
  }

  const filtered = reservas.filter((r) => {
    const matchSearch =
      r.paqueteNombre.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filtroEstado === "todos" || r.estado === filtroEstado;
    return matchSearch && matchEstado;
  });

  // Stats
  const porEstado = (e: string) => reservas.filter((r) => r.estado === e).length;
  const ingresos  = reservas
    .filter((r) => r.estado === "CONFIRMADA" || r.estado === "COMPLETADA")
    .reduce((a, r) => a + r.precioTotal, 0);

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Reservas</h2>
        <p className="text-sm text-gray-500 mt-0.5">Gestiona y monitorea todas las reservas</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm p-3 bg-red-50 rounded-xl border border-red-200">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Confirmadas",    value: porEstado("CONFIRMADA"),    icon: <CheckCircle2 className="h-4 w-4" />, color: "text-emerald-600 bg-emerald-50" },
          { label: "Pend. de pago",  value: porEstado("PENDIENTE_PAGO"),icon: <Clock className="h-4 w-4" />,        color: "text-amber-600 bg-amber-50" },
          { label: "Completadas",    value: porEstado("COMPLETADA"),    icon: <CalendarCheck className="h-4 w-4" />,color: "text-blue-600 bg-blue-50" },
          { label: "Ingresos conf.", value: `$${ingresos.toLocaleString()}`, icon: <TrendingUp className="h-4 w-4" />, color: "text-purple-600 bg-purple-50" },
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
          <Input placeholder="Buscar por paquete..." className="pl-8"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {["todos", ...ESTADOS].map((f) => (
            <Button key={f} size="sm"
              variant={filtroEstado === f ? "default" : "outline"}
              className={filtroEstado === f ? "bg-[#d4663a] hover:bg-[#b8532e]" : ""}
              onClick={() => setFiltroEstado(f)}>
              {f === "todos" ? "Todos" : ESTADO_LABELS[f]}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Paquete</TableHead>
              <TableHead>Fecha salida</TableHead>
              <TableHead><span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />Personas</span></TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargando ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#d4663a]" />
              </TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-gray-400">
                No se encontraron reservas
              </TableCell></TableRow>
            ) : filtered.map((r) => (
              <TableRow key={r.id} className="hover:bg-gray-50/50">
                <TableCell>
                  <p className="font-medium text-gray-800 text-sm">{r.paqueteNombre}</p>
                  <p className="text-xs text-gray-400">{r.id.slice(0, 8)}...</p>
                </TableCell>
                <TableCell className="text-sm text-gray-600">{r.fechaSalida}</TableCell>
                <TableCell className="text-sm text-gray-600">{r.numPersonas}</TableCell>
                <TableCell className="text-sm font-semibold text-gray-800">${r.precioTotal}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={ESTADO_STYLES[r.estado]}>
                    {ESTADO_LABELS[r.estado] ?? r.estado}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="gap-2" onClick={() => setDetalle(r)}>
                        <Eye className="h-4 w-4" /> Ver detalle
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {ESTADOS.filter((e) => e !== r.estado).map((e) => (
                        <DropdownMenuItem key={e} className="gap-2"
                          onClick={() => setCambioEstado({ reserva: r, nuevoEstado: e })}>
                          {e === "CONFIRMADA"    && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                          {e === "CANCELADA"     && <XCircle className="h-4 w-4 text-red-500" />}
                          {e === "COMPLETADA"    && <CalendarCheck className="h-4 w-4 text-blue-500" />}
                          {e === "PENDIENTE_PAGO"&& <Clock className="h-4 w-4 text-amber-500" />}
                          Marcar como {ESTADO_LABELS[e]}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal detalle */}
      <Dialog open={!!detalle} onOpenChange={(o) => !o && setDetalle(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de reserva</DialogTitle>
            <DialogDescription className="sr-only">
              Información de la reserva y acompañantes
            </DialogDescription>
          </DialogHeader>
          {detalle && (
            <div className="space-y-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Paquete:</span>
                  <span>{detalle.paqueteNombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Fecha salida:</span>
                  <span>{detalle.fechaSalida}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Personas:</span>
                  <span>{detalle.numPersonas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Total:</span>
                  <span className="font-bold text-[#d4663a]">${detalle.precioTotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-500">Estado:</span>
                  <Badge variant="outline" className={ESTADO_STYLES[detalle.estado]}>
                    {ESTADO_LABELS[detalle.estado]}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Creada:</span>
                  <span>{new Date(detalle.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {detalle.acompanantes?.length > 0 && (
                <div>
                  <p className="font-medium text-gray-700 mb-2">
                    Acompañantes ({detalle.acompanantes.length})
                  </p>
                  <div className="space-y-2">
                    {detalle.acompanantes.map((a, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3">
                        <p className="font-medium">{a.nombreCompleto}</p>
                        <p className="text-gray-500 text-xs">
                          {a.dniPasaporte} · {a.pais}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog cambiar estado */}
      <Dialog open={!!cambioEstado} onOpenChange={(o) => !o && setCambioEstado(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cambiar estado</DialogTitle>
            <DialogDescription>
              ¿Marcar la reserva de <strong>{cambioEstado?.reserva.paqueteNombre}</strong> como{" "}
              <strong>{ESTADO_LABELS[cambioEstado?.nuevoEstado ?? ""]}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCambioEstado(null)}>Cancelar</Button>
            <Button className="bg-[#d4663a] hover:bg-[#b8532e]"
              onClick={confirmarCambioEstado} disabled={cambiando}>
              {cambiando && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  MoreHorizontal, Plus, Search, Eye, Pencil,
  PowerOff, Power, Trash2, MapPin, Clock,
  DollarSign, TrendingUp, Map, Loader2, AlertCircle,
} from "lucide-react";
import {
  getPaquetesAdmin, PaqueteAdminDto,
} from "@/lib/admin";
import { togglePaquete, eliminarPaquete } from "@/lib/paquetes";

export default function ToursAdminPage() {
  const router = useRouter();
  const [paquetes, setPaquetes]         = useState<PaqueteAdminDto[]>([]);
  const [cargando, setCargando]         = useState(true);
  const [error, setError]               = useState("");
  const [search, setSearch]             = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "activo" | "inactivo">("todos");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    tipo: "eliminar" | "toggle" | null;
    paquete: PaqueteAdminDto | null;
  }>({ open: false, tipo: null, paquete: null });
  const [accionando, setAccionando] = useState(false);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    try {
      const data = await getPaquetesAdmin();
      setPaquetes(data);
    } catch {
      setError("Error al cargar los paquetes");
    } finally {
      setCargando(false);
    }
  }

  // Filtrado local
  const filtered = paquetes.filter((p) => {
    const matchSearch =
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.lugares.some((l) => l.toLowerCase().includes(search.toLowerCase()));
    const matchEstado =
      filtroEstado === "todos" ||
      (filtroEstado === "activo" ? p.activo : !p.activo);
    return matchSearch && matchEstado;
  });

  async function confirmarAccion() {
    if (!confirmDialog.paquete) return;
    setAccionando(true);
    try {
      if (confirmDialog.tipo === "toggle") {
        await togglePaquete(confirmDialog.paquete.id);
      } else {
        await eliminarPaquete(confirmDialog.paquete.id);
      }
      await cargar(); // recarga desde backend
    } catch {
      setError("Error al realizar la acción");
    } finally {
      setAccionando(false);
      setConfirmDialog({ open: false, tipo: null, paquete: null });
    }
  }

  // Stats locales calculadas desde los datos
  const activos          = paquetes.filter((p) => p.activo).length;
  const totalReservas    = paquetes.reduce((a, p) => a + p.totalReservas, 0);
  const ingresosTotal    = paquetes.reduce((a, p) => a + p.ingresosTotales, 0);

  if (cargando) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-[#d4663a]" />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Paquetes / Tours</h2>
          <p className="text-sm text-gray-500 mt-0.5">Gestiona los paquetes turísticos</p>
        </div>
        <Button
          className="bg-[#d4663a] hover:bg-[#b8532e] gap-2"
          onClick={() => router.push("/admin/tours/nuevo")}
        >
          <Plus className="h-4 w-4" /> Nuevo paquete
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 p-3 bg-red-50 rounded-xl border border-red-200 text-sm">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total paquetes", value: paquetes.length, icon: <Map className="h-4 w-4" />, color: "text-blue-600 bg-blue-50" },
          { label: "Activos", value: activos, icon: <Power className="h-4 w-4" />, color: "text-emerald-600 bg-emerald-50" },
          { label: "Total reservas", value: totalReservas, icon: <Clock className="h-4 w-4" />, color: "text-amber-600 bg-amber-50" },
          { label: "Ingresos totales", value: `$${ingresosTotal.toLocaleString()}`, icon: <TrendingUp className="h-4 w-4" />, color: "text-purple-600 bg-purple-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Buscar por nombre o lugar..." className="pl-8"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(["todos", "activo", "inactivo"] as const).map((f) => (
            <Button key={f} variant={filtroEstado === f ? "default" : "outline"} size="sm"
              className={filtroEstado === f ? "bg-[#d4663a] hover:bg-[#b8532e]" : ""}
              onClick={() => setFiltroEstado(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
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
              <TableHead><span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Duración</span></TableHead>
              <TableHead><span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />Precio</span></TableHead>
              <TableHead><span className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" />Ingresos</span></TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                  No se encontraron paquetes
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id} className="hover:bg-gray-50/50">
                  {/* Nombre + lugares */}
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-800 leading-tight">{p.nombre}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.lugares.map((l) => (
                          <span key={l} className="inline-flex items-center gap-0.5 text-[11px] text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">
                            <MapPin className="h-2.5 w-2.5" />{l}
                          </span>
                        ))}
                      </div>
                    </div>
                  </TableCell>

                  {/* Duración */}
                  <TableCell className="text-sm text-gray-600">
                    {p.duracionDias}D / {p.duracionNoches}N
                  </TableCell>

                  {/* Precio */}
                  <TableCell className="text-sm font-semibold text-gray-800">
                    ${p.precioBase}
                  </TableCell>

                  {/* Ingresos + reservas */}
                  <TableCell>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        ${p.ingresosTotales.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">{p.totalReservas} reservas</p>
                    </div>
                  </TableCell>

                  {/* Estado */}
                  <TableCell>
                    <Badge variant="outline"
                      className={p.activo
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-gray-100 text-gray-500 border-gray-200"}>
                      {p.activo ? "activo" : "inactivo"}
                    </Badge>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="gap-2"
                          >
                          <Eye className="h-4 w-4" /> Ver detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2"
                          onClick={() => router.push(`/admin/tours/${p.id}/editar`)}>
                          <Pencil className="h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2"
                          onClick={() => setConfirmDialog({ open: true, tipo: "toggle", paquete: p })}>
                          {p.activo
                            ? <><PowerOff className="h-4 w-4 text-amber-500" /> Desactivar</>
                            : <><Power className="h-4 w-4 text-emerald-500" /> Activar</>}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600"
                          onClick={() => setConfirmDialog({ open: true, tipo: "eliminar", paquete: p })}>
                          <Trash2 className="h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog confirmación */}
      <Dialog open={confirmDialog.open}
        onOpenChange={(o) => !o && setConfirmDialog({ open: false, tipo: null, paquete: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.tipo === "eliminar" ? "¿Eliminar paquete?"
                : confirmDialog.paquete?.activo ? "¿Desactivar paquete?" : "¿Activar paquete?"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.tipo === "eliminar"
                ? <>Estás a punto de eliminar <strong>{confirmDialog.paquete?.nombre}</strong>. Esta acción no se puede deshacer.</>
                : confirmDialog.paquete?.activo
                ? <>El paquete <strong>{confirmDialog.paquete?.nombre}</strong> dejará de aparecer en la web.</>
                : <>El paquete <strong>{confirmDialog.paquete?.nombre}</strong> volverá a estar disponible.</>}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline"
              onClick={() => setConfirmDialog({ open: false, tipo: null, paquete: null })}>
              Cancelar
            </Button>
            <Button disabled={accionando}
              className={confirmDialog.tipo === "eliminar"
                ? "bg-red-600 hover:bg-red-700" : "bg-[#d4663a] hover:bg-[#b8532e]"}
              onClick={confirmarAccion}>
              {accionando && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {confirmDialog.tipo === "eliminar" ? "Sí, eliminar"
                : confirmDialog.paquete?.activo ? "Sí, desactivar" : "Sí, activar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
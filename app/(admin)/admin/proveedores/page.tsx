
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
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  MoreHorizontal, Plus, Search, Truck,
  Hotel, UtensilsCrossed, Loader2, AlertCircle,
} from "lucide-react";
import api from "@/lib/axios";

interface Proveedor {
  id: string;
  nombre: string;
  tipo: "TRANSPORTE" | "HOTEL" | "RESTAURANTE";
  telefono?: string;
  email?: string;
  notas?: string;
}

const TIPO_STYLES: Record<string, { color: string; icon: React.ReactNode }> = {
  TRANSPORTE:   { color: "bg-blue-100 text-blue-700 border-blue-200",   icon: <Truck className="h-3 w-3" /> },
  HOTEL:        { color: "bg-purple-100 text-purple-700 border-purple-200", icon: <Hotel className="h-3 w-3" /> },
  RESTAURANTE:  { color: "bg-amber-100 text-amber-700 border-amber-200", icon: <UtensilsCrossed className="h-3 w-3" /> },
};

const FORM_VACIO: Omit<Proveedor, "id"> = {
  nombre: "", tipo: "TRANSPORTE", telefono: "", email: "", notas: "",
};

export default function ProveedoresPage() {
  const [proveedores, setProveedores]   = useState<Proveedor[]>([]);
  const [cargando, setCargando]         = useState(true);
  const [error, setError]               = useState("");
  const [search, setSearch]             = useState("");
  const [filtroTipo, setFiltroTipo]     = useState<string>("todos");

  // Modal
  const [modalOpen, setModalOpen]       = useState(false);
  const [editando, setEditando]         = useState<Proveedor | null>(null);
  const [form, setForm]                 = useState(FORM_VACIO);
  const [guardando, setGuardando]       = useState(false);
  const [errorForm, setErrorForm]       = useState("");

  // Confirmar eliminar
  const [confirmEliminar, setConfirmEliminar] = useState<Proveedor | null>(null);
  const [eliminando, setEliminando]     = useState(false);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setCargando(true);
    try {
      const res = await api.get<Proveedor[]>("/api/proveedores");
      setProveedores(res.data);
    } catch {
      setError("Error al cargar los proveedores");
    } finally {
      setCargando(false);
    }
  }

  function abrirCrear() {
    setEditando(null);
    setForm(FORM_VACIO);
    setErrorForm("");
    setModalOpen(true);
  }

  function abrirEditar(p: Proveedor) {
    setEditando(p);
    setForm({ nombre: p.nombre, tipo: p.tipo, telefono: p.telefono || "", email: p.email || "", notas: p.notas || "" });
    setErrorForm("");
    setModalOpen(true);
  }

  async function guardar() {
    if (!form.nombre.trim()) { setErrorForm("El nombre es obligatorio"); return; }
    setGuardando(true);
    setErrorForm("");
    try {
      if (editando) {
        await api.put(`/api/proveedores/${editando.id}`, form);
      } else {
        await api.post("/api/proveedores", form);
      }
      setModalOpen(false);
      await cargar();
    } catch {
      setErrorForm("Error al guardar el proveedor");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar() {
    if (!confirmEliminar) return;
    setEliminando(true);
    try {
      await api.delete(`/api/proveedores/${confirmEliminar.id}`);
      setConfirmEliminar(null);
      await cargar();
    } catch {
      setError("Error al eliminar el proveedor");
    } finally {
      setEliminando(false);
    }
  }

  const filtered = proveedores.filter((p) => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (p.email || "").toLowerCase().includes(search.toLowerCase());
    const matchTipo = filtroTipo === "todos" || p.tipo === filtroTipo;
    return matchSearch && matchTipo;
  });

  // Stats
  const porTipo = (tipo: string) => proveedores.filter((p) => p.tipo === tipo).length;

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Proveedores</h2>
          <p className="text-sm text-gray-500 mt-0.5">Gestiona los proveedores de servicios</p>
        </div>
        <Button className="bg-[#d4663a] hover:bg-[#b8532e] gap-2" onClick={abrirCrear}>
          <Plus className="h-4 w-4" /> Nuevo proveedor
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm p-3 bg-red-50 rounded-xl border border-red-200">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { tipo: "TRANSPORTE", label: "Transporte", icon: <Truck className="h-4 w-4" />, color: "text-blue-600 bg-blue-50" },
          { tipo: "HOTEL",      label: "Hoteles",    icon: <Hotel className="h-4 w-4" />, color: "text-purple-600 bg-purple-50" },
          { tipo: "RESTAURANTE",label: "Restaurantes",icon: <UtensilsCrossed className="h-4 w-4" />, color: "text-amber-600 bg-amber-50" },
        ].map((s) => (
          <div key={s.tipo} className="bg-white border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{porTipo(s.tipo)}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Buscar por nombre o email..." className="pl-8"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {["todos", "TRANSPORTE", "HOTEL", "RESTAURANTE"].map((f) => (
            <Button key={f} size="sm"
              variant={filtroTipo === f ? "default" : "outline"}
              className={filtroTipo === f ? "bg-[#d4663a] hover:bg-[#b8532e]" : ""}
              onClick={() => setFiltroTipo(f)}>
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
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargando ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#d4663a]" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-400">
                  No se encontraron proveedores
                </TableCell>
              </TableRow>
            ) : filtered.map((p) => (
              <TableRow key={p.id} className="hover:bg-gray-50/50">
                <TableCell className="font-medium text-gray-800">{p.nombre}</TableCell>
                <TableCell>
                  <Badge variant="outline"
                    className={`gap-1 ${TIPO_STYLES[p.tipo]?.color}`}>
                    {TIPO_STYLES[p.tipo]?.icon}
                    {p.tipo.charAt(0) + p.tipo.slice(1).toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-600">{p.email || "—"}</TableCell>
                <TableCell className="text-sm text-gray-600">{p.telefono || "—"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2" onClick={() => abrirEditar(p)}>
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600"
                        onClick={() => setConfirmEliminar(p)}>
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal crear/editar */}
      <Dialog open={modalOpen} onOpenChange={(o) => !guardando && setModalOpen(o)}>
        <DialogContent className="max-w-md">
          <DialogDescription className="sr-only">
            Modal proveedor
          </DialogDescription>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar proveedor" : "Nuevo proveedor"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {errorForm && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> {errorForm}
              </p>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">
                Nombre <span className="text-red-500">*</span>
              </label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej. Transportes Colca SAC" className="mt-1" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Tipo</label>
              <select value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as Proveedor["tipo"] })}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4663a]/30 focus:border-[#d4663a]">
                <option value="TRANSPORTE">Transporte</option>
                <option value="HOTEL">Hotel</option>
                <option value="RESTAURANTE">Restaurante</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contacto@empresa.com" type="email" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Teléfono</label>
                <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  placeholder="+51 999 888 777" className="mt-1" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Notas internas</label>
              <textarea value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                placeholder="Observaciones, condiciones, etc."
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4663a]/30 focus:border-[#d4663a] resize-none"
                rows={3} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={guardando}>
              Cancelar
            </Button>
            <Button className="bg-[#d4663a] hover:bg-[#b8532e]" onClick={guardar} disabled={guardando}>
              {guardando && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editando ? "Guardar cambios" : "Crear proveedor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog confirmar eliminar */}
      <Dialog open={!!confirmEliminar} onOpenChange={(o) => !o && setConfirmEliminar(null)}>
        <DialogContent className="max-w-sm">
          <DialogDescription className="sr-only">
            Eliminar proveedor
          </DialogDescription>
          <DialogHeader>
            <DialogTitle>¿Eliminar proveedor?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Estás a punto de eliminar <strong>{confirmEliminar?.nombre}</strong>. Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmEliminar(null)}>Cancelar</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={eliminar} disabled={eliminando}>
              {eliminando && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Sí, eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
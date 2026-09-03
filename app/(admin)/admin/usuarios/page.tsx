
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
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Search, MoreHorizontal, Plus, Loader2,
  UserPlus, ShieldCheck, Trash2, Users,
  UserCog, AlertCircle,
} from "lucide-react";
import {
  getUsuarios, crearUsuario, cambiarRol, eliminarUsuario,
  Usuario, CrearUsuarioRequest,
} from "@/lib/usuarios";

// ── Estilos (coherentes con la paleta) ─────────────
const ROL_STYLES: Record<string, string> = {
  CLIENTE: "bg-slate-100 text-slate-700 border-slate-200",
  ADMIN:   "bg-amber-100 text-amber-700 border-amber-200",
};

const ROL_LABELS: Record<string, string> = {
  CLIENTE: "Cliente",
  ADMIN:   "Admin",
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Modal crear usuario
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [form, setForm] = useState<CrearUsuarioRequest>({
    nombreCompleto: "",
    email: "",
    password: "",
    rol: "CLIENTE",
  });
  const [creando, setCreando] = useState(false);

  // Modal cambiar rol
  const [cambioRol, setCambioRol] = useState<{ usuario: Usuario; nuevoRol: "CLIENTE" | "ADMIN" } | null>(null);
  const [cambiando, setCambiando] = useState(false);

  // Modal eliminar
  const [eliminar, setEliminar] = useState<Usuario | null>(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => { cargarUsuarios(); }, []);

  async function cargarUsuarios() {
    setCargando(true);
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch {
      setError("Error al cargar usuarios");
    } finally {
      setCargando(false);
    }
  }

  // Crear usuario
  async function handleCrear() {
    if (!form.nombreCompleto || !form.email || !form.password) return;
    setCreando(true);
    try {
      await crearUsuario(form);
      setMostrarCrear(false);
      setForm({ nombreCompleto: "", email: "", password: "", rol: "CLIENTE" });
      await cargarUsuarios();
    } catch {
      setError("Error al crear usuario");
    } finally {
      setCreando(false);
    }
  }

  // Cambiar rol
  async function confirmarCambioRol() {
    if (!cambioRol) return;
    setCambiando(true);
    try {
      await cambiarRol(cambioRol.usuario.id, cambioRol.nuevoRol);
      setCambioRol(null);
      await cargarUsuarios();
    } catch {
      setError("Error al cambiar rol");
    } finally {
      setCambiando(false);
    }
  }

  // Eliminar
  async function confirmarEliminar() {
    if (!eliminar) return;
    setEliminando(true);
    try {
      await eliminarUsuario(eliminar.id);
      setEliminar(null);
      await cargarUsuarios();
    } catch {
      setError("Error al eliminar usuario");
    } finally {
      setEliminando(false);
    }
  }

  const filtered = usuarios.filter((u) =>
    u.nombreCompleto.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const totalUsuarios = usuarios.length;
  const totalAdmins = usuarios.filter((u) => u.rol === "ADMIN").length;
  const totalClientes = usuarios.filter((u) => u.rol === "CLIENTE").length;
  const ultimoRegistro = usuarios
    .filter((u) => u.createdAt)
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))[0]?.createdAt ?? "";

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
        <p className="text-sm text-gray-500 mt-0.5">Administra los usuarios y roles del sistema</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm p-3 bg-red-50 rounded-xl border border-red-200">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Cards resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800">{totalUsuarios}</p>
            <p className="text-xs text-gray-500">Total usuarios</p>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800">{totalAdmins}</p>
            <p className="text-xs text-gray-500">Administradores</p>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center">
            <UserCog className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800">{totalClientes}</p>
            <p className="text-xs text-gray-500">Clientes</p>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <UserPlus className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">
              {ultimoRegistro ? new Date(ultimoRegistro).toLocaleDateString() : "—"}
            </p>
            <p className="text-xs text-gray-500">Último registrado</p>
          </div>
        </div>
      </div>

      {/* Filtros y botón crear */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o email..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          className="bg-[#d4663a] hover:bg-[#b8532e] gap-2"
          onClick={() => setMostrarCrear(true)}
        >
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Fecha registro</TableHead>
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
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-medium text-gray-800 text-sm">
                    {user.nombreCompleto}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={ROL_STYLES[user.rol]}>
                      {ROL_LABELS[user.rol]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() =>
                            setCambioRol({
                              usuario: user,
                              nuevoRol: user.rol === "ADMIN" ? "CLIENTE" : "ADMIN",
                            })
                          }
                        >
                          <UserCog className="h-4 w-4" />
                          {user.rol === "ADMIN"
                            ? "Convertir a Cliente"
                            : "Convertir a Admin"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="gap-2 text-red-600"
                          onClick={() => setEliminar(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar usuario
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

      {/* ─── Diálogo Crear usuario ─── */}
      <Dialog open={mostrarCrear} onOpenChange={setMostrarCrear}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear nuevo usuario</DialogTitle>
            <DialogDescription>
              Completa los datos para registrar un usuario. El rol por defecto es Cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              placeholder="Nombre completo"
              value={form.nombreCompleto}
              onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })}
            />
            <Input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              type="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <label className="text-sm">Rol:</label>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={form.rol}
                onChange={(e) =>
                  setForm({ ...form, rol: e.target.value as "CLIENTE" | "ADMIN" })
                }
              >
                <option value="CLIENTE">Cliente</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMostrarCrear(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-[#d4663a] hover:bg-[#b8532e]"
              disabled={creando}
              onClick={handleCrear}
            >
              {creando && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Diálogo Cambiar rol ─── */}
      <Dialog open={!!cambioRol} onOpenChange={(o) => !o && setCambioRol(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cambiar rol</DialogTitle>
            <DialogDescription>
              ¿Convertir a <strong>{cambioRol?.usuario.nombreCompleto}</strong> en{" "}
              <strong>{ROL_LABELS[cambioRol?.nuevoRol ?? ""]}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCambioRol(null)}>
              Cancelar
            </Button>
            <Button
              className="bg-[#d4663a] hover:bg-[#b8532e]"
              disabled={cambiando}
              onClick={confirmarCambioRol}
            >
              {cambiando && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Diálogo Eliminar ─── */}
      <Dialog open={!!eliminar} onOpenChange={(o) => !o && setEliminar(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de eliminar a{" "}
              <strong>{eliminar?.nombreCompleto}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEliminar(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={eliminando}
              onClick={confirmarEliminar}
            >
              {eliminando && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
// app/(admin)/admin/mensajeria/page.tsx
"use client";
export const dynamic = "force-dynamic";
import { useCallback, useEffect, useState } from "react";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Search, CheckCircle2, XCircle, RefreshCw, Loader2,
    AlertCircle, RotateCcw,
} from "lucide-react";
import {
    getEntregas, getEntregaStats, getAuditoria,
    getConfigMensajeria, actualizarConfigMensajeria,
    reprocesarEntrega, reprocesarTodas,
    EntregaDto, EntregaStatsDto, AuditoriaDto,
} from "@/lib/admin";

const ESTADO_STYLES: Record<string, string> = {
    ENTREGADA: "bg-emerald-100 text-emerald-700 border-emerald-200",
    REGISTRADA: "bg-emerald-100 text-emerald-700 border-emerald-200",
    FALLIDA: "bg-red-100 text-red-600 border-red-200",
    REPROCESADA: "bg-sky-100 text-sky-700 border-sky-200",
    EN_PROCESO: "bg-amber-100 text-amber-700 border-amber-200",
};

const ESTADO_LABELS: Record<string, string> = {
    ENTREGADA: "Entregada",
    REGISTRADA: "Registrada",
    FALLIDA: "Fallida",
    REPROCESADA: "Reprocesada",
    EN_PROCESO: "En proceso",
};

const EVENTO_STYLES: Record<string, string> = {
    RESERVA_CONFIRMADA: "bg-emerald-50 text-emerald-700 border-emerald-200",
    RESERVA_CANCELADA: "bg-red-50 text-red-600 border-red-200",
};

const EVENTO_LABELS: Record<string, string> = {
    RESERVA_CONFIRMADA: "Confirmada",
    RESERVA_CANCELADA: "Cancelada",
};

const FILTROS = ["todos", "ENTREGADA", "FALLIDA", "REPROCESADA"];

function formatearFecha(f: string) {
    return f ? new Date(f).toLocaleString("es-PE") : "—";
}

export default function MensajeriaAdminPage() {
    const [entregas, setEntregas] = useState<EntregaDto[]>([]);
    const [stats, setStats] = useState<EntregaStatsDto | null>(null);
    const [auditoria, setAuditoria] = useState<AuditoriaDto[]>([]);
    const [simularFallo, setSimularFallo] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [aviso, setAviso] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("todos");
    const [busquedaAuditoria, setBusquedaAuditoria] = useState("");
    const [reprocesandoId, setReprocesandoId] = useState<string | null>(null);
    const [reprocesandoTodos, setReprocesandoTodos] = useState(false);
    const [cambiandoConfig, setCambiandoConfig] = useState(false);

    const cargar = useCallback(async () => {
        try {
            const [e, s, a, c] = await Promise.all([
                getEntregas(), getEntregaStats(), getAuditoria(), getConfigMensajeria(),
            ]);
            setEntregas(e); setStats(s); setAuditoria(a);
            setSimularFallo(c.simularFalloNotificaciones);
        } catch {
            setError("Error al cargar la mensajería");
        } finally {
            setCargando(false);
        }
    }, []);

    // Carga inicial y refresco cada 10 s (para ver el reproceso automático)
    useEffect(() => {
        cargar();
        const t = setInterval(cargar, 10000);
        return () => clearInterval(t);
    }, [cargar]);

    async function toggleSimulacion() {
        setCambiandoConfig(true);
        setError(""); setAviso("");
        try {
            const c = await actualizarConfigMensajeria(!simularFallo);
            setSimularFallo(c.simularFalloNotificaciones);
        } catch {
            setError("No se pudo cambiar la simulación de falla");
        } finally {
            setCambiandoConfig(false);
        }
    }

    async function reprocesar(id: string) {
        setReprocesandoId(id);
        setError(""); setAviso("");
        try {
            const r = await reprocesarEntrega(id);
            if (r.ok) setAviso(r.mensaje); else setError(r.mensaje);
            await cargar();
        } catch {
            setError("No se pudo reprocesar el mensaje");
        } finally {
            setReprocesandoId(null);
        }
    }

    async function reprocesarTodo() {
        setReprocesandoTodos(true);
        setError(""); setAviso("");
        try {
            const r = await reprocesarTodas();
            if (r.intentados === 0) {
                setAviso("No hay mensajes pendientes por reprocesar");
            } else if (r.fallidos === 0) {
                setAviso(`Se reprocesaron ${r.exitosos} mensaje(s) correctamente`);
            } else {
                setError(`Reprocesados: ${r.exitosos} · volvieron a fallar: ${r.fallidos}`);
            }
            await cargar();
        } catch {
            setError("No se pudieron reprocesar los mensajes");
        } finally {
            setReprocesandoTodos(false);
        }
    }

    const entregasFiltradas = entregas.filter(
        (e) => filtroEstado === "todos" || e.estado === filtroEstado
    );

    const q = busquedaAuditoria.trim().toLowerCase();
    const auditoriaFiltrada = auditoria.filter(
        (a) =>
            !q ||
            a.reservaId?.toLowerCase().includes(q) ||
            a.correlationId?.toLowerCase().includes(q) ||
            a.clienteNombre?.toLowerCase().includes(q)
    );

    const fallidas = stats?.fallidas ?? 0;

    return (
        <div className="space-y-6">

            {/* Encabezado */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Mensajería</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Eventos del ESB: cada reserva confirmada o cancelada llega a sus suscriptores de forma independiente
                    </p>
                </div>
                <Button size="sm" variant="outline" onClick={cargar}>
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Actualizar
                </Button>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm p-3 bg-red-50 rounded-xl border border-red-200">
                    <AlertCircle className="h-4 w-4" /> {error}
                </div>
            )}
            {aviso && (
                <div className="flex items-center gap-2 text-emerald-700 text-sm p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="h-4 w-4" /> {aviso}
                </div>
            )}

            {/* Simulación de falla (solo demo) */}
            <div className="bg-white border rounded-xl p-5 space-y-3">
                <div>
                    <h3 className="text-sm font-semibold text-gray-800">Simular falla de notificaciones</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Solo para demostración. Con la falla activa, el suscriptor de Notificaciones falla a propósito:
                        la cola reintenta 3 veces y el mensaje queda en dead letter (Fallida). Auditoría no se ve afectada.
                        Al desactivarla, puedes reprocesar los mensajes fallidos.
                    </p>
                </div>
                <button
                    disabled={cambiandoConfig}
                    onClick={toggleSimulacion}
                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 disabled:opacity-50 ${simularFallo
                        ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        }`}>
                    {cambiandoConfig
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : simularFallo ? <XCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                    {simularFallo ? "Falla ACTIVADA — clic para desactivar" : "Falla desactivada — clic para activar"}
                </button>
            </div>

            {/* ───────────── Bloque 1: Notificaciones ───────────── */}
            <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Notificaciones</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Avisos entregados a los clientes y envíos fallidos. Los fallidos se reintentan solos cada pocos minutos.
                        </p>
                    </div>
                    {fallidas > 0 && (
                        <Button size="sm" disabled={reprocesandoTodos}
                            className="bg-[#d4663a] hover:bg-[#b8532e]"
                            onClick={reprocesarTodo}>
                            {reprocesandoTodos
                                ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                : <RotateCcw className="h-3.5 w-3.5 mr-1.5" />}
                            Reprocesar todos ({fallidas})
                        </Button>
                    )}
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: "Entregadas", value: stats?.entregadas ?? 0, icon: <CheckCircle2 className="h-4 w-4" />, color: "text-emerald-600 bg-emerald-50" },
                        { label: "Fallidas pendientes", value: fallidas, icon: <XCircle className="h-4 w-4" />, color: "text-red-600 bg-red-50" },
                        { label: "Reprocesadas", value: stats?.reprocesadas ?? 0, icon: <RotateCcw className="h-4 w-4" />, color: "text-sky-600 bg-sky-50" },
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
                <div className="flex gap-2 flex-wrap">
                    {FILTROS.map((f) => (
                        <Button key={f} size="sm"
                            variant={filtroEstado === f ? "default" : "outline"}
                            className={filtroEstado === f ? "bg-[#d4663a] hover:bg-[#b8532e]" : ""}
                            onClick={() => setFiltroEstado(f)}>
                            {f === "todos" ? "Todos" : ESTADO_LABELS[f]}
                        </Button>
                    ))}
                </div>

                {/* Tabla */}
                <div className="rounded-xl border bg-white overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead>Fecha</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Evento</TableHead>
                                <TableHead>Reserva</TableHead>
                                <TableHead>Suscriptor</TableHead>
                                <TableHead>Detalle</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cargando ? (
                                <TableRow><TableCell colSpan={8} className="text-center py-12">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#d4663a]" />
                                </TableCell></TableRow>
                            ) : entregasFiltradas.length === 0 ? (
                                <TableRow><TableCell colSpan={8} className="text-center py-12 text-gray-400">
                                    No hay mensajes para mostrar
                                </TableCell></TableRow>
                            ) : entregasFiltradas.map((e) => (
                                <TableRow key={`${e.estado === "ENTREGADA" ? "n" : "f"}-${e.id}`} className="hover:bg-gray-50/50">
                                    <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                                        {formatearFecha(e.fecha)}
                                    </TableCell>
                                    <TableCell className="text-sm font-medium text-gray-800">{e.clienteNombre}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={EVENTO_STYLES[e.eventoTipo] ?? ""}>
                                            {EVENTO_LABELS[e.eventoTipo] ?? e.eventoTipo ?? "—"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-500 font-mono">
                                        #{e.reservaId?.slice(0, 8) ?? "—"}
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600">{e.suscriptor}</TableCell>
                                    <TableCell className="text-xs text-gray-500 max-w-[260px] truncate" title={e.detalle}>
                                        {e.detalle}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={ESTADO_STYLES[e.estado] ?? ""}>
                                            {e.estado === "ENTREGADA" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                            {e.estado === "FALLIDA" && <XCircle className="h-3 w-3 mr-1" />}
                                            {e.estado === "REPROCESADA" && <RotateCcw className="h-3 w-3 mr-1" />}
                                            {ESTADO_LABELS[e.estado]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {e.reprocesable && (
                                            <Button size="sm" variant="outline"
                                                disabled={reprocesandoId === e.id || reprocesandoTodos}
                                                onClick={() => reprocesar(e.id)}>
                                                {reprocesandoId === e.id
                                                    ? <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                    : <RotateCcw className="h-3 w-3 mr-1" />}
                                                Reprocesar
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* ───────────── Bloque 2: Auditoría ───────────── */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Auditoría</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Registro permanente de cada evento, con una copia de los datos al momento en que ocurrió.
                        Muestra qué hizo cada suscriptor con el evento.
                    </p>
                </div>

                <div className="relative max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input placeholder="Buscar por reserva o correlationId..." className="pl-8"
                        value={busquedaAuditoria} onChange={(e) => setBusquedaAuditoria(e.target.value)} />
                </div>

                <div className="rounded-xl border bg-white overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead>Hora</TableHead>
                                <TableHead>Evento</TableHead>
                                <TableHead>Reserva</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>CorrelationId</TableHead>
                                <TableHead>Resultado por suscriptor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cargando ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-12">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#d4663a]" />
                                </TableCell></TableRow>
                            ) : auditoriaFiltrada.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-12 text-gray-400">
                                    No hay eventos registrados
                                </TableCell></TableRow>
                            ) : auditoriaFiltrada.map((a) => (
                                <TableRow key={a.id} className="hover:bg-gray-50/50">
                                    <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                                        {formatearFecha(a.fecha)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={EVENTO_STYLES[a.tipoEvento] ?? ""}>
                                            {EVENTO_LABELS[a.tipoEvento] ?? a.tipoEvento}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-500 font-mono">
                                        #{a.reservaId?.slice(0, 8)}
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-medium text-sm text-gray-800">{a.clienteNombre}</p>
                                        <p className="text-xs text-gray-400">{a.clienteEmail}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {a.paqueteNombre}
                                            {a.monto ? ` · $${a.monto}` : ""}
                                            {a.metodo ? ` · ${a.metodo}` : ""}
                                        </p>
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-500 font-mono" title={a.correlationId}>
                                        {a.correlationId ? `${a.correlationId.slice(0, 8)}…` : "—"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1.5">
                                            {a.resultados.map((r) => (
                                                <Badge key={r.suscriptor} variant="outline" className={ESTADO_STYLES[r.estado] ?? ""}>
                                                    {r.suscriptor}: {ESTADO_LABELS[r.estado] ?? r.estado}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
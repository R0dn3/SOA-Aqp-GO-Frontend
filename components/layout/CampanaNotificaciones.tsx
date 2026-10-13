// components/layout/CampanaNotificaciones.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import {
    getNotificaciones, getNoLeidas, marcarLeida, marcarTodasLeidas,
    NotificacionDto,
} from "@/lib/notificaciones";

const INTERVALO_MS = 15000;

export default function CampanaNotificaciones() {
    const [abierto, setAbierto] = useState(false);
    const [noLeidas, setNoLeidas] = useState(0);
    const [items, setItems] = useState<NotificacionDto[]>([]);
    const [cargando, setCargando] = useState(false);
    const contenedor = useRef<HTMLDivElement>(null);

    const refrescarContador = useCallback(async () => {
        try {
            setNoLeidas(await getNoLeidas());
        } catch {
            /* si falla, se reintenta en el próximo ciclo */
        }
    }, []);

    const cargarLista = useCallback(async () => {
        setCargando(true);
        try {
            const lista = await getNotificaciones();
            setItems(lista);
            setNoLeidas(lista.filter((n) => !n.leida).length);
        } catch {
            /* ignorar */
        } finally {
            setCargando(false);
        }
    }, []);

    // Consulta el contador cada 15 segundos
    useEffect(() => {
        refrescarContador();
        const t = setInterval(refrescarContador, INTERVALO_MS);
        return () => clearInterval(t);
    }, [refrescarContador]);

    // Cierra al hacer clic fuera
    useEffect(() => {
        function fuera(e: MouseEvent) {
            if (contenedor.current && !contenedor.current.contains(e.target as Node)) {
                setAbierto(false);
            }
        }
        document.addEventListener("mousedown", fuera);
        return () => document.removeEventListener("mousedown", fuera);
    }, []);

    function alternar() {
        const siguiente = !abierto;
        setAbierto(siguiente);
        if (siguiente) cargarLista();
    }

    async function abrirNotificacion(n: NotificacionDto) {
        if (!n.leida) {
            setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, leida: true } : x)));
            setNoLeidas((c) => Math.max(0, c - 1));
            try { await marcarLeida(n.id); } catch { /* ignorar */ }
        }
    }

    async function leerTodas() {
        setItems((prev) => prev.map((x) => ({ ...x, leida: true })));
        setNoLeidas(0);
        try { await marcarTodasLeidas(); } catch { /* ignorar */ }
    }

    return (
        <div className="relative" ref={contenedor}>
            <button
                onClick={alternar}
                aria-label="Notificaciones"
                className="relative flex items-center justify-center w-10 h-10 rounded-lg text-[#f4e8d9] hover:bg-[#3d2820] hover:text-white transition-all"
            >
                <Bell className="w-5 h-5" />
                {noLeidas > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#d4663a] text-white text-[10px] font-bold flex items-center justify-center">
                        {noLeidas > 9 ? "9+" : noLeidas}
                    </span>
                )}
            </button>

            {abierto && (
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-[#e8d8cc] overflow-hidden z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8d8cc] bg-[#fdf4ef]">
                        <p className="text-sm font-bold text-[#2a1810]">Notificaciones</p>
                        {noLeidas > 0 && (
                            <button
                                onClick={leerTodas}
                                className="text-xs text-[#d4663a] hover:underline flex items-center gap-1"
                            >
                                <CheckCheck className="w-3.5 h-3.5" /> Marcar todas
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {cargando && items.length === 0 ? (
                            <div className="py-8 flex justify-center">
                                <Loader2 className="w-5 h-5 animate-spin text-[#d4663a]" />
                            </div>
                        ) : items.length === 0 ? (
                            <p className="py-8 text-center text-sm text-gray-400">
                                Aún no tienes notificaciones
                            </p>
                        ) : (
                            items.map((n) => (
                                <Link
                                    key={n.id}
                                    href="/dashboard"
                                    onClick={() => { abrirNotificacion(n); setAbierto(false); }}
                                    className={`flex gap-3 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${n.leida ? "" : "bg-orange-50/60"}`}
                                >
                                    {n.tipo === "RESERVA_CONFIRMADA" ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div className="min-w-0">
                                        <p className={`text-sm text-gray-800 ${n.leida ? "" : "font-semibold"}`}>
                                            {n.mensaje}
                                        </p>
                                        <p className="text-[11px] text-gray-400 mt-1">
                                            {new Date(n.creadaEn).toLocaleString("es-PE")}
                                        </p>
                                    </div>
                                    {!n.leida && (
                                        <span className="w-2 h-2 rounded-full bg-[#d4663a] flex-shrink-0 mt-2" />
                                    )}
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
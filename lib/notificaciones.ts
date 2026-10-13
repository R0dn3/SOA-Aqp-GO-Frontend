// lib/notificaciones.ts
import api from "@/lib/axios";

export interface NotificacionDto {
    id: string;
    tipo: "RESERVA_CONFIRMADA" | "RESERVA_CANCELADA" | string;
    mensaje: string;
    reservaId: string;
    leida: boolean;
    creadaEn: string;
}

export interface AvisoPendienteDto {
    reservaId: string;
    eventoTipo: string;
}

export async function getNotificaciones(): Promise<NotificacionDto[]> {
    const res = await api.get<NotificacionDto[]>("/api/notificaciones");
    return res.data;
}

export async function getNoLeidas(): Promise<number> {
    const res = await api.get<{ total: number }>("/api/notificaciones/no-leidas");
    return res.data.total;
}

export async function marcarLeida(id: string): Promise<void> {
    await api.patch(`/api/notificaciones/${id}/leida`);
}

export async function marcarTodasLeidas(): Promise<void> {
    await api.patch("/api/notificaciones/leidas");
}

/** Avisos de reserva que fallaron y aún no se reenvían (banner en Mis reservas). */
export async function getAvisosPendientes(): Promise<AvisoPendienteDto[]> {
    const res = await api.get<AvisoPendienteDto[]>("/api/notificaciones/pendientes");
    return res.data;
}
// lib/api/tickets.ts
import api from "@/lib/axios";

export type TipoTicket    = "SERVICIO" | "INFORMACION" | "ACCESO";
export type EstadoTicket  = "ABIERTO" | "EN_PROCESO" | "RESUELTO" | "CERRADO";
export type PrioridadTicket = "BAJA" | "MEDIA" | "ALTA";

export interface MensajeDto {
  id: string;
  autorNombre: string;
  mensaje: string;
  esAdmin: boolean;
  createdAt: string;
}

export interface TicketResumen {
  id: string;
  asunto: string;
  tipo: TipoTicket;
  estado: EstadoTicket;
  prioridad: PrioridadTicket;
  usuarioNombre: string;
  usuarioEmail: string;
  reservaId?: string;
  adminNombre?: string;
  createdAt: string;
  updatedAt: string;
  totalMensajes: number;
}

export interface TicketDetalle extends TicketResumen {
  mensajes: MensajeDto[];
}

export interface TicketStatsDto {
  totalTickets: number;
  abiertos: number;
  enProceso: number;
  resueltos: number;
  cerrados: number;
  sinAsignar: number;
}

// ── Cliente ───────────────────────────────────────────────────

export async function crearTicket(data: {
  tipo: TipoTicket;
  asunto: string;
  mensajeInicial: string;
  reservaId?: string;
}): Promise<TicketDetalle> {
  const res = await api.post<TicketDetalle>("/api/tickets", data);
  return res.data;
}

export async function getMisTickets(): Promise<TicketResumen[]> {
  const res = await api.get<TicketResumen[]>("/api/tickets/mis-tickets");
  return res.data;
}

export async function getTicketDetalle(id: string): Promise<TicketDetalle> {
  const res = await api.get<TicketDetalle>(`/api/tickets/${id}`);
  return res.data;
}

export async function responderTicket(id: string, mensaje: string): Promise<TicketDetalle> {
  const res = await api.post<TicketDetalle>(`/api/tickets/${id}/responder`, { mensaje });
  return res.data;
}

// ── Admin / Operador ──────────────────────────────────────────

export async function getTicketsAdmin(page = 0, size = 20, estado?: EstadoTicket) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (estado) params.append("estado", estado);
  const res = await api.get(`/api/admin/tickets?${params}`);
  return res.data;
}

export async function getTicketDetalleAdmin(
  id: string
): Promise<TicketDetalle> {
  const res = await api.get<TicketDetalle>(
    `/api/admin/tickets/${id}`
  );
  return res.data;
}

export async function responderTicketAdmin(id: string, mensaje: string): Promise<TicketDetalle> {
  const res = await api.post<TicketDetalle>(`/api/admin/tickets/${id}/responder`, { mensaje });
  return res.data;
}

export async function cambiarEstadoTicket(id: string, estado: EstadoTicket): Promise<TicketDetalle> {
  const res = await api.patch<TicketDetalle>(`/api/admin/tickets/${id}/estado`, { estado });
  return res.data;
}

export async function cambiarPrioridadTicket(id: string, prioridad: PrioridadTicket): Promise<TicketDetalle> {
  const res = await api.patch<TicketDetalle>(`/api/admin/tickets/${id}/prioridad`, { prioridad });
  return res.data;
}

export async function getTicketStats(): Promise<TicketStatsDto> {
  const res = await api.get<TicketStatsDto>("/api/admin/tickets/stats");
  return res.data;
}
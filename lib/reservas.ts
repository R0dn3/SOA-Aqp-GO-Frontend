// lib/api/reservas.ts
import api from "@/lib/axios";

export interface AcompananteRequest {
  nombreCompleto: string;
  dniPasaporte: string;
  pais?: string;
  fechaNacimiento?: string;
  genero?: string;
  datosAdicionales?: string;
}

export interface ReservaRequest {
  paqueteId: string;
  fechaSalida: string;
  numPersonas: number;
  acompanantes?: AcompananteRequest[];
}

export interface ReservaResponse {
  id: string;
  paqueteId: string;
  paqueteNombre: string;
  fotoPrincipal?: string;
  fechaSalida: string;
  numPersonas: number;
  precioTotal: number;
  estado: string;
  createdAt: string;
  acompanantes: AcompananteRequest[];
}

export interface PagoRequest {
  reservaId: string;
  monto: number;
  metodo: "TRANSFERENCIA" | "TARJETA" | "YAPE" | "PLIN" | "EFECTIVO";
  referencia: string;
}

export interface PagoResponse {
  id: string;
  reservaId: string;
  monto: number;
  metodo: string;
  estado: string;   // VERIFICADO | RECHAZADO
  referencia: string;
  fechaPago: string;
}

export async function crearReserva(data: ReservaRequest): Promise<ReservaResponse> {
  const res = await api.post<ReservaResponse>("/api/reservas", data);
  return res.data;
}

export async function getMisReservas(): Promise<ReservaResponse[]> {
  const res = await api.get<ReservaResponse[]>("/api/reservas/mis-reservas");
  return res.data;
}

export async function getReserva(id: string): Promise<ReservaResponse> {
  const res = await api.get<ReservaResponse>(`/api/reservas/${id}`);
  return res.data;
}

export async function cancelarReserva(id: string): Promise<ReservaResponse> {
  const res = await api.patch<ReservaResponse>(`/api/reservas/${id}/cancelar`);
  return res.data;
}

export async function procesarPago(data: PagoRequest): Promise<PagoResponse> {
  const res = await api.post<PagoResponse>("/api/pagos", data);
  return res.data;
}
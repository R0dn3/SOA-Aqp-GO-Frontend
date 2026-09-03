import api from "./axios";
import { PaqueteResumen, PaqueteDetalle} from "@/types";

// ── Tipos del request ─────────────────────────────────────────
export interface PaqueteCreateRequest {
  nombre: string;
  subtitulo?: string | null;
  resumenMd?: string | null;
  recomendacionesMd?: string | null;
  incluyeMd?: string | null;
  noIncluyeMd?: string | null;
  preguntasMd?: string | null;
  precioBase: number;
  duracionDias: number;
  duracionNoches?: number | null;
  mapaUrl?: string | null;
  activo: boolean;
  lugarIds: string[];
  proveedores: ProveedorAsignadoRequest[];
  fotos: FotoRequest[];
  itinerario: ItinerarioDiaRequest[];
}
 
export interface FotoRequest {
  url: string;
  alt?: string | null;
  orden: number;
}
 
export interface ItinerarioDiaRequest {
  diaNumero: number;
  titulo: string;
  descripcionMd?: string | null;
}
 
export interface ProveedorAsignadoRequest {
  proveedorId: string;
  rol: string;
  notas?: string | null;
}
 
// ── Endpoints ─────────────────────────────────────────────────
 
// Público — lista de tarjetas para la web del cliente
export async function  obtenerPaquetes(): Promise<PaqueteResumen[]> {
  const res = await api.get<PaqueteResumen[]>("/api/paquetes");
  return res.data;
}
 
// Público — detalle completo al hacer click en un paquete
export async function obtenerPaqueteDetalle(id: string): Promise<PaqueteDetalle> {
  const res = await api.get<PaqueteDetalle>(`/api/paquetes/${id}`);
  return res.data;
}
 
// Admin — crear paquete con todo incluido
export async function crearPaquete(data: PaqueteCreateRequest): Promise<PaqueteDetalle> {
  const res = await api.post<PaqueteDetalle>("/api/paquetes", data);
  return res.data;
}
 
// Admin — editar paquete (reemplaza todo)
export async function editarPaquete(id: string, data: PaqueteCreateRequest): Promise<PaqueteDetalle> {
  const res = await api.put<PaqueteDetalle>(`/api/paquetes/${id}`, data);
  return res.data;
}
 
// Admin — activar o desactivar
export async function togglePaquete(id: string): Promise<PaqueteDetalle> {
  const res = await api.patch<PaqueteDetalle>(`/api/paquetes/${id}/toggle`);
  return res.data;
}
 
// Admin — eliminar
export async function eliminarPaquete(id: string): Promise<void> {
  await api.delete(`/api/paquetes/${id}`);
}
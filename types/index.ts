// ── Auth ──────────────────────────────────────────────────────
export interface AuthResponse {
  token: string;
  email: string;
  nombreCompleto: string;
  rol: "CLIENTE" | "ADMIN";
  telefono?: string;      
  dniPasaporte?: string;
}
 
export interface LoginRequest {
  email: string;
  password: string;
}
 
export interface RegisterRequest {
  nombreCompleto: string;
  email: string;
  password: string;
  telefono?: string;
  rol?: string;
}
 
// ── Usuario ───────────────────────────────────────────────────
export interface Usuario {
  id: string;
  nombreCompleto: string;
  email: string;
  telefono?: string;
  dniPasaporte?: string;
  pais?: string;
  fechaNacimiento?: string;
  genero?: string;
  rol: "CLIENTE" | "ADMIN";
}
 
// ── Paquetes ──────────────────────────────────────────────────
export interface PaqueteResumen {
  id: string;
  nombre: string;
  subtitulo?: string;
  precioBase: number;
  duracionDias: number;
  duracionNoches?: number;
  fotoPrincipal?: string;
  lugares: string[];
}
 
export interface PaqueteDetalle {
  id: string;
  nombre: string;
  subtitulo?: string;
  resumenMd?: string;
  recomendacionesMd?: string;
  incluyeMd?: string;
  noIncluyeMd?: string;
  preguntasMd?: string;
  precioBase: number;
  duracionDias: number;
  duracionNoches?: number;
  mapaUrl?: string;
  fotos: FotoDto[];
  lugares: string[];
  itinerario: ItinerarioDto[];
}
 
export interface FotoDto {
  id: string;
  url: string;
  alt?: string;
  orden: number;
}
 
export interface ItinerarioDto {
  diaNumero: number;
  titulo: string;
  descripcionMd?: string;
}
 
// ── Reservas ──────────────────────────────────────────────────
export interface ReservaRequest {
  paqueteId: string;
  fechaSalida: string;
  numPersonas: number;
  acompanantes?: AcompananteDto[];
}
 
export interface AcompananteDto {
  nombreCompleto: string;
  dniPasaporte: string;
  pais?: string;
  fechaNacimiento?: string;
  genero?: string;
  datosAdicionales?: string;
}
 
export interface Reserva {
  id: string;
  paquete: PaqueteResumen;
  fechaSalida: string;
  numPersonas: number;
  precioTotal: number;
  estado: "PENDIENTE_PAGO" | "CONFIRMADA" | "CANCELADA" | "COMPLETADA";
  createdAt: string;
}
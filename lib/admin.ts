// lib/api/admin.ts
import api from "@/lib/axios";

export interface StatsDto {
  totalPaquetes: number;
  totalReservas: number;
  totalUsuarios: number;
  totalProveedores: number;
  reservasHoy: number;
  reservasPendientesPago: number;
  ingresosTotales: number;
}

export interface ActividadRecienteDto {
  id: string;
  clienteNombre: string;
  clienteEmail: string;
  paqueteNombre: string;
  fechaSalida: string;
  numPersonas: number;
  precioTotal: number;
  estado: string;
  createdAt: string;
}

export interface PaqueteAdminDto {
  id: string;
  nombre: string;
  lugares: string[];
  precioBase: number;
  duracionDias: number;
  duracionNoches: number;
  totalReservas: number;
  ingresosTotales: number;
  fotoPrincipal?: string;
  activo: boolean;
  createdAt: string;
}

export interface PagoAdminDto {
  id: string;
  reservaId: string;
  clienteNombre: string;
  clienteEmail: string;
  paqueteNombre: string;
  monto: number;
  metodo: string;
  estado: string;
  referencia: string;
  fechaPago: string;
}

export interface PagoStatsDto {
  totalPagos: number;
  pagosVerificados: number;
  pagosPendientes: number;
  pagosRechazados: number;
  montoTotalVerificado: number;
}

// ── Mensajería (ESB) ─────────────────────────────────────────

export interface EntregaDto {
  id: string;
  estado: "ENTREGADA" | "FALLIDA" | "REPROCESADA";
  suscriptor: string;
  eventoTipo: string;
  reservaId: string;
  clienteNombre: string;
  detalle: string;
  correlationId: string;
  fecha: string;
  reprocesable: boolean;
}

export interface EntregaStatsDto {
  entregadas: number;
  fallidas: number;
  reprocesadas: number;
}

export interface ResultadoSuscriptorDto {
  suscriptor: string;
  estado: string;
}

export interface AuditoriaDto {
  id: string;
  tipoEvento: string;
  reservaId: string;
  clienteNombre: string;
  clienteEmail: string;
  paqueteNombre: string;
  monto: string;
  metodo: string;
  estadoPago: string;
  correlationId: string;
  fecha: string;
  resultados: ResultadoSuscriptorDto[];
}

export interface ConfigMensajeriaDto {
  simularFalloNotificaciones: boolean;
}

export interface ResultadoReprocesoDto {
  ok: boolean;
  mensaje: string;
}

export interface ResumenReprocesoDto {
  intentados: number;
  exitosos: number;
  fallidos: number;
}

export interface MetodoPagoConfigDto {
  metodo: "TARJETA" | "YAPE" | "PLIN" | "TRANSFERENCIA" | "EFECTIVO";
  activo: boolean;
}

export async function getStats(): Promise<StatsDto> {
  const res = await api.get<StatsDto>("/api/admin/stats");
  return res.data;
}

export async function getActividadReciente(): Promise<ActividadRecienteDto[]> {
  const res = await api.get<ActividadRecienteDto[]>("/api/admin/actividad-reciente");
  return res.data;
}

export async function getPaquetesAdmin(): Promise<PaqueteAdminDto[]> {
  const res = await api.get<PaqueteAdminDto[]>("/api/admin/paquetes");
  return res.data;
}

export async function getPagosAdmin(): Promise<PagoAdminDto[]> {
  const res = await api.get<PagoAdminDto[]>("/api/admin/pagos");
  return res.data;
}

export async function getPagoStats(): Promise<PagoStatsDto> {
  const res = await api.get<PagoStatsDto>("/api/admin/pagos/stats");
  return res.data;
}

export async function cambiarEstadoReserva(
  id: string,
  estado: string
): Promise<void> {
  await api.patch(`/api/reservas/${id}/estado`, { estado });
}

export async function getMetodosPago(): Promise<MetodoPagoConfigDto[]> {
  const res = await api.get<MetodoPagoConfigDto[]>("/api/admin/metodos-pago");
  return res.data;
}

export async function actualizarMetodoPago(metodo: string, activo: boolean): Promise<MetodoPagoConfigDto> {
  const res = await api.patch<MetodoPagoConfigDto>(`/api/admin/metodos-pago/${metodo}`, { activo });
  return res.data;
}

export async function getEntregas(): Promise<EntregaDto[]> {
  const res = await api.get<EntregaDto[]>("/api/admin/esb/entregas");
  return res.data;
}

export async function getEntregaStats(): Promise<EntregaStatsDto> {
  const res = await api.get<EntregaStatsDto>("/api/admin/esb/entregas/stats");
  return res.data;
}

export async function getAuditoria(): Promise<AuditoriaDto[]> {
  const res = await api.get<AuditoriaDto[]>("/api/admin/esb/auditoria");
  return res.data;
}

export async function getConfigMensajeria(): Promise<ConfigMensajeriaDto> {
  const res = await api.get<ConfigMensajeriaDto>("/api/admin/esb/config");
  return res.data;
}

export async function actualizarConfigMensajeria(
  simularFalloNotificaciones: boolean
): Promise<ConfigMensajeriaDto> {
  const res = await api.patch<ConfigMensajeriaDto>("/api/admin/esb/config", {
    simularFalloNotificaciones,
  });
  return res.data;
}

export async function reprocesarEntrega(id: string): Promise<ResultadoReprocesoDto> {
  const res = await api.post<ResultadoReprocesoDto>(`/api/admin/esb/entregas/${id}/reprocesar`);
  return res.data;
}

export async function reprocesarTodas(): Promise<ResumenReprocesoDto> {
  const res = await api.post<ResumenReprocesoDto>("/api/admin/esb/entregas/reprocesar-todos");
  return res.data;
}
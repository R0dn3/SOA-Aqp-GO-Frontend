import api from "@/lib/axios";
import { obtenerToken } from "@/lib/auth";

export interface ResumenReportes {
  ingresosEsteMes: number;
  totalReservas: number;
  confirmadas: number;
  crecimientoIngresos: number;   // porcentaje
  nuevosClientesMes: number;
}

export interface IngresoMensual {
  mes: string;
  ingresos: number;
  reservas: number;
}

export interface EstadoReserva {
  estado: string;
  cantidad: number;
}

export interface ProcedenciaCliente {
  pais: string;
  clientes: number;
  porcentaje: number;
}

export interface ReservaSemana {
  dia: string;
  nuevas: number;
  canceladas: number;
}

export interface RendimientoPaquete {
  nombre: string;
  reservas: number;
  ingresos: number;
  duracionDias: number;
}

export interface ReporteCompleto {
  resumen: ResumenReportes;
  ingresosMensuales: IngresoMensual[];
  estadosReserva: EstadoReserva[];
  procedenciaClientes: ProcedenciaCliente[];
  reservasSemana: ReservaSemana[];
  rendimientoPaquetes: RendimientoPaquete[];
}

export async function getReportes(): Promise<ReporteCompleto> {
  const res = await api.get<ReporteCompleto>("/api/admin/reportes");
  return res.data;
}

export async function getResumenReportesSoap(): Promise<ResumenReportes> {
  const token = obtenerToken();
  const res = await fetch("/api/soap/resumen-reportes", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "No se pudo cargar el resumen");
  }
  return res.json();
}
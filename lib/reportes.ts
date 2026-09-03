import api from "@/lib/axios";

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
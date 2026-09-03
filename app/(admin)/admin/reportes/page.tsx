
"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, Users,
  CalendarCheck, MapPin, Download, AlertTriangle, Loader2,
} from "lucide-react";
import { getReportes, ReporteCompleto } from "@/lib/reportes";

// ── Paleta cálida del proyecto ─────────────────────────────
const C = {
  naranja: "#d4663a",
  naranjaLight: "#fdf0e8",
  marron: "#2a1810",
  beige: "#e8d8cc",
  verde: "#2d7a47",
  verdeLight: "#e8f5ec",
  ambar: "#f59e0b",
  ambarLight: "#fef3e2",
  rojo: "#c0392b",
  rojoLight: "#fdecea",
  texto: "#4a3020",
  textoMuted: "#8c7b6e",
};

// Colores para el gráfico de estados
const COLOR_ESTADO: Record<string, string> = {
  PENDIENTE_PAGO: C.ambar,
  CONFIRMADA: C.verde,
  CANCELADA: C.rojo,
  COMPLETADA: "#2b6cb0",   // azul
};

// ── Helpers ────────────────────────────────────────────────
function pct(a: number, b: number) { return Math.round((a / b) * 100); }

function KpiCard({
  title, value, sub, trend, trendUp, icon, color,
}: {
  title: string; value: string; sub: string;
  trend?: string; trendUp?: boolean;
  icon: React.ReactNode; color: string;
}) {
  return (
    <Card className="border-[#e8d8cc]">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: color + "20", color }}
          >
            {icon}
          </div>
          {trend && (
            <span
              className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: trendUp ? C.verdeLight : C.rojoLight,
                color: trendUp ? C.verde : C.rojo,
              }}
            >
              {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {trend}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold" style={{ color: C.marron }}>{value}</p>
        <p className="text-xs mt-0.5" style={{ color: C.textoMuted }}>{title}</p>
        <p className="text-[11px] mt-1" style={{ color: C.textoMuted }}>{sub}</p>
      </CardContent>
    </Card>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#e8d8cc] bg-white px-3 py-2 shadow text-xs">
      <p className="font-semibold mb-1" style={{ color: C.marron }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{typeof p.value === "number" && p.name.includes("ngreso")
            ? `$${p.value.toLocaleString()}` : p.value}</strong>
        </p>
      ))}
    </div>
  );
}

export default function ReportesPage() {
  const [data, setData] = useState<ReporteCompleto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReportes()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#d4663a]" />
      </div>
    );
  }

  const { resumen, ingresosMensuales, estadosReserva, procedenciaClientes, reservasSemana, rendimientoPaquetes } = data;
  const totalReservasEstados = estadosReserva.reduce((a, e) => a + e.cantidad, 0);
  const ingresoMes = ingresosMensuales.length > 0 ? ingresosMensuales[ingresosMensuales.length - 1].ingresos : 0;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: C.marron }}>Reportes y análisis</h2>
          <p className="text-sm mt-0.5" style={{ color: C.textoMuted }}>
            Datos actualizados al {new Date().toLocaleDateString("es-PE", { dateStyle: "long" })}
          </p>
        </div>
        <Button variant="outline" className="gap-2 border-[#e8d8cc] text-[#4a3020] hover:bg-[#fdf0e8]">
          <Download size={15} />
          Exportar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Ingresos este mes"
          value={`$${resumen.ingresosEsteMes.toLocaleString('es-PE')}`}
          sub="Confirmados y completados"
          trend={`${resumen.crecimientoIngresos > 0 ? "+" : ""}${resumen.crecimientoIngresos.toFixed(1)}%`}
          trendUp={resumen.crecimientoIngresos > 0}
          icon={<DollarSign size={18} />}
          color={C.naranja}
        />
        <KpiCard
          title="Reservas totales"
          value={String(resumen.totalReservas)}
          sub={`${resumen.confirmadas} confirmadas`}
          trend=""
          icon={<CalendarCheck size={18} />}
          color={C.verde}
        />
        <KpiCard
          title="Tasa conversión"
          value={`${resumen.totalReservas > 0 ? pct(resumen.confirmadas, resumen.totalReservas) : 0}%`}
          sub="Confirmadas / total"
          trend=""
          icon={<MapPin size={18} />}
          color={C.ambar}
        />
        <KpiCard
          title="Nuevos clientes"
          value={String(resumen.nuevosClientesMes)}
          sub="Este mes"
          trend=""
          icon={<Users size={18} />}
          color="#7b5ea7"
        />
      </div>

      {/* Alertas */}
      {rendimientoPaquetes.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3">
          {rendimientoPaquetes.filter(p => p.reservas === 0).length > 0 && (
            <div
              className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-xs"
              style={{ background: C.ambarLight, color: "#92400e", border: "0.5px solid #fcd9a0" }}
            >
              <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
              Hay paquetes sin reservas. Considera revisar su visibilidad o precio.
            </div>
          )}
        </div>
      )}

      {/* Tabs de reportes */}
      <Tabs defaultValue="ingresos">
        <TabsList className="border border-[#e8d8cc] bg-[#fdf4ef]">
          <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
          <TabsTrigger value="paquetes">Paquetes</TabsTrigger>
          <TabsTrigger value="reservas">Reservas</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
        </TabsList>

        {/* TAB INGRESOS */}
        <TabsContent value="ingresos" className="space-y-4 mt-5">
          <Card className="border-[#e8d8cc]">
            <CardHeader>
              <CardTitle className="text-base" style={{ color: C.marron }}>Ingresos mensuales (confirmados)</CardTitle>
              <CardDescription style={{ color: C.textoMuted }}>Últimos 7 meses en USD</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={ingresosMensuales}>
                  <defs>
                    <linearGradient id="gradIngreso" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.naranja} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={C.naranja} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e8e0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: C.textoMuted }} />
                  <YAxis tick={{ fontSize: 12, fill: C.textoMuted }} tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone" dataKey="ingresos" name="Ingresos"
                    stroke={C.naranja} strokeWidth={2}
                    fill="url(#gradIngreso)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-[#e8d8cc]">
            <CardHeader>
              <CardTitle className="text-base" style={{ color: C.marron }}>Detalle mensual</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#e8d8cc]">
                    <TableHead>Mes</TableHead>
                    <TableHead>Ingresos</TableHead>
                    <TableHead>Reservas</TableHead>
                    <TableHead>Ticket prom.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingresosMensuales.map((m) => {
                    const ticket = m.reservas > 0 ? Math.round(m.ingresos / m.reservas) : 0;
                    return (
                      <TableRow key={m.mes} className="border-[#f0e8e0] hover:bg-[#fdf0e8]">
                        <TableCell className="font-medium" style={{ color: C.texto }}>{m.mes} 2025</TableCell>
                        <TableCell style={{ color: C.naranja, fontWeight: 600 }}>${m.ingresos.toLocaleString('es-PE')}</TableCell>
                        <TableCell>{m.reservas}</TableCell>
                        <TableCell>${ticket}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB PAQUETES */}
        <TabsContent value="paquetes" className="space-y-4 mt-5">
          <Card className="border-[#e8d8cc]">
            <CardHeader>
              <CardTitle className="text-base" style={{ color: C.marron }}>Rendimiento por paquete</CardTitle>
              <CardDescription style={{ color: C.textoMuted }}>Ingresos y reservas por paquete</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#e8d8cc]">
                    <TableHead>Paquete</TableHead>
                    <TableHead>Reservas</TableHead>
                    <TableHead>Ingresos</TableHead>
                    <TableHead>Duración</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rendimientoPaquetes.map((p) => (
                    <TableRow key={p.nombre} className="border-[#f0e8e0] hover:bg-[#fdf0e8]">
                      <TableCell className="text-sm font-medium" style={{ color: C.texto }}>{p.nombre}</TableCell>
                      <TableCell>{p.reservas}</TableCell>
                      <TableCell style={{ color: C.naranja, fontWeight: 600 }}>
                        ${p.ingresos.toLocaleString('es-PE')}
                      </TableCell>
                      <TableCell>{p.duracionDias} días</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB RESERVAS */}
        <TabsContent value="reservas" className="space-y-4 mt-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="border-[#e8d8cc]">
              <CardHeader>
                <CardTitle className="text-base" style={{ color: C.marron }}>Distribución por estado</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={estadosReserva}
                      dataKey="cantidad"
                      nameKey="estado"
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={85}
                      paddingAngle={3}
                    >
                      {estadosReserva.map((entry, index) => (
                        <Cell key={index} fill={COLOR_ESTADO[entry.estado] || "#ccc"} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} reservas`]} />
                    <Legend
                      formatter={(val, entry: any) => {
                        const e = estadosReserva.find(e => e.estado === val);
                        return `${val}: ${e?.cantidad || 0} (${pct(e?.cantidad || 0, totalReservasEstados)}%)`;
                      }}
                      wrapperStyle={{ fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-[#e8d8cc]">
              <CardHeader>
                <CardTitle className="text-base" style={{ color: C.marron }}>Reservas esta semana</CardTitle>
                <CardDescription style={{ color: C.textoMuted }}>Nuevas vs canceladas por día</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={reservasSemana}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0e8e0" />
                    <XAxis dataKey="dia" tick={{ fontSize: 11, fill: C.textoMuted }} />
                    <YAxis tick={{ fontSize: 11, fill: C.textoMuted }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="nuevas" name="Nuevas" fill={C.naranja} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="canceladas" name="Canceladas" fill={C.rojo} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB CLIENTES */}
        <TabsContent value="clientes" className="space-y-4 mt-5">
          <Card className="border-[#e8d8cc]">
            <CardHeader>
              <CardTitle className="text-base" style={{ color: C.marron }}>Procedencia de clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {procedenciaClientes.map((p) => (
                  <div key={p.pais} className="flex items-center gap-3">
                    <span className="text-sm w-20 flex-shrink-0 font-medium" style={{ color: C.texto }}>
                      {p.pais}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-[#f0e8e0] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${p.porcentaje}%`, background: C.naranja }}
                      />
                    </div>
                    <span className="text-xs w-16 text-right" style={{ color: C.textoMuted }}>
                      {p.clientes} ({Math.round(p.porcentaje)}%)
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Car, UserCheck, MapPin, Phone, Mail, User,
  Calendar, Users, Plus, Trash2, CheckCircle2,
  Loader2, CreditCard, X, AlertCircle, ChevronRight,
} from "lucide-react";
import { obtenerPaquetes } from "@/lib/paquetes";
import { crearReserva, procesarPago, AcompananteRequest } from "@/lib/reservas";
import { obtenerUsuarioLocal } from "@/lib/auth";
import api from "@/lib/axios";
import { PaqueteResumen } from "@/types";

// ── Tipos locales ─────────────────────────────────────────────
type Paso = 1 | 2 | 3;

interface UsuarioLocal {
  id?: string;
  nombreCompleto: string;
  email: string;
  telefono?: string;
  dniPasaporte?: string;
  rol: string;
}

// ── Indicador de pasos ────────────────────────────────────────
function PasoIndicador({ paso, actual }: { paso: number; actual: Paso }) {
  const labels = ["Reserva", "Acompañantes", "Resumen"];
  const completado = paso < actual;
  const activo = paso === actual;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
        completado ? "bg-emerald-500 text-white" :
        activo ? "bg-[#c7663c] text-white" :
        "bg-gray-200 text-gray-400"
      }`}>
        {completado ? <CheckCircle2 className="h-4 w-4" /> : paso}
      </div>
      <span className={`text-xs hidden sm:block ${activo ? "text-[#c7663c] font-semibold" : "text-gray-400"}`}>
        {labels[paso - 1]}
      </span>
    </div>
  );
}

// ── Modal de pago simulado ────────────────────────────────────
function ModalPago({
  reservaId, monto, onExito, onCerrar,
}: {
  reservaId: string;
  monto: number;
  onExito: (referencia: string) => void;
  onCerrar: () => void;
}) {
  const [metodo, setMetodo] = useState<"TARJETA" | "YAPE" | "PLIN" | "TRANSFERENCIA">("YAPE");
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  // Campos de tarjeta simulados
  const [tarjeta, setTarjeta] = useState({ numero: "", nombre: "", expiry: "", cvv: "" });

  async function pagar() {
    setError("");
    setProcesando(true);

    // Referencia simulada
    const referencia = `OP-${Date.now()}`;

    try {
      const res = await procesarPago({
        reservaId,
        monto,
        metodo,
        referencia,
      });

      if (res.estado === "VERIFICADO") {
        onExito(referencia);
      } else {
        setError("El pago fue rechazado. Intenta con otro método.");
      }
    } catch {
      setError("Error al procesar el pago. Intenta nuevamente.");
    } finally {
      setProcesando(false);
    }
  }

  const metodos = [
    { id: "YAPE", label: "Yape", color: "bg-purple-600" },
    { id: "PLIN", label: "Plin", color: "bg-emerald-500" },
    { id: "TARJETA", label: "Tarjeta", color: "bg-blue-600" },
    { id: "TRANSFERENCIA", label: "Transferencia", color: "bg-amber-600" },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-[#c7663c] px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg">Pasarela de Pago</h3>
            <p className="text-white/80 text-sm">Total a pagar: <strong>${monto}</strong></p>
          </div>
          <button onClick={onCerrar} className="text-white/80 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Selección de método */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Método de pago</p>
            <div className="grid grid-cols-4 gap-2">
              {metodos.map((m) => (
                <button key={m.id}
                  onClick={() => setMetodo(m.id)}
                  className={`py-2 rounded-lg text-xs font-bold text-white transition-all ${m.color} ${
                    metodo === m.id ? "ring-2 ring-offset-1 ring-gray-400 scale-105" : "opacity-60 hover:opacity-80"
                  }`}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Formulario según método */}
          {metodo === "TARJETA" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Número de tarjeta</label>
                <input type="text" placeholder="0000 0000 0000 0000" maxLength={19}
                  value={tarjeta.numero}
                  onChange={(e) => setTarjeta({ ...tarjeta, numero: e.target.value })}
                  className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c7663c]/30 focus:border-[#c7663c]" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Nombre en la tarjeta</label>
                <input type="text" placeholder="JUAN PEREZ"
                  value={tarjeta.nombre}
                  onChange={(e) => setTarjeta({ ...tarjeta, nombre: e.target.value })}
                  className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c7663c]/30 focus:border-[#c7663c]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Vencimiento</label>
                  <input type="text" placeholder="MM/AA" maxLength={5}
                    value={tarjeta.expiry}
                    onChange={(e) => setTarjeta({ ...tarjeta, expiry: e.target.value })}
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c7663c]/30 focus:border-[#c7663c]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">CVV</label>
                  <input type="password" placeholder="•••" maxLength={4}
                    value={tarjeta.cvv}
                    onChange={(e) => setTarjeta({ ...tarjeta, cvv: e.target.value })}
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c7663c]/30 focus:border-[#c7663c]" />
                </div>
              </div>
            </div>
          )}

          {(metodo === "YAPE" || metodo === "PLIN") && (
            <div className="bg-gray-50 rounded-xl p-4 text-center space-y-2">
              <div className={`w-20 h-20 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-2xl ${
                metodo === "YAPE" ? "bg-purple-600" : "bg-emerald-500"
              }`}>
                QR
              </div>
              <p className="text-sm text-gray-600">Escanea el código QR con {metodo === "YAPE" ? "Yape" : "Plin"}</p>
              <p className="text-xs text-gray-400">Número: +51 954 123 456</p>
              <p className="font-bold text-[#c7663c]">${monto}</p>
            </div>
          )}

          {metodo === "TRANSFERENCIA" && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <p className="font-semibold text-gray-700">Datos bancarios</p>
              <div className="space-y-1 text-gray-600">
                <p><span className="font-medium">Banco:</span> BCP</p>
                <p><span className="font-medium">Cuenta:</span> 191-12345678-0-12</p>
                <p><span className="font-medium">CCI:</span> 002-191-00123456780-12</p>
                <p><span className="font-medium">Titular:</span> AQP GO SAC</p>
                <p><span className="font-medium">Monto:</span> <span className="text-[#c7663c] font-bold">${monto}</span></p>
              </div>
              <p className="text-xs text-amber-600 mt-2">
                Después de transferir, haz clic en "Confirmar pago"
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          {/* Botón pagar */}
          <button onClick={pagar} disabled={procesando}
            className="w-full bg-[#c7663c] hover:bg-[#a9552f] disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all">
            {procesando
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Procesando...</>
              : <><CreditCard className="h-4 w-4" /> Confirmar pago ${monto}</>}
          </button>

          <p className="text-xs text-gray-400 text-center">
            🔒 Pago simulado — No se realizará ningún cargo real
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────
export default function ReservarPage() {
  const router = useRouter();
  const [paso, setPaso] = useState<Paso>(1);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Datos del usuario
  const [usuario, setUsuario] = useState<UsuarioLocal | null>(null);
  const [dniPasaporte, setDniPasaporte] = useState("");
  const [telefono, setTelefono] = useState("");

  // Datos de la reserva
  const [paquetes, setPaquetes] = useState<PaqueteResumen[]>([]);
  const [paqueteId, setPaqueteId] = useState("");
  const [fecha, setFecha] = useState("");
  const [numPersonas, setNumPersonas] = useState(1);

  // Acompañantes
  const [acompanantes, setAcompanantes] = useState<AcompananteRequest[]>([]);

  // Resultado
  const [reservaCreada, setReservaCreada] = useState<{ id: string; precioTotal: number } | null>(null);
  const [mostrarPago, setMostrarPago] = useState(false);
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [referenciaPago, setReferenciaPago] = useState("");

  useEffect(() => {
    const u = obtenerUsuarioLocal();
    if (u) {
      setUsuario(u);
      setDniPasaporte(u.dniPasaporte || "");
      setTelefono(u.telefono || "");
    }
    obtenerPaquetes().then(setPaquetes).catch(console.error);
  }, []);

  const paqueteSeleccionado = paquetes.find((p) => p.id === paqueteId);
  const precioTotal = paqueteSeleccionado
    ? paqueteSeleccionado.precioBase * numPersonas
    : 0;

  // ── Paso 1: completar datos personales ───────────────────
  

  // ── Paso 2: validar datos de la reserva ──────────────────
  function validarReserva() {
    if (!paqueteId) { setError("Selecciona un paquete"); return; }
    if (!fecha) { setError("Selecciona una fecha de viaje"); return; }
    const hoy = new Date().toISOString().split("T")[0];
    if (fecha <= hoy) { setError("La fecha debe ser futura"); return; }
    setError("");
    setPaso(2);
  }

  // ── Paso 3: acompañantes ──────────────────────────────────
  function agregarAcompanante() {
    if (acompanantes.length >= numPersonas - 1) return;
    setAcompanantes((prev) => [...prev, {
      nombreCompleto: "", dniPasaporte: "", pais: "Perú",
      genero: "", datosAdicionales: "",
    }]);
  }

  function actualizarAcompanante(i: number, campo: keyof AcompananteRequest, valor: string) {
    setAcompanantes((prev) => prev.map((a, idx) => idx === i ? { ...a, [campo]: valor } : a));
  }

  function quitarAcompanante(i: number) {
    setAcompanantes((prev) => prev.filter((_, idx) => idx !== i));
  }

  // ── Paso 4: crear reserva ─────────────────────────────────
  async function crearReservaFn() {
    setError("");
    setCargando(true);
    try {
      const res = await crearReserva({
        paqueteId,
        fechaSalida: fecha,
        numPersonas,
        acompanantes: acompanantes.filter((a) => a.nombreCompleto.trim()),
      });
      setReservaCreada({ id: res.id, precioTotal: res.precioTotal });
      setPaso(3);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Error al crear la reserva");
    } finally {
      setCargando(false);
    }
  }

  // ── Éxito del pago ────────────────────────────────────────
  function onPagoExitoso(referencia: string) {
    setMostrarPago(false);
    setReferenciaPago(referencia);
    setPagoExitoso(true);
  }

  // ── Si el pago fue exitoso ────────────────────────────────
  if (pagoExitoso) {
    return (
      <div className="bg-[#f5efe9] min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">¡Reserva confirmada!</h2>
          <p className="text-gray-500 text-sm">
            Tu reserva de <strong>{paqueteSeleccionado?.nombre}</strong> ha sido confirmada exitosamente.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-1 text-sm">
            <p><span className="font-medium">Reserva ID:</span> {reservaCreada?.id.slice(0, 8)}...</p>
            <p><span className="font-medium">Referencia de pago:</span> {referenciaPago}</p>
            <p><span className="font-medium">Total pagado:</span> ${reservaCreada?.precioTotal}</p>
            <p><span className="font-medium">Fecha de viaje:</span> {fecha}</p>
          </div>
          <p className="text-xs text-gray-400">
            Recibirás un email con todos los detalles de tu viaje.
          </p>
          <button onClick={() => router.push("/")}
            className="w-full bg-[#c7663c] hover:bg-[#a9552f] text-white py-3 rounded-xl font-semibold transition-all">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5efe9] min-h-screen py-16 px-6">

      {/* Título */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-[#3b1f0f]">Reserva tu Viaje</h1>
        <p className="text-gray-600 mt-2">Completa los pasos para confirmar tu reserva</p>
      </div>

      {/* Indicador de pasos */}
      <div className="max-w-lg mx-auto mb-8">
        <div className="relative flex items-center justify-between">
          
          {[1, 2, 3].map((p) => (
            <PasoIndicador key={p} paso={p} actual={paso} />
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

        {/* ── Panel izquierdo informativo ── */}
        <div className="md:col-span-1">
          <div className="bg-[#c7663c] text-white p-8 rounded-2xl shadow-xl space-y-6">
            <h2 className="text-xl font-bold">¿Por qué reservar con nosotros?</h2>
            <ul className="space-y-4">
              {[
                { icon: <Car size={18} />, title: "Transporte Premium", desc: "Vehículos modernos y cómodos" },
                { icon: <UserCheck size={18} />, title: "Guías Expertos", desc: "Personal bilingüe certificado" },
                { icon: <MapPin size={18} />, title: "Mejor Precio", desc: "Sin intermediarios, tarifas directas" },
              ].map((item) => (
                <li key={item.title} className="flex items-start gap-3 group">
                  <div className="bg-white/20 p-2.5 rounded-full group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-xs opacity-80">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Resumen si hay paquete seleccionado */}
            {paqueteSeleccionado && (
              <div className="bg-white/20 rounded-xl p-4 space-y-1 text-sm">
                <p className="font-semibold">Resumen de tu reserva</p>
                <p className="opacity-90 text-xs">{paqueteSeleccionado.nombre}</p>
                <p className="opacity-80 text-xs">{fecha || "Sin fecha"} · {numPersonas} persona(s)</p>
                <p className="font-bold text-lg mt-2">Total: ${precioTotal}</p>
              </div>
            )}

            <div className="bg-white/20 p-4 rounded-xl space-y-2 text-sm">
              <p className="font-semibold">¿Necesitas ayuda?</p>
              <div className="flex items-center gap-2 text-xs">
                <Phone size={14} /><span>+51 954 123 456</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Mail size={14} /><span>info@aqpgo.pe</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Panel principal ── */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden">

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border-b border-red-200 px-6 py-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          <div className="p-8 space-y-6">

            

            {/* ─── PASO 2: Datos de la reserva ─── */}
            {paso === 1 && (
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-gray-800">Detalle de tu reserva</h3>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Paquete turístico <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                    <select value={paqueteId} onChange={(e) => setPaqueteId(e.target.value)}
                      className="w-full border border-gray-200 p-2.5 pl-9 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c7663c]/30 focus:border-[#c7663c]">
                      <option value="">Selecciona un paquete</option>
                      {paquetes.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} — ${p.precioBase}/persona
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Fecha de viaje <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1">
                      <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
                      <input type="date" value={fecha}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setFecha(e.target.value)}
                        className="w-full border border-gray-200 p-2.5 pl-9 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c7663c]/30 focus:border-[#c7663c]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Número de personas</label>
                    <div className="relative mt-1">
                      <Users size={16} className="absolute left-3 top-3 text-gray-400" />
                      <select value={numPersonas}
                        onChange={(e) => {
                          setNumPersonas(Number(e.target.value));
                          setAcompanantes([]);
                        }}
                        className="w-full border border-gray-200 p-2.5 pl-9 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c7663c]/30 focus:border-[#c7663c]">
                        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                          <option key={n} value={n}>{n} persona{n > 1 ? "s" : ""}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Preview precio */}
                {paqueteSeleccionado && (
                  <div className="bg-[#f5efe9] rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{paqueteSeleccionado.nombre}</p>
                      <p className="text-xs text-gray-400">
                        ${paqueteSeleccionado.precioBase} × {numPersonas} persona(s)
                      </p>
                    </div>
                    <p className="text-xl font-bold text-[#c7663c]">${precioTotal}</p>
                  </div>
                )}
              </div>
            )}

            {/* ─── PASO 3: Acompañantes ─── */}
            {paso === 2 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800">Acompañantes</h3>
                  <span className="text-xs text-gray-400">
                    {acompanantes.length} de {numPersonas - 1} máx.
                  </span>
                </div>

                {numPersonas === 1 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Reserva para 1 persona, no hay acompañantes</p>
                  </div>
                ) : (
                  <>
                    {acompanantes.map((a, i) => (
                      <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-[#c7663c]">
                            Acompañante {i + 1}
                          </span>
                          <button onClick={() => quitarAcompanante(i)}
                            className="text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-gray-600">Nombre completo *</label>
                            <input type="text" value={a.nombreCompleto}
                              onChange={(e) => actualizarAcompanante(i, "nombreCompleto", e.target.value)}
                              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#c7663c]" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">DNI / Pasaporte *</label>
                            <input type="text" value={a.dniPasaporte}
                              onChange={(e) => actualizarAcompanante(i, "dniPasaporte", e.target.value)}
                              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#c7663c]" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">País</label>
                            <input type="text" value={a.pais || ""}
                              onChange={(e) => actualizarAcompanante(i, "pais", e.target.value)}
                              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#c7663c]" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600">Datos adicionales</label>
                            <input type="text" value={a.datosAdicionales || ""}
                              placeholder="Alergias, necesidades especiales..."
                              onChange={(e) => actualizarAcompanante(i, "datosAdicionales", e.target.value)}
                              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#c7663c]" />
                          </div>
                        </div>
                      </div>
                    ))}

                    {acompanantes.length < numPersonas - 1 && (
                      <button onClick={agregarAcompanante}
                        className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-[#c7663c] hover:text-[#c7663c] transition-all flex items-center justify-center gap-2">
                        <Plus className="h-4 w-4" /> Agregar acompañante
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ─── PASO 4: Resumen ─── */}
            {paso === 3 && (
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-gray-800">Resumen de tu reserva</h3>

                {reservaCreada ? (
                  <div className="space-y-4">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                      Reserva creada exitosamente. Procede al pago para confirmarla.
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5 space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Paquete</span>
                        <span className="font-medium text-right">{paqueteSeleccionado?.nombre}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Fecha de viaje</span>
                        <span className="font-medium">{fecha}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Personas</span>
                        <span className="font-medium">{numPersonas}</span>
                      </div>
                      {acompanantes.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Acompañantes</span>
                          <span className="font-medium">{acompanantes.length}</span>
                        </div>
                      )}
                      <hr />
                      <div className="flex justify-between text-base">
                        <span className="font-bold text-gray-800">Total a pagar</span>
                        <span className="font-bold text-[#c7663c] text-lg">${reservaCreada.precioTotal}</span>
                      </div>
                    </div>

                    <button onClick={() => setMostrarPago(true)}
                      className="w-full bg-[#c7663c] hover:bg-[#a9552f] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl">
                      <CreditCard className="h-5 w-5" /> Proceder al pago
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    Creando reserva...
                  </div>
                )}
              </div>
            )}

            {/* ── Botones de navegación ── */}
            <div className="flex justify-between pt-4 border-t">
              {paso > 1 && paso < 4 && (
                <button onClick={() => { setPaso((prev) => (prev - 1) as Paso); setError(""); }}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all">
                  ← Anterior
                </button>
              )}
              {paso === 1 && <div />}

              
              {paso === 1 && (
                <button onClick={validarReserva}
                  className="px-6 py-2.5 bg-[#c7663c] hover:bg-[#a9552f] text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all">
                  Siguiente <ChevronRight className="h-4 w-4" />
                </button>
              )}
              {paso === 2 && (
                <button onClick={crearReservaFn} disabled={cargando}
                  className="px-6 py-2.5 bg-[#c7663c] hover:bg-[#a9552f] disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all">
                  {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Ver resumen <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-6 text-center max-w-lg mx-auto">
        Al reservar, aceptas nuestros términos y condiciones. Nos pondremos en contacto contigo para coordinar los detalles finales.
      </p>

      {/* Modal de pago */}
      {mostrarPago && reservaCreada && (
        <ModalPago
          reservaId={reservaCreada.id}
          monto={reservaCreada.precioTotal}
          onExito={onPagoExitoso}
          onCerrar={() => setMostrarPago(false)}
        />
      )}
    </div>
  );
}
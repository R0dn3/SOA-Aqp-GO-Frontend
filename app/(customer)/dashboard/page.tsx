
"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Clock,
  Mail,
  Phone,
  User,
  Users,
  Car,
  CreditCard,
  XCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getMisReservas, cancelarReserva, ReservaResponse } from "@/lib/reservas";
import { ModalPago } from "@/components/layout/ModalPago";
import PerfilCard from "@/components/layout/PerfilCard";

export default function DashboardPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<{
    nombreCompleto: string;
    email: string;
    telefono?: string;
    dniPasaporte?: string;
  } | null>(null);

  const [reservas, setReservas] = useState<ReservaResponse[]>([]);
  const [cargandoReservas, setCargandoReservas] = useState(true);
  const [errorReservas, setErrorReservas] = useState("");

  // Modal de pago
  const [mostrarPago, setMostrarPago] = useState(false);
  const [reservaAPagar, setReservaAPagar] = useState<ReservaResponse | null>(null);

  // Detalle expandido
  const [reservaExpandida, setReservaExpandida] = useState<string | null>(null);

  // ----- PAGINACIÓN -----
  const [paginaActual, setPaginaActual] = useState(0);
  const RESERVAS_POR_PAGINA = 2;

  // Cargar usuario y reservas
  useEffect(() => {
    const stored = localStorage.getItem("usuario");
    if (!stored) {
      router.replace("/");
      return;
    }
    setUsuario(JSON.parse(stored));

    getMisReservas()
      .then(setReservas)
      .catch((err) => {
        console.error(err);
        setErrorReservas("No se pudieron cargar tus reservas.");
      })
      .finally(() => setCargandoReservas(false));
  }, [router]);

  // Calcular total de páginas
  const totalPaginas = Math.ceil(reservas.length / RESERVAS_POR_PAGINA);
  // Ajustar página actual si se queda fuera de rango (ej. al cancelar última reserva)
  useEffect(() => {
    if (paginaActual >= totalPaginas && totalPaginas > 0) {
      setPaginaActual(totalPaginas - 1);
    } else if (totalPaginas === 0) {
      setPaginaActual(0);
    }
  }, [reservas, paginaActual, totalPaginas]);

  // Obtener reservas de la página actual
  const reservasPaginadas = reservas.slice(
    paginaActual * RESERVAS_POR_PAGINA,
    (paginaActual + 1) * RESERVAS_POR_PAGINA
  );

  const irPaginaAnterior = () => {
    if (paginaActual > 0) {
      setPaginaActual(paginaActual - 1);
      setReservaExpandida(null); // cerrar detalle al cambiar de página
    }
  };

  const irPaginaSiguiente = () => {
    if (paginaActual + 1 < totalPaginas) {
      setPaginaActual(paginaActual + 1);
      setReservaExpandida(null);
    }
  };

  const handleCancelar = async (id: string) => {
    try {
      const actualizada = await cancelarReserva(id);
      setReservas((prev) =>
        prev.map((r) => (r.id === id ? actualizada : r))
      );
    } catch {
      alert("Error al cancelar la reserva.");
    }
  };

  const handlePagoExitoso = (referencia: string) => {
    setMostrarPago(false);
    setReservaAPagar(null);
    // Actualizar estado de la reserva a CONFIRMADA (simulado)
    setReservas((prev) =>
      prev.map((r) =>
        r.id === reservaAPagar?.id ? { ...r, estado: "CONFIRMADA" } : r
      )
    );
  };

  const abrirPago = (reserva: ReservaResponse) => {
    setReservaAPagar(reserva);
    setMostrarPago(true);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "PENDIENTE_PAGO":
        return <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">Pendiente de pago</span>;
      case "CONFIRMADA":
        return <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">Confirmada</span>;
      case "CANCELADA":
        return <span className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full">Cancelada</span>;
      case "COMPLETADA":
        return <span className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Completada</span>;
      default:
        return null;
    }
  };

  if (!usuario) {
    return (
      <div className="min-h-screen bg-[#f5eee6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4663a] mx-auto mb-4" />
          <p className="text-gray-600">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5eee6] min-h-screen">
      <div className="px-8 py-10 max-w-7xl mx-auto w-full">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#2a1810] to-[#d4663a] bg-clip-text text-transparent mb-2">
          Mi Dashboard
        </h1>
        <p className="text-gray-600 mb-8">Bienvenido, {usuario.nombreCompleto}</p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* PERFIL */}
          <PerfilCard />

          {/* RESERVAS */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-[#2a1810]">Mis Reservas</h2>

            {cargandoReservas && (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-[#d4663a]" />
                <p className="text-gray-500">Cargando reservas...</p>
              </div>
            )}

            {errorReservas && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-2">
                <AlertCircle size={18} /> {errorReservas}
              </div>
            )}

            {!cargandoReservas && reservas.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center shadow">
                <p className="text-gray-500 mb-4">No tienes reservas aún.</p>
                <button
                  onClick={() => router.push("/reservar")}
                  className="px-6 py-3 bg-[#d4663a] text-white rounded-xl hover:bg-[#b8542d] transition-colors"
                >
                  Reservar ahora
                </button>
              </div>
            )}

            {/* Lista paginada de reservas */}
            {reservasPaginadas.map((reserva) => (
              <motion.div
                key={reserva.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow border hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <span className="text-sm text-gray-500">#{reserva.id.slice(0, 8)}</span>
                    <span className="ml-2">{getEstadoBadge(reserva.estado)}</span>
                    <h3 className="text-xl font-bold mt-2">{reserva.paqueteNombre}</h3>
                    {reserva.fotoPrincipal && (
                      <img
                        src={reserva.fotoPrincipal}
                        alt={reserva.paqueteNombre}
                        className="w-24 h-16 object-cover rounded-lg mt-2"
                      />
                    )}
                  </div>
                  <span className="text-xl font-bold text-[#d4663a]">
                    S/ {reserva.precioTotal?.toFixed(2)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-6 text-sm text-gray-600 mt-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={16} /> {new Date(reserva.fechaSalida).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={16} /> {reserva.numPersonas} pax
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={16} /> {reserva.estado}
                  </span>
                </div>

                {/* Botones de acción según estado */}
                <div className="mt-4 flex gap-3 flex-wrap">
                  {reserva.estado === "PENDIENTE_PAGO" && (
                    <>
                      <button
                        onClick={() => abrirPago(reserva)}
                        className="bg-[#d4663a] text-white px-5 py-2 rounded-lg hover:bg-[#b8542d] transition-colors flex items-center gap-2"
                      >
                        <CreditCard size={16} /> Confirmar pago
                      </button>
                      <button
                        onClick={() => handleCancelar(reserva.id)}
                        className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <XCircle size={16} /> Cancelar
                      </button>
                    </>
                  )}

                  {reserva.estado === "CONFIRMADA" && (
                    <button
                      onClick={() => handleCancelar(reserva.id)}
                      className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <XCircle size={16} /> Cancelar reserva
                    </button>
                  )}

                  {/* Ver detalle */}
                  <button
                    onClick={() =>
                      setReservaExpandida(reservaExpandida === reserva.id ? null : reserva.id)
                    }
                    className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    {reservaExpandida === reserva.id ? (
                      <><ChevronUp size={16} /> Ocultar detalles</>
                    ) : (
                      <><ChevronDown size={16} /> Ver detalles</>
                    )}
                  </button>
                </div>

                {/* Detalle expandido */}
                <AnimatePresence>
                  {reservaExpandida === reserva.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600 space-y-2">
                        <p><span className="font-medium">Reserva ID:</span> {reserva.id}</p>
                        <p><span className="font-medium">Paquete:</span> {reserva.paqueteNombre}</p>
                        <p><span className="font-medium">Fecha de salida:</span> {new Date(reserva.fechaSalida).toLocaleDateString()}</p>
                        <p><span className="font-medium">Personas:</span> {reserva.numPersonas}</p>
                        <p><span className="font-medium">Precio total:</span> S/ {reserva.precioTotal?.toFixed(2)}</p>
                        {reserva.acompanantes.length > 0 && (
                          <div>
                            <p className="font-medium mb-1">Acompañantes:</p>
                            <ul className="list-disc pl-5">
                              {reserva.acompanantes.map((a, i) => (
                                <li key={i}>{a.nombreCompleto} – {a.dniPasaporte}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <p><span className="font-medium">Creada el:</span> {new Date(reserva.createdAt).toLocaleString()}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {/* Controles de paginación (solo si hay más de una página) */}
            {totalPaginas > 1 && (
              <div className="flex justify-center items-center gap-4 mt-4">
                <button
                  onClick={irPaginaAnterior}
                  disabled={paginaActual === 0}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                    paginaActual === 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-[#d4663a] hover:bg-gray-100 shadow"
                  }`}
                >
                  <ChevronDown className="rotate-90" size={16} /> Anterior
                </button>
                <span className="text-sm text-gray-600">
                  Página {paginaActual + 1} de {totalPaginas}
                </span>
                <button
                  onClick={irPaginaSiguiente}
                  disabled={paginaActual + 1 >= totalPaginas}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                    paginaActual + 1 >= totalPaginas
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-[#d4663a] hover:bg-gray-100 shadow"
                  }`}
                >
                  Siguiente <ChevronDown className="-rotate-90" size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CARDS INFERIORES */}
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {[
            { icon: Calendar, title: "Nueva Reserva", desc: "Planifica tu próxima aventura", link: "/reservar" },
            { icon: MapPin, title: "Ver Paquetes", desc: "Explora nuestras ofertas", link: "/destinations" },
            { icon: Car, title: "Destinos", desc: "Descubre nuevos lugares", link: "/destinos" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.2 }}
              onClick={() => router.push(item.link)}
              className="group bg-white p-6 rounded-2xl shadow cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <item.icon size={28} className="text-[#d4663a] mb-3 group-hover:scale-110 transition" />
              <h3 className="font-bold">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal de pago */}
      {mostrarPago && reservaAPagar && (
        <ModalPago
          reservaId={reservaAPagar.id}
          monto={reservaAPagar.precioTotal}
          onExito={handlePagoExitoso}
          onCerrar={() => setMostrarPago(false)}
        />
      )}
    </div>
  );
}
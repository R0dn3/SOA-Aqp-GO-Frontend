// app/destinos/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Clock, MapPin, Star, Filter, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { obtenerPaquetes } from "@/lib/paquetes";
import { PaqueteResumen } from "@/types";

const ITEMS_PER_PAGE = 9;

export default function DestinosPage() {
  const [paquetes, setPaquetes] = useState<PaqueteResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Obtener paquetes desde la API
  useEffect(() => {
    obtenerPaquetes()
      .then((data) => {
        setPaquetes(data);
      })
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  // Filtros dinámicos
  const duracionesUnicas = Array.from(new Set(paquetes.map(p => p.duracionDias)))
    .sort((a, b) => a - b)
    .map(d => `${d} día${d !== 1 ? "s" : ""}`);

  const ubicacionesUnicas = Array.from(
    new Set(paquetes.flatMap(p => p.lugares))
  ).sort();

  const paquetesFiltrados = paquetes.filter(p => {
    const matchDuration =
      selectedDuration === "all" ||
      `${p.duracionDias} día${p.duracionDias !== 1 ? "s" : ""}` === selectedDuration;
    const matchLocation =
      selectedLocation === "all" ||
      p.lugares.includes(selectedLocation);
    return matchDuration && matchLocation;
  });

  // Paginación
  const totalPages = Math.ceil(paquetesFiltrados.length / ITEMS_PER_PAGE);
  const paginatedPaquetes = paquetesFiltrados.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Resetear página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDuration, selectedLocation]);

  const limpiarFiltros = () => {
    setSelectedDuration("all");
    setSelectedLocation("all");
  };

  // Generar array de páginas para los botones
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-[#f5eee6]">
      {/* HERO (sin cambios) */}
      <section className="relative h-96 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1563817714600-1dda672c234e"
          alt="Todos los destinos"
          className="absolute w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#2a1810]/80 flex items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl text-white font-bold mb-3">
              Todos los Paquetes
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Explora nuestras experiencias cuidadosamente diseñadas para que
              vivas el sur del Perú como nunca antes
            </p>
          </motion.div>
        </div>
      </section>

      {/* FILTROS (sin cambios) */}
      <section className="py-6 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap gap-4 items-center">
          <Filter className="text-[#d4663a]" size={20} />

          <select
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4663a] focus:border-transparent"
          >
            <option value="all">Todas las duraciones</option>
            {duracionesUnicas.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4663a] focus:border-transparent"
          >
            <option value="all">Todas las ubicaciones</option>
            {ubicacionesUnicas.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          {(selectedDuration !== "all" || selectedLocation !== "all") && (
            <button
              onClick={limpiarFiltros}
              className="bg-[#d4663a] text-white px-4 py-2 rounded-lg hover:bg-[#b8542d] transition"
            >
              Limpiar filtros
            </button>
          )}

          <span className="ml-auto text-sm text-gray-500">
            {paquetesFiltrados.length} paquete(s) encontrado(s)
          </span>
        </div>
      </section>

      {/* CUADRÍCULA DE PAQUETES CON PAGINACIÓN */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-[#2a1810] mb-10 text-center"
          >
            Elige tu próxima aventura
            <span className="block w-16 h-1 bg-[#d4663a] mx-auto mt-3 rounded-full" />
          </motion.h2>

          {cargando ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4663a]" />
              <span className="ml-3 text-gray-600">Cargando paquetes...</span>
            </div>
          ) : paquetesFiltrados.length === 0 ? (
            <p className="text-center text-gray-500 py-20">
              No se encontraron paquetes con esos filtros.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedPaquetes.map((paquete) => (
                  <motion.div
                    key={paquete.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                  >
                    {/* Imagen con overlay */}
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={paquete.fotoPrincipal || "/images/placeholder.jpg"}
                        alt={paquete.nombre}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="text-xl font-bold text-white drop-shadow-lg">
                          {paquete.nombre}
                        </h3>
                        {paquete.subtitulo && (
                          <p className="text-sm text-white/80 drop-shadow">
                            {paquete.subtitulo}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-5">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {paquete.lugares.map((lugar) => (
                          <span
                            key={lugar}
                            className="bg-[#f4e8d9] text-[#2a1810] text-xs px-2 py-1 rounded-full inline-flex items-center gap-1"
                          >
                            <MapPin size={10} /> {lugar}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>
                            {paquete.duracionDias} día{paquete.duracionDias > 1 ? "s" : ""}
                            {paquete.duracionNoches ? ` · ${paquete.duracionNoches} noches` : ""}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-[#d4663a]">
                          S/ {paquete.precioBase.toFixed(2)}
                        </span>
                      </div>

                      <Link
                        href={`/paquetes/${paquete.id}`}
                        className="block text-center bg-[#d4663a] text-white py-2 rounded-lg hover:bg-[#b8542d] transition font-medium"
                      >
                        Ver Detalles
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* PAGINACIÓN */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Anterior
                  </button>

                  {pages.map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                        currentPage === page
                          ? "bg-[#d4663a] text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA FINAL (sin cambios) */}
      <section className="py-20 bg-[#2a1810] text-white text-center">
        <Star className="mx-auto mb-4 text-[#d4663a]" size={28} />
        <h2 className="text-4xl font-bold mb-4">¿No encuentras lo que buscas?</h2>
        <p className="mb-8 text-white/80">
          Creamos experiencias personalizadas según tus gustos y tiempo.
        </p>
        <Link
          href="/reservar"
          className="inline-flex items-center gap-2 bg-[#d4663a] px-6 py-3 rounded-full hover:bg-[#b8542d] transition shadow-lg"
        >
          Solicitar Tour Personalizado
          <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}
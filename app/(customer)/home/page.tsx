// app/page.tsx (o pages/index.tsx)
"use client";

import Link from "next/link";
import { ArrowRight, Car, Globe, Shield, Star, MapPin, Clock, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { obtenerPaquetes } from "@/lib/paquetes";
import { PaqueteResumen } from "@/types";

// ── Features estáticos (se mantienen) ──────────────────────────
const features = [
  {
    icon: Star,
    title: "Excelencia",
    description: "Calificación 5 estrellas de nuestros clientes",
  },
  {
    icon: Car,
    title: "Flota Premium",
    description: "Vehículos modernos y bien mantenidos",
  },
  {
    icon: Globe,
    title: "Tours Únicos",
    description: "Experiencias auténticas y memorables",
  },
  {
    icon: Shield,
    title: "Seguridad",
    description: "Personal certificado y seguros completos",
  },
];

// ── Datos mock para la galería interactiva (luego puedes cargarlos desde API) ──
const galeriaDestinos = [
  {
    subtitulo: "Visita",
    titulo: "Arequipa",
    imagen: "/1200 - 1.jpeg",
    //enlace: "/destinations/arequipa",
  },
  {
    subtitulo: "Visita",
    titulo: "Cusco",
    imagen: "/1200 - 2.jpg",
    //enlace: "/destinations/cusco",
  },
  {
    subtitulo: "Visita",
    titulo: "Puno",
    imagen: "/1200 - 3.webp",
    //enlace: "/destinations/puno",
  },
  {
    subtitulo: "Visita",
    titulo: "Ica",
    imagen: "/1200 - 4.jpg",
    //enlace: "/destinations/ica",
  },
];

// ── Hero con slider de imágenes y zoom ─────────────────────────
const heroImages = [
  "/arequipa.jpg",
  "/Centro.jpeg",
  "/Misti.jpg",
  "/Colca.jpg",
  "/Salinas.jpg",
];

function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // cambia cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">
      <AnimatePresence>
        <motion.img
          key={currentIndex}
          src={heroImages[currentIndex]}
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
          alt={`Hero ${currentIndex + 1}`}
        />
      </AnimatePresence>

      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#2a1810]/90" />

      {/* Contenido del hero (mantenemos el texto original) */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="inline-block px-4 py-2 bg-[#d4663a]/90 rounded-full text-white mb-6">
              Descubre la Ciudad Blanca
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl text-white font-bold mb-6">
              Tu Aventura en Arequipa Comienza Aquí
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Explora los majestuosos volcanes, el impresionante Cañón del Colca y la rica cultura del sur del Perú con nuestros tours personalizados y servicio de transporte premium.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/destinations"
                className="group px-8 py-4 bg-[#d4663a] text-white rounded-full hover:bg-[#c15530] flex items-center gap-2"
              >
                Ver Tours
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 bg-white/10 text-white rounded-full border border-white/30"
              >
                Conócenos
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── Galería que cambia imagen al pasar el mouse ─────────────────
function InteractiveGallery() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const currentImage = hoveredIndex !== null ? galeriaDestinos[hoveredIndex].imagen : galeriaDestinos[0].imagen;

  return (
    <section className="py-20 bg-[#1a1a1a] text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Lista de destinos */}
          <div className="lg:w-1/3 space-y-4">
            {galeriaDestinos.map((destino, index) => (
              <motion.div
                key={destino.titulo}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                  hoveredIndex === index ? "bg-[#d4663a] scale-105" : "bg-[#2a1810]/50 hover:bg-[#3d2820]"
                }`}
              >
                <p className="text-sm uppercase text-[#f4e8d9]">{destino.subtitulo}</p>
                <h3 className="text-2xl font-bold">{destino.titulo}</h3>
                <Link
                  href= "#"
                  className="inline-block mt-2 text-[#d4663a] hover:text-white transition-colors"
                >
                  Ver Más →
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Contenedor de la imagen grande */}
          <div className="lg:w-2/3 relative h-96 lg:h-[500px] rounded-2xl overflow-hidden">
            <AnimatePresence>
              <motion.img
                key={currentImage}
                src={currentImage}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 w-full h-full object-cover"
                alt="Destino"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Carrusel infinito de paquetes ───────────────────────────────
function PaquetesCarousel() {
  const [paquetes, setPaquetes] = useState<PaqueteResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Obtener paquetes desde la API
  useEffect(() => {
    obtenerPaquetes()
      .then((data) => setPaquetes(data))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  // Auto-scroll infinito (de derecha a izquierda)
  useEffect(() => {
    if (!carouselRef.current || paquetes.length === 0) return;
    const container = carouselRef.current;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    
    // Duplicamos los items para crear efecto infinito (estilo marquee)
    const duplicate = container.innerHTML;
    container.innerHTML += duplicate; // duplica el contenido

    let animationFrame: number;
    let speed = 0.5; // píxeles por frame (ajusta la velocidad)

    const animate = () => {
      if (!container) return;
      container.scrollLeft += speed;
      // Cuando llegue al final del contenido original, reseteamos
      if (container.scrollLeft >= container.scrollWidth / 2) {
        container.scrollLeft = 0;
      }
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [paquetes]);

  if (cargando) {
    return (
      <section className="py-20 bg-gradient-to-br from-[#f4e8d9] to-[#e8dfd2]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4663a] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando paquetes...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-[#f4e8d9] to-[#e8dfd2] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl text-[#2a1810] font-bold mb-4">Destinos Populares</h2>
          <p className="text-lg text-[#6b5849]">Encuentra tu próxima aventura</p>
        </div>

        {/* Contenedor del carrusel */}
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-hidden py-4"
          style={{ scrollBehavior: 'smooth' }}
        >
          {/* Renderizamos los paquetes originales */}
          {paquetes.map((paquete) => (
            <motion.div
              key={paquete.id}
              className="min-w-[300px] md:min-w-[350px] bg-white rounded-2xl shadow-lg overflow-hidden flex-shrink-0 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <img
                src={paquete.fotoPrincipal || "/images/placeholder.jpg"}
                alt={paquete.nombre}
                className="w-full h-48 object-cover"
              />
              <div className="p-5">
                <div className="flex items-center gap-2 text-sm text-[#d4663a] mb-2">
                  <MapPin size={14} />
                  <span>{paquete.lugares.join(" · ")}</span>
                </div>
                <h3 className="text-xl font-bold text-[#2a1810] mb-1">{paquete.nombre}</h3>
                {paquete.subtitulo && (
                  <p className="text-gray-500 text-sm mb-3">{paquete.subtitulo}</p>
                )}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <Clock size={14} />
                    <span>{paquete.duracionDias} días{paquete.duracionNoches ? ` / ${paquete.duracionNoches} noches` : ""}</span>
                  </div>
                  <span className="text-xl font-bold text-[#d4663a]">
                    S/ {paquete.precioBase.toFixed(2)}
                  </span>
                </div>
                <Link
                  href={`/paquetes/${paquete.id}`}
                  className="mt-4 block text-center w-full py-2 bg-[#d4663a] text-white rounded-lg hover:bg-[#b8542d] transition-colors"
                >
                  Ver Paquete
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Componente principal de la página ──────────────────────────
export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSlider />

      {/* Sección de características (se mantiene) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl text-[#2a1810] font-bold mb-4">Por Qué Elegirnos</h2>
            <p className="text-lg text-[#6b5849] max-w-2xl mx-auto">
              Más de 10 años de experiencia brindando los mejores tours y servicios de transporte en Arequipa
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group text-center p-8 rounded-2xl bg-[#faf8f5] hover:bg-[#d4663a] transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#d4663a] group-hover:bg-white flex items-center justify-center transition-colors duration-300">
                  <feature.icon className="w-8 h-8 text-white group-hover:text-[#d4663a] transition-colors duration-300" />
                </div>
                <h3 className="text-xl text-[#2a1810] group-hover:text-white font-semibold mb-2 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-[#6b5849] group-hover:text-white/90 transition-colors duration-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Galería interactiva */}
      <InteractiveGallery />

      {/* Carrusel de paquetes */}
      <PaquetesCarousel />

      {/* CTA */}
      <section className="py-20 bg-[#2a1810] text-white text-center">
        <h2 className="text-4xl font-bold mb-6">¿Listo para tu Próxima Aventura?</h2>
        <Link href="/reservar" className="px-8 py-4 bg-[#d4663a] rounded-full">
          Reservar Ahora
        </Link>
      </section>
    </div>
  );
}
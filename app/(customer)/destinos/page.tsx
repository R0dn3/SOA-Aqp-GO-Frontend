"use client";

import Link from "next/link";

const destinos = [
    {
        title: "Cañón del Colca",
        image: "/Colca.jpg",
        difficulty: "Moderado",
        description:
            "Uno de los cañones más profundos del mundo, hogar del majestuoso cóndor andino. Experimenta vistas espectaculares y pueblos tradicionales.",
        duration: "Full Day / 2 Días",
        tags: ["Observación de cóndores", "Aguas termales", "Pueblos coloniales"],
    },
    {
        title: "Volcán Misti",
        image: "/Misti.jpg",
        difficulty: "Difícil",
        description:
            "El imponente guardián de Arequipa. Trekking de altura con vistas panorámicas de la ciudad y los volcanes circundantes.",
        duration: "2 Días",
        tags: ["Trekking de altura", "Campamento nocturno", "Vistas 360°"],
    },
    {
        title: "Centro Histórico",
        image: "/Centro.jpeg",
        difficulty: "Fácil",
        description:
            "Patrimonio de la Humanidad UNESCO. Descubre la arquitectura colonial en sillar blanco y la rica historia de la Ciudad Blanca.",
        duration: "Medio Día",
        tags: ["Monasterio de Santa Catalina", "Plaza de Armas", "Museos históricos"],
    },
    {
        title: "Valle de los Volcanes",
        image: "/Valle.jpg",
        difficulty: "Moderado",
        description:
            "Paisaje lunar con más de 80 cráteres volcánicos. Una experiencia única de geología y naturaleza virgen.",
        duration: "Full day",
        tags: ["Cráteres volcánicos", "Formaciones geológicas", "Flora andina"],
    },
    {
        title: "Laguna de Salinas",
        image: "/Salinas.jpg",
        difficulty: "Moderado",
        description:
            "Laguna de altura a 4,300 msnm. Observa flamencos rosados y vicuñas en su hábitat natural con el telón de fondo del volcán Ubinas.",
        duration: "Full day",
        tags: ["Flamencos andinos", "Vicuñas salvajes", "Fotografía de paisaje"],
    },
    {
        title: "Petroglifos de Toro Muerto",
        image: "/Petroglifos.jpg",
        difficulty: "Fácil",
        description:
            "Uno de los sitios de arte rupestre más grandes del mundo. Miles de grabados de las culturas pre-incas.",
        duration: "Full day",
        tags: ["Arte rupestre", "Historia pre-inca", "Paisaje desértico"],
    },
];

export default function DestinosPage() {

    const badgeColors: Record<string, string> = {
        Difícil: "bg-red-500 text-white",
        Moderado: "bg-yellow-400 text-black",
        Fácil: "bg-green-500 text-white",
    };

    return (
        <div className="bg-[#f5f1eb]">

            {/* HERO */}
            <section className="relative h-[400px] flex items-center justify-center text-center text-white overflow-hidden">

                <img
                    src="/Portada.jpg"
                    className="absolute w-full h-full object-cover scale-105 hover:scale-110 transition duration-700"
                />

                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

                <div className="relative z-10 animate-fade-in">
                    <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">
                        Destinos Increíbles
                    </h1>
                    <p className="text-lg opacity-90">
                        Explora los lugares más espectaculares del sur del Perú
                    </p>
                </div>
            </section>

            {/* DESTINOS */}
            <section className="max-w-7xl mx-auto py-16 px-6 grid md:grid-cols-2 gap-8">

                {destinos.map((destino, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition duration-300 group"
                    >
                        {/* IMAGE */}
                        <div className="relative h-64 overflow-hidden">

                            <img
                                src={destino.image}
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                                alt={destino.title}
                            />

                            {/* OVERLAY GRADIENT */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                            {/* BADGE */}
                            <span
                                className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold shadow-md ${badgeColors[destino.difficulty]}`}
                            >
                                {destino.difficulty}
                            </span>

                            {/* TITLE */}
                            <h2 className="absolute bottom-4 left-4 text-white text-2xl font-bold drop-shadow-lg">
                                {destino.title}
                            </h2>
                        </div>

                        {/* CONTENT */}
                        <div className="p-6">
                            <p className="text-gray-600 mb-4 leading-relaxed">
                                {destino.description}
                            </p>

                            <p className="text-sm text-[#d4663a] mb-4 font-semibold">
                                ⏱ {destino.duration}
                            </p>

                            <p className="font-semibold mb-2">Lo Mejor:</p>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {destino.tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="bg-[#f1e3d3] px-3 py-1 rounded-full text-sm hover:bg-[#d4663a] hover:text-white transition"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <Link href="/reservar">
                                <button className="w-full bg-[#d4663a] text-white py-3 rounded-lg font-semibold shadow-md hover:bg-[#c15530] hover:scale-105 active:scale-95 transition duration-300">
                                    Reservar Tour
                                </button>
                            </Link>
                        </div>
                    </div>
                ))}
            </section>

            {/* CTA FINAL */}
            <section className="bg-gradient-to-r from-[#2a1810] to-[#4a2c20] text-white py-20 text-center">

                <h2 className="text-4xl font-bold mb-4">
                    ¿No Encuentras lo que Buscas?
                </h2>

                <p className="mb-6 text-lg opacity-90">
                    Podemos crear un itinerario personalizado para ti
                </p>

                <Link href="/reservar" className="px-8 py-4 bg-[#d4663a] rounded-full">
                Reservar Ahora
                </Link>
            </section>

        </div>
    );
}
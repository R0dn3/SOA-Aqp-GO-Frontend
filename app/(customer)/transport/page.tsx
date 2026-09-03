"use client";

import { Check, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function TransportPage() {
  const vehicles = [
    {
      name: "Automóvil Sedán",
      capacity: "1-4 pasajeros",
      features: [
        "Aire acondicionado",
        "Música Bluetooth",
        "Asientos de cuero",
        "GPS integrado",
      ],
      price: "Desde S/ 150/día",
      image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d",
    },
    {
      name: "Camioneta SUV",
      capacity: "1-6 pasajeros",
      features: [
        "4x4 para terrenos difíciles",
        "Amplio espacio de equipaje",
        "Pantallas individuales",
        "Sistema de sonido premium",
      ],
      price: "Desde S/ 250/día",
      image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b",
    },
    {
      name: "Van / Minibus",
      capacity: "7-15 pasajeros",
      features: [
        "Ideal para grupos",
        "Asientos reclinables",
        "WiFi a bordo",
        "Refrigerador pequeño",
      ],
      price: "Desde S/ 400/día",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957",
    },
  ];

  return (
    <div className="min-h-screen">
      
      {/* HERO */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"></div>
        </div>

        <div className="relative z-10 h-full flex items-center justify-center text-center">
          <div className="max-w-4xl mx-auto px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl text-white font-bold mb-4"
            >
              Nuestro Transporte
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/90"
            >
              Flota moderna y segura para tu viaje
            </motion.p>
          </div>
        </div>
      </section>

      {/* VEHICULOS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">

          <div className="text-center mb-16">
            <h2 className="text-4xl text-[#2a1810] font-bold mb-4">
              Nuestra Flota
            </h2>
            <p className="text-lg text-[#6b5849]">
              Vehículos cómodos y equipados
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {vehicles.map((vehicle, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border hover:shadow-2xl transition"
              >
                
                {/* Imagen */}
                <div className="relative h-64">
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover"
                  />

                  
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 text-[#2a1810]">
                    {vehicle.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-4 text-[#6b5849]">
                    <Users className="w-5 h-5 text-[#d4663a]" />
                    {vehicle.capacity}
                  </div>

                  <ul className="space-y-2">
                    {vehicle.features.map((f, i) => (
                      <li key={i} className="flex gap-2 text-[#6b5849]">
                        <Check className="w-5 h-5 text-[#d4663a]" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* SEGURIDAD */}
      <section className="py-20 bg-[#f4e8d9]">
        <div className="max-w-7xl mx-auto px-4">

          <div className="text-center mb-12">
            <h2 className="text-4xl text-[#2a1810] font-bold">
              Seguridad y Mantenimiento
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Inspección",
                desc: "Vehículos revisados constantemente",
              },
              {
                title: "Conductores",
                desc: "Personal profesional certificado",
              },
              {
                title: "Seguro",
                desc: "Cobertura completa",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileInView={{ opacity: 1 }}
                className="bg-white p-8 rounded-2xl shadow-lg text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-[#d4663a] rounded-full flex items-center justify-center">
                  <Check className="text-white w-8 h-8" />
                </div>

                <h3 className="text-xl font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-[#6b5849]">{item.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
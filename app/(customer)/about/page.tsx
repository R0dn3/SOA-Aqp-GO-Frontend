"use client";
import { Award, Heart, Shield, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function aboutPage() {
  return (
    <div className="min-h-screen">
      
      {/* HERO */}
      <section className="relative h-96 overflow-hidden">
          <img
          src="https://images.unsplash.com/photo-1590545651636-f0e7f151239f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
          className="absolute inset-0 w-full h-full object-cover"
         />

        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"></div>

        <div className="relative z-10 h-full flex items-center justify-center text-center">
          <div className="max-w-4xl mx-auto px-4">
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl text-white font-bold mb-4"
            >
              Nuestra Historia
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-white/90"
            >
              Descubre quiénes somos y nuestra pasión por el turismo en Arequipa
            </motion.p>
          </div>
        </div>
      </section>

      {/* QUIENES SOMOS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl text-[#2a1810] font-bold mb-6">
              Quiénes Somos
            </h2>

            <p className="text-lg text-[#6b5849] mb-4">
              Somos una agencia de turismo enfocada en brindar experiencias únicas
              en Arequipa y sus alrededores, conectando a los viajeros con la
              cultura, naturaleza y tradición local.
            </p>

            <p className="text-lg text-[#6b5849]">
              Nuestro objetivo es ofrecer un servicio confiable, seguro y memorable,
              alineado con la transformación digital del turismo.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="h-96 rounded-2xl overflow-hidden shadow-2xl"
          >
            <img
                 src="https://images.unsplash.com/photo-1586863350987-7af32f8b5c30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
                className="w-full h-full object-cover"
            />

          </motion.div>
        </div>
      </section>

      {/* VALORES */}
      <section className="py-20 bg-[#f4e8d9]">
        <div className="max-w-7xl mx-auto px-4">

          <div className="text-center mb-16">
            <h2 className="text-4xl text-[#2a1810] font-bold mb-4">
              Nuestros Valores
            </h2>
            <p className="text-lg text-[#6b5849]">
              Lo que nos define como empresa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Heart, title: "Pasión", desc: "Amamos lo que hacemos" },
              { icon: Shield, title: "Seguridad", desc: "Tu bienestar es prioridad" },
              { icon: Award, title: "Calidad", desc: "Buscamos excelencia" },
              { icon: Users, title: "Compromiso", desc: "Con nuestros clientes" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-2xl shadow-lg text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-[#d4663a] rounded-full flex items-center justify-center">
                  <item.icon className="text-white w-8 h-8" />
                </div>

                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-[#6b5849]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ESTADISTICAS */}
      <section className="py-20 bg-[#2a1810] text-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">

          {[
            { number: "10+", label: "Años de experiencia" },
            { number: "5000+", label: "Clientes" },
            { number: "20+", label: "Destinos" },
            { number: "100%", label: "Satisfacción" },
          ].map((stat, i) => (
            <motion.div key={i} whileInView={{ scale: 1.1 }}>
              <h3 className="text-4xl text-[#d4663a] font-bold">
                {stat.number}
              </h3>
              <p>{stat.label}</p>
            </motion.div>
          ))}

        </div>
      </section>

    </div>
  );
}
import Link from "next/link";
import {
  Globe,
  Camera,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#2a1810] text-[#f4e8d9] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* BRAND */}
          <div>
            <h3
              className="text-xl text-white mb-4 font-bold"
            >
              Arequipa Tours
            </h3>
            <p className="text-[#f4e8d9]/80 text-sm leading-relaxed">
              Descubre la belleza de Arequipa y el sur del Perú con nuestros
              tours personalizados y servicio de transporte de primera clase.
            </p>
          </div>

          {/* LINKS */}
          <div>
            <h4 className="text-white mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-[#d4663a] transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/destinations" className="hover:text-[#d4663a] transition-colors">
                  Paquetes Tours
                </Link>
              </li>
              <li>
                <Link href="/reservar" className="hover:text-[#d4663a] transition-colors">
                  Reservar
                </Link>
              </li>
              <li>
                <Link href="/soporte" className="hover:text-[#d4663a] transition-colors">
                  Soporte
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACTO */}
          <div>
            <h4 className="text-white mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm">
              
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 text-[#d4663a] flex-shrink-0" />
                <span>Arequipa, Perú</span>
              </li>

              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#d4663a] flex-shrink-0" />
                <span>+51 954 123 456</span>
              </li>

              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#d4663a] flex-shrink-0" />
                <span>info@arequipatours.pe</span>
              </li>

            </ul>
          </div>

          {/* SOCIAL */}
          <div>
            <h4 className="text-white mb-4">Síguenos</h4>

            <div className="flex gap-3">
              
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#3d2820] flex items-center justify-center hover:bg-[#d4663a] transition-all duration-300"
              >
                <Globe className="w-5 h-5" />
              </a>

              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#3d2820] flex items-center justify-center hover:bg-[#d4663a] transition-all duration-300"
              >
                <Camera className="w-5 h-5" />
              </a>

            </div>
          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-[#3d2820] mt-8 pt-8 text-center text-sm text-[#f4e8d9]/60">
          <p>&copy; 2026 Arequipa Tours. Todos los derechos reservados.</p>
        </div>

      </div>
    </footer>
  );
}
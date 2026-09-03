// components/layout/navigation.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut, Plane } from "lucide-react";
import { logout as authLogout } from "@/lib/auth"; // Ajusta la ruta según tu estructura

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Almacenamos los datos del usuario autenticado
  const [user, setUser] = useState<{ nombreCompleto: string; email: string } | null>(null);

  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem("usuario");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };

    loadUser();
    window.addEventListener("authChanged", loadUser);

    return () => {
      window.removeEventListener("authChanged", loadUser);
    };
  }, []);

  const isAuthenticated = !!user;

  const handleLogout = async () => {
    await authLogout();            // Limpia Firebase y localStorage
    window.dispatchEvent(new Event("authChanged")); // Actualiza el estado
    window.location.href = "/";    // Redirige al inicio
  };

  const navLinks = [
    { path: "/", label: "Inicio" },
    { path: "/about", label: "Nosotros" },
    { path: "/transport", label: "Transportes" },
    { path: "/destinations", label: "Paquetes" },
    { path: "/reservar", label: "Reservar" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#2a1810] border-b border-[#d4663a]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#d4663a] rounded-full flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl text-white font-bold leading-none">AQP GO</h1>
              <p className="text-xs text-[#f4e8d9]">Descubre el Perú</p>
            </div>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive(link.path)
                    ? "bg-[#d4663a] text-white"
                    : "text-[#f4e8d9] hover:bg-[#3d2820] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* AUTH */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3d2820] text-[#f4e8d9] hover:bg-[#d4663a] hover:text-white transition-all"
                >
                  <User className="w-4 h-4" />
                  <span>{user?.nombreCompleto}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#f4e8d9] hover:bg-[#3d2820] transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-6 py-2 rounded-lg bg-[#d4663a] text-white hover:bg-[#c15530] transition-all duration-300 shadow-lg hover:shadow-[#d4663a]/50"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-white p-2"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-[#d4663a]/20">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg mb-1 transition-all ${
                  isActive(link.path)
                    ? "bg-[#d4663a] text-white"
                    : "text-[#f4e8d9] hover:bg-[#3d2820]"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-4 pt-4 border-t border-[#d4663a]/20">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 rounded-lg bg-[#3d2820] text-[#f4e8d9] mb-2"
                  >
                    Mi Cuenta – {user?.nombreCompleto}
                  </Link>
                  <button
                    onClick={() => {
                      authLogout();
                      setIsOpen(false);
                      window.dispatchEvent(new Event("authChanged"));
                      window.location.href = "/";
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg text-[#f4e8d9] hover:bg-[#3d2820]"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-lg bg-[#d4663a] text-white"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
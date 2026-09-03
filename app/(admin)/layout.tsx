
"use client";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout as authLogout } from "@/lib/auth";
import { useState, useEffect } from "react";
import {
  Home, Map, CalendarCheck, Users,
  Truck, Settings, PanelLeft,
  CreditCard, BarChart3, LogOut, Bell,LifeBuoy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/admin",            icon: <Home size={18} />,          label: "Dashboard"   },
  { href: "/admin/tours",      icon: <Map size={18} />,           label: "Tours"       },
  { href: "/admin/reservas",   icon: <CalendarCheck size={18} />, label: "Reservas"    },
  { href: "/admin/usuarios",   icon: <Users size={18} />,         label: "Usuarios"    },
  { href: "/admin/proveedores",icon: <Truck size={18} />,         label: "Proveedores" },
  { href: "/admin/pagos",      icon: <CreditCard size={18} />,    label: "Pagos"       },
  { href: "/admin/soporte",    icon: <LifeBuoy size={18} />,      label: "Soporte"     },
  { href: "/admin/reportes",   icon: <BarChart3 size={18} />,     label: "Reportes"    },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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

  const userInitials = user
    ? user.nombreCompleto
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const handleLogout = async () => {
    await authLogout();            // Limpia Firebase y localStorage
    window.dispatchEvent(new Event("authChanged")); // Actualiza el estado
    window.location.href = "/";    // Redirige al inicio
  };

  const isActive = (path: string) => {
    if (path === "/") return pathname === path;
    return pathname.startsWith(path);
  };
  return (
    <div className="flex min-h-screen" style={{ background: "#fdf4ef" }}>

      {/* ── SIDEBAR DESKTOP ──────────────────────────────── */}
      <aside
        className="fixed inset-y-0 left-0 z-10 hidden w-16 flex-col sm:flex"
        style={{ background: "#2a1810", borderRight: "1px solid #3d2820" }}
      >
        <nav className="flex flex-col items-center gap-3 py-5">
          {/* Logo */}
          <Link
            href="/admin"
            className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white text-sm mb-2"
            style={{ background: "#d4663a" }}
          >
            A
          </Link>

          {navLinks.map((link) => (
            <NavItem key={link.href} href={link.href} icon={link.icon} label={link.label} />
          ))}
        </nav>

        {/* Settings al fondo */}
        <div className="mt-auto mb-5 flex justify-center">
          <NavItem href="/admin/settings" icon={<Settings size={18} />} label="Ajustes" />
        </div>
      </aside>

      {/* ── CONTENIDO PRINCIPAL ──────────────────────────── */}
      <div className="flex flex-col flex-1 sm:pl-16">

        {/* ── HEADER ───────────────────────────────────── */}
        <header
          className="sticky top-0 z-20 flex h-14 items-center px-4 sm:px-6"
          style={{ background: "#3d2820", borderBottom: "1px solid #5a3828" }}
        >
          {/* Botón mobile */}
          <MobileNav />

          {/* Título desktop */}
          <span
            className="hidden sm:block text-sm font-semibold"
            style={{ color: "#f4e8d9" }}
          >
            Panel Administrativo
          </span>

          {/* Acciones — al lado derecho */}
          <div className="flex items-center gap-1 ml-auto">

            {/* Notificaciones */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-lg"
              style={{ color: "#c4956a" }}
            >
              <Bell size={17} />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: "#d4663a" }}
              />
            </Button>

            {/* Avatar + dropdown sesión */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-[#4d3428] outline-none">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white flex-shrink-0"
                    style={{ background: "#d4663a" }}
                  >
                    {userInitials}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold leading-none" style={{ color: "#f4e8d9" }}>
                      {user?.nombreCompleto || "Admin"}
                    </p>
                    <p className="text-[10px] mt-0.5 leading-none" style={{ color: "#c4956a" }}>
                      {user?.email || ""}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-52 border-[#e8d8cc]">
                <div className="px-3 py-2.5 border-b border-[#e8d8cc]">
                  <p className="text-xs font-semibold text-[#2a1810]">
                    {user?.nombreCompleto || "Usuario"}
                  </p>
                  <p className="text-[11px] text-[#8c7b6e] mt-0.5">
                    {user?.email || ""}
                  </p>
                </div>
                <Link href="/">
                <DropdownMenuItem className="gap-2 mt-1 cursor-pointer text-sm text-[#4a3020]">
                  <Settings size={14} className="text-[#8c7b6e]" />
                  Vista Cliente
                </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-[#e8d8cc]" />

                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-sm text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut size={14} />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* ── MAIN ─────────────────────────────────────── */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

/* ── NavItem desktop con tooltip ───────────────────────── */
function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const pathname = usePathname();
  const isActive =
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      title={label}
      className="group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150"
      style={{
        background: isActive ? "#d4663a" : "transparent",
        color: isActive ? "#ffffff" : "#c4956a",
      }}
    >
      {icon}
      {/* Tooltip */}
      <span
        className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: "#1a0f09", color: "#f4e8d9", border: "1px solid #3d2820" }}
      >
        {label}
      </span>
    </Link>
  );
}

/* ── MobileNav ──────────────────────────────────────────── */
function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="sm:hidden h-9 w-9 rounded-lg"
          style={{ color: "#f4e8d9" }}
        >
          <PanelLeft size={20} />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-60 p-0" style={{ background: "#2a1810", border: "none" }}>
        {/* Header del sheet */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid #3d2820" }}>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl font-bold text-white text-sm"
            style={{ background: "#d4663a" }}
          >
            A
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "#f4e8d9" }}>AQP GO</p>
            <p className="text-[10px]" style={{ color: "#c4956a" }}>Panel Admin</p>
          </div>
        </div>

        {/* Links */}
        <nav className="flex flex-col gap-1 p-3 mt-1">
          {navLinks.map((link) => (
            <MobileNavItem key={link.href} {...link} />
          ))}
        </nav>

        {/* Footer del sheet */}
        <div className="absolute bottom-0 left-0 right-0 p-3" style={{ borderTop: "1px solid #3d2820" }}>
          <MobileNavItem href="/admin/settings" icon={<Settings size={17} />} label="Ajustes" />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MobileNavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const pathname = usePathname();
  const isActive =
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
      style={{
        background: isActive ? "#d4663a" : "transparent",
        color: isActive ? "#ffffff" : "#c4956a",
      }}
    >
      {icon}
      {label}
    </Link>
  );
}
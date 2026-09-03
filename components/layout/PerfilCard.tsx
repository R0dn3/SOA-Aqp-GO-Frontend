"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, MapPin, CreditCard,
  Calendar, Users, Pencil, X, Save, Loader2,
  CheckCircle2, AlertCircle,
} from "lucide-react";
import { getPerfil, actualizarPerfil, PerfilCompleto } from "@/lib/perfil";
import { useRouter } from "next/router";

// ── Campo de solo lectura ─────────────────────────────────────
function CampoInfo({ icon, label, value }: {
  icon: React.ReactNode; label: string; value?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-[#b86a3c] mt-0.5 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-700 font-medium">{value || "—"}</p>
      </div>
    </div>
  );
}

// ── Campo editable ────────────────────────────────────────────
function CampoEditable({ label, value, onChange, type = "text", opciones }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  opciones?: { value: string; label: string }[];
}) {
  if (opciones) {
    return (
      <div>
        <label className="block text-xs text-gray-400 mb-1">{label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#b86a3c]/30 focus:border-[#b86a3c]">
          <option value="">Seleccionar...</option>
          {opciones.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#b86a3c]/30 focus:border-[#b86a3c]" />
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
export default function PerfilCard() {
  const [perfil, setPerfil]         = useState<PerfilCompleto | null>(null);
  const [editando, setEditando]     = useState(false);
  const [guardando, setGuardando]   = useState(false);
  const [cargando, setCargando]     = useState(true);
  const [mensaje, setMensaje]       = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  // Formulario de edición
  const [form, setForm] = useState({
    nombreCompleto: "",
    telefono: "",
    dniPasaporte: "",
    pais: "",
    fechaNacimiento: "",
    genero: "",
  });

  useEffect(() => {
    getPerfil()
      .then((data) => {
        setPerfil(data);
        // Precarga el formulario con los datos actuales
        setForm({
          nombreCompleto:  data.nombreCompleto || "",
          telefono:        data.telefono || "",
          dniPasaporte:    data.dniPasaporte || "",
          pais:            data.pais || "",
          fechaNacimiento: data.fechaNacimiento || "",
          genero:          data.genero || "",
        });
      })
      .catch(() => setMensaje({ tipo: "error", texto: "Error al cargar el perfil" }))
      .finally(() => setCargando(false));
  }, []);

  function cancelarEdicion() {
    if (!perfil) return;
    // Restaura el formulario con los datos originales
    setForm({
      nombreCompleto:  perfil.nombreCompleto || "",
      telefono:        perfil.telefono || "",
      dniPasaporte:    perfil.dniPasaporte || "",
      pais:            perfil.pais || "",
      fechaNacimiento: perfil.fechaNacimiento || "",
      genero:          perfil.genero || "",
    });
    setEditando(false);
    setMensaje(null);
  }

  async function guardar() {
    setGuardando(true);
    setMensaje(null);
    try {
      const actualizado = await actualizarPerfil(form);
      setPerfil(actualizado);
      setEditando(false);
      setMensaje({ tipo: "ok", texto: "Perfil actualizado correctamente" });
      setTimeout(() => setMensaje(null), 3000);
    } catch {
      setMensaje({ tipo: "error", texto: "Error al guardar los cambios" });
    } finally {
      setGuardando(false);
    }
    console.log(form.fechaNacimiento);
  }

  // Formato de fecha para mostrar
  function formatearFecha(fecha?: string) {
    if (!fecha) return undefined;
    const [year, month, day] = fecha.split('-');
    // Los meses en Date van de 0 a 11, por eso restamos 1
    const fechaLocal = new Date(Number(year), Number(month) - 1, Number(day));
    return fechaLocal.toLocaleDateString("es-PE", { dateStyle: "long" });
  }

  // Label de género
  function labelGenero(g?: string) {
    const map: Record<string, string> = { M: "Masculino", F: "Femenino", otro: "No definido" };
    return g ? map[g] ?? g : undefined;
  }

  if (cargando) return (
    <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-center h-48">
      <Loader2 className="h-6 w-6 animate-spin text-[#b86a3c]" />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow p-6 hover:shadow-xl transition-all duration-300"
    >
      {/* Avatar y nombre */}
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 bg-[#b86a3c] rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-3xl font-bold">
            {perfil?.nombreCompleto?.charAt(0).toUpperCase() ?? "?"}
          </span>
        </div>
        <h2 className="mt-4 text-xl font-bold text-gray-800">{perfil?.nombreCompleto}</h2>
        <p className="text-gray-500 text-sm">{perfil?.email}</p>
        <span className={`mt-2 text-xs font-semibold px-3 py-1 rounded-full ${
          perfil?.rol === "ADMIN"
            ? "bg-orange-100 text-[#b86a3c]"
            : "bg-gray-100 text-gray-500"
        }`}>
          {perfil?.rol === "ADMIN" ? "Administrador" : "Cliente"}
        </span>
      </div>

      <hr className="my-5" />

      {/* Mensaje de éxito o error */}
      {mensaje && (
        <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 mb-4 ${
          mensaje.tipo === "ok"
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-red-50 text-red-600 border border-red-200"
        }`}>
          {mensaje.tipo === "ok"
            ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
          {mensaje.texto}
        </div>
      )}

      {/* ── MODO LECTURA ── */}
      {!editando && (
        <div className="space-y-4 text-sm">
          <CampoInfo icon={<Mail size={15} />}     label="Correo electrónico" value={perfil?.email} />
          <CampoInfo icon={<Phone size={15} />}    label="Teléfono"           value={perfil?.telefono} />
          <CampoInfo icon={<CreditCard size={15}/>} label="DNI / Pasaporte"  value={perfil?.dniPasaporte} />
          <CampoInfo icon={<MapPin size={15} />}   label="País"              value={perfil?.pais} />
          <CampoInfo icon={<Calendar size={15} />} label="Fecha de nacimiento" value={formatearFecha(perfil?.fechaNacimiento)} />
          <CampoInfo icon={<Users size={15} />}    label="Género"            value={labelGenero(perfil?.genero)} />
        </div>
      )}

      {/* ── MODO EDICIÓN ── */}
      {editando && (
        <div className="space-y-3">
          <CampoEditable label="Nombre completo"
            value={form.nombreCompleto}
            onChange={(v) => setForm({ ...form, nombreCompleto: v })} />

          {/* Email — solo lectura siempre */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Correo electrónico</label>
            <input type="email" value={perfil?.email} disabled
              className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">El correo no se puede modificar</p>
          </div>

          <CampoEditable label="Teléfono" type="tel"
            value={form.telefono}
            onChange={(v) => setForm({ ...form, telefono: v })} />

          <CampoEditable label="DNI / Pasaporte"
            value={form.dniPasaporte}
            onChange={(v) => setForm({ ...form, dniPasaporte: v })} />

          <CampoEditable label="País"
            value={form.pais}
            onChange={(v) => setForm({ ...form, pais: v })} />

          <CampoEditable label="Fecha de nacimiento" type="date"
            value={form.fechaNacimiento}
            onChange={(v) => setForm({ ...form, fechaNacimiento: v })} />

          <CampoEditable label="Género"
            value={form.genero}
            onChange={(v) => setForm({ ...form, genero: v })}
            opciones={[
              { value: "M",    label: "Masculino" },
              { value: "F",    label: "Femenino" },
              { value: "otro", label: "Prefiero no decirlo" },
            ]} />
        </div>
      )}

      {/* ── Botones ── */}
      <div className="mt-6">
        {!editando ? (
          <button
            onClick={() => setEditando(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#b86a3c] text-[#b86a3c] text-sm font-semibold hover:bg-[#b86a3c] hover:text-white transition-all duration-200"
          >
            <Pencil size={15} /> Editar perfil
          </button>
          
        ) : (
          <div className="flex gap-2">
            <button onClick={cancelarEdicion} disabled={guardando}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all">
              <X size={15} /> Cancelar
            </button>
            <button onClick={guardar} disabled={guardando}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#b86a3c] text-white text-sm font-semibold hover:bg-[#a05530] transition-all disabled:opacity-50">
              {guardando
                ? <><Loader2 size={15} className="animate-spin" /> Guardando...</>
                : <><Save size={15} /> Guardar cambios</>}
            </button>
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 transition-all font-medium shadow-sm"
        >
          <Link
            href="/soporte"
          >
            ¿Necesitas ayuda?
          </Link>
          
        </button>
      </div>
    </motion.div>
  );
}
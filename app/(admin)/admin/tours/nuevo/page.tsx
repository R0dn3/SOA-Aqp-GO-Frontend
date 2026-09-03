
"use client";
export const dynamic = "force-dynamic";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { crearPaquete } from "@/lib/paquetes";
import { getLugares, Lugar } from "@/lib/lugares";
import { getProveedores, Proveedor } from "@/lib/proveedores";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft, Save, Plus, Trash2, GripVertical,
  ImagePlus, MapPin, X, AlertCircle, CheckCircle2,
  Upload, Loader2,
} from "lucide-react";
import api from "@/lib/axios";

// ── Tipos ─────────────────────────────────────────────────────
type Foto = {
  id: number;
  url: string;
  alt: string;
  orden: number;
  subiendo?: boolean; 
  error?: string;     
};

type DiaItinerario = {
  id: number;
  diaNumero: number;
  titulo: string;
  descripcionMd: string;
};

type LugarSeleccionado = {
  id: string;   
  nombre: string;
};

type ProveedorSeleccionado = {
  id: string;  
  nombre: string;
  tipo: string;
  rol: string;
};

// ── Componentes auxiliares ────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-400 mt-1">{children}</p>;
}

function MarkdownTextarea({
  label, value, onChange, placeholder, hint, rows = 6, required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; hint?: string; rows?: number; required?: boolean;
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <textarea
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#d4663a]/30 focus:border-[#d4663a] resize-y font-mono"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {hint && <Hint>{hint}</Hint>}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────
export default function NuevoTourPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState("");

  const [lugaresDisponibles, setLugaresDisponibles] = useState<Lugar[]>([]);
  const [proveedoresDisponibles, setProveedoresDisponibles] = useState<Proveedor[]>([]);

  useEffect(() => {
    getLugares().then(setLugaresDisponibles).catch(console.error);
    getProveedores().then(setProveedoresDisponibles).catch(console.error);
  }, []);

  // ── Estado del formulario ─────────────────────────────────
  const [nombre, setNombre] = useState("");
  const [lugaresSeleccionados, setLugaresSeleccionados] = useState<LugarSeleccionado[]>([]);
  const [precio, setPrecio] = useState("");
  const [dias, setDias] = useState("1");
  const [noches, setNoches] = useState("0");
  const [activo, setActivo] = useState(true);
  const [mapaUrl, setMapaUrl] = useState("");

  // Contenido
  const [subtitulo, setSubtitulo] = useState("");
  const [resumen, setResumen] = useState("");
  const [recomendaciones, setRecomendaciones] = useState("");
  const [incluye, setIncluye] = useState("- Transporte en bus turístico\n- Guía local certificado\n- ");
  const [noIncluye, setNoIncluye] = useState("- Vuelos\n- Seguro de viaje\n- ");
  const [preguntas, setPreguntas] = useState("**¿Qué incluye el tour?**\n\n**¿Cuál es el punto de encuentro?**\n\n");

  // Fotos
  const [fotos, setFotos] = useState<Foto[]>([]);
  const inputFileRef = useRef<HTMLInputElement>(null);

  // Itinerario
  const [itinerario, setItinerario] = useState<DiaItinerario[]>([
    { id: 1, diaNumero: 1, titulo: "", descripcionMd: "" },
  ]);

  // Proveedores
  const [proveedoresAsignados, setProveedoresAsignados] = useState<ProveedorSeleccionado[]>([]);

  // Nombre automático
  const nombreGenerado = lugaresSeleccionados.map((l) => l.nombre).join(" + ");
  const nombreFinal = nombre.trim() || nombreGenerado;

  // ── Handlers de lugares ───────────────────────────────────
  function agregarLugar(lugar: { id: string; nombre: string }) {
    if (lugaresSeleccionados.find((l) => l.id === lugar.id)) return;
    setLugaresSeleccionados((prev) => [...prev, lugar]);
  }

  function quitarLugar(id: string) {
    setLugaresSeleccionados((prev) => prev.filter((l) => l.id !== id));
  }

  // ── Handlers de fotos ─────────────────────────────────────

  // Se llama cuando el usuario selecciona archivos
  async function handleSeleccionarFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const archivos = Array.from(e.target.files || []);
    if (!archivos.length) return;

    // Crea placeholders mientras suben
    const placeholders: Foto[] = archivos.map((archivo, i) => ({
      id: Date.now() + i,
      url: URL.createObjectURL(archivo), // preview local temporal
      alt: archivo.name.replace(/\.[^/.]+$/, ""),
      orden: fotos.length + i,
      subiendo: true,
    }));

    setFotos((prev) => [...prev, ...placeholders]);

    // Sube cada archivo a Cloudinary via API Route
    for (let i = 0; i < archivos.length; i++) {
      const archivo = archivos[i];
      const placeholder = placeholders[i];

      try {
        const formData = new FormData();
        formData.append("file", archivo);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Error al subir");

        const data = await res.json();

        // Reemplaza el placeholder con la URL real de Cloudinary
        setFotos((prev) =>
          prev.map((f) =>
            f.id === placeholder.id
              ? { ...f, url: data.url, subiendo: false, error: undefined }
              : f
          )
        );
      } catch {
        setFotos((prev) =>
          prev.map((f) =>
            f.id === placeholder.id
              ? { ...f, subiendo: false, error: "Error al subir" }
              : f
          )
        );
      }
    }

    // Limpia el input para permitir re-seleccionar el mismo archivo
    if (inputFileRef.current) inputFileRef.current.value = "";
  }

  function quitarFoto(id: number) {
    setFotos((prev) =>
      prev
        .filter((f) => f.id !== id)
        .map((f, i) => ({ ...f, orden: i }))
    );
  }

  function actualizarAltFoto(id: number, alt: string) {
    setFotos((prev) => prev.map((f) => (f.id === id ? { ...f, alt } : f)));
  }

  // ── Handlers de itinerario ────────────────────────────────
  function agregarDia() {
    const nuevoDia = itinerario.length + 1;
    setItinerario((prev) => [
      ...prev,
      { id: Date.now(), diaNumero: nuevoDia, titulo: "", descripcionMd: "" },
    ]);
    setDias(String(nuevoDia));
  }

  function quitarDia(id: number) {
    setItinerario((prev) => {
      const actualizado = prev
        .filter((d) => d.id !== id)
        .map((d, i) => ({ ...d, diaNumero: i + 1 }));
      setDias(String(actualizado.length || 1));
      return actualizado;
    });
  }

  function actualizarDia(id: number, campo: "titulo" | "descripcionMd", valor: string) {
    setItinerario((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [campo]: valor } : d))
    );
  }

  // ── Handlers de proveedores ───────────────────────────────
  function toggleProveedor(p: { id: string; nombre: string; tipo: string }) {
    setProveedoresAsignados((prev) => {
      const existe = prev.find((pa) => pa.id === p.id);
      if (existe) return prev.filter((pa) => pa.id !== p.id);
      return [...prev, { ...p, rol: p.tipo }]; // rol = tipo por defecto
    });
  }

  // ── Guardar paquete ───────────────────────────────────────
  async function guardar() {
    setErrorGuardar("");

    // Validaciones básicas
    if (!nombreFinal.trim()) {
      setActiveTab("general");
      setErrorGuardar("El nombre o los lugares son obligatorios");
      return;
    }
    if (!precio || parseFloat(precio) <= 0) {
      setActiveTab("general");
      setErrorGuardar("El precio debe ser mayor a 0");
      return;
    }
    if (fotos.some((f) => f.subiendo)) {
      setActiveTab("fotos");
      setErrorGuardar("Espera a que terminen de subir todas las fotos");
      return;
    }

    setGuardando(true);

    try {
      // Construye el body que espera PaqueteCreateDto en Spring
      const body = {
        nombre: nombreFinal,
        subtitulo: subtitulo || null,
        resumenMd: resumen || null,
        recomendacionesMd: recomendaciones || null,
        incluyeMd: incluye || null,
        noIncluyeMd: noIncluye || null,
        preguntasMd: preguntas || null,
        precioBase: parseFloat(precio),
        duracionDias: parseInt(dias),
        duracionNoches: parseInt(noches),
        mapaUrl: mapaUrl || null,
        activo,
        lugarIds: lugaresSeleccionados.map((l) => l.id),
        proveedores: proveedoresAsignados.map((p) => ({
          proveedorId: p.id,
          rol: p.rol,
          notas: null,
        })),
        fotos: fotos
          .filter((f) => !f.error) // excluye fotos con error
          .map((f, i) => ({
            url: f.url,
            alt: f.alt || null,
            orden: i,
          })),
        itinerario: itinerario.map((d) => ({
          diaNumero: d.diaNumero,
          titulo: d.titulo,
          descripcionMd: d.descripcionMd || null,
        })),
      };

      await crearPaquete(body);
      router.push("/admin/tours");

    } catch (err: any) {
      setErrorGuardar(
        err?.response?.data?.error || "Error al guardar el paquete"
      );
    } finally {
      setGuardando(false);
    }
  }

  // Tab completitud
  const tabStatus = {
    general: !!nombreFinal.trim() && !!precio,
    contenido: !!subtitulo.trim() || !!resumen.trim(),
    itinerario: itinerario.some((d) => d.titulo.trim().length > 0),
    fotos: fotos.filter((f) => !f.error).length > 0,
    extras: proveedoresAsignados.length > 0,
  };

  return (
    <div className="space-y-6 max-w-4xl">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/tours")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Nuevo paquete</h2>
            <p className="text-sm text-gray-500">
              {nombreFinal || "Completa la información del paquete"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/tours")}>
            Cancelar
          </Button>
          <Button
            className="bg-[#d4663a] hover:bg-[#b8532e] gap-2 min-w-[120px]"
            onClick={guardar}
            disabled={guardando}
          >
            {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {guardando ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>

      {/* Error general */}
      {errorGuardar && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {errorGuardar}
        </div>
      )}

      {/* ── Tabs ─────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          {[
            { key: "general", label: "General" },
            { key: "contenido", label: "Contenido" },
            { key: "itinerario", label: "Itinerario" },
            { key: "fotos", label: "Fotos" },
            { key: "extras", label: "Extras" },
          ].map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="relative gap-1.5 text-xs sm:text-sm">
              {t.label}
              {tabStatus[t.key as keyof typeof tabStatus] && (
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ─── GENERAL ─────────────────────────────────── */}
        <TabsContent value="general" className="space-y-5 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información básica</CardTitle>
              <CardDescription>Define los datos principales del paquete</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* Lugares */}
              <div>
                <Label required>Lugares del paquete</Label>
                <div className="flex flex-wrap gap-2 mb-3 min-h-[36px]">
                  {lugaresSeleccionados.map((l) => (
                    <Badge key={l.id} variant="outline"
                      className="gap-1.5 pl-2 pr-1 py-1 border-[#d4663a]/30 text-[#d4663a] bg-[#d4663a]/5">
                      <MapPin className="h-3 w-3" />
                      {l.nombre}
                      <button onClick={() => quitarLugar(l.id)}
                        className="ml-0.5 hover:text-red-600 transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {lugaresDisponibles
                    .filter((l) => !lugaresSeleccionados.find((s) => s.id === l.id))
                    .map((l) => (
                      <button key={l.id} onClick={() => agregarLugar(l)}
                        className="text-xs border border-gray-200 rounded-full px-3 py-1 text-gray-600 hover:border-[#d4663a] hover:text-[#d4663a] transition-colors">
                        + {l.nombre}
                      </button>
                    ))}
                </div>
                <Hint>
                  Nombre generado: <strong>{nombreGenerado || "Lugar 1 + Lugar 2"}</strong>
                </Hint>
              </div>

              {/* Nombre personalizado */}
              <div>
                <Label>Nombre personalizado</Label>
                <Input value={nombre} onChange={(e) => setNombre(e.target.value)}
                  placeholder={nombreGenerado || "Ej. Arequipa + Cañón del Colca"} />
                <Hint>Déjalo vacío para usar el nombre generado por los lugares</Hint>
              </div>

              {/* Duración + precio */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <Label required>Días</Label>
                  <Input type="number" min="1" value={dias}
                    onChange={(e) => setDias(e.target.value)} />
                </div>
                <div>
                  <Label required>Noches</Label>
                  <Input type="number" min="0" value={noches}
                    onChange={(e) => setNoches(e.target.value)} />
                </div>
                <div>
                  <Label required>Precio (USD)</Label>
                  <Input type="number" min="0" step="0.01" value={precio}
                    onChange={(e) => setPrecio(e.target.value)} placeholder="0.00" />
                </div>
              </div>

              {/* Estado */}
              <div className="flex items-center gap-3">
                <button onClick={() => setActivo(!activo)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${activo ? "bg-[#d4663a]" : "bg-gray-200"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${activo ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <span className="text-sm text-gray-700">
                  {activo ? "Activo (visible en web)" : "Inactivo (oculto)"}
                </span>
              </div>

              {/* Mapa */}
              <div>
                <Label>URL del mapa</Label>
                <Input value={mapaUrl} onChange={(e) => setMapaUrl(e.target.value)}
                  placeholder="https://maps.google.com/..." />
                <Hint>Enlace de Google Maps para mostrar la ruta</Hint>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── CONTENIDO ───────────────────────────────── */}
        <TabsContent value="contenido" className="space-y-5 mt-6">
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Todos los campos aceptan <strong>Markdown</strong>:{" "}
              <code className="bg-blue-100 px-1 rounded">**negrita**</code>,{" "}
              <code className="bg-blue-100 px-1 rounded">- listas</code>, saltos de línea, etc.
            </p>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Resumen</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label required>Subtítulo</Label>
                <Input value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)}
                  placeholder="Ej. Vive la magia del cañón más profundo del mundo" />
              </div>
              <MarkdownTextarea label="Resumen" required value={resumen} onChange={setResumen}
                rows={5} placeholder="Describe el paquete..." hint="Aparecerá en la página del paquete" />
              <MarkdownTextarea label="Recomendaciones" value={recomendaciones}
                onChange={setRecomendaciones} rows={4}
                placeholder="- Llevar ropa abrigadora&#10;- Documentos de identidad" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Incluye / No incluye</CardTitle></CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <MarkdownTextarea label="✓ Incluye" value={incluye} onChange={setIncluye} rows={8}
                placeholder="- Transporte&#10;- Guía&#10;- ..." />
              <MarkdownTextarea label="✗ No incluye" value={noIncluye} onChange={setNoIncluye} rows={8}
                placeholder="- Vuelos&#10;- Seguro&#10;- ..." />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preguntas frecuentes</CardTitle>
              <CardDescription>Usa **negrita** para las preguntas</CardDescription>
            </CardHeader>
            <CardContent>
              <MarkdownTextarea label="Preguntas frecuentes" value={preguntas}
                onChange={setPreguntas} rows={10}
                placeholder={"**¿Cuál es el punto de encuentro?**\n\nNos reunimos en...\n\n"} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── ITINERARIO ──────────────────────────────── */}
        <TabsContent value="itinerario" className="space-y-4 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Itinerario por días</CardTitle>
                <CardDescription>Define qué actividades se hacen cada día</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={agregarDia}>
                <Plus className="h-4 w-4" /> Agregar día
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {itinerario.map((dia) => (
                <div key={dia.id}
                  className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-300" />
                      <span className="text-sm font-semibold text-[#d4663a]">Día {dia.diaNumero}</span>
                    </div>
                    {itinerario.length > 1 && (
                      <Button variant="ghost" size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-red-500"
                        onClick={() => quitarDia(dia.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <Label>Título del día</Label>
                    <Input value={dia.titulo}
                      onChange={(e) => actualizarDia(dia.id, "titulo", e.target.value)}
                      placeholder="Ej. Llegada a Arequipa y visita al centro histórico" />
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <textarea
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#d4663a]/30 focus:border-[#d4663a] resize-y font-mono"
                      rows={4}
                      value={dia.descripcionMd}
                      onChange={(e) => actualizarDia(dia.id, "descripcionMd", e.target.value)}
                      placeholder={"- 08:00 Desayuno\n- 09:00 Visita a la Catedral\n- 12:00 Almuerzo..."}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── FOTOS ───────────────────────────────────── */}
        <TabsContent value="fotos" className="space-y-5 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Galería de fotos</CardTitle>
              <CardDescription>
                Selecciona imágenes desde tu explorador. Se suben automáticamente a Cloudinary.
                La primera foto será la portada.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Botón de subida */}
              <div
                onClick={() => inputFileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl py-8 text-center cursor-pointer hover:border-[#d4663a]/50 hover:bg-[#d4663a]/5 transition-all group"
              >
                <Upload className="h-8 w-8 text-gray-300 group-hover:text-[#d4663a] mx-auto mb-2 transition-colors" />
                <p className="text-sm font-medium text-gray-500 group-hover:text-[#d4663a] transition-colors">
                  Haz clic para seleccionar fotos
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  PNG, JPG, WEBP — Puedes seleccionar varias a la vez
                </p>
              </div>

              {/* Input oculto */}
              <input
                ref={inputFileRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={handleSeleccionarFotos}
              />

              {/* Grid de fotos */}
              {fotos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {fotos.map((foto, idx) => (
                    <div key={foto.id}
                      className={`relative group rounded-lg overflow-hidden border ${
                        foto.error ? "border-red-200" : "border-gray-100"
                      }`}>

                      {/* Preview */}
                      <div className="relative h-32 bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={foto.url} alt={foto.alt}
                          className={`w-full h-full object-cover transition-opacity ${foto.subiendo ? "opacity-50" : "opacity-100"}`} />

                        {/* Spinner mientras sube */}
                        {foto.subiendo && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <Loader2 className="h-6 w-6 text-white animate-spin" />
                          </div>
                        )}

                        {/* Error */}
                        {foto.error && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-50/80">
                            <div className="text-center">
                              <AlertCircle className="h-5 w-5 text-red-500 mx-auto" />
                              <p className="text-xs text-red-500 mt-1">Error al subir</p>
                            </div>
                          </div>
                        )}

                        {/* Badge portada */}
                        {idx === 0 && !foto.subiendo && !foto.error && (
                          <span className="absolute top-1.5 left-1.5 bg-[#d4663a] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Portada
                          </span>
                        )}

                        {/* Botón eliminar */}
                        <button onClick={() => quitarFoto(foto.id)}
                          className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Alt text */}
                      {!foto.error && (
                        <div className="p-2">
                          <Input value={foto.alt}
                            onChange={(e) => actualizarAltFoto(foto.id, e.target.value)}
                            placeholder="Descripción de la foto"
                            className="text-xs h-7"
                            disabled={foto.subiendo} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {fotos.some((f) => f.subiendo) && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Subiendo fotos a Cloudinary...
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── EXTRAS ──────────────────────────────────── */}
        <TabsContent value="extras" className="space-y-5 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Proveedores asignados</CardTitle>
              <CardDescription>Uso interno — no visible al cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {proveedoresDisponibles.map((p) => {
                  const asignado = !!proveedoresAsignados.find((pa) => pa.id === p.id);
                  return (
                    <label key={p.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        asignado ? "border-[#d4663a]/40 bg-[#d4663a]/5" : "border-gray-100 hover:border-gray-200"
                      }`}>
                      <input type="checkbox" className="accent-[#d4663a]"
                        checked={asignado} onChange={() => toggleProveedor(p)} />
                      <p className="text-sm font-medium text-gray-800 flex-1">{p.nombre}</p>
                      <Badge variant="outline"
                        className={
                          p.tipo === "TRANSPORTE" ? "border-blue-200 text-blue-600 bg-blue-50" :
                          p.tipo === "HOTEL" ? "border-purple-200 text-purple-600 bg-purple-50" :
                          "border-amber-200 text-amber-600 bg-amber-50"
                        }>
                        {p.tipo.toLowerCase()}
                      </Badge>
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Resumen */}
          <Card className="border-[#d4663a]/20 bg-[#d4663a]/5">
            <CardHeader>
              <CardTitle className="text-base text-[#d4663a]">Resumen antes de guardar</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-1">
              <p><strong>Nombre:</strong> {nombreFinal || "—"}</p>
              <p><strong>Lugares:</strong> {lugaresSeleccionados.map((l) => l.nombre).join(", ") || "—"}</p>
              <p><strong>Duración:</strong> {dias} días / {noches} noches</p>
              <p><strong>Precio:</strong> {precio ? `$${precio}` : "—"}</p>
              <p><strong>Fotos subidas:</strong> {fotos.filter((f) => !f.error && !f.subiendo).length}</p>
              <p><strong>Días de itinerario:</strong> {itinerario.length}</p>
              <p><strong>Proveedores:</strong> {proveedoresAsignados.length}</p>
              <p><strong>Estado:</strong> {activo ? "Activo" : "Inactivo"}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Footer ───────────────────────────────────────── */}
      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button variant="outline" onClick={() => router.push("/admin/tours")}>
          Cancelar
        </Button>
        <Button className="bg-[#d4663a] hover:bg-[#b8532e] gap-2 min-w-[140px]"
          onClick={guardar} disabled={guardando}>
          {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {guardando ? "Guardando..." : "Guardar paquete"}
        </Button>
      </div>
    </div>
  );
}
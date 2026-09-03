// Coloca en: components/admin/BackupButton.tsx
// Úsalo en cualquier página del admin, por ejemplo en el dashboard
"use client";

import { useState } from "react";
import { Download, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { obtenerToken } from "@/lib/auth";

export default function BackupButton() {
  const [estado, setEstado] = useState<"idle" | "cargando" | "exito" | "error">("idle");
  const [mensaje, setMensaje] = useState("");

  async function descargarBackup() {
    setEstado("cargando");
    setMensaje("");

    try {
      const token = obtenerToken();

      // Fetch directo — axios no maneja bien la descarga de archivos binarios
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/backup/descargar`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Error al generar el backup");

      // Obtiene el nombre del archivo del header
      const disposition = res.headers.get("Content-Disposition") || "";
      const filename = disposition.includes("filename=")
        ? disposition.split("filename=")[1].replace(/"/g, "")
        : "backup.sql";

      // Crea un link temporal y lo clickea para descargar
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href     = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setEstado("exito");
      setMensaje(`Backup descargado: ${filename}`);
      setTimeout(() => setEstado("idle"), 4000);

    } catch (err: any) {
      setEstado("error");
      setMensaje("Error al generar el backup. Verifica que pg_dump esté disponible.");
      setTimeout(() => setEstado("idle"), 5000);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={descargarBackup}
        disabled={estado === "cargando"}
        variant="outline"
        className="gap-2 border-amber-200 text-amber-700 hover:bg-amber-50"
      >
        {estado === "cargando"
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Generando backup...</>
          : <><Download className="h-4 w-4" /> Descargar backup SQL</>}
      </Button>

      {estado === "exito" && (
        <p className="text-xs text-emerald-600 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> {mensaje}
        </p>
      )}
      {estado === "error" && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {mensaje}
        </p>
      )}
    </div>
  );
}
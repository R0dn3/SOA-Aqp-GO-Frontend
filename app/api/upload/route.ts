// app/api/upload/route.ts
// Recibe una imagen del frontend, la sube a Cloudinary y devuelve la URL
// El API Secret nunca sale del servidor — el cliente nunca lo ve

import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo" },
        { status: 400 }
      );
    }

    // Validar que sea una imagen
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Solo se permiten imágenes" },
        { status: 400 }
      );
    }

    // Validar tamaño máximo: 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "La imagen no puede superar 10MB" },
        { status: 400 }
      );
    }

    // Convertir File a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Subir a Cloudinary
    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "aqpgo/paquetes",
              resource_type: "image",
              // Transformación automática: optimiza calidad y formato
              transformation: [
                { quality: "auto", fetch_format: "auto" },
              ],
            },
            (error, result) => {
              if (error || !result) reject(error);
              else resolve(result as { secure_url: string; public_id: string });
            }
          )
          .end(buffer);
      }
    );

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });

  } catch (error) {
    console.error("Error subiendo a Cloudinary:", error);
    return NextResponse.json(
      { error: "Error interno al subir la imagen" },
      { status: 500 }
    );
  }
}
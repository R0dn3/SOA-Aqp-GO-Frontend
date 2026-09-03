// lib/api/perfil.ts
import api from "@/lib/axios";

export interface PerfilCompleto {
  id: string;
  nombreCompleto: string;
  email: string;
  telefono?: string;
  dniPasaporte?: string;
  pais?: string;
  fechaNacimiento?: string;
  genero?: string;
  rol: string;
}

export interface ActualizarPerfilRequest {
  nombreCompleto?: string;
  telefono?: string;
  dniPasaporte?: string;
  pais?: string;
  fechaNacimiento?: string;
  genero?: string;
}

export async function getPerfil(): Promise<PerfilCompleto> {
  const res = await api.get<PerfilCompleto>("/api/usuarios/perfil");
  return res.data;
}

export async function actualizarPerfil(
  datos: ActualizarPerfilRequest
): Promise<PerfilCompleto> {
  const res = await api.put<PerfilCompleto>("/api/usuarios/perfil", datos);
  return res.data;
}
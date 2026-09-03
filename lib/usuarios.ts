// lib/api/usuarios.ts
import api from "@/lib/axios";

export interface Usuario {
  id: string;
  nombreCompleto: string;
  email: string;
  telefono?: string;
  dniPasaporte?: string;
  pais?: string;
  fechaNacimiento?: string;
  genero?: string;
  rol: "CLIENTE" | "ADMIN";
  createdAt: string;
}

export interface CrearUsuarioRequest {
  nombreCompleto: string;
  email: string;
  password: string;
  telefono?: string;
  dniPasaporte?: string;
  pais?: string;
  fechaNacimiento?: string;
  genero?: string;
  rol?: "CLIENTE" | "ADMIN"; // opcional, por defecto CLIENTE desde backend si no se envía
}

// Obtener todos los usuarios (solo ADMIN)
export async function getUsuarios(): Promise<Usuario[]> {
  const res = await api.get<Usuario[]>("/api/usuarios");
  return res.data;
}

// Obtener un usuario por ID
export async function getUsuario(id: string): Promise<Usuario> {
  const res = await api.get<Usuario>(`/api/usuarios/${id}`);
  return res.data;
}

// Cambiar rol de un usuario
export async function cambiarRol(id: string, nuevoRol: "CLIENTE" | "ADMIN"): Promise<Usuario> {
  const res = await api.patch<Usuario>(`/api/usuarios/${id}/rol`, nuevoRol, {
    headers: { "Content-Type": "application/json" }
  });
  return res.data;
}

// Eliminar usuario
export async function eliminarUsuario(id: string): Promise<void> {
  await api.delete(`/api/usuarios/${id}`);
}

// Crear un nuevo usuario (solo admin)
export async function crearUsuario(data: CrearUsuarioRequest): Promise<Usuario> {
  const res = await api.post<Usuario>("/api/usuarios/register", data);
  return res.data;
}
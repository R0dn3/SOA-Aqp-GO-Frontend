// lib/api/proveedores.ts

import api from "@/lib/axios";

export interface Proveedor {
  id: string;
  nombre: string;
  tipo: "TRANSPORTE" | "HOTEL" | "RESTAURANTE";
  telefono?: string;
  email?: string;
  notas?: string;
}

export async function getProveedores(): Promise<Proveedor[]> {
  const res = await api.get<Proveedor[]>("/api/proveedores");
  return res.data;
}
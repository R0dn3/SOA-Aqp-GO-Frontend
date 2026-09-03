// lib/api/lugares.ts

import api from "@/lib/axios";

export interface Lugar {
  id: string;
  nombre: string;
  descripcion?: string;
  region?: string;
}

export async function getLugares(): Promise<Lugar[]> {
  const res = await api.get<Lugar[]>("/api/lugares");
  return res.data;
}
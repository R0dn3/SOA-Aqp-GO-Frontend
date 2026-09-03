import { signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import api from "./axios";
import { AuthResponse, LoginRequest, RegisterRequest } from "@/types";
 
// ── Guardar / limpiar sesión ──────────────────────────────────
 
export function guardarSesion(data: AuthResponse) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("usuario", JSON.stringify({
    email: data.email,
    nombreCompleto: data.nombreCompleto,
    rol: data.rol,
    telefono: data.telefono,
    dniPasaporte: data.dniPasaporte,
  }));
  window.dispatchEvent(new Event("authChanged"));
}
 
export function limpiarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  window.dispatchEvent(new Event("authChanged"));
}
 
export function obtenerUsuarioLocal() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("usuario");
  return raw ? JSON.parse(raw) : null;
}
 
export function obtenerToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}
 
export function estaAutenticado() {
  return !!obtenerToken();
}
 
// ── Login con email y password ────────────────────────────────
 
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/api/auth/login", data);
  guardarSesion(res.data);
  return res.data;
}
 
// ── Registro con email y password ────────────────────────────
 
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/api/auth/register", data);
  guardarSesion(res.data);
  return res.data;
}
 
// ── Login / Register con Google ───────────────────────────────
 
export async function loginConGoogle(): Promise<AuthResponse> {
  // 1. Firebase abre el popup de Google
  const result = await signInWithPopup(auth, googleProvider);
 
  // 2. Obtenemos el token de Firebase (idToken)
  const idToken = await result.user.getIdToken();
 
  // 3. Lo mandamos a Spring para que verifique y devuelva nuestro JWT
  const res = await api.post<AuthResponse>("/api/auth/google", { idToken });
  guardarSesion(res.data);
  return res.data;
}
 
// ── Logout ────────────────────────────────────────────────────
 
export async function logout() {
  await firebaseSignOut(auth); // cierra sesión en Firebase
  limpiarSesion();             // limpia localStorage
}
 
// ── Redirección según rol ─────────────────────────────────────
 
export function getRutaPorRol(rol: "CLIENTE" | "ADMIN"): string {
  return rol === "ADMIN" ? "/admin" : "/";
}
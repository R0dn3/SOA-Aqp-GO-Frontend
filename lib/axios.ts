import axios from "axios";
 
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // http://localhost:8080
  headers: {
    "Content-Type": "application/json",
  },
});
 
// Interceptor: agrega el token JWT en cada petición automáticamente
api.interceptors.request.use((config) => {
  // Solo en el cliente (browser)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
 
// Interceptor: si el token expiró (401) limpia sesión y redirige al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
 
export default api;
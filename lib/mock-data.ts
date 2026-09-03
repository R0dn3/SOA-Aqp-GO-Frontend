export interface Tour {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  rating: number;
  reviews: number;
  category: string;
  location: string;
  gradient: string;
  included: string[];
  difficulty: "Fácil" | "Moderado" | "Difícil";
  maxPeople: number;
  available: boolean;
}

export const mockTours: Tour[] = [
  {
    id: "1",
    name: "Cañón del Colca",
    description: "Explora uno de los cañones más profundos del mundo y avista al majestuoso cóndor andino en su hábitat natural.",
    price: 150,
    duration: "2 días / 1 noche",
    rating: 4.9,
    reviews: 248,
    category: "Naturaleza",
    location: "Caylloma, Arequipa",
    gradient: "from-emerald-600 to-teal-800",
    included: ["Transporte", "Guía bilingüe", "Desayuno", "Entradas"],
    difficulty: "Moderado",
    maxPeople: 15,
    available: true,
  },
  {
    id: "2",
    name: "Volcán El Misti",
    description: "Asciende al volcán símbolo de Arequipa y vive la experiencia de estar sobre los 5.822 m.s.n.m.",
    price: 200,
    duration: "2 días / 1 noche",
    rating: 4.7,
    reviews: 186,
    category: "Aventura",
    location: "Arequipa",
    gradient: "from-orange-600 to-red-800",
    included: ["Equipo de montaña", "Guía certificado", "Alimentación", "Campamento"],
    difficulty: "Difícil",
    maxPeople: 10,
    available: true,
  },
  {
    id: "3",
    name: "Centro Histórico",
    description: "Recorre el magnífico centro histórico declarado Patrimonio de la Humanidad por la UNESCO.",
    price: 45,
    duration: "4 horas",
    rating: 4.8,
    reviews: 412,
    category: "Cultural",
    location: "Arequipa",
    gradient: "from-amber-500 to-yellow-700",
    included: ["Guía bilingüe", "Entrada a museos", "Degustación"],
    difficulty: "Fácil",
    maxPeople: 20,
    available: true,
  },
  {
    id: "4",
    name: "Lago Titicaca",
    description: "Visita el lago navegable más alto del mundo y conoce la cultura aimara en las islas flotantes.",
    price: 280,
    duration: "3 días / 2 noches",
    rating: 4.9,
    reviews: 324,
    category: "Cultural",
    location: "Puno",
    gradient: "from-blue-600 to-indigo-800",
    included: ["Transporte", "Alojamiento", "Desayunos", "Guía"],
    difficulty: "Fácil",
    maxPeople: 12,
    available: true,
  },
  {
    id: "5",
    name: "Valle del Colca",
    description: "Trek por paisajes andinos únicos, aguas termales y comunidades rurales tradicionales.",
    price: 120,
    duration: "1 día",
    rating: 4.6,
    reviews: 156,
    category: "Trekking",
    location: "Caylloma, Arequipa",
    gradient: "from-lime-600 to-green-800",
    included: ["Transporte", "Guía", "Almuerzo", "Termas"],
    difficulty: "Moderado",
    maxPeople: 18,
    available: true,
  },
  {
    id: "6",
    name: "Ruta del Sillar",
    description: "Descubre los cañones tallados en sillar blanco, la piedra volcánica característica de Arequipa.",
    price: 65,
    duration: "6 horas",
    rating: 4.7,
    reviews: 98,
    category: "Aventura",
    location: "Arequipa",
    gradient: "from-stone-500 to-slate-700",
    included: ["Transporte", "Guía", "Snack"],
    difficulty: "Fácil",
    maxPeople: 15,
    available: true,
  },
];

export const mockReservas = [
  { id: "RES-001", tourName: "Cañón del Colca", date: "2026-05-15", people: 2, total: 300, status: "confirmada", paymentStatus: "pagado" },
  { id: "RES-002", tourName: "Centro Histórico", date: "2026-04-22", people: 3, total: 135, status: "pendiente", paymentStatus: "pendiente" },
  { id: "RES-003", tourName: "Volcán El Misti", date: "2026-06-10", people: 1, total: 200, status: "confirmada", paymentStatus: "pagado" },
  { id: "RES-004", tourName: "Lago Titicaca", date: "2026-07-01", people: 4, total: 1120, status: "confirmada", paymentStatus: "pagado" },
  { id: "RES-005", tourName: "Valle del Colca", date: "2026-05-30", people: 2, total: 240, status: "cancelada", paymentStatus: "reembolsado" },
];

export const mockProveedores = [
  { id: "PROV-001", name: "Andes Adventures", contact: "juan@andes.pe", tours: 4, rating: 4.8, status: "activo" },
  { id: "PROV-002", name: "Colca Express", contact: "info@colca.pe", tours: 2, rating: 4.6, status: "activo" },
  { id: "PROV-003", name: "Misti Trek", contact: "hola@mistitrek.pe", tours: 3, rating: 4.7, status: "inactivo" },
  { id: "PROV-004", name: "Titicaca Tours", contact: "ventas@titicaca.pe", tours: 5, rating: 4.9, status: "activo" },
];

export const dashboardStats = {
  totalReservas: 1248,
  reservasHoy: 23,
  ingresosMes: 48750,
  toursActivos: 24,
  clientesNuevos: 156,
  satisfaccion: 4.8,
};

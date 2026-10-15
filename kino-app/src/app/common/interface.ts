export interface User {
  _id: string;
  nombre: string;
  email: string;
  rol: 'actor' | 'guionista';
  foto?: string;
  bio?: string;
  edad?: number;
  ciudad?: string;
  agencia?: string;
  altura?: string;
  idiomas?: string;
  unionStatus?: string;
  generos?: string[];
  portfolio?: PortfolioItem[];
  onboardingCompleto?: boolean;
}

export interface PortfolioItem {
  _id?: string;
  tipo: 'video' | 'foto' | 'link';
  url: string;
  titulo?: string;
}

export interface Script {
  _id: string;
  titulo: string;
  sinopsis: string;
  genero: string;
  guionista: User;
  pdfUrl?: string;
  fotoGuionista?: string;
  createdAt: string;
  comentarios?: Comment[];
}

export interface Comment {
  _id: string;
  usuario: User;
  texto: string;
  fecha: string;
  votos: number;
}

export interface Match {
  _id: string;
  actor: User;
  guion: Script;
  estado: 'pendiente' | 'aceptado' | 'rechazado';
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ActorProfile {
  nombre: string;
  foto?: string;
  bio?: string;
  edad?: number;
  ciudad?: string;
  agencia?: string;
  generos: string[];
  portfolio?: string;
}

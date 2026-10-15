export interface Script {
  _id: string;
  titulo: string;
  genero: string;
  sinopsis: string;
  pdfUrl: string;
  edadMin?: number;
  edadMax?: number;
  ubicacion?: string;
  imagenUrl?: string;
  contacto?: string;
  guionista: string;
  fotoGuionista: string;
  publico: boolean;
  comentarios: Comment[];
  requisitos?: string[];
}

export interface Comment {
  _id?: string;
  usuario: any;
  texto: string;
  fecha: Date;
  votos: number;
}

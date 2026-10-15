import { Schema, Types } from 'mongoose';

const CommentSchema = new Schema({
  usuario: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  texto: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  votos: { type: Number, default: 0 }
});

export const ScriptSchema = new Schema(
  {
    titulo: { type: String, required: true },
    genero: { type: String, required: true },
    sinopsis: { type: String, required: true },
    pdfUrl: { type: String, required: true },
    edadMin: { type: Number, required: false, default: null },
    edadMax: { type: Number, required: false, default: null },
    ubicacion: { type: String, required: false },
    imagenUrl: { type: String, required: false },
    imagenesUrls: { type: [String], default: [] },
    contacto: { type: String, required: false },
    guionista: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fotoGuionista: { type: String, default: null },
    publico: { type: Boolean, default: false },
    comentarios: { type: [CommentSchema], default: [] },
    requisitos: { type: [String], default: [] },
  },
  { versionKey: false },
);

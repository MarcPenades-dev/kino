import { Schema } from 'mongoose';

export const MessageSchema = new Schema(
  {
    de: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    para: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    texto: { type: String, required: true },
    leido: { type: Boolean, default: false },
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
    audioUrl: { type: String, default: null },
    imagenUrl: { type: String, default: null },
    duracion: { type: String, default: null },
    editado: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

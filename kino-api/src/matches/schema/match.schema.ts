import { Schema } from 'mongoose';
export const MatchSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    script: { type: Schema.Types.ObjectId, ref: 'Script', required: true },
    estado: {
      type: String,
      default: 'pendiente',
      enum: ['pendiente', 'aceptado', 'rechazado'],
    },
    fechaCallback: { type: Date, default: null },
    horaCallback: { type: String, default: null },
    notasCallback: { type: String, default: null },
    disponibilidadConfirmada: { type: Boolean, default: false },
  },
  { versionKey: false },
);

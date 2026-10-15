import { Schema } from 'mongoose';

export const SeleccionSchema = new Schema(
  {
    director: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    script: { type: Schema.Types.ObjectId, ref: 'Script', required: true },
    estado: {
      type: String,
      default: 'aceptado',
      enum: ['aceptado', 'rechazado'],
    },
  },
  { timestamps: true, versionKey: false },
);

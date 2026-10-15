import { Schema } from 'mongoose';

export const UserSchema = new Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol: { type: String, required: true, enum: ['actor', 'guionista'] },
    foto: { type: String, default: null },
    bio: { type: String, default: null },
    edad: { type: Number, default: null },
    agencia: { type: String, default: null },
    ciudad: { type: String, default: null },
    altura: { type: String, default: null },
    idiomas: { type: String, default: null },
    unionStatus: { type: String, default: null },
    generos: { type: [String], default: [] },
    portfolio: { type: Array, default: [] },
    links: { type: [String], default: [] },
    onboardingCompleto: { type: Boolean, default: false },
    guardados: [{ type: Schema.Types.ObjectId, ref: 'Script' }],
    actoresGuardados: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { versionKey: false },
);

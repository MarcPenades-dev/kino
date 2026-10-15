export interface User {
  _id: string;
  nombre: string;
  email: string;
  password: string;
  rol: string;
  foto: string;
  bio: string;
  edad: number;
  agencia?: string;
  ciudad?: string;
  guardados?: string[];
  actoresGuardados?: string[];
}

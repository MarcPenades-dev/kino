export interface Message {
  _id: string;
  de: string;
  para: string;
  texto: string;
  leido: boolean;
  matchId: string;
  createdAt: Date;
}

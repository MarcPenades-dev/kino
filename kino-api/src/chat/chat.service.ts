import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ChatService {
  constructor(@InjectModel('Message') private messageModel: Model<any>) {}

  async enviar(
    deId: string,
    paraId: string,
    texto: string,
    matchId: string,
    audioUrl?: string,
    duracion?: string,
    imagenUrl?: string,
  ): Promise<any> {
    const datos: any = { de: deId, para: paraId, texto, matchId };
    if (audioUrl) datos.audioUrl = audioUrl;
    if (duracion) datos.duracion = duracion;
    if (imagenUrl) datos.imagenUrl = imagenUrl;

    const msg = await this.messageModel.create(datos);

    return this.messageModel
      .findById((msg as any)._id)
      .populate('de', 'nombre foto')
      .populate('para', 'nombre foto')
      .exec();
  }

  async getConversacion(matchId: string): Promise<any[]> {
    return this.messageModel
      .find({ matchId })
      .populate('de', 'nombre foto')
      .populate('para', 'nombre foto')
      .sort({ createdAt: 1 })
      .exec();
  }

  async getMisChats(userId: string): Promise<any[]> {
    return this.messageModel
      .find({ $or: [{ de: userId }, { para: userId }] })
      .populate('de', 'nombre foto')
      .populate('para', 'nombre foto')
      .populate({
        path: 'matchId',
        populate: {
          path: 'script',
          select: 'titulo genero imagenUrl imagenesUrls'
        }
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async eliminar(id: string, userId: string): Promise<any> {
    return this.messageModel
      .findOneAndDelete({
        _id: id,
        de: userId,
      })
      .exec();
  }

  async editar(id: string, userId: string, texto: string): Promise<any> {
    return this.messageModel
      .findOneAndUpdate(
        { _id: id, de: userId },
        { $set: { texto, editado: true } },
        { new: true },
      )
      .populate('de', 'nombre foto')
      .populate('para', 'nombre foto')
      .exec();
  }

  async marcarLeidos(matchId: string, userId: string): Promise<any> {
    return this.messageModel
      .updateMany(
        { matchId, para: userId, leido: false },
        { $set: { leido: true } },
      )
      .exec();
  }
}

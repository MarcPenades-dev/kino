import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match } from './interfaces/match.inteface';
import { CreateMatchDto } from './dto/match.dto';

@Injectable()
export class MatchesService {
  constructor(@InjectModel('Match') private matchModel: Model<Match>) {}

  async darLike(createMatchDto: CreateMatchDto, actorId: string): Promise<any> {
    const existe = await this.matchModel
      .findOne({
        actor: actorId,
        script: createMatchDto.scriptId,
      })
      .exec();

    if (existe)
      throw new BadRequestException({
        status: false,
        message: 'Ya has dado like a este guion',
      });

    const match = new this.matchModel({
      actor: actorId,
      script: createMatchDto.scriptId,
    });
    return match.save();
  }

  async getMatchesByScript(scriptId: string): Promise<Match[]> {
    return this.matchModel
      .find({ script: scriptId })
      .populate('actor', 'nombre foto bio')
      .exec();
  }

  async updateEstado(id: string, estado: string): Promise<any> {
    const updated = await this.matchModel
      .findByIdAndUpdate(id, { $set: { estado } }, { new: true })
      .exec();
    if (!updated)
      throw new NotFoundException({
        status: false,
        message: 'Match no encontrado',
      });
    return updated;
  }

  async eliminarMatch(id: string): Promise<any> {
    const eliminado = await this.matchModel.findByIdAndDelete(id).exec();
    if (!eliminado)
      throw new NotFoundException({
        status: false,
        message: 'Match no encontrado',
      });
    return eliminado;
  }

  async getMatchesByActor(actorId: string): Promise<Match[]> {
    return this.matchModel
      .find({ actor: actorId })
      .populate({
        path: 'script',
        select:
          'titulo genero sinopsis imagenUrl pdfUrl ubicacion edades contacto',
        populate: {
          path: 'guionista',
          select: 'nombre foto',
        },
      })
      .select(
        'estado fechaCallback horaCallback notasCallback disponibilidadConfirmada createdAt updatedAt actor script',
      )
      .exec();
  }
  async getMatchesByGuionista(guionistaId: string): Promise<Match[]> {
    // Primero busca los scripts del guionista
    const matches = await this.matchModel
      .find()
      .populate({
        path: 'script',
        select: 'titulo genero sinopsis imagenUrl guionista',
        populate: {
          path: 'guionista',
          select: 'nombre foto',
        },
      })
      .populate('actor', 'nombre foto ciudad bio edad generos unionStatus')
      .exec();

    // Filtra solo los matches donde el script pertenece al guionista
    return matches.filter(
      (m: any) =>
        m.script?.guionista?._id?.toString() === guionistaId ||
        m.script?.guionista?.toString() === guionistaId,
    );
  }

  async setCallback(
    id: string,
    fechaCallback: string,
    horaCallback: string,
    notasCallback?: string,
  ): Promise<any> {
    const updated = await this.matchModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            fechaCallback: new Date(fechaCallback),
            horaCallback,
            notasCallback: notasCallback || null,
          },
        },
        { new: true },
      )
      .populate({
        path: 'script',
        populate: { path: 'guionista', select: 'nombre foto' },
      })
      .populate('actor', 'nombre foto')
      .exec();

    if (!updated)
      throw new NotFoundException({
        status: false,
        message: 'Match no encontrado',
      });

    return updated;
  }

  async removeCallback(id: string): Promise<any> {
    const updated = await this.matchModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            fechaCallback: null,
            horaCallback: null,
            notasCallback: null,
          },
        },
        { new: true },
      )
      .exec();

    if (!updated)
      throw new NotFoundException({
        status: false,
        message: 'Match no encontrado',
      });

    return updated;
  }

  async confirmarDisponibilidad(id: string): Promise<any> {
    const updated = await this.matchModel
      .findByIdAndUpdate(
        id,
        { $set: { disponibilidadConfirmada: true } },
        { new: true },
      )
      .populate({
        path: 'script',
        populate: { path: 'guionista', select: 'nombre foto' },
      })
      .populate('actor', 'nombre foto')
      .exec();

    if (!updated)
      throw new NotFoundException({
        status: false,
        message: 'Match no encontrado',
      });

    return updated;
  }
}

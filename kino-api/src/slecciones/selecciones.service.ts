import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Seleccion } from './interfaces/seleccion.interface';

@Injectable()
export class SeleccionesService {
  constructor(
    @InjectModel('Seleccion') private seleccionModel: Model<Seleccion>,
  ) {}

  async crear(
    directorId: string,
    actorId: string,
    scriptId: string,
  ): Promise<any> {
    const existe = await this.seleccionModel
      .findOne({
        director: directorId,
        actor: actorId,
        script: scriptId,
      })
      .exec();

    if (existe) {
      existe.estado = 'aceptado';
      return existe.save();
    }

    return this.seleccionModel.create({
      director: directorId,
      actor: actorId,
      script: scriptId,
      estado: 'aceptado',
    });
  }

  async rechazar(directorId: string, actorId: string): Promise<any> {
    return this.seleccionModel
      .deleteMany({
        director: directorId,
        actor: actorId,
      })
      .exec();
  }

  async getByDirector(directorId: string): Promise<any[]> {
    return this.seleccionModel
      .find({ director: directorId, estado: 'aceptado' })
      .populate('actor', 'nombre foto bio edad ciudad')
      .populate('script', 'titulo genero imagenUrl')
      .exec();
  }

  async getByScript(scriptId: string): Promise<any[]> {
    return this.seleccionModel
      .find({ script: scriptId, estado: 'aceptado' })
      .populate('actor', 'nombre foto bio edad ciudad')
      .exec();
  }
}

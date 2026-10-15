import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Script } from './interfaces/script.interface';
import { CreateScriptDto } from './dto/script.dto';

@Injectable()
export class ScriptsService {
  constructor(@InjectModel('Script') private scriptModel: Model<Script>) {}

  async createScript(
    createScriptDto: CreateScriptDto,
    guionistaId: string,
  ): Promise<Script> {
    const script = new this.scriptModel({
      ...createScriptDto,
      guionista: guionistaId,
    });
    return script.save();
  }

  async getFeed(): Promise<Script[]> {
    return this.scriptModel
      .find()
      .populate('guionista', 'nombre foto')
      .sort({ _id: -1 })
      .exec();
  }

  async getScriptById(id: string): Promise<Script | null> {
    return this.scriptModel
      .findById(id)
      .populate('guionista', 'nombre foto edad')
      .populate('comentarios.usuario', 'nombre foto rol edad')
      .exec();
  }
  async updateScript(id: string, data: any): Promise<any> {
    const updated = await this.scriptModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();
    if (!updated)
      throw new NotFoundException({
        status: false,
        message: 'Guion no encontrado',
      });
    return updated;
  }

  async getScriptsByGuionista(guionistaId: string): Promise<Script[]> {
    return this.scriptModel
      .find({ guionista: guionistaId })
      .populate('guionista', 'nombre foto edad')
      .exec();
  }

  async getPublicos(): Promise<Script[]> {
    return this.scriptModel
      .find({ publico: true })
      .populate('guionista', 'nombre foto edad')
      .populate('comentarios.usuario', 'nombre foto rol edad')
      .sort({ _id: -1 })
      .exec();
  }

  async actualizarVisibilidad(id: string, publico: boolean): Promise<any> {
    const updated = await this.scriptModel
      .findByIdAndUpdate(id, { $set: { publico } }, { new: true })
      .exec();
    if (!updated)
      throw new NotFoundException({
        status: false,
        message: 'Guion no encontrado',
      });
    return updated;
  }

  async deleteScript(id: string): Promise<any> {
    const eliminado = await this.scriptModel.findByIdAndDelete(id).exec();
    if (!eliminado)
      throw new NotFoundException({
        status: false,
        message: 'Guion no encontrado',
      });
    return eliminado;
  }

  async addComment(scriptId: string, userId: string, texto: string): Promise<Script> {
    const script = await this.scriptModel.findByIdAndUpdate(
      scriptId,
      { $push: { comentarios: { usuario: userId, texto } } },
      { new: true }
    ).populate('comentarios.usuario', 'nombre foto rol edad').exec();

    if (!script) {
      throw new NotFoundException({ status: false, message: 'Guion no encontrado' });
    }
    return script;
  }
}

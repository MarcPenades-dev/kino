import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectConnection() private connection: Connection
  ) { }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findAllGuionistas(): Promise<User[]> {
    return this.userModel.find({ rol: 'guionista' }).exec();
  }

  async deleteUser(id: string): Promise<any> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException({
        status: false,
        message: 'Usuario no encontrado',
      });
    }

    const userId = user._id;

    if (user.rol === 'guionista') {
      // Obtener scripts del guionista antes de borrarlos
      const scripts = await this.connection.model('Script').find({ guionista: userId }).exec();
      const scriptIds = scripts.map(s => s._id);

      if (scriptIds.length > 0) {
        // Eliminar matches y selecciones asociados a sus scripts
        await this.connection.model('Match').deleteMany({ script: { $in: scriptIds } }).exec();
        await this.connection.model('Seleccion').deleteMany({ script: { $in: scriptIds } }).exec();

        // Eliminar sus scripts de las listas "guardados" de otros usuarios
        await this.userModel.updateMany(
          { guardados: { $in: scriptIds } },
          { $pull: { guardados: { $in: scriptIds } } }
        ).exec();
      }

      // Eliminar sus propios scripts
      await this.connection.model('Script').deleteMany({ guionista: userId }).exec();
      // Eliminar selecciones donde actuaba como director
      await this.connection.model('Seleccion').deleteMany({ director: userId }).exec();

    } else if (user.rol === 'actor') {
      // Eliminar matches y selecciones del actor
      await this.connection.model('Match').deleteMany({ actor: userId }).exec();
      await this.connection.model('Seleccion').deleteMany({ actor: userId }).exec();

      // Eliminar al actor de las listas "actoresGuardados" de otros usuarios
      await this.userModel.updateMany(
        { actoresGuardados: userId },
        { $pull: { actoresGuardados: userId } }
      ).exec();
    }

    // Eliminar todos los comentarios del usuario en cualquier script (evita referencias rotas)
    await this.connection.model('Script').updateMany(
      { 'comentarios.usuario': userId },
      [{ $set: { comentarios: { $filter: { input: '$comentarios', cond: { $ne: ['$$this.usuario', userId] } } } } }],
      { updatePipeline: true } as any
    ).exec();

    // Eliminar todos los mensajes donde el usuario es remitente o destinatario
    await this.connection.model('Message').deleteMany({
      $or: [{ de: userId }, { para: userId }]
    }).exec();

    // Eliminar el propio documento de usuario
    const eliminado = await this.userModel.findByIdAndDelete(id).exec();
    return eliminado;
  }

  async updateProfile(id: string, data: any): Promise<User> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();
    if (!updated)
      throw new NotFoundException({
        status: false,
        message: 'Usuario no encontrado',
      });
    return updated;
  }

  async toggleGuardar(userId: string, scriptId: string): Promise<any> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (!user.guardados) user.guardados = [];

    const index = user.guardados.findIndex((id) => id.toString() === scriptId);
    let guardado = false;

    if (index >= 0) {
      user.guardados.splice(index, 1);
    } else {
      user.guardados.push(scriptId);
      guardado = true;
    }

    await user.save();
    return { guardado, guardados: user.guardados };
  }

  async getGuardados(userId: string): Promise<any> {
    const user = await this.userModel
      .findById(userId)
      .populate({
        path: 'guardados',
        populate: { path: 'guionista', select: 'nombre foto edad' },
      })
      .exec();

    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user.guardados || [];
  }

  async buscarActores(filtros: any): Promise<User[]> {
    const query: any = { rol: 'actor' };

    if (filtros.nombre) {
      query.nombre = { $regex: filtros.nombre, $options: 'i' };
    }
    if (filtros.ciudad) {
      query.ciudad = { $regex: filtros.ciudad, $options: 'i' };
    }
    if (filtros.edad) {
      const [min, max] = filtros.edad.split('-').map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        query.edad = { $gte: min, $lte: max };
      }
    }

    return this.userModel.find(query).select('-password').exec();
  }

  async toggleGuardarActor(directorId: string, actorId: string): Promise<any> {
    const director = await this.userModel.findById(directorId).exec();
    if (!director) throw new NotFoundException('Usuario no encontrado');

    if (!director.actoresGuardados) director.actoresGuardados = [];

    const index = director.actoresGuardados.findIndex(
      (id) => id.toString() === actorId,
    );
    let guardado = false;

    if (index >= 0) {
      director.actoresGuardados.splice(index, 1);
    } else {
      director.actoresGuardados.push(actorId);
      guardado = true;
    }

    await director.save();
    return { guardado, actoresGuardados: director.actoresGuardados };
  }

  async getActoresGuardados(directorId: string): Promise<any> {
    const director = await this.userModel
      .findById(directorId)
      .populate('actoresGuardados', 'nombre foto bio edad ciudad rol')
      .exec();

    if (!director) throw new NotFoundException('Usuario no encontrado');
    return director.actoresGuardados || [];
  }

}

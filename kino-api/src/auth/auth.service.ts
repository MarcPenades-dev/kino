import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/auth.dto';

const CODIGO_GUIONISTA = 'CINE2025';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: any) {
    const { nombre, email, password, rol, codigoGuionista } = data;

    // Verificar si es guionista y validar código
    if (rol === 'guionista') {
      if (!codigoGuionista || codigoGuionista !== CODIGO_GUIONISTA) {
        throw new BadRequestException('Código de guionista incorrecto');
      }
    }

    // Verificar si el email ya existe
    const existe = await this.userModel.findOne({ email });
    if (existe) {
      throw new BadRequestException('El email ya está registrado');
    }


    const hash = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await this.userModel.create({
      nombre,
      email,
      password: hash,
      rol,
    });

    // Generar token
    const token = this.jwtService.sign({
      sub: user._id,
      rol: user.rol,
    });

    return { token, user };
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Email o contraseña incorrectos');
    }

    const valido = await bcrypt.compare(password, user.password);
    if (!valido) {
      throw new BadRequestException('Email o contraseña incorrectos');
    }

    const token = this.jwtService.sign({
      sub: user._id,
      rol: user.rol,
    });

    return { token, user };
  }
}

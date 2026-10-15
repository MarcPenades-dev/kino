import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Request
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/kino/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('guionistas')
  @UseGuards(JwtAuthGuard)
  async getAllGuionistas() {
    try {
      const users = await this.usersService.findAllGuionistas();
      return { status: true, users };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUser(@Param('id') id: string) {
    try {
      const user = await this.usersService.findById(id);
      return { status: true, user };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    try {
      await this.usersService.deleteUser(id);
      return { status: true, message: 'Usuario eliminado correctamente' };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Patch('perfil/:id')
  async updateProfile(@Param('id') id: string, @Body() body: any) {
    try {
      const user = await this.usersService.updateProfile(id, body);
      return { status: true, user };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Post('guardar/:scriptId')
  @UseGuards(JwtAuthGuard)
  async toggleGuardar(
    @Param('scriptId') scriptId: string,
    @Request() req: any,
  ) {
    try {
      const result = await this.usersService.toggleGuardar(
        req.user.id || req.user.sub,
        scriptId,
      );
      return { status: true, ...result };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Get('mis-guardados/lista')
  @UseGuards(JwtAuthGuard)
  async getGuardados(@Request() req: any) {
    try {
      const scripts = await this.usersService.getGuardados(
        req.user.id || req.user.sub,
      );
      return { status: true, scripts };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }
  @Get('actores/buscar')
  @UseGuards(JwtAuthGuard)
  async buscarActores(@Request() req: any, @Body() body: any) {
    try {
      const { nombre, edad, ciudad } = req.query;
      const actores = await this.usersService.buscarActores({
        nombre,
        edad,
        ciudad,
      });
      return { status: true, actores };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Post('guardar-actor/:actorId')
  @UseGuards(JwtAuthGuard)
  async toggleGuardarActor(
    @Param('actorId') actorId: string,
    @Request() req: any,
  ) {
    try {
      const result = await this.usersService.toggleGuardarActor(
        req.user.id || req.user.sub,
        actorId,
      );
      return { status: true, ...result };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Get('mis-actores/lista')
  @UseGuards(JwtAuthGuard)
  async getActoresGuardados(@Request() req: any) {
    try {
      const actores = await this.usersService.getActoresGuardados(
        req.user.id || req.user.sub,
      );
      return { status: true, actores };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SeleccionesService } from './selecciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/kino/selecciones')
export class SeleccionesController {
  constructor(private readonly seleccionesService: SeleccionesService) {}

  @Post('aceptar')
  @UseGuards(JwtAuthGuard)
  async aceptar(
    @Body() body: { actorId: string; scriptId: string },
    @Request() req: any,
  ) {
    try {
      const result = await this.seleccionesService.crear(
        req.user.id || req.user.sub,
        body.actorId,
        body.scriptId,
      );
      return { status: true, result };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Delete('rechazar/:actorId')
  @UseGuards(JwtAuthGuard)
  async rechazar(@Param('actorId') actorId: string, @Request() req: any) {
    try {
      await this.seleccionesService.rechazar(
        req.user.id || req.user.sub,
        actorId,
      );
      return { status: true };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Get('mis-selecciones')
  @UseGuards(JwtAuthGuard)
  async getMisSelecciones(@Request() req: any) {
    try {
      const selecciones = await this.seleccionesService.getByDirector(
        req.user.id || req.user.sub,
      );
      return { status: true, selecciones };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Get('script/:scriptId')
  @UseGuards(JwtAuthGuard)
  async getByScript(@Param('scriptId') scriptId: string) {
    try {
      const selecciones = await this.seleccionesService.getByScript(scriptId);
      return { status: true, selecciones };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ScriptsService } from './scripts.service';
import { CreateScriptDto } from './dto/script.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/kino/scripts')
export class ScriptsController {
  constructor(private readonly scriptsService: ScriptsService) {}

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  async getFeed() {
    try {
      const scripts = await this.scriptsService.getFeed();
      return { status: true, scripts };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Get('guionista/:id')
  @UseGuards(JwtAuthGuard)
  async getScriptsByGuionista(@Param('id') id: string) {
    try {
      const scripts = await this.scriptsService.getScriptsByGuionista(id);
      return { status: true, scripts };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Get('publicos')
  @UseGuards(JwtAuthGuard)
  async getPublicos() {
    try {
      const scripts = await this.scriptsService.getPublicos();
      return { status: true, scripts };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Put('editar-estado/:id')
  @UseGuards(JwtAuthGuard)
  async actualizarVisibilidad(
    @Param('id') id: string,
    @Body() body: { publico: boolean },
  ) {
    try {
      const script = await this.scriptsService.actualizarVisibilidad(
        id,
        body.publico,
      );
      return {
        status: true,
        message: 'Visibilidad actualizada correctamente',
        script,
      };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getScriptById(@Param('id') id: string) {
    try {
      const script = await this.scriptsService.getScriptById(id);
      return { status: true, script };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createScript(
    @Body() createScriptDto: CreateScriptDto,
    @Request() req: any,
  ) {
    try {
      const script = await this.scriptsService.createScript(
        createScriptDto,
        req.user.id,
      );
      return { status: true, message: 'Guion creado correctamente', script };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateScript(@Param('id') id: string, @Body() body: any) {
    try {
      const script = await this.scriptsService.updateScript(id, body);
      return {
        status: true,
        message: 'Guion actualizado correctamente',
        script,
      };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Post(':id/comentarios')
  @UseGuards(JwtAuthGuard)
  async addComment(
    @Param('id') id: string,
    @Body('texto') texto: string,
    @Request() req: any,
  ) {
    try {
      if (!texto || texto.trim() === '') {
        throw new BadRequestException('El comentario no puede estar vacío');
      }
      const script = await this.scriptsService.addComment(id, req.user.sub || req.user.id, texto);
      return { status: true, message: 'Comentario añadido', script };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteScript(@Param('id') id: string) {
    try {
      await this.scriptsService.deleteScript(id);
      return { status: true, message: 'Guion eliminado correctamente' };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }
}

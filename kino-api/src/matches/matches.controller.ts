import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateMatchDto } from './dto/match.dto';
import { MatchesService } from './matches.service';

@Controller('api/kino/matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post('like')
  @UseGuards(JwtAuthGuard)
  async darLike(@Body() createMatchDto: CreateMatchDto, @Request() req: any) {
    try {
      const match = await this.matchesService.darLike(
        createMatchDto,
        req.user.id,
      );
      return { status: true, message: 'Like registrado correctamente', match };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Get('script/:scriptId')
  @UseGuards(JwtAuthGuard)
  async getMatchesByScript(@Param('scriptId') scriptId: string) {
    try {
      const matches = await this.matchesService.getMatchesByScript(scriptId);
      return { status: true, matches };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  // NUEVO: actor logueado sin ID
  @Get('actor')
  @UseGuards(JwtAuthGuard)
  async getMatchesPorActorLogueado(@Request() req: any) {
    try {
      const matches = await this.matchesService.getMatchesByActor(req.user.id);
      return { status: true, matches };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  // existente: actor por ID
  @Get('actor/:actorId')
  @UseGuards(JwtAuthGuard)
  async getMatchesByActor(@Param('actorId') actorId: string) {
    try {
      const matches = await this.matchesService.getMatchesByActor(actorId);
      return { status: true, matches };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Get('guionista')
  @UseGuards(JwtAuthGuard)
  async getMatchesByGuionista(@Request() req: any) {
    try {
      const matches = await this.matchesService.getMatchesByGuionista(
        req.user.id,
      );
      return { status: true, matches };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateEstado(@Param('id') id: string, @Body() body: any) {
    try {
      const match = await this.matchesService.updateEstado(id, body.estado);
      return {
        status: true,
        message: 'Estado actualizado correctamente',
        match,
      };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async eliminarMatch(@Param('id') id: string) {
    try {
      await this.matchesService.eliminarMatch(id);
      return { status: true, message: 'Match eliminado correctamente' };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Patch(':id/callback')
  @UseGuards(JwtAuthGuard)
  async setCallback(
    @Param('id') id: string,
    @Body()
    body: {
      fechaCallback: string;
      horaCallback: string;
      notasCallback?: string;
    },
  ) {
    try {
      const match = await this.matchesService.setCallback(
        id,
        body.fechaCallback,
        body.horaCallback,
        body.notasCallback,
      );
      return { status: true, message: 'Callback programado', match };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Delete(':id/callback')
  @UseGuards(JwtAuthGuard)
  async removeCallback(@Param('id') id: string) {
    try {
      const match = await this.matchesService.removeCallback(id);
      return { status: true, message: 'Callback eliminado', match };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Patch(':id/confirmar-disponibilidad')
  @UseGuards(JwtAuthGuard)
  async confirmarDisponibilidad(@Param('id') id: string) {
    try {
      const match = await this.matchesService.confirmarDisponibilidad(id);
      return { status: true, message: 'Disponibilidad confirmada', match };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }
}

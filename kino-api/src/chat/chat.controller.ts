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
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/kino/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('enviar')
  @UseGuards(JwtAuthGuard)
  async enviarMensaje(
    @Body()
    body: {
      paraId: string;
      texto: string;
      matchId: string;
      audioUrl?: string;
      duracion?: string;
      imagenUrl?: string;
    },
    @Request() req: any,
  ) {
    try {
      const msg = await this.chatService.enviar(
        req.user.id,
        body.paraId,
        body.texto,
        body.matchId,
        body.audioUrl,
        body.duracion,
        body.imagenUrl,
      );
      return { status: true, mensaje: msg };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Get('conversacion/:matchId')
  @UseGuards(JwtAuthGuard)
  async getConversacion(@Param('matchId') matchId: string) {
    try {
      const mensajes = await this.chatService.getConversacion(matchId);
      return { status: true, mensajes };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Get('mis-chats')
  @UseGuards(JwtAuthGuard)
  async getMisChats(@Request() req: any) {
    try {
      const chats = await this.chatService.getMisChats(req.user.id);
      return { status: true, chats };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Delete('mensaje/:id')
  @UseGuards(JwtAuthGuard)
  async eliminarMensaje(@Param('id') id: string, @Request() req: any) {
    try {
      await this.chatService.eliminar(id, req.user.id);
      return { status: true };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Patch('mensaje/:id')
  @UseGuards(JwtAuthGuard)
  async editarMensaje(
    @Param('id') id: string,
    @Body() body: { texto: string },
    @Request() req: any,
  ) {
    try {
      const msg = await this.chatService.editar(id, req.user.id, body.texto);
      return { status: true, mensaje: msg };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }

  @Patch('leidos/:matchId')
  @UseGuards(JwtAuthGuard)
  async marcarLeidos(@Param('matchId') matchId: string, @Request() req: any) {
    try {
      await this.chatService.marcarLeidos(matchId, req.user.id);
      return { status: true };
    } catch (e) {
      throw new BadRequestException({ status: false, message: e.message });
    }
  }
}

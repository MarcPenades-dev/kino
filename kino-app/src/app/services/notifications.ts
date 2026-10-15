import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth';
import { ChatService } from './chat';
import { ScriptsService } from './scripts';
import { MatchesService } from './matches';

export interface Notificacion {
  id: string;
  tipo: 'mensaje' | 'anuncio' | 'match_aceptado' | 'match_pendiente' | 'disponibilidad';
  titulo: string;
  subtitulo: string;
  fecha: Date;
  leida: boolean;
  matchId?: string;
  scriptId?: string;
  usuarioFoto?: string;
  usuarioNombre?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly chatService = inject(ChatService);
  private readonly matchesService = inject(MatchesService);
  private readonly scriptsService = inject(ScriptsService);

  private _notificaciones = new BehaviorSubject<Notificacion[]>([]);
  notificaciones$ = this._notificaciones.asObservable();

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: 'Bearer ' + this.authService.obtenerToken()
    });
  }

  get totalNoLeidas(): number {
    return this._notificaciones.value.filter(n => !n.leida).length;
  }

  cargarTodas() {
    const user = this.authService.obtenerUser();
    const notifs: Notificacion[] = [];

    // 1. Mensajes no leídos
    this.chatService.getMisChats().subscribe({
      next: (data: any) => {
        const mensajes = data.chats || data;
        const mapaChats: { [key: string]: any } = {};

        mensajes.forEach((msg: any) => {
          const matchId = msg.matchId?._id || msg.matchId;
          if (!matchId) return;

          const deId = msg.de?._id || msg.de;
          if (deId !== user?._id && !msg.leido) {
            if (!mapaChats[matchId]) {
              mapaChats[matchId] = {
                matchId,
                count: 0,
                ultimoMensaje: msg,
                de: msg.de
              };
            }
            mapaChats[matchId].count++;
            if (new Date(msg.createdAt) > new Date(mapaChats[matchId].ultimoMensaje.createdAt)) {
              mapaChats[matchId].ultimoMensaje = msg;
            }
          }
        });

        Object.values(mapaChats).forEach((chat: any) => {
          notifs.push({
            id: 'msg_' + chat.matchId,
            tipo: 'mensaje',
            titulo: chat.de?.nombre || 'Nuevo mensaje',
            subtitulo: chat.count > 1
              ? `${chat.count} mensajes sin leer`
              : chat.ultimoMensaje?.audioUrl
                ? '🎤 Te envió un audio'
                : chat.ultimoMensaje?.texto || 'Nuevo mensaje',
            fecha: new Date(chat.ultimoMensaje?.createdAt),
            leida: false,
            matchId: chat.matchId,
            usuarioFoto: chat.de?.foto,
            usuarioNombre: chat.de?.nombre
          });
        });

        this._notificaciones.next([...notifs]);
      }
    });

    // 2. Matches según rol
    if (user?.rol === 'actor') {
      this.matchesService.getMatchesPorActor().subscribe({
        next: (data: any) => {
          const matches = data.matches || data;

          // Callbacks aceptados
          matches
            .filter((m: any) => m.estado === 'aceptado')
            .forEach((m: any) => {
              notifs.push({
                id: 'match_' + m._id,
                tipo: 'match_aceptado',
                titulo: '¡Callback confirmado!',
                subtitulo: `${m.script?.guionista?.nombre || 'El director'} aceptó tu solicitud para "${m.script?.titulo}"`,
                fecha: new Date(m.updatedAt || m.createdAt),
                leida: this.estaLeida('match_' + m._id),
                scriptId: m.script?._id,
                matchId: m._id,
                usuarioFoto: m.script?.guionista?.foto,
                usuarioNombre: m.script?.guionista?.nombre
              });
            });

          // Fecha de callback programada
          matches
            .filter((m: any) => m.estado === 'aceptado' && m.fechaCallback)
            .forEach((m: any) => {
              notifs.push({
                id: 'callback_fecha_' + m._id,
                tipo: 'match_aceptado',
                titulo: '📅 Callback programado',
                subtitulo: `Tu callback para "${m.script?.titulo}" está fijado el ${new Date(m.fechaCallback).toLocaleDateString('es-ES')} a las ${m.horaCallback}`,
                fecha: new Date(m.updatedAt || m.createdAt),
                leida: this.estaLeida('callback_fecha_' + m._id),
                scriptId: m.script?._id,
                matchId: m._id,
                usuarioFoto: m.script?.guionista?.foto,
                usuarioNombre: m.script?.guionista?.nombre
              });
            });

          this._notificaciones.next(
            [...notifs].sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
          );
        }
      });
    }

    if (user?.rol === 'guionista') {
      this.matchesService.getMatchesPorGuionista().subscribe({
        next: (data: any) => {
          const matches = data.matches || data;

          // Actores pendientes
          matches
            .filter((m: any) => m.estado === 'pendiente')
            .forEach((m: any) => {
              notifs.push({
                id: 'pending_' + m._id,
                tipo: 'match_pendiente',
                titulo: 'Nuevo actor interesado',
                subtitulo: `${m.actor?.nombre || 'Un actor'} aplicó a "${m.script?.titulo}"`,
                fecha: new Date(m.createdAt),
                leida: this.estaLeida('pending_' + m._id),
                scriptId: m.script?._id,
                matchId: m._id,
                usuarioFoto: m.actor?.foto,
                usuarioNombre: m.actor?.nombre
              });
            });

          // Disponibilidades confirmadas por actores
          matches
            .filter((m: any) => m.estado === 'aceptado' && m.disponibilidadConfirmada)
            .forEach((m: any) => {
              notifs.push({
                id: 'disponibilidad_' + m._id,
                tipo: 'disponibilidad',
                titulo: '✅ Disponibilidad confirmada',
                subtitulo: `${m.actor?.nombre || 'El actor'} confirmó su disponibilidad para "${m.script?.titulo}"`,
                fecha: new Date(m.updatedAt || m.createdAt),
                leida: this.estaLeida('disponibilidad_' + m._id),
                scriptId: m.script?._id,
                matchId: m._id,
                usuarioFoto: m.actor?.foto,
                usuarioNombre: m.actor?.nombre
              });
            });

          this._notificaciones.next(
            [...notifs].sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
          );
        }
      });

      // 3. Anuncios recientes del feed
      this.scriptsService.getFeed().subscribe({
        next: (data: any) => {
          const scripts = data.scripts || data;
          const recientes = scripts
            .filter((s: any) => {
              const diff = Date.now() - new Date(s.createdAt || 0).getTime();
              return diff < 1000 * 60 * 60 * 24 * 3;
            })
            .slice(0, 5);

          recientes.forEach((s: any) => {
            notifs.push({
              id: 'anuncio_' + s._id,
              tipo: 'anuncio',
              titulo: 'Nuevo casting publicado',
              subtitulo: `"${s.titulo}" — ${s.guionista?.nombre || 'Director'}`,
              fecha: new Date(s.createdAt),
              leida: this.estaLeida('anuncio_' + s._id),
              scriptId: s._id,
              usuarioFoto: s.guionista?.foto,
              usuarioNombre: s.guionista?.nombre
            });
          });

          this._notificaciones.next(
            [...notifs].sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
          );
        }
      });
    }
  }

  marcarLeida(id: string) {
    const leidas = this.getLeidas();
    leidas.add(id);
    localStorage.setItem('notifs_leidas', JSON.stringify([...leidas]));
    const actualizadas = this._notificaciones.value.map(n =>
      n.id === id ? { ...n, leida: true } : n
    );
    this._notificaciones.next(actualizadas);
  }

  marcarTodasLeidas() {
    const leidas = this.getLeidas();
    this._notificaciones.value.forEach(n => leidas.add(n.id));
    localStorage.setItem('notifs_leidas', JSON.stringify([...leidas]));
    const actualizadas = this._notificaciones.value.map(n => ({ ...n, leida: true }));
    this._notificaciones.next(actualizadas);
  }

  private estaLeida(id: string): boolean {
    return this.getLeidas().has(id);
  }

  private getLeidas(): Set<string> {
    try {
      const raw = localStorage.getItem('notifs_leidas');
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  }
}

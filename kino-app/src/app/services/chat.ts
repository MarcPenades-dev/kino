import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';
import {environment} from "../../environments/environment";

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = environment.apiUrl + '/chat';

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: 'Bearer ' + this.authService.obtenerToken()
    });
  }

  enviarMensaje(paraId: string, texto: string, matchId: string, audioUrl?: string, duracion?: string, imagenUrl?: string) {
    return this.http.post<any>(this.baseUrl + '/enviar',
      { paraId, texto, matchId, audioUrl, duracion, imagenUrl },
      { headers: this.getHeaders() }
    );
  }

  getConversacion(matchId: string) {
    return this.http.get<any>(this.baseUrl + '/conversacion/' + matchId, {
      headers: this.getHeaders()
    });
  }

  getMisChats() {
    return this.http.get<any>(this.baseUrl + '/mis-chats', {
      headers: this.getHeaders()
    });
  }

  eliminarMensaje(id: string) {
    return this.http.delete<any>(this.baseUrl + '/mensaje/' + id, {
      headers: this.getHeaders()
    });
  }

  editarMensaje(id: string, texto: string) {
    return this.http.patch<any>(this.baseUrl + '/mensaje/' + id, { texto }, {
      headers: this.getHeaders()
    });
  }

  marcarLeidos(matchId: string) {
    return this.http.patch<any>(this.baseUrl + '/leidos/' + matchId, {}, {
      headers: this.getHeaders()
    });
  }
}

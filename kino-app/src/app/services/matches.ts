import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Match } from '../common/interface';
import { AuthService } from './auth';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class MatchesService {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly authService: AuthService = inject(AuthService);
  private readonly baseUrl = environment.apiUrl + '/matches'

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: 'Bearer ' + this.authService.obtenerToken()
    });
  }

  darLike(guionId: string): Observable<any> {
    return this.http.post<any>(
      this.baseUrl + '/like',
      { scriptId: guionId },
      { headers: this.getHeaders() }
    );
  }

  getMatchesPorGuion(guionId: string): Observable<Match[]> {
    return this.http.get<Match[]>(this.baseUrl + '/guion/' + guionId, { headers: this.getHeaders() });
  }

  getMatchesPorActor(): Observable<Match[]> {
    return this.http.get<Match[]>(this.baseUrl + '/actor', { headers: this.getHeaders() });
  }

  actualizarEstado(id: string, estado: string): Observable<Match> {
    return this.http.patch<Match>(this.baseUrl + '/' + id, { estado }, { headers: this.getHeaders() });
  }

  eliminar(id: string): Observable<any> {
    return this.http.delete<any>(this.baseUrl + '/' + id, { headers: this.getHeaders() });
  }

  getMatchesPorGuionista(): Observable<any[]> {
    return this.http.get<any>(this.baseUrl + '/guionista', { headers: this.getHeaders() });
  }

  setCallback(matchId: string, fechaCallback: string, horaCallback: string, notasCallback?: string) {
    return this.http.patch<any>(this.baseUrl + '/' + matchId + '/callback',
      { fechaCallback, horaCallback, notasCallback },
      { headers: this.getHeaders() }
    );
  }

  removeCallback(matchId: string) {
    return this.http.delete<any>(this.baseUrl + '/' + matchId + '/callback', {
      headers: this.getHeaders()
    });
  }

  confirmarDisponibilidad(matchId: string) {
    return this.http.patch<any>(this.baseUrl + '/' + matchId + '/confirmar-disponibilidad', {}, {
      headers: this.getHeaders()
    });
  }
}

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';
import {environment} from "../../environments/environment";

@Injectable({ providedIn: 'root' })
export class SeleccionesService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = environment.apiUrl + '/selecciones';

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: 'Bearer ' + this.authService.obtenerToken()
    });
  }

  aceptarActor(actorId: string, scriptId: string) {
    return this.http.post<any>(this.baseUrl + '/aceptar', { actorId, scriptId }, {
      headers: this.getHeaders()
    });
  }

  rechazarActor(actorId: string) {
    return this.http.delete<any>(this.baseUrl + '/rechazar/' + actorId, {
      headers: this.getHeaders()
    });
  }

  getMisSelecciones() {
    return this.http.get<any>(this.baseUrl + '/mis-selecciones', {
      headers: this.getHeaders()
    });
  }

  getByScript(scriptId: string) {
    return this.http.get<any>(this.baseUrl + '/script/' + scriptId, {
      headers: this.getHeaders()
    });
  }
}

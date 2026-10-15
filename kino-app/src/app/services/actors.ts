import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActorsService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly authService: AuthService = inject(AuthService);
  private readonly baseUrl = environment.apiUrl + '/users';
  private readonly matchesBaseUrl = environment.apiUrl + '/matches';

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: 'Bearer ' + this.authService.obtenerToken()
    });
  }

  updateProfile(data: any) {
    const id = this.authService.obtenerUser()._id;
    return this.http.patch<any>(this.baseUrl + '/perfil/' + id, data, {
      headers: this.getHeaders()
    });
  }

  getProfile() {
    const userId = this.authService.obtenerUser()?._id;
    return this.http.get<any>(this.baseUrl + '/' + userId, {
      headers: this.getHeaders()
    });
  }

  saveCasting(scriptId: string) {
    return this.http.post<any>(this.baseUrl + '/guardar/' + scriptId, {}, {
      headers: this.getHeaders()
    });
  }

  getSavedCastings() {
    return this.http.get<any>(this.baseUrl + '/mis-guardados/lista', {
      headers: this.getHeaders()
    });
  }

  applyToCasting(scriptId: string) {
    return this.http.post<any>(this.matchesBaseUrl + '/like', { scriptId }, {
      headers: this.getHeaders()
    });
  }

  etApplications() {
    const actorId = this.authService.obtenerUser()?._id;
    return this.http.get<any>(this.matchesBaseUrl + '/actor/' + actorId, {
      headers: this.getHeaders()
    });
  }

  getSavedActors() {
    return this.http.get<any>(this.baseUrl + '/mis-actores/lista', {
      headers: this.getHeaders()
    });
  }

  saveActor(actorId: string) {
    return this.http.post<any>(this.baseUrl + '/guardar-actor/' + actorId, {}, {
      headers: this.getHeaders()
    });
  }
}

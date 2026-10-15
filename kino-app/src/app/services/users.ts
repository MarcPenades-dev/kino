import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl + '/users';

  private getHeaders(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: 'Bearer ' + token });
  }

  updateProfile(id: string, data: any, token: string) {
    return this.http.patch<any>(this.baseUrl + '/perfil/' + id, data, {
      headers: this.getHeaders(token)
    });
  }

  deleteAccount(id: string, token: string) {
    return this.http.delete<any>(this.baseUrl + '/' + id, {
      headers: this.getHeaders(token)
    });
  }

  getProfile(id: string, token: string) {
    return this.http.get<any>(this.baseUrl + '/' + id, {
      headers: this.getHeaders(token)
    });
  }

  toggleGuardar(scriptId: string, token: string) {
    return this.http.post<any>(this.baseUrl + '/guardar/' + scriptId, {}, {
      headers: this.getHeaders(token)
    });
  }

  getGuardados(token: string) {
    return this.http.get<any>(this.baseUrl + '/mis-guardados/lista', {
      headers: this.getHeaders(token)
    });
  }

  buscarActores(filtros: any, token: string) {
    const params = new URLSearchParams();
    if (filtros.nombre) params.set('nombre', filtros.nombre);
    if (filtros.ciudad) params.set('ciudad', filtros.ciudad);
    if (filtros.edad) params.set('edad', filtros.edad);

    return this.http.get<any>(this.baseUrl + '/actores/buscar?' + params.toString(), {
      headers: this.getHeaders(token)
    });
  }

  toggleGuardarActor(actorId: string, token: string) {
    return this.http.post<any>(this.baseUrl + '/guardar-actor/' + actorId, {}, {
      headers: this.getHeaders(token)
    });
  }

  getActoresGuardados(token: string) {
    return this.http.get<any>(this.baseUrl + '/mis-actores/lista', {
      headers: this.getHeaders(token)
    });
  }

  completeOnboarding(id: string, data: any, token: string) {
    return this.http.patch<any>(this.baseUrl + '/perfil/' + id, data, {
      headers: this.getHeaders(token)
    });
  }
}

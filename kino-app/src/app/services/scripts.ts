import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Script } from '../common/interface';
import { AuthService } from './auth';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ScriptsService {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly authService: AuthService = inject(AuthService);
  private readonly baseUrl = environment.apiUrl + '/scripts';

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: 'Bearer ' + this.authService.obtenerToken()
    });
  }

  getFeed(): Observable<Script[]> {
    return this.http.get<Script[]>(this.baseUrl + '/feed', { headers: this.getHeaders() });
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(this.baseUrl + '/' + id, { headers: this.getHeaders() });
  }

  getMisGuiones(id: string): Observable<any> {
    return this.http.get<any>(this.baseUrl + '/guionista/' + id, { headers: this.getHeaders() });
  }

  crear(data: any): Observable<Script> {
    return this.http.post<Script>(this.baseUrl, data, { headers: this.getHeaders() });
  }

  actualizar(id: string, data: any): Observable<Script> {
    return this.http.put<Script>(this.baseUrl + '/' + id, data, { headers: this.getHeaders() });
  }

  eliminar(id: string): Observable<any> {
    return this.http.delete<any>(this.baseUrl + '/' + id, { headers: this.getHeaders() });
  }




  getTodosLosPublicos(token: string) {

    const headers = {
      'Authorization': 'Bearer ' + token
    };


    return this.http.get<any>(this.baseUrl + '/publicos', { headers });
  }


  actualizarVisibilidad(id: string, valor: boolean) {
    return this.http.put(
      this.baseUrl + '/editar-estado/' + id,
      { publico: valor },
      { headers: this.getHeaders() }
    );
  }

  comentar(id: string, texto: string): Observable<any> {
    return this.http.post<any>(
      this.baseUrl + '/' + id + '/comentarios',
      { texto },
      { headers: this.getHeaders() }
    );
  }
}

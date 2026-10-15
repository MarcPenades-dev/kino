import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UploadsService {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly authService: AuthService = inject(AuthService);
  private readonly baseUrl = environment.apiUrl + '/uploads';

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: 'Bearer ' + this.authService.obtenerToken()
    });
  }

  subirFoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(this.baseUrl + '/foto', formData, { headers: this.getHeaders() });
  }

  subirPdf(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(this.baseUrl + '/pdf', formData, { headers: this.getHeaders() });
  }

  subirVideo(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(this.baseUrl + '/video', formData, { headers: this.getHeaders() });
  }
}

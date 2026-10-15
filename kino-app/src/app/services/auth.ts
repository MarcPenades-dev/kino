import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse } from '../common/interface';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl + '/auth';

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.baseUrl + '/login', { email, password });
  }

  register(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.baseUrl + '/register', data);
  }

  guardarSesion(token: string, user: any): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  obtenerUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  estaLogueado(): boolean {
    return !!localStorage.getItem('token');
  }
}

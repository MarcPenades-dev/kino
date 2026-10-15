import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButtons, IonButton, IonIcon, IonSpinner
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline, personOutline, filmOutline,
  locationOutline, playCircleOutline, linkOutline, imageOutline,
  checkmarkOutline, mailOutline, personAddOutline, shareSocialOutline,
  businessOutline, chatbubbleEllipsesOutline,
  logoInstagram, logoTwitter, logoTiktok,
  bookmark, bookmarkOutline
} from 'ionicons/icons';
import { UsersService } from '../../services/users';
import { AuthService } from '../../services/auth';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonButton, IonIcon, IonSpinner
  ]
})
export class UserProfilePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usersService = inject(UsersService);
  private readonly authService = inject(AuthService);

  private readonly serverUrl = environment.apiUrl.replace('/api/kino', '');

  user: any = null;
  cargando = true;
  estaGuardado = false;

  constructor() {
    addIcons({
      chevronBackOutline, personOutline, filmOutline,
      locationOutline, playCircleOutline, linkOutline, imageOutline,
      checkmarkOutline, mailOutline, personAddOutline, shareSocialOutline,
      businessOutline, chatbubbleEllipsesOutline,
      logoInstagram, logoTwitter, logoTiktok,
      bookmark, bookmarkOutline
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.cargarUsuario(id);
  }

  cargarUsuario(id: string) {
    this.cargando = true;
    const token = this.authService.obtenerToken();
    if (!token) return;

    this.usersService.getProfile(id, token).subscribe({
      next: (data: any) => {
        this.user = data.user || data;
        this.verificarGuardado(token);
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  verificarGuardado(token: string) {
    this.usersService.getActoresGuardados(token).subscribe({
      next: (res: any) => {
        const guardados = res.actores || [];
        this.estaGuardado = guardados.some((g: any) => (g._id || g) === this.user._id);
      }
    });
  }

  toggleGuardar() {
    const token = this.authService.obtenerToken();
    if (!token || !this.user) return;
    this.usersService.toggleGuardarActor(this.user._id, token).subscribe({
      next: (res: any) => {
        this.estaGuardado = res.guardado;
      }
    });
  }

  abrirItem(item: any) {
    if (item.url) window.open(item.url, '_blank');
  }

  abrirRedSocial(red: string) {
    let url = '';
    switch (red) {
      case 'instagram': url = 'https://www.instagram.com'; break;
      case 'twitter': url = 'https://www.twitter.com'; break;
      case 'tiktok': url = 'https://www.tiktok.com'; break;
    }
    if (url) window.open(url, '_blank');
  }

  volver() { window.history.back(); }

  getInitial(nombre?: string): string {
    return nombre ? nombre.charAt(0).toUpperCase() : '?';
  }

  getImgUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${this.serverUrl}/${cleanPath}`;
  }
}

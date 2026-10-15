import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonIcon, IonSpinner, IonButtons, IonButton
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  searchOutline, filmOutline, personOutline,
  chevronBackOutline, locationOutline, closeOutline,
  bookmarkOutline, peopleOutline, optionsOutline,
  refreshOutline, chatbubblesOutline
} from 'ionicons/icons';
import { UsersService } from '../../services/users';
import { AuthService } from '../../services/auth';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-buscar',
  templateUrl: './buscar.page.html',
  styleUrls: ['./buscar.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonIcon, IonSpinner, IonButtons, IonButton
  ]
})
export class BuscarPage implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly serverUrl = environment.apiUrl.replace('/api/kino', '');

  actores: any[] = [];
  cargando = false;
  mostrarFiltrosAvanzados = false;
  private debounceTimer: any;
  actoresGuardadosIds: string[] = [];

  filtros = {
    nombre: '',
    ciudad: '',
    edad: '',
    generos: [] as string[]
  };

  generosDisponibles = [
    'Drama', 'Comedia', 'Thriller', 'Acción',
    'Sci-Fi', 'Terror', 'Musical', 'Documental'
  ];

  constructor() {
    addIcons({
      chevronBackOutline, searchOutline, chatbubblesOutline,
      locationOutline, peopleOutline, optionsOutline,
      closeOutline, bookmarkOutline, refreshOutline
    });
  }

  ngOnInit() {
    this.cargarActoresGuardados();
  }

  buscarConDebounce() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.buscar(), 400);
  }

  cargarActoresGuardados() {
    const token = this.authService.obtenerToken();
    if (!token) return;
    this.usersService.getActoresGuardados(token).subscribe({
      next: (data: any) => {
        const actores = data.actores || data;
        this.actoresGuardadosIds = actores.map((a: any) => a._id);
      }
    });
  }

  buscar() {
    this.cargando = true;
    const token = this.authService.obtenerToken();
    if (!token) return;

    this.usersService.buscarActores(this.filtros, token).subscribe({
      next: (data: any) => {
        this.actores = data.actores || data;
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  toggleGenero(genero: string) {
    if (this.filtros.generos.includes(genero)) {
      this.filtros.generos = this.filtros.generos.filter(g => g !== genero);
    } else {
      this.filtros.generos.push(genero);
    }
    this.buscar();
  }

  limpiarNombre() {
    this.filtros.nombre = '';
    this.buscar();
  }

  limpiarFiltros() {
    this.filtros = { nombre: '', ciudad: '', edad: '', generos: [] };
    this.buscar();
  }

  verPerfil(id: string) {
    this.router.navigate(['/user-profile', id]);
  }

  volver() { window.history.back(); }

  irAChats() { this.router.navigate(['/mis-chats']); }

  getInitial(nombre?: string): string {
    return nombre ? nombre.charAt(0).toUpperCase() : '?';
  }

  getImgUrl(path: string): string {
    if (!path) return '';
    return this.serverUrl + '/' + path;
  }

  async toggleGuardarActor(actor: any, event: Event) {
    event.stopPropagation();
    const token = this.authService.obtenerToken();
    if (!token) return;

    this.usersService.toggleGuardarActor(actor._id, token).subscribe({
      next: (res: any) => {
        if (res.guardado) {
          this.actoresGuardadosIds.push(actor._id);
        } else {
          this.actoresGuardadosIds = this.actoresGuardadosIds.filter(id => id !== actor._id);
        }
      }
    });
  }
}

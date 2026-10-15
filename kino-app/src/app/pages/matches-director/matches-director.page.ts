import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonIcon,
  IonSpinner, IonButtons, IonButton, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  filmOutline, notificationsOutline, locationOutline,
  closeOutline, checkmarkOutline, peopleOutline,
  checkmarkCircleOutline, chevronDownOutline, chevronForwardOutline,
  chatbubblesOutline
} from 'ionicons/icons';
import { MatchesService } from '../../services/matches';
import { SeleccionesService } from '../../services/selecciones';
import { AuthService } from '../../services/auth';
import { environment } from '../../../environments/environment';

export interface GrupoMatch {
  actorId: string;
  actor: any;
  matches: any[];
  expandido: boolean;
}

@Component({
  selector: 'app-matches-director',
  templateUrl: './matches-director.page.html',
  styleUrls: ['./matches-director.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonIcon,
    IonSpinner, IonButtons, IonButton
  ]
})
export class MatchesDirectorPage implements OnInit {
  private readonly matchesService = inject(MatchesService);
  private readonly seleccionesService = inject(SeleccionesService);
  private readonly authService = inject(AuthService);
  private readonly toastCtrl = inject(ToastController);
  private readonly router = inject(Router);

  private readonly serverUrl = environment.apiUrl.replace('/api/kino', '');

  cargando = false;
  filtroActual = 'pendiente';

  // Listas planas originales
  pendientes: any[] = [];
  aceptados: any[] = [];

  // Grupos con acordeón
  gruposPendientes: GrupoMatch[] = [];
  gruposAceptados: GrupoMatch[] = [];

  constructor() {
    addIcons({
      filmOutline, notificationsOutline, locationOutline,
      closeOutline, checkmarkOutline, peopleOutline,
      checkmarkCircleOutline, chevronDownOutline, chevronForwardOutline,
      chatbubblesOutline
    });
  }

  ngOnInit() { this.cargarMatches(); }
  ionViewWillEnter() { this.cargarMatches(); }

  cargarMatches() {
    this.cargando = true;
    this.matchesService.getMatchesPorGuionista().subscribe({
      next: (data: any) => {
        const todos = data.matches || data;
        this.pendientes = todos.filter((m: any) => m.estado === 'pendiente');
        this.aceptados = todos.filter((m: any) => m.estado === 'aceptado');
        this.gruposPendientes = this.agruparPorActor(this.pendientes);
        this.gruposAceptados = this.agruparPorActor(this.aceptados);
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  agruparPorActor(matches: any[]): GrupoMatch[] {
    const mapa: { [id: string]: GrupoMatch } = {};

    matches.forEach(m => {
      const actorId = m.actor?._id || m.actor || 'desconocido';
      if (!mapa[actorId]) {
        mapa[actorId] = { actorId, actor: m.actor, matches: [], expandido: false };
      }
      mapa[actorId].matches.push(m);
    });

    const grupos = Object.values(mapa);
    // Si solo tiene 1 match, expandir por defecto
    grupos.forEach(g => { if (g.matches.length === 1) g.expandido = true; });
    return grupos;
  }

  toggleGrupo(grupo: GrupoMatch) {
    if (grupo.matches.length <= 1) return;
    grupo.expandido = !grupo.expandido;
  }

  irAChats() {
    this.router.navigate(['/mis-chats']);
  }

  async aceptar(matchId: string) {
    this.matchesService.actualizarEstado(matchId, 'aceptado').subscribe({
      next: async () => {
        const match = this.pendientes.find(m => m._id === matchId);
        if (match) {
          this.pendientes = this.pendientes.filter(m => m._id !== matchId);
          this.aceptados.push({ ...match, estado: 'aceptado' });
          this.gruposPendientes = this.agruparPorActor(this.pendientes);
          this.gruposAceptados = this.agruparPorActor(this.aceptados);
          
          const actorId = match.actor?._id || match.actor;
          const scriptId = match.script?._id || match.script;
          if (actorId && scriptId) {
            this.seleccionesService.aceptarActor(actorId, scriptId).subscribe();
          }
        }
        const toast = await this.toastCtrl.create({
          message: 'Actor aceptado', duration: 1800, color: 'success'
        });
        await toast.present();
      }
    });
  }

  async rechazar(matchId: string) {
    this.matchesService.actualizarEstado(matchId, 'rechazado').subscribe({
      next: async () => {
        this.pendientes = this.pendientes.filter(m => m._id !== matchId);
        this.gruposPendientes = this.agruparPorActor(this.pendientes);
        const toast = await this.toastCtrl.create({
          message: 'Actor rechazado', duration: 1800, color: 'danger'
        });
        await toast.present();
      }
    });
  }

  getInitial(nombre?: string): string {
    return nombre ? nombre.charAt(0).toUpperCase() : '?';
  }

  getImgUrl(path: string): string {
    if (!path) return '';
    return this.serverUrl + '/' + path;
  }
}

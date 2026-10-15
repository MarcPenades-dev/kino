import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonIcon, IonSpinner, IonButtons, IonButton
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  notificationsOutline, documentOutline, filmOutline,
  checkmarkCircleOutline, calendarOutline, searchOutline,
  personCircleOutline, starOutline, chatbubblesOutline
} from 'ionicons/icons';
import { MatchesService } from '../../services/matches';
import { AuthService } from '../../services/auth';
import { NotificationsService } from '../../services/notifications';
import { NotificacionesPanelComponent } from '../../components/notificaciones-panel/notificaciones-panel.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-actor-applications',
  templateUrl: './actor-applications.page.html',
  styleUrls: ['./actor-applications.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonIcon, IonSpinner, IonButtons, IonButton,
    NotificacionesPanelComponent
  ]
})
export class ActorApplicationsPage implements OnInit {
  private readonly matchesService = inject(MatchesService);
  private readonly authService = inject(AuthService);
  private readonly notifService = inject(NotificationsService);
  private readonly router = inject(Router);

  private readonly serverUrl = environment.apiUrl.replace('/api/kino', '');

  matches: any[] = [];
  matchesFiltrados: any[] = [];
  cargando = false;
  filtroActual = 'all';
  mostrarNotificaciones = false;

  get pendientes() {
    return this.matches.filter(m => m.estado === 'pendiente');
  }

  get aceptados() {
    return this.matches.filter(m => m.estado === 'aceptado');
  }

  get totalNoLeidas(): number {
    return this.notifService.totalNoLeidas;
  }

  constructor() {
    addIcons({
      notificationsOutline, documentOutline, filmOutline,
      checkmarkCircleOutline, calendarOutline, searchOutline,
      personCircleOutline, starOutline, chatbubblesOutline
    });
  }

  ngOnInit() {
    this.cargarMatches();
    this.notifService.cargarTodas();
  }

  ionViewWillEnter() {
    this.cargarMatches();
    this.notifService.cargarTodas();
  }

  cargarMatches() {
    this.cargando = true;
    this.matchesService.getMatchesPorActor().subscribe({
      next: (data: any) => {
        const todos = data.matches || data;
        this.matches = todos.sort((a: any, b: any) => {
          const orden: any = { aceptado: 0, pendiente: 1, rechazado: 2 };
          return orden[a.estado] - orden[b.estado];
        });
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  setFiltro(filtro: string) {
    this.filtroActual = filtro;
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    switch (this.filtroActual) {
      case 'pending':
        this.matchesFiltrados = this.matches.filter(m => m.estado === 'pendiente');
        break;
      case 'accepted':
        this.matchesFiltrados = this.matches.filter(m => m.estado === 'aceptado');
        break;
      default:
        this.matchesFiltrados = [...this.matches];
    }
  }

  toggleNotificaciones() {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
    if (this.mostrarNotificaciones) {
      this.notifService.cargarTodas();
    }
  }

  verDetalle(match: any) {
    if (match.estado === 'aceptado') {
      this.router.navigate(['/application-detail', match._id]);
    } else if (match.script?._id) {
      this.router.navigate(['/script-detail', match.script._id]);
    }
  }

  irAlFeed() {
    this.router.navigate(['/tabs-actor/home']);
  }

  irAChats() {
    this.router.navigate(['/mis-chats']);
  }

  getImgUrl(path: string): string {
    if (!path) return '';
    return this.serverUrl + '/' + path;
  }
}

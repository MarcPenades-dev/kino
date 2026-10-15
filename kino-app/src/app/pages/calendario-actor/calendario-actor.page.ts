import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonIcon, IonSpinner, IonButtons, IonButton, IonBadge
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline, chevronForwardOutline, calendarOutline,
  filmOutline, timeOutline, locationOutline, checkmarkCircleOutline,
  closeCircleOutline, alertCircleOutline, personOutline, chatbubblesOutline
} from 'ionicons/icons';
import { MatchesService } from '../../services/matches';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-calendario-actor',
  templateUrl: './calendario-actor.page.html',
  styleUrls: ['./calendario-actor.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonIcon, IonSpinner, IonButtons, IonButton, IonBadge
  ]
})
export class CalendarioActorPage implements OnInit {
  private readonly matchesService = inject(MatchesService);
  private readonly router = inject(Router);
  private readonly serverUrl = environment.apiUrl.replace('/api/kino', '');

  cargando = false;
  matches: any[] = [];

  // Calendario
  hoy = new Date();
  mesActual = new Date(this.hoy.getFullYear(), this.hoy.getMonth(), 1);
  diaSeleccionado: Date | null = null;
  semanas: (Date | null)[][] = [];

  readonly diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  readonly mesesNombres = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  constructor() {
    addIcons({
      chevronBackOutline, chevronForwardOutline, calendarOutline,
      filmOutline, timeOutline, locationOutline, checkmarkCircleOutline,
      closeCircleOutline, alertCircleOutline, personOutline, chatbubblesOutline
    });
  }

  ngOnInit(): void {
    this.cargarMatches();
  }

  ionViewWillEnter(): void {
    this.cargarMatches();
  }

  cargarMatches(): void {
    this.cargando = true;
    this.matchesService.getMatchesPorActor().subscribe({
      next: (data: any) => {
        const todos = data.matches || data;
        // Solo matches con fecha de callback asignada
        this.matches = todos.filter((m: any) => m.fechaCallback);
        this.construirCalendario();
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  construirCalendario(): void {
    const año = this.mesActual.getFullYear();
    const mes = this.mesActual.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);

    // Día de semana del primer día (0=Dom, adaptamos a Lun=0)
    let inicioDeSemana = primerDia.getDay();
    inicioDeSemana = inicioDeSemana === 0 ? 6 : inicioDeSemana - 1;

    const dias: (Date | null)[] = [];
    for (let i = 0; i < inicioDeSemana; i++) dias.push(null);
    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      dias.push(new Date(año, mes, d));
    }
    while (dias.length % 7 !== 0) dias.push(null);

    this.semanas = [];
    for (let i = 0; i < dias.length; i += 7) {
      this.semanas.push(dias.slice(i, i + 7));
    }
  }

  mesAnterior(): void {
    this.mesActual = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() - 1, 1);
    this.diaSeleccionado = null;
    this.construirCalendario();
  }

  mesSiguiente(): void {
    this.mesActual = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() + 1, 1);
    this.diaSeleccionado = null;
    this.construirCalendario();
  }

  seleccionarDia(dia: Date | null): void {
    if (!dia) return;
    if (this.diaSeleccionado && this.esMismaFecha(dia, this.diaSeleccionado)) {
      this.diaSeleccionado = null;
    } else {
      this.diaSeleccionado = dia;
    }
  }

  tieneCasting(dia: Date | null): boolean {
    if (!dia) return false;
    return this.matches.some(m => {
      const fecha = new Date(m.fechaCallback);
      return this.esMismaFecha(fecha, dia);
    });
  }

  esMismaFecha(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  esHoy(dia: Date | null): boolean {
    if (!dia) return false;
    return this.esMismaFecha(dia, this.hoy);
  }

  esDiaSeleccionado(dia: Date | null): boolean {
    if (!dia || !this.diaSeleccionado) return false;
    return this.esMismaFecha(dia, this.diaSeleccionado);
  }

  get matchesDelDia(): any[] {
    if (!this.diaSeleccionado) return [];
    return this.matches.filter(m => {
      const fecha = new Date(m.fechaCallback);
      return this.esMismaFecha(fecha, this.diaSeleccionado!);
    });
  }

  get nombreMes(): string {
    return this.mesesNombres[this.mesActual.getMonth()];
  }

  get anioActual(): number {
    return this.mesActual.getFullYear();
  }

  contarCastingsDia(dia: Date | null): number {
    if (!dia) return 0;
    return this.matches.filter(m => {
      const fecha = new Date(m.fechaCallback);
      return this.esMismaFecha(fecha, dia);
    }).length;
  }

  get proximosCastings(): any[] {
    const ahora = new Date();
    return this.matches
      .filter(m => new Date(m.fechaCallback) >= ahora)
      .sort((a, b) => new Date(a.fechaCallback).getTime() - new Date(b.fechaCallback).getTime())
      .slice(0, 3);
  }

  formatearFecha(fecha: string): string {
    const d = new Date(fecha);
    return `${d.getDate()} de ${this.mesesNombres[d.getMonth()]} ${d.getFullYear()}`;
  }

  getImgUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return this.serverUrl + '/' + path;
  }

  verDetalle(matchId: string): void {
    this.router.navigate(['/application-detail', matchId]);
  }

  irAChats() {
    this.router.navigate(['/mis-chats']);
  }

  getDiasHasta(fechaCallback: string): string {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fecha = new Date(fechaCallback);
    fecha.setHours(0, 0, 0, 0);
    const diff = Math.round((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Mañana';
    if (diff < 0) return 'Pasado';
    return `En ${diff} días`;
  }
}

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
  chevronBackOutline, chevronForwardOutline, calendarOutline,
  filmOutline, timeOutline, locationOutline, personOutline,
  checkmarkCircleOutline, closeCircleOutline, peopleOutline,
  chatbubbleOutline, chatbubblesOutline
} from 'ionicons/icons';
import { MatchesService } from '../../services/matches';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-calendario-director',
  templateUrl: './calendario-director.page.html',
  styleUrls: ['./calendario-director.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonIcon, IonSpinner, IonButtons, IonButton
  ]
})
export class CalendarioDirectorPage implements OnInit {
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
      filmOutline, timeOutline, locationOutline, personOutline,
      checkmarkCircleOutline, closeCircleOutline, peopleOutline,
      chatbubbleOutline, chatbubblesOutline
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
    this.matchesService.getMatchesPorGuionista().subscribe({
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

  tieneActores(dia: Date | null): boolean {
    if (!dia) return false;
    return this.matches.some(m => {
      const fecha = new Date(m.fechaCallback);
      return this.esMismaFecha(fecha, dia);
    });
  }

  contarActoresDia(dia: Date | null): number {
    if (!dia) return 0;
    return this.matches.filter(m => {
      const fecha = new Date(m.fechaCallback);
      return this.esMismaFecha(fecha, dia);
    }).length;
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

  get actoresDelDia(): any[] {
    if (!this.diaSeleccionado) return [];
    const seleccionados = this.matches.filter(m => {
      const fecha = new Date(m.fechaCallback);
      return this.esMismaFecha(fecha, this.diaSeleccionado!);
    });
    // Ordenar por hora
    return seleccionados.sort((a, b) => {
      if (!a.horaCallback) return 1;
      if (!b.horaCallback) return -1;
      return a.horaCallback.localeCompare(b.horaCallback);
    });
  }

  get nombreMes(): string {
    return this.mesesNombres[this.mesActual.getMonth()];
  }

  get anioActual(): number {
    return this.mesActual.getFullYear();
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

  irAlChat(matchId: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/chat', matchId]);
  }

  irAChats() {
    this.router.navigate(['/mis-chats']);
  }

  verActoresSeleccionados(scriptId: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/actores-seleccionados', scriptId]);
  }

  getInitial(nombre?: string): string {
    return nombre ? nombre.charAt(0).toUpperCase() : '?';
  }

  // Agrupar actores del día por casting (script)
  get actoresPorCasting(): { script: any; actores: any[] }[] {
    const grupos: { [key: string]: { script: any; actores: any[] } } = {};
    this.actoresDelDia.forEach(m => {
      const scriptId = m.script?._id || 'sin-casting';
      if (!grupos[scriptId]) {
        grupos[scriptId] = {
          script: m.script,
          actores: []
        };
      }
      grupos[scriptId].actores.push(m);
    });
    return Object.values(grupos);
  }

  // Resumen de días con mayor actividad
  get diasConMasActores(): { dia: Date; count: number }[] {
    const conteo: { [key: string]: { dia: Date; count: number } } = {};
    this.matches.forEach(m => {
      const fecha = new Date(m.fechaCallback);
      const key = fecha.toDateString();
      if (!conteo[key]) conteo[key] = { dia: fecha, count: 0 };
      conteo[key].count++;
    });
    return Object.values(conteo)
      .filter(d => d.dia >= this.hoy)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }
}

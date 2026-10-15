import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonIcon, IonSpinner, IonButtons, IonButton
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  searchOutline, optionsOutline, heartOutline, heart,
  locationOutline, calendarOutline, filmOutline,
  personCircleOutline, closeOutline, personOutline,
  refreshOutline, menuOutline, notificationsOutline, chatbubblesOutline
} from 'ionicons/icons';
import { ScriptsService } from '../../services/scripts';
import { AuthService } from '../../services/auth';
import { UsersService } from '../../services/users';
import { NotificationsService } from '../../services/notifications';
import { NotificacionesPanelComponent } from '../../components/notificaciones-panel/notificaciones-panel.component';

@Component({
  selector: 'app-actor-home',
  templateUrl: './actor-home.page.html',
  styleUrls: ['./actor-home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonIcon, IonSpinner, IonButtons, IonButton,
    NotificacionesPanelComponent
  ]
})
export class ActorHomePage implements OnInit {
  private readonly scriptsService = inject(ScriptsService);
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);
  private readonly notifService = inject(NotificationsService);

  guiones: any[] = [];
  guionesFiltrados: any[] = [];
  guardadosIds: string[] = [];
  cargando = false;
  busqueda = '';
  generoActivo = '';
  mostrarFiltrosAvanzados = false;
  panelNotifAbierto = false;

  // Carrusel: mapa de slide activo por casting ID
  private slideActivo: { [id: string]: number } = {};
  private carruselIntervals: { [id: string]: any } = {};

  filtros = {
    ubicacion: '',
    director: '',
    genero: ''
  };

  generosFiltro = ['Ciencia Ficción', 'Acción', 'Drama', 'Thriller', 'Comedia', 'Horror'];

  constructor() {
    addIcons({
      searchOutline, optionsOutline, heartOutline, heart,
      locationOutline, calendarOutline, filmOutline,
      personCircleOutline, closeOutline, personOutline,
      refreshOutline, menuOutline, notificationsOutline, chatbubblesOutline
    });
  }

  get totalNoLeidas(): number {
    return this.notifService.totalNoLeidas;
  }

  toggleNotificaciones() {
    if (!this.panelNotifAbierto) {
      this.notifService.cargarTodas();
    }
    this.panelNotifAbierto = !this.panelNotifAbierto;
  }

  ngOnInit() {
    this.cargarFeed();
    this.cargarGuardados();
  }

  ionViewWillEnter() {
    this.cargarFeed();
  }

  cargarFeed() {
    this.cargando = true;
    this.scriptsService.getFeed().subscribe({
      next: (data: any) => {
        const todos = data.scripts || data;
        this.guiones = todos.filter((g: any) => g.publico !== false);
        this.filtrarGuiones();
        this.cargando = false;
        this.iniciarCarruseles();
      },
      error: () => { this.cargando = false; }
    });
  }

  cargarGuardados() {
    const token = this.authService.obtenerToken();
    if (!token) return;
    this.usersService.getGuardados(token).subscribe({
      next: (data: any) => {
        const scripts = data.scripts || data;
        this.guardadosIds = scripts.map((s: any) => s._id);
      }
    });
  }

  toggleFiltrosAvanzados() {
    this.mostrarFiltrosAvanzados = !this.mostrarFiltrosAvanzados;
  }

  setGenero(genero: string) {
    this.generoActivo = genero;
    // Sincroniza con filtros avanzados
    this.filtros.genero = genero;
    this.filtrarGuiones();
  }

  setGeneroFiltro(genero: string) {
    if (this.filtros.genero === genero) {
      // Toggle: si ya está activo, desactiva
      this.filtros.genero = '';
      this.generoActivo = '';
    } else {
      this.filtros.genero = genero;
      this.generoActivo = genero;
    }
    this.filtrarGuiones();
  }

  filtrarGuiones() {
    let resultado = [...this.guiones];

    // Filtro por búsqueda general
    if (this.busqueda.trim()) {
      const q = this.busqueda.toLowerCase();
      resultado = resultado.filter(g =>
        g.titulo?.toLowerCase().includes(q) ||
        g.guionista?.nombre?.toLowerCase().includes(q) ||
        g.sinopsis?.toLowerCase().includes(q) ||
        g.ubicacion?.toLowerCase().includes(q) ||
        g.genero?.toLowerCase().includes(q)
      );
    }


    if (this.generoActivo) {
      resultado = resultado.filter(g =>
        g.genero?.toLowerCase().includes(this.generoActivo.toLowerCase())
      );
    }


    if (this.filtros.ubicacion.trim()) {
      const u = this.filtros.ubicacion.toLowerCase();
      resultado = resultado.filter(g =>
        g.ubicacion?.toLowerCase().includes(u)
      );
    }


    if (this.filtros.director.trim()) {
      const d = this.filtros.director.toLowerCase();
      resultado = resultado.filter(g =>
        g.guionista?.nombre?.toLowerCase().includes(d)
      );
    }

    // Filtro por edad del actor
    const user = this.authService.obtenerUser();
    const edadActor = user?.edad;
    if (edadActor) {
      resultado = resultado.filter(g => {
        const min = g.edadMin ?? 0;
        const max = g.edadMax ?? 999;
        return edadActor >= min && edadActor <= max;
      });
    }

    this.guionesFiltrados = resultado;
  }

  limpiarBusqueda() {
    this.busqueda = '';
    this.filtrarGuiones();
  }

  limpiarFiltros() {
    this.filtros = { ubicacion: '', director: '', genero: '' };
    this.generoActivo = '';
    this.busqueda = '';
    this.filtrarGuiones();
  }

  toggleGuardar(guion: any, event: Event) {
    event.stopPropagation();
    const token = this.authService.obtenerToken();
    if (!token) return;

    this.usersService.toggleGuardar(guion._id, token).subscribe({
      next: (res: any) => {
        if (res.guardado) {
          this.guardadosIds.push(guion._id);
        } else {
          this.guardadosIds = this.guardadosIds.filter(id => id !== guion._id);
        }
      }
    });
  }

  verDetalle(id: string) {
    this.router.navigate(['/script-detail', id]);
  }

  getRolLabel(guion: any): string {
    if (!guion.edades) return 'LEAD ROLE';
    const e = guion.edades.toLowerCase();
    if (e.includes('day')) return 'DAY PLAYER';
    return 'SUPPORTING';
  }

  getRolClass(guion: any): string {
    const label = this.getRolLabel(guion);
    if (label === 'LEAD ROLE') return 'rol-lead';
    if (label === 'DAY PLAYER') return 'rol-day';
    return 'rol-supporting';
  }

  getGeneros(genero: string): string[] {
    if (!genero) return [];
    return genero.split(/[,\/]/).map(g => g.trim()).filter(Boolean);
  }

  // ── CARRUSEL ──────────────────────────────────────────────
  getImagenes(guion: any): string[] {
    const urls: string[] = guion.imagenesUrls?.filter((u: string) => !!u) || [];
    if (urls.length === 0 && guion.imagenUrl) urls.push(guion.imagenUrl);
    return urls;
  }

  getSlideActivo(id: string): number {
    return this.slideActivo[id] || 0;
  }

  private iniciarCarruseles() {
    this.detenerCarruseles();
    this.guionesFiltrados.forEach(g => {
      const imgs = this.getImagenes(g);
      if (imgs.length > 1) {
        this.slideActivo[g._id] = 0;
        this.carruselIntervals[g._id] = setInterval(() => {
          this.slideActivo[g._id] = (this.slideActivo[g._id] + 1) % imgs.length;
        }, 3000);
      }
    });
  }

  private detenerCarruseles() {
    Object.values(this.carruselIntervals).forEach(t => clearInterval(t));
    this.carruselIntervals = {};
  }

  ngOnDestroy() {
    this.detenerCarruseles();
  }
  // ─────────────────────────────────────────────────────────

  irAChats() {
    this.router.navigate(['/mis-chats']);
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonIcon, IonSpinner,
  IonButtons, ModalController, AlertController
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth';
import { UsersService } from '../../services/users';
import { ScriptsService } from '../../services/scripts';
import { MatchesService } from '../../services/matches';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline, settingsOutline, createOutline,
  filmOutline, personOutline, addOutline, cameraOutline,
  checkmarkCircleOutline, timeOutline, peopleCircleOutline,
  chevronForwardOutline, logOutOutline, chatbubblesOutline,
  bookmark, bookmarkOutline
} from 'ionicons/icons';
import { SeleccionesService } from '../../services/selecciones';
import { NuevoAnuncioModal } from '../nuevo-anuncio.modal/nuevo-anuncio.modal.page';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonIcon, IonSpinner, IonButtons
  ]
})
export class ProfilePage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly scriptsService = inject(ScriptsService);
  private readonly matchesService = inject(MatchesService);
  private readonly seleccionesService = inject(SeleccionesService);
  private readonly router = inject(Router);
  private readonly modalCtrl = inject(ModalController);
  private readonly alertCtrl = inject(AlertController);

  private readonly serverUrl = environment.apiUrl.replace('/api/kino', '');

  user: any = null;
  misGuiones: any[] = [];
  cargando = false;
  guionesPublicos = 0;
  matchesPendientes = 0;
  totalGuiones = 0;
  seleccionesPorScript: any[] = [];
  perfilesGuardados: any[] = [];

  constructor() {
    addIcons({
      chevronBackOutline, settingsOutline, createOutline,
      filmOutline, personOutline, addOutline, cameraOutline,
      checkmarkCircleOutline, timeOutline, peopleCircleOutline,
      chevronForwardOutline, logOutOutline, chatbubblesOutline,
      bookmark, bookmarkOutline
    });
  }

  ngOnInit() {
    this.user = this.authService.obtenerToken() ? this.authService.obtenerUser() : null;
    this.cargarGuiones();
    this.cargarSelecciones();
    this.cargarPerfilesGuardados();
  }

  ionViewWillEnter() {
    this.cargarPerfilesGuardados();
    this.cargarGuiones();
    this.cargarSelecciones();
  }

  cargarPerfilesGuardados() {
    const token = this.authService.obtenerToken();
    if (!token) return;
    this.usersService.getActoresGuardados(token).subscribe({
      next: (res: any) => {
        this.perfilesGuardados = res.actores || [];
      }
    });
  }

  cargarGuiones() {
    this.cargando = true;
    const token = this.authService.obtenerToken();
    if (!token) return;
    const payload = JSON.parse(atob(token.split('.')[1]));
    this.scriptsService.getMisGuiones(payload.sub).subscribe({
      next: (data: any) => {
        this.misGuiones = data.scripts || data;
        this.totalGuiones = this.misGuiones.length;
        this.guionesPublicos = this.misGuiones.filter((g: any) => g.publico).length;
        this.cargando = false;
        // Cargar matches reales para cruzar con los guiones
        this.cargarMatchCounts();
      },
      error: () => { this.cargando = false; }
    });
  }

  cargarMatchCounts() {
    this.matchesService.getMatchesPorGuionista().subscribe({
      next: (resp: any) => {
        const matches: any[] = resp.matches || resp;
        // Construir mapa scriptId → nº de matches pendientes
        const mapa: Record<string, number> = {};
        matches.forEach((m: any) => {
          const scriptId = m.script?._id?.toString() || m.script?.toString();
          if (!scriptId) return;
          if (!mapa[scriptId]) mapa[scriptId] = 0;
          if (!m.estado || m.estado === 'pendiente') mapa[scriptId]++;
        });
        // Enriquecer cada guión con su matchCount real
        this.misGuiones = this.misGuiones.map((g: any) => ({
          ...g,
          matchCount: mapa[g._id?.toString()] || 0
        }));
        // Total de pendientes para el stat del header
        this.matchesPendientes = Object.values(mapa).reduce((a, b) => a + b, 0);
      },
      error: () => { } // silencioso, los guiones ya están cargados
    });
  }

  cargarSelecciones() {
    this.seleccionesService.getMisSelecciones().subscribe({
      next: (data: any) => {
        const selecciones = data.selecciones || [];
        const mapa: any = {};
        selecciones.forEach((s: any) => {
          const scriptId = s.script?._id;
          if (!mapa[scriptId]) {
            mapa[scriptId] = { script: s.script, actores: [] };
          }
          mapa[scriptId].actores.push(s.actor);
        });
        this.seleccionesPorScript = Object.values(mapa);
      }
    });
  }

  verDetalle(id: string) { this.router.navigate(['/script-detail', id]); }
  verPerfilGuardado(id: string) { this.router.navigate(['/user-profile', id]); }
  irAEditar() { this.router.navigate(['/edit-profile']); }

  async irAMisAnuncios() {
    const modal = await this.modalCtrl.create({
      component: NuevoAnuncioModal,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      handle: true
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data?.creado) {
      this.cargarGuiones();
    }
  }

  irAChats() {
    this.router.navigate(['/mis-chats']);
  }

  irAtras() { this.router.navigate(['/tabs-director/inicio']); }
  irASettings() { this.router.navigate(['/edit-profile']); }

  getInitial(nombre?: string): string {
    return nombre ? nombre.charAt(0).toUpperCase() : '?';
  }

  getProgressPercentage(cantidad: number): number {
    const maxActores = 10;
    return Math.min(Math.round((cantidad / maxActores) * 100), 100);
  }

  get totalActoresSeleccionados(): number {
    return this.seleccionesPorScript.reduce((total: number, grupo: any) =>
      total + grupo.actores.length, 0
    );
  }

  verActoresDeScript(grupo: any) {
    this.router.navigate(
      ['/actores-seleccionados', grupo.script._id],
      { queryParams: { titulo: grupo.script.titulo } }
    );
  }

  splitGenero(genero: string): string[] {
    if (!genero) return [];
    return genero.split(/[,\/]/).map(g => g.trim().toUpperCase()).filter(Boolean);
  }

  cerrarSesion() {
    this.authService.cerrarSesion();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  async eliminarCuenta() {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Cuenta',
      message: '¿Estás seguro de que quieres eliminar tu cuenta de forma permanente? Se borrarán todos tus datos y registros relacionados.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            const token = this.authService.obtenerToken();
            if (token && this.user) {
              this.usersService.deleteAccount(this.user._id, token).subscribe({
                next: () => {
                  this.authService.cerrarSesion();
                  this.router.navigate(['/login'], { replaceUrl: true });
                },
                error: (err) => {
                  console.error('Error eliminando cuenta', err);
                }
              });
            }
          }
        }
      ]
    });
    await alert.present();
  }

  getImgUrl(path: string): string {
    if (!path) return '';
    return this.serverUrl + '/' + path;
  }
}

import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonIcon, IonSpinner, IonButtons, IonButton,
  ToastController, AlertController, IonRefresher, IonRefresherContent,
  IonMenuButton
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  addOutline, searchOutline, menuOutline,
  checkmarkOutline, closeOutline, personOutline,
  notificationsOutline, filmOutline, locationOutline,
  calendarOutline, createOutline, trashOutline, chatbubblesOutline
} from 'ionicons/icons';
import { ScriptsService } from '../../services/scripts';
import { MatchesService } from '../../services/matches';
import { AuthService } from '../../services/auth';
import { NuevoAnuncioModal } from '../nuevo-anuncio.modal/nuevo-anuncio.modal.page';
import { ModalController } from '@ionic/angular/standalone';
import { UsersService } from '../../services/users';
import { SeleccionesService } from '../../services/selecciones';
import { NotificationsService } from '../../services/notifications';
import { NotificacionesPanelComponent } from '../../components/notificaciones-panel/notificaciones-panel.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-inicio-director',
  templateUrl: './inicio-director.page.html',
  styleUrls: ['./inicio-director.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonIcon, IonSpinner, IonButtons, IonButton,
    IonRefresher, IonRefresherContent,
    IonMenuButton,
    NotificacionesPanelComponent
  ]
})
export class InicioDirectorPage implements OnInit, OnDestroy {
  private readonly scriptsService = inject(ScriptsService);
  private readonly matchesService = inject(MatchesService);
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly seleccionesService = inject(SeleccionesService);
  private readonly notifService = inject(NotificationsService);
  private readonly router = inject(Router);
  private readonly toastCtrl = inject(ToastController);
  private readonly modalCtrl = inject(ModalController);
  private readonly alertCtrl = inject(AlertController);

  private readonly serverUrl = environment.apiUrl.replace('/api/kino', '');

  user: any = null;
  misGuiones: any[] = [];
  guionesPublicos: any[] = [];
  matchesPendientes: any[] = [];
  actoresGuardados: any[] = [];
  cargandoGuiones = false;
  cargandoMatches = false;
  mostrarNotificaciones = false;

  // Carrusel: mapa de slide activo por casting ID
  private slideActivo: { [id: string]: number } = {};
  private carruselIntervals: { [id: string]: any } = {};

  get totalNoLeidas(): number {
    return this.notifService.totalNoLeidas;
  }

  constructor() {
    addIcons({
      addOutline, searchOutline, menuOutline,
      checkmarkOutline, closeOutline, personOutline,
      notificationsOutline, filmOutline, locationOutline,
      calendarOutline, createOutline, trashOutline, chatbubblesOutline
    });
  }

  ngOnInit() {
    this.user = this.authService.obtenerUser();
    this.cargarMisGuiones();
    this.cargarMatches();
    this.notifService.cargarTodas();
  }

  ionViewWillEnter() {
    this.cargarMisGuiones();
    this.cargarMatches();
    this.notifService.cargarTodas();
  }

  handleRefresh(event: any) {
    this.cargarMisGuiones();
    this.cargarMatches();
    this.notifService.cargarTodas();
    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }

  toggleNotificaciones() {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
    if (this.mostrarNotificaciones) {
      this.notifService.cargarTodas();
    }
  }

  cargarMisGuiones() {
    this.cargandoGuiones = true;
    const token = this.authService.obtenerToken();
    if (!token) return;
    const payload = JSON.parse(atob(token.split('.')[1]));
    this.scriptsService.getMisGuiones(payload.sub).subscribe({
      next: (data: any) => {
        this.misGuiones = data.scripts || data;
        this.guionesPublicos = this.misGuiones.filter((g: any) => g.publico);
        this.cargandoGuiones = false;
        this.iniciarCarruseles();
      },
      error: () => { this.cargandoGuiones = false; }
    });
  }

  cargarMatches() {
    this.cargandoMatches = true;
    this.matchesService.getMatchesPorGuionista().subscribe({
      next: (data: any) => {
        const todos = data.matches || data;
        this.matchesPendientes = todos
          .filter((m: any) => m.estado === 'pendiente')
          .map((m: any) => ({
            _id: m.actor?._id,
            actor: m.actor,
            script: m.script,
            matchId: m._id,
            estado: 'pendiente'
          }));
        this.cargandoMatches = false;
      },
      error: () => { this.cargandoMatches = false; }
    });
  }

  async togglePublico(guion: any, event: Event) {
    event.stopPropagation();
    const nuevoValor = !guion.publico;
    this.scriptsService.actualizarVisibilidad(guion._id, nuevoValor).subscribe({
      next: async () => {
        guion.publico = nuevoValor;
        this.guionesPublicos = this.misGuiones.filter((g: any) => g.publico);
        const toast = await this.toastCtrl.create({
          message: nuevoValor ? 'Anuncio publicado' : 'Anuncio marcado como privado',
          duration: 1800,
          color: nuevoValor ? 'success' : 'medium'
        });
        await toast.present();
      }
    });
  }

  async aceptarMatch(actorId: string, event: Event) {
    event.stopPropagation();

    const matchesDelActor = this.matchesPendientes.filter(
      m => m._id === actorId || m.actor?._id === actorId
    );

    const guionesDelActor = this.misGuiones.filter((g: any) =>
      matchesDelActor.some((m: any) =>
        m.script?._id === g._id || m.script === g._id
      )
    );

    if (guionesDelActor.length === 1) {
      this.seleccionesService.aceptarActor(actorId, guionesDelActor[0]._id).subscribe({
        next: async () => {
          const matchAceptado = matchesDelActor.find(m => m.script?._id === guionesDelActor[0]._id || m.script === guionesDelActor[0]._id);
          if (matchAceptado?.matchId) {
            this.matchesService.actualizarEstado(matchAceptado.matchId, 'aceptado').subscribe();
          }
          this.matchesPendientes = this.matchesPendientes.filter(m => m._id !== actorId);
          const toast = await this.toastCtrl.create({
            message: 'Actor añadido al casting',
            duration: 1800,
            color: 'success'
          });
          await toast.present();
        }
      });
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Seleccionar Anuncio',
      message: '¿A qué casting quieres añadir este actor?',
      inputs: guionesDelActor.map(g => ({
        type: 'radio',
        label: g.titulo,
        value: g._id
      })),
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Aceptar',
          handler: (scriptId: string) => {
            if (!scriptId) return;
            this.seleccionesService.aceptarActor(actorId, scriptId).subscribe({
              next: async () => {
                const matchAceptado = matchesDelActor.find(m => m.script?._id === scriptId || m.script === scriptId);
                if (matchAceptado?.matchId) {
                  this.matchesService.actualizarEstado(matchAceptado.matchId, 'aceptado').subscribe();
                }
                this.matchesPendientes = this.matchesPendientes.filter(m => m._id !== actorId);
                const toast = await this.toastCtrl.create({
                  message: 'Actor añadido al casting',
                  duration: 1800,
                  color: 'success'
                });
                await toast.present();
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async rechazarMatch(actorId: string, event: Event) {
    event.stopPropagation();
    const matchPendiente = this.matchesPendientes.find(m => m._id === actorId);
    if (matchPendiente?.matchId) {
      this.matchesService.actualizarEstado(matchPendiente.matchId, 'rechazado').subscribe();
    }
    this.matchesPendientes = this.matchesPendientes.filter(m => m._id !== actorId);
    const toast = await this.toastCtrl.create({
      message: 'Actor descartado',
      duration: 1800,
      color: 'medium'
    });
    await toast.present();
  }

  async editarGuion(guion: any, event: Event) {
    event.stopPropagation();
    this.scriptsService.getById(guion._id).subscribe({
      next: async (res: any) => {
        const datosCompletos = res.script || res;
        const modal = await this.modalCtrl.create({
          component: NuevoAnuncioModal,
          componentProps: {
            modoEdicion: true,
            datosGuion: datosCompletos
          }
        });
        modal.onDidDismiss().then((data) => {
          if (data.role === 'ok') {
            this.cargarMisGuiones();
          }
        });
        await modal.present();
      }
    });
  }

  async eliminarGuion(id: string, event: Event) {
    event.stopPropagation();
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Anuncio',
      message: '¿Estás seguro de que quieres eliminar este casting?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.scriptsService.eliminar(id).subscribe({
              next: async () => {
                this.guionesPublicos = this.guionesPublicos.filter(g => g._id !== id);
                this.misGuiones = this.misGuiones.filter(g => g._id !== id);
                const toast = await this.toastCtrl.create({
                  message: 'Anuncio eliminado correctamente',
                  duration: 2000,
                  color: 'danger',
                  position: 'bottom'
                });
                await toast.present();
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  verDetalle(id: string) { this.router.navigate(['/script-detail', id]); }
  irAPerfil() { this.router.navigate(['/profile']); }
  irABuscar() { this.router.navigate(['/buscar']); }

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
    // Limpiar los intervalos anteriores
    this.detenerCarruseles();

    this.guionesPublicos.forEach(g => {
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
      this.cargarMisGuiones();
    }
  }

  irAChats() {
    this.router.navigate(['/mis-chats']);
  }

  getInitial(nombre?: string): string {
    return nombre ? nombre.charAt(0).toUpperCase() : '?';
  }

  splitGenero(genero: string): string[] {
    if (!genero) return [];
    return genero.split(/[,\/]/).map(g => g.trim().toUpperCase()).filter(Boolean);
  }

  getImgUrl(path: string): string {
    if (!path) return '';
    return this.serverUrl + '/' + path;
  }

  getRolLabel(guion: any): string {
    return guion.publico ? 'PÚBLICO' : 'PRIVADO';
  }

  getRolClass(guion: any): string {
    return guion.publico ? 'rol-lead' : 'rol-supporting';
  }
}

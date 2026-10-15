import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonIcon, IonSpinner, IonFooter,
  ToastController
} from '@ionic/angular/standalone';
import { ScriptsService } from '../../services/scripts';
import { MatchesService } from '../../services/matches';
import { AuthService } from '../../services/auth';
import { UsersService } from '../../services/users';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline, locationOutline, calendarOutline,
  cashOutline, chevronForwardOutline, documentTextOutline,
  heartOutline, heart, send, checkmarkCircleOutline,
  paperPlaneOutline, personCircleOutline
} from 'ionicons/icons';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-script-detail',
  templateUrl: './script-detail.page.html',
  styleUrls: ['./script-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonIcon, IonSpinner, IonFooter
  ]
})
export class ScriptDetailPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly scriptsService = inject(ScriptsService);
  private readonly matchesService = inject(MatchesService);
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly toastCtrl = inject(ToastController);

  private readonly serverUrl = environment.apiUrl.replace('/api/kino', '');

  guion: any = null;
  cargando = true;
  aplicando = false;
  yaAplico = false;
  estaGuardado = false;
  nuevoComentario = '';
  enviandoComentario = false;
  esActor = false;

  // Carrusel
  slideActual = 0;
  private carruselTimer: any = null;

  constructor() {
    addIcons({
      chevronBackOutline, locationOutline, calendarOutline,
      cashOutline, chevronForwardOutline, documentTextOutline,
      heartOutline, heart, send, checkmarkCircleOutline,
      paperPlaneOutline, personCircleOutline
    });
  }

  ngOnInit() {
    const user = this.authService.obtenerUser();
    this.esActor = user?.rol === 'actor';

    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.obtenerDetalle(id);
    this.cargarGuardados();
  }

  obtenerDetalle(id: string) {
    this.cargando = true;
    this.scriptsService.getById(id).subscribe({
      next: (data: any) => {
        this.guion = data.script || data;
        this.cargando = false;
        this.verificarSiAplico();
        this.iniciarCarrusel();
      },
      error: () => { this.cargando = false; }
    });
  }

  verificarSiAplico() {
    if (!this.guion) return;
    this.matchesService.getMatchesPorActor().subscribe({
      next: (data: any) => {
        const matches = data.matches || data;
        this.yaAplico = matches.some(
          (m: any) => m.script?._id === this.guion._id ||
            m.script === this.guion._id
        );
      }
    });
  }

  cargarGuardados() {
    const token = this.authService.obtenerToken();
    if (!token) return;
    this.usersService.getGuardados(token).subscribe({
      next: (data: any) => {
        const scripts = data.scripts || data;
        this.estaGuardado = scripts.some(
          (s: any) => s._id === this.guion?._id
        );
      }
    });
  }

  async aplicar() {
    if (!this.guion) return;
    this.aplicando = true;

    this.matchesService.darLike(this.guion._id).subscribe({
      next: async () => {
        this.aplicando = false;
        this.yaAplico = true;
        const toast = await this.toastCtrl.create({
          message: '🎬 Solicitud enviada. ¡Buena suerte!',
          duration: 2500,
          color: 'success',
          position: 'top'
        });
        await toast.present();
      },
      error: async (err) => {
        this.aplicando = false;
        if (err.error?.message?.includes('Like')) {
          this.yaAplico = true;
        }
        const toast = await this.toastCtrl.create({
          message: err.error?.message || 'No se pudo enviar la solicitud.',
          duration: 2000,
          color: 'warning',
          position: 'top'
        });
        await toast.present();
      }
    });
  }

  toggleGuardar() {
    const token = this.authService.obtenerToken();
    if (!token || !this.guion) return;
    this.usersService.toggleGuardar(this.guion._id, token).subscribe({
      next: (res: any) => {
        this.estaGuardado = res.guardado;
      }
    });
  }

  enviarComentario() {
    if (!this.nuevoComentario.trim() || !this.guion) return;
    this.enviandoComentario = true;
    this.scriptsService.comentar(this.guion._id, this.nuevoComentario).subscribe({
      next: () => {
        this.nuevoComentario = '';
        this.enviandoComentario = false;
        this.obtenerDetalle(this.guion._id);
      },
      error: () => { this.enviandoComentario = false; }
    });
  }

  abrirPdf() {
    if (this.guion?.pdfUrl) window.open(this.guion.pdfUrl, '_blank');
  }

  verAplicaciones() {
    this.router.navigate(['/tabs-actor/applications']);
  }

  verPerfilDirector() {
    const directorId = this.guion?.guionista?._id || this.guion?.guionista?.id;
    if (directorId) {
      this.router.navigate(['/user-profile', directorId]);
    }
  }

  volver() { window.history.back(); }

  getInitial(nombre?: string): string {
    if (!nombre) return 'U';
    return nombre.charAt(0).toUpperCase();
  }

  getGeneros(): string[] {
    if (!this.guion?.genero) return [];
    return this.guion.genero.split(/[,\/]/).map((g: string) => g.trim()).filter(Boolean);
  }

  getImgUrl(path: string): string {
    if (!path) return '';
    return this.serverUrl + '/' + path;
  }

  // ── CARRUSEL ──────────────────────────────────────────────
  getImagenes(): string[] {
    const urls: string[] = this.guion?.imagenesUrls?.filter((u: string) => !!u) || [];
    if (urls.length === 0 && this.guion?.imagenUrl) urls.push(this.guion.imagenUrl);
    return urls;
  }

  private iniciarCarrusel() {
    this.detenerCarrusel();
    const imgs = this.getImagenes();
    if (imgs.length > 1) {
      this.slideActual = 0;
      this.carruselTimer = setInterval(() => {
        this.slideActual = (this.slideActual + 1) % imgs.length;
      }, 3000);
    }
  }

  private detenerCarrusel() {
    if (this.carruselTimer) {
      clearInterval(this.carruselTimer);
      this.carruselTimer = null;
    }
  }

  ngOnDestroy() { this.detenerCarrusel(); }
  // ─────────────────────────────────────────────────────────
}

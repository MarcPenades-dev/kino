import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonIcon, IonSpinner,
  ToastController
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline, checkmarkCircleOutline, checkmarkOutline,
  calendarOutline, timeOutline, videocamOutline, chatbubbleOutline,
  bulbOutline, ellipse, ellipseOutline, heartOutline, heart,
  paperPlaneOutline, eyeOutline, filmOutline, documentTextOutline
} from 'ionicons/icons';
import { MatchesService } from '../../services/matches';
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-application-detail',
  templateUrl: './application-detail.page.html',
  styleUrls: ['./application-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonIcon, IonSpinner
  ]
})
export class ApplicationDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly matchesService = inject(MatchesService);
  private readonly toastCtrl = inject(ToastController);

  private readonly serverUrl = environment.apiUrl.replace('/api/kino', '');

  match: any = null;
  cargando = true;
  confirmado = false;
  dioLike = false;
  guardandoConfirmacion = false;

  apiUrl = 'http://192.168.1.153:3000';

  constructor() {
    addIcons({
      chevronBackOutline, checkmarkCircleOutline, checkmarkOutline,
      calendarOutline, timeOutline, videocamOutline, chatbubbleOutline,
      bulbOutline, ellipse, ellipseOutline, heartOutline, heart,
      paperPlaneOutline, eyeOutline, filmOutline, documentTextOutline
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.cargarMatch(id);
  }

  cargarMatch(id: string) {
    this.cargando = true;
    this.matchesService.getMatchesPorActor().subscribe({
      next: (data: any) => {
        const matches = data.matches || data;
        this.match = matches.find((m: any) => m._id === id);

        if (!this.match) {
          this.cargando = false;
          return;
        }

        // Leemos disponibilidadConfirmada directamente del backend
        this.confirmado = this.match.disponibilidadConfirmada === true;
        this.dioLike = true;
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  async confirmarDisponibilidad() {
    if (!this.match?._id || this.guardandoConfirmacion || this.confirmado) return;

    this.guardandoConfirmacion = true;

    this.matchesService.confirmarDisponibilidad(this.match._id).subscribe({
      next: async (res: any) => {
        const matchActualizado = res.match || res;

        this.match = {
          ...this.match,
          disponibilidadConfirmada: true
        };
        this.confirmado = true;
        this.guardandoConfirmacion = false;

        const toast = await this.toastCtrl.create({
          message: '✅ Disponibilidad confirmada. El director será notificado.',
          duration: 2500,
          color: 'success',
          position: 'top'
        });
        await toast.present();
      },
      error: async () => {
        this.guardandoConfirmacion = false;
        const toast = await this.toastCtrl.create({
          message: 'Error al confirmar disponibilidad',
          duration: 2000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
      }
    });
  }

  irAlChat() {
    if (!this.match?._id) return;
    this.router.navigate(['/chat', this.match._id]);
  }

  async iniciarVideoLlamada() {
    const toast = await this.toastCtrl.create({
      message: '📹 Videollamada próximamente disponible.',
      duration: 2000,
      color: 'warning',
      position: 'top'
    });
    await toast.present();
  }

  volver() { window.history.back(); }

  getInitial(nombre?: string): string {
    return nombre ? nombre.charAt(0).toUpperCase() : '?';
  }

  getImgUrl(path: string): string {
    if (!path) return '';
    return this.serverUrl + '/' + path;
  }
}

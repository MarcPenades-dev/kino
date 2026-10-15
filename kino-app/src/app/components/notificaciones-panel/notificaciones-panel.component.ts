import { Component, inject, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  notificationsOutline, chatbubbleOutline, checkmarkCircleOutline,
  megaphoneOutline, personAddOutline, closeOutline
} from 'ionicons/icons';
import { NotificationsService, Notificacion } from '../../services/notifications';

@Component({
  selector: 'app-notificaciones-panel',
  templateUrl: './notificaciones-panel.component.html',
  styleUrls: ['./notificaciones-panel.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, IonSpinner]
})
export class NotificacionesPanelComponent implements OnInit {
  private readonly notifService = inject(NotificationsService);
  private readonly router = inject(Router);

  @Output() cerrado = new EventEmitter<void>();

  notificaciones: Notificacion[] = [];
  cargando = true;
  apiUrl = 'http://192.168.1.153:3000';

  constructor() {
    addIcons({
      notificationsOutline, chatbubbleOutline, checkmarkCircleOutline,
      megaphoneOutline, personAddOutline, closeOutline
    });
  }

  ngOnInit() {
    this.notifService.cargarTodas();
    this.notifService.notificaciones$.subscribe(notifs => {
      this.notificaciones = notifs;
      this.cargando = false;
    });
  }

  get totalNoLeidas(): number {
    return this.notifService.totalNoLeidas;
  }

  get noLeidas(): Notificacion[] {
    return this.notificaciones.filter(n => !n.leida);
  }

  abrirNotificacion(n: Notificacion) {
    this.notifService.marcarLeida(n.id);

    switch (n.tipo) {
      case 'mensaje':
        if (n.matchId) this.router.navigate(['/chat', n.matchId]);
        break;
      case 'match_aceptado':
        if (n.matchId) this.router.navigate(['/application-detail', n.matchId]);
        break;
      case 'match_pendiente':
        this.router.navigate(['/tabs-director/inicio']);
        break;
      case 'anuncio':
        if (n.scriptId) this.router.navigate(['/script-detail', n.scriptId]);
        break;
    }

    this.cerrar();
  }

  marcarTodas() {
    this.notifService.marcarTodasLeidas();
  }

  cerrar() {
    this.cerrado.emit();
  }

  getIcono(tipo: string): string {
    const iconos: { [key: string]: string } = {
      mensaje: 'chatbubble-outline',
      match_aceptado: 'checkmark-circle-outline',
      match_pendiente: 'person-add-outline',
      anuncio: 'megaphone-outline',
      disponibilidad: 'checkmark-circle-outline'
    };
    return iconos[tipo] || 'notifications-outline';
  }

  formatFecha(fecha: any): string {
    if (!fecha) return '';
    const dateObj = new Date(fecha);
    if (isNaN(dateObj.getTime())) return '';

    const ahora = new Date();
    const diff = ahora.getTime() - dateObj.getTime();
    const mins = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (mins < 1) return 'Ahora mismo';
    if (mins < 60) return `Hace ${mins} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    return dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }

  getInitial(nombre?: string): string {
    return nombre ? nombre.charAt(0).toUpperCase() : '?';
  }
}

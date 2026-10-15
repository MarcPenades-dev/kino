import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonButtons,
  IonButton, IonIcon, IonSpinner, IonFooter,
  ToastController, AlertController
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline, videocamOutline, cameraOutline,
  micOutline, imageOutline, happyOutline,
  informationCircleOutline, chatbubblesOutline, send,
  createOutline, trashOutline, pauseOutline, playOutline,
  colorPaletteOutline, checkmarkOutline, ellipsisHorizontalOutline,
  closeOutline
} from 'ionicons/icons';
import { ChatService } from '../../services/chat';
import { AuthService } from '../../services/auth';
import { MatchesService } from '../../services/matches';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

const FONDOS_CHAT = [
  { id: 1, css: '#0A0A0A', img: null, label: 'Default' },
  { id: 2, css: 'linear-gradient(180deg, #0d0d1a 0%, #0A0A0A 100%)', img: null, label: 'Noche' },
  { id: 3, css: 'linear-gradient(180deg, #0a1a0a 0%, #0A0A0A 100%)', img: null, label: 'Verde' },
  { id: 4, css: 'linear-gradient(180deg, #1a0a0a 0%, #0A0A0A 100%)', img: null, label: 'Rojo' },
  { id: 5, img: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80', css: '', label: 'Cine' },
  { id: 6, img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80', css: '', label: 'Movie' },
  { id: 7, img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80', css: '', label: 'Theater' },
  { id: 8, img: 'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=800&q=80', css: '', label: 'Concert' }
];

function getFondoChatFromStorage(matchId: string): any {
  try {
    const id = parseInt(localStorage.getItem(`chat_fondo_${matchId}`) || '1', 10);
    return { ...(FONDOS_CHAT.find(f => f.id === id) || FONDOS_CHAT[0]) };
  } catch {
    return { ...FONDOS_CHAT[0] };
  }
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonButtons,
    IonButton, IonIcon, IonSpinner, IonFooter
  ]
})
export class ChatPage implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly chatService = inject(ChatService);
  private readonly authService = inject(AuthService);
  private readonly matchesService = inject(MatchesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastCtrl = inject(ToastController);
  private readonly alertCtrl = inject(AlertController);
  private readonly sanitizer = inject(DomSanitizer);

  private readonly serverUrl = environment.apiUrl.replace('/api/kino', '');

  @ViewChild('chatContent') chatContent!: IonContent;
  @ViewChild('imgInput') imgInput!: ElementRef<HTMLInputElement>;

  matchId = '';
  mensajes: any[] = [];
  otroUsuario: any = null;
  scriptTitulo = '';
  nuevoMensaje = '';
  cargando = false;
  enviando = false;
  usuarioActual: any = null;
  private intervalo: any;

  grabando = false;
  tiempoGrabacion = 0;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private timerGrabacion: any;
  audioActual: string | null = null;
  audioProgreso = 0;
  private audioElement: HTMLAudioElement | null = null;

  accionesAbiertas: string | null = null;
  mensajeEditando: any = null;
  textoEditando = '';

  videollamadaActiva = false;
  videoUrl!: SafeResourceUrl;

  fondosChat = FONDOS_CHAT;
  fondoChatActual = FONDOS_CHAT[0];
  mostrarSelectorFondoChat = false;

  constructor() {
    addIcons({
      chevronBackOutline, videocamOutline, cameraOutline,
      micOutline, imageOutline, happyOutline,
      informationCircleOutline, chatbubblesOutline, send,
      createOutline, trashOutline, pauseOutline, playOutline,
      colorPaletteOutline, checkmarkOutline, ellipsisHorizontalOutline,
      closeOutline
    });
  }

  ngOnInit() {
    this.matchId = this.route.snapshot.paramMap.get('matchId') || '';
    this.usuarioActual = this.authService.obtenerUser();
    this.fondoChatActual = getFondoChatFromStorage(this.matchId);
    this.cargarConversacion();
    this.cargarInfoMatch();

    this.intervalo = setInterval(() => {
      this.cargarConversacion(false);
    }, 5000);
  }

  ngOnDestroy() {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  cargarInfoMatch() {
    if (this.usuarioActual?.rol === 'actor') {
      this.matchesService.getMatchesPorActor().subscribe({
        next: (data: any) => {
          const matches = data.matches || data;
          const match = matches.find((m: any) => m._id === this.matchId);
          if (match) {
            this.scriptTitulo = match.script?.titulo || 'Casting';
            this.otroUsuario = match.script?.guionista;
          }
        }
      });
    } else {
      this.matchesService.getMatchesPorGuionista().subscribe({
        next: (data: any) => {
          const matches = data.matches || data;
          const match = matches.find((m: any) => m._id === this.matchId);
          if (match) {
            this.scriptTitulo = match.script?.titulo || 'Casting';
            this.otroUsuario = match.actor;
          }
        }
      });
    }
  }

  cargarConversacion(mostrarCargando = true) {
    if (mostrarCargando) this.cargando = true;
    this.chatService.getConversacion(this.matchId).subscribe({
      next: (data: any) => {
        this.mensajes = data.mensajes || data;
        this.cargando = false;
        setTimeout(() => this.scrollAbajo(), 100);
        this.chatService.marcarLeidos(this.matchId).subscribe();
      },
      error: () => { this.cargando = false; }
    });
  }

  enviar() {
    if (!this.nuevoMensaje.trim() || !this.otroUsuario) return;
    this.enviando = true;

    this.chatService.enviarMensaje(
      this.otroUsuario._id,
      this.nuevoMensaje.trim(),
      this.matchId
    ).subscribe({
      next: (data: any) => {
        this.mensajes.push(data.mensaje || data);
        this.nuevoMensaje = '';
        this.enviando = false;
        setTimeout(() => this.scrollAbajo(), 100);
      },
      error: () => { this.enviando = false; }
    });
  }

  enviarEmoji(emoji: string) {
    this.nuevoMensaje = emoji;
    this.enviar();
  }

  esMio(mensaje: any): boolean {
    const deId = mensaje.de?._id || mensaje.de;
    return deId === this.usuarioActual?._id;
  }

  esUltimoDeSuGrupo(index: number): boolean {
    if (index === this.mensajes.length - 1) return true;
    const actual = this.mensajes[index];
    const siguiente = this.mensajes[index + 1];
    const actualId = actual.de?._id || actual.de;
    const siguienteId = siguiente.de?._id || siguiente.de;
    return actualId !== siguienteId;
  }

  scrollAbajo() {
    if (this.chatContent) {
      this.chatContent.scrollToBottom(300);
    }
  }

  toggleAcciones(mensaje: any, event: Event) {
    event.stopPropagation();
    if (this.accionesAbiertas === mensaje._id) {
      this.accionesAbiertas = null;
    } else {
      this.accionesAbiertas = mensaje._id;
    }
  }

  cerrarMenu() {
    this.accionesAbiertas = null;
  }

  iniciarEdicion(mensaje: any) {
    this.mensajeEditando = mensaje;
    this.textoEditando = mensaje.texto;
    this.accionesAbiertas = null;
    setTimeout(() => {
      const input = document.querySelector('.edit-input') as HTMLInputElement;
      if (input) input.focus();
    }, 100);
  }

  cancelarEdicion() {
    this.mensajeEditando = null;
    this.textoEditando = '';
  }

  guardarEdicion() {
    if (!this.mensajeEditando || !this.textoEditando.trim()) return;

    this.chatService.editarMensaje(
      this.mensajeEditando._id,
      this.textoEditando.trim()
    ).subscribe({
      next: (data: any) => {
        const msg = data.mensaje || data;
        const index = this.mensajes.findIndex(m => m._id === msg._id);
        if (index !== -1) {
          this.mensajes[index] = msg;
          this.mensajes = [...this.mensajes];
        }
        this.cancelarEdicion();
      }
    });
  }

  async confirmarEliminar(mensaje: any) {
    this.accionesAbiertas = null;
    const alert = await this.alertCtrl.create({
      header: 'Eliminar mensaje',
      message: '¿Estás seguro?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.chatService.eliminarMensaje(mensaje._id).subscribe({
              next: () => {
                this.mensajes = this.mensajes.filter(m => m._id !== mensaje._id);
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async iniciarGrabacion() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);
      this.grabando = true;
      this.tiempoGrabacion = 0;

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };

      this.mediaRecorder.start();

      this.timerGrabacion = setInterval(() => {
        this.tiempoGrabacion++;
        if (this.tiempoGrabacion >= 60) this.detenerGrabacion();
      }, 1000);

    } catch (err) {
      const toast = await this.toastCtrl.create({
        message: 'No se pudo acceder al micrófono',
        duration: 2000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  }

  detenerGrabacion() {
    if (!this.mediaRecorder || !this.grabando) return;
    clearInterval(this.timerGrabacion);

    this.mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      this.grabando = false;
      await this.subirYEnviarAudio(audioBlob);
      this.mediaRecorder?.stream.getTracks().forEach(t => t.stop());
    };

    this.mediaRecorder.stop();
  }

  cancelarAudio() {
    if (!this.mediaRecorder) return;
    clearInterval(this.timerGrabacion);
    this.mediaRecorder.stream.getTracks().forEach(t => t.stop());
    this.grabando = false;
    this.audioChunks = [];
    this.tiempoGrabacion = 0;
  }

  async subirYEnviarAudio(blob: Blob) {
    const token = this.authService.obtenerToken();
    if (!token || !this.otroUsuario) return;

    const formData = new FormData();
    formData.append('file', blob, `audio-${Date.now()}.webm`);

    try {
      const res: any = await this.http.post(
        environment.apiUrl + '/uploads/audio',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      ).toPromise();

      if (res?.url) {
        this.chatService.enviarMensaje(
          this.otroUsuario._id,
          '🎤 Audio',
          this.matchId,
          res.url,
          this.formatTiempo(this.tiempoGrabacion)
        ).subscribe({
          next: (data: any) => {
            this.mensajes.push(data.mensaje || data);
            setTimeout(() => this.scrollAbajo(), 100);
          }
        });
      }
    } catch (err) {
      console.error('Error subiendo audio:', err);
    }
  }

  toggleAudio(mensaje: any) {
    if (this.audioActual === mensaje._id) {
      this.audioElement?.pause();
      this.audioActual = null;
      return;
    }

    if (this.audioElement) this.audioElement.pause();

    this.audioActual = mensaje._id;
    this.audioElement = new Audio(mensaje.audioUrl);
    this.audioElement.play();

    this.audioElement.ontimeupdate = () => {
      if (this.audioElement) {
        this.audioProgreso = (this.audioElement.currentTime / this.audioElement.duration) * 100;
      }
    };

    this.audioElement.onended = () => {
      this.audioActual = null;
      this.audioProgreso = 0;
    };
  }

  formatTiempo(segundos: number): string {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  iniciarVideo() {
    const sala = `kino-casting-${this.matchId}`;
    const nombre = encodeURIComponent(this.usuarioActual?.nombre || 'Usuario');
    const url = `https://meet.jit.si/${sala}#userInfo.displayName="${nombre}"&config.prejoinPageEnabled=false`;

    this.videollamadaActiva = false;
    window.open(url, '_blank');

    if (this.otroUsuario) {
      this.chatService.enviarMensaje(
        this.otroUsuario._id,
        `📹 Videollamada iniciada. Pulsa el icono de cámara para unirte.`,
        this.matchId
      ).subscribe({
        next: (data: any) => {
          this.mensajes.push(data.mensaje || data);
          setTimeout(() => this.scrollAbajo(), 100);
        }
      });
    }
  }

  cerrarVideo() {
    this.videollamadaActiva = false;
  }

  toggleSelectorFondo() {
    this.mostrarSelectorFondoChat = !this.mostrarSelectorFondoChat;
  }

  seleccionarFondoChat(fondo: any) {
    this.fondoChatActual = { ...fondo };
    localStorage.setItem(`chat_fondo_${this.matchId}`, String(fondo.id));
    this.mostrarSelectorFondoChat = false;
  }

  verPerfil() {
    if (!this.otroUsuario?._id) return;
    this.router.navigate(['/user-profile', this.otroUsuario._id]);
  }

  seleccionarImagen() {
    if (this.imgInput?.nativeElement) {
      this.imgInput.nativeElement.click();
    }
  }

  async onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    input.value = '';

    if (!this.otroUsuario) return;

    const token = this.authService.obtenerToken();
    if (!token) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res: any = await this.http.post(
        environment.apiUrl + '/uploads/foto',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      ).toPromise();

      if (res?.url) {
        this.chatService.enviarMensaje(
          this.otroUsuario._id,
          '📷 Imagen',
          this.matchId,
          undefined,
          undefined,
          res.url
        ).subscribe({
          next: (data: any) => {
            this.mensajes.push(data.mensaje || data);
            setTimeout(() => this.scrollAbajo(), 100);
          },
          error: async () => {
            const toast = await this.toastCtrl.create({
              message: 'Error al enviar la imagen',
              duration: 2000,
              color: 'danger',
              position: 'top'
            });
            await toast.present();
          }
        });
      }
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      const toast = await this.toastCtrl.create({
        message: 'Error al subir la imagen',
        duration: 2000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }
  }

  volver() { window.history.back(); }

  abrirImagen(url: string) {
    window.open(url, '_blank');
  }

  getInitial(nombre?: string): string {
    return nombre ? nombre.charAt(0).toUpperCase() : '?';
  }

  esUltimoLeidoPorOtro(mensaje: any, index: number): boolean {
    if (!this.esMio(mensaje)) return false;
    if (!mensaje.leido) return false;
    for (let i = index + 1; i < this.mensajes.length; i++) {
      if (this.esMio(this.mensajes[i]) && this.mensajes[i].leido) {
        return false;
      }
    }
    return true;
  }

  getImgUrl(path: string): string {
    if (!path) return '';
    return this.serverUrl + '/' + path;
  }
}

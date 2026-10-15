import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar,
  IonButtons, IonButton, IonIcon, IonSpinner, IonTitle
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline, chatbubblesOutline, searchOutline,
  createOutline, closeCircleOutline, filmOutline, micOutline,
  chevronDownOutline, chevronForwardOutline,
  star, starOutline, chatbubble, chatbubbleOutline
} from 'ionicons/icons';
import { ChatService } from '../../services/chat';
import { AuthService } from '../../services/auth';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-mis-chats',
  templateUrl: './mis-chats.page.html',
  styleUrls: ['./mis-chats.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar,
    IonButtons, IonButton, IonIcon, IonSpinner, IonTitle
  ]
})
export class MisChatsPage implements OnInit, OnDestroy {
  private readonly chatService = inject(ChatService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly serverUrl = environment.apiUrl.replace('/api/kino', '');

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  chats: any[] = [];
  grupos: GrupoChat[] = [];
  gruposFiltrados: GrupoChat[] = [];
  cargando = true;
  usuarioActual: any = null;
  mostrarBusqueda = false;
  busqueda = '';
  filtroActivo: 'todos' | 'favoritos' | 'noleidos' = 'todos';

  private slideActivo: { [id: string]: number } = {};
  private carruselIntervals: { [id: string]: any } = {};

  constructor() {
    addIcons({
      chevronBackOutline, chatbubblesOutline, searchOutline,
      createOutline, closeCircleOutline, filmOutline, micOutline,
      chevronDownOutline, chevronForwardOutline,
      star, starOutline, chatbubble, chatbubbleOutline
    });
  }

  ngOnInit() {
    this.usuarioActual = this.authService.obtenerUser();
    this.cargarChats();
  }

  ionViewWillEnter() {
    this.cargarChats();
  }

  cargarChats() {
    this.cargando = true;
    this.chatService.getMisChats().subscribe({
      next: (data: any) => {
        const mensajes = data.chats || data;
        const mapaChats: { [key: string]: any } = {};

        // 1) Agrupar mensajes por matchId
        mensajes.forEach((msg: any) => {
          const matchId = msg.matchId?._id || msg.matchId;
          if (!matchId) return;

          if (!mapaChats[matchId]) {
            mapaChats[matchId] = {
              matchId,
              ultimoMensaje: msg,
              noLeidos: 0,
              scriptTitulo: msg.matchId?.script?.titulo || 'Casting',
              script: msg.matchId?.script,
              otroUsuario: this.resolverOtroUsuario(msg)
            };
          } else {
            if (new Date(msg.createdAt) > new Date(mapaChats[matchId].ultimoMensaje.createdAt)) {
              mapaChats[matchId].ultimoMensaje = msg;
            }
          }

          const deId = msg.de?._id || msg.de;
          if (deId !== this.usuarioActual?._id && !msg.leido) {
            mapaChats[matchId].noLeidos++;
          }
        });

        this.chats = Object.values(mapaChats).sort((a: any, b: any) =>
          new Date(b.ultimoMensaje.createdAt).getTime() -
          new Date(a.ultimoMensaje.createdAt).getTime()
        );

        // 2) Agrupar chats por persona (otro usuario)
        this.grupos = this.agruparPorPersona(this.chats);
        this.gruposFiltrados = [...this.grupos];
        this.cargando = false;
        this.iniciarCarruseles();
      },
      error: () => { this.cargando = false; }
    });
  }

  agruparPorPersona(chats: any[]): GrupoChat[] {
    const mapa: { [userId: string]: GrupoChat } = {};

    // Cargar favoritos de localStorage
    const favsStr = localStorage.getItem(`kino_favs_chats_${this.usuarioActual?._id}`);
    const favIds: string[] = favsStr ? JSON.parse(favsStr) : [];

    chats.forEach(chat => {
      chat.favorito = favIds.includes(chat.matchId);

      const otro = chat.otroUsuario;
      const userId = otro?._id || otro || 'desconocido';

      if (!mapa[userId]) {
        mapa[userId] = {
          userId,
          persona: otro,
          chats: [],
          expandido: false,
          noLeidosTotal: 0
        };
      }
      mapa[userId].chats.push(chat);
      mapa[userId].noLeidosTotal += chat.noLeidos || 0;
    });

    const grupos = Object.values(mapa).sort((a, b) => {
      const fechaA = new Date(a.chats[0].ultimoMensaje.createdAt).getTime();
      const fechaB = new Date(b.chats[0].ultimoMensaje.createdAt).getTime();
      return fechaB - fechaA;
    });

    // Si solo hay un casting, expandir por defecto
    grupos.forEach(g => { if (g.chats.length === 1) g.expandido = true; });

    return grupos;
  }

  toggleGrupo(grupo: GrupoChat) {
    if (grupo.chats.length <= 1) return;
    grupo.expandido = !grupo.expandido;
  }

  toggleChatFavorito(chat: any, event: Event) {
    event.stopPropagation();
    chat.favorito = !chat.favorito;
    
    // Guardar en localStorage
    let favsStr = localStorage.getItem(`kino_favs_chats_${this.usuarioActual?._id}`);
    let favIds: string[] = favsStr ? JSON.parse(favsStr) : [];
    
    if (chat.favorito) {
      if (!favIds.includes(chat.matchId)) favIds.push(chat.matchId);
    } else {
      favIds = favIds.filter(id => id !== chat.matchId);
    }
    localStorage.setItem(`kino_favs_chats_${this.usuarioActual?._id}`, JSON.stringify(favIds));
    
    // Si estamos en la pestaña de favoritos, recargar filtro
    if (this.filtroActivo === 'favoritos') {
      this.filtrarChats();
    }
  }

  setFiltro(filtro: 'todos' | 'favoritos' | 'noleidos') {
    this.filtroActivo = filtro;
    this.filtrarChats();
  }

  filtrarChats() {
    const q = this.busqueda.toLowerCase();
    
    this.gruposFiltrados = this.grupos
      .map(g => ({
        ...g,
        expandido: (q || this.filtroActivo === 'noleidos' || this.filtroActivo === 'favoritos') ? true : g.expandido,
        chats: g.chats.filter((c: any) => {
          // Filtros de pestaña por chat
          if (this.filtroActivo === 'noleidos' && c.noLeidos === 0) return false;
          if (this.filtroActivo === 'favoritos' && !c.favorito) return false;

          if (!q) return true;
          return c.otroUsuario?.nombre?.toLowerCase().includes(q) ||
                 c.scriptTitulo?.toLowerCase().includes(q) ||
                 c.ultimoMensaje?.texto?.toLowerCase().includes(q);
        })
      }))
      .filter(g => {
        // Que tenga chats que hayan pasado todos los filtros
        return g.chats.length > 0;
      });
  }

  toggleBusqueda() {
    this.mostrarBusqueda = !this.mostrarBusqueda;
    if (this.mostrarBusqueda) {
      setTimeout(() => this.searchInput?.nativeElement?.focus(), 350);
    } else {
      this.busqueda = '';
      this.gruposFiltrados = [...this.grupos];
    }
  }

  limpiarBusqueda() {
    this.busqueda = '';
    this.gruposFiltrados = [...this.grupos];
  }

  resolverOtroUsuario(msg: any): any {
    const miId = this.usuarioActual?._id?.toString();
    const deId = (msg.de?._id || msg.de)?.toString();

    // Si yo soy quien envió el mensaje, el otro es "para"
    // Si otro envió el mensaje, el otro es "de"
    if (deId === miId) {
      return msg.para?._id ? msg.para : { _id: (msg.para?._id || msg.para), nombre: 'Usuario' };
    }
    return msg.de?._id ? msg.de : { _id: deId, nombre: 'Usuario' };
  }

  getOtroUsuario(chat: any): any {
    return chat.otroUsuario;
  }

  esMioElUltimo(chat: any): boolean {
    const deId = (chat.ultimoMensaje?.de?._id || chat.ultimoMensaje?.de)?.toString();
    return deId === this.usuarioActual?._id?.toString();
  }

  get totalNoLeidos(): number {
    return this.grupos.reduce((total, g) => total + g.noLeidosTotal, 0);
  }

  formatHora(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    const ahora = new Date();
    const diffMs = ahora.getTime() - date.getTime();
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDias === 0) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDias === 1) {
      return 'Ayer';
    } else if (diffDias < 7) {
      return date.toLocaleDateString('es-ES', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
  }

  abrirChat(chat: any) {
    this.router.navigate(['/chat', chat.matchId]);
  }

  volver() { window.history.back(); }

  getInitial(nombre?: string): string {
    return nombre ? nombre.charAt(0).toUpperCase() : '?';
  }

  getImgUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return this.serverUrl + '/' + path;
  }

  // ── CARRUSEL ──────────────────────────────────────────────
  getImagenes(chat: any): string[] {
    const urls: string[] = chat.script?.imagenesUrls?.filter((u: string) => !!u) || [];
    if (urls.length === 0 && chat.script?.imagenUrl) urls.push(chat.script.imagenUrl);
    return urls;
  }

  getSlideActivo(id: string): number {
    return this.slideActivo[id] || 0;
  }

  private iniciarCarruseles() {
    this.detenerCarruseles();
    this.chats.forEach(chat => {
      const imgs = this.getImagenes(chat);
      if (imgs.length > 1) {
        this.slideActivo[chat.matchId] = 0;
        this.carruselIntervals[chat.matchId] = setInterval(() => {
          this.slideActivo[chat.matchId] = (this.slideActivo[chat.matchId] + 1) % imgs.length;
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
}

export interface GrupoChat {
  userId: string;
  persona: any;
  chats: any[];
  expandido: boolean;
  noLeidosTotal: number;
  favorito?: boolean;
}

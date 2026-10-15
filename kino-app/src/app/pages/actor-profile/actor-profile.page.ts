import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonIcon, IonButtons, IonButton,
  ActionSheetController, AlertController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  createOutline, locationOutline, cameraOutline,
  addOutline, playCircleOutline, imageOutline,
  linkOutline, filmOutline, chevronForwardOutline,
  colorPaletteOutline, checkmarkOutline, logOutOutline,
  videocamOutline, eyeOutline, trashOutline, closeOutline, pencilOutline, chatbubblesOutline,
  bookmark, bookmarkOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth';
import { UsersService } from '../../services/users';
import { MatchesService } from '../../services/matches';
import { UploadsService } from '../../services/uploads';
import {environment} from "../../../environments/environment";

// ← FUERA DE LA CLASE para que esté disponible antes de la instancia
const FONDOS = [
  { id: 1, css: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)', img: null, label: 'Negro' },
  { id: 2, img: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80', css: '', label: 'Cine' },
  { id: 3, img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80', css: '', label: 'Pelicula' },
  { id: 4, img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80', css: '', label: 'Teatro' },
  { id: 5, img: 'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=800&q=80', css: '', label: 'Escenario' },
  { id: 6, img: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800&q=80', css: '', label: 'Luces' },
  { id: 7, img: 'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=800&q=80', css: '', label: 'Concierto' },
  { id: 8, img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80', css: '', label: 'Fiesta Luces' }
];

function getFondoFromStorage(): any {
  try {
    const id = parseInt(localStorage.getItem('actor_fondo_id') || '1', 10);
    return { ...(FONDOS.find(f => f.id === id) || FONDOS[0]) };
  } catch {
    return { ...FONDOS[0] };
  }
}

@Component({
  selector: 'app-actor-profile',
  templateUrl: './actor-profile.page.html',
  styleUrls: ['./actor-profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonIcon, IonButtons, IonButton
  ]
})
export class ActorProfilePage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly matchesService = inject(MatchesService);
  private readonly uploadsService = inject(UploadsService);
  private readonly router = inject(Router);
  private readonly actionSheetCtrl = inject(ActionSheetController);
  private readonly alertCtrl = inject(AlertController);

  private readonly serverUrl = environment.apiUrl.replace('/api/kino', '');

  user: any = null;
  guardados: any[] = [];
  perfilesGuardados: any[] = [];
  totalApps = 0;
  totalReels = 0;
  totalFotos = 0;
  mostrarSelectorFondo = false;
  mostrarPickerMedia = false;

  @ViewChild('inputVideo') inputVideoRef!: ElementRef<HTMLInputElement>;
  @ViewChild('inputFoto')  inputFotoRef!: ElementRef<HTMLInputElement>;

  // Referencia a la constante para usar en el template
  fondosDisponibles = FONDOS;

  // Se inicializa leyendo localStorage ANTES del primer render
  fondoActual = getFondoFromStorage();

  constructor() {
    addIcons({
      createOutline, locationOutline, cameraOutline,
      addOutline, playCircleOutline, imageOutline,
      linkOutline, filmOutline, chevronForwardOutline,
      colorPaletteOutline, checkmarkOutline, logOutOutline,
      videocamOutline, eyeOutline, trashOutline, closeOutline, pencilOutline, chatbubblesOutline,
      bookmark, bookmarkOutline
    });
  }

  ngOnInit() {
    this.cargarPerfil();
  }

  ionViewWillEnter() {
    this.cargarPerfil();
  }

  seleccionarFondo(fondo: any) {
    this.fondoActual = { ...fondo };
    localStorage.setItem('actor_fondo_id', String(fondo.id));
    this.mostrarSelectorFondo = false;
  }

  cargarPerfil() {
    this.user = this.authService.obtenerUser();
    this.calcularPortfolioStats();
    this.cargarGuardados();
    this.cargarTotalApps();
    this.cargarPerfilesGuardados();
  }

  calcularPortfolioStats() {
    if (!this.user?.portfolio) return;
    this.totalReels = this.user.portfolio.filter(
      (p: any) => p.tipo === 'video' || p.tipo === 'link'
    ).length;
    this.totalFotos = this.user.portfolio.filter(
      (p: any) => p.tipo === 'foto'
    ).length;
  }

  cargarGuardados() {
    const token = this.authService.obtenerToken();
    if (!token) return;
    this.usersService.getGuardados(token).subscribe({
      next: (data: any) => {
        this.guardados = data.scripts || data;
      }
    });
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

  cargarTotalApps() {
    this.matchesService.getMatchesPorActor().subscribe({
      next: (data: any) => {
        const matches = data.matches || data;
        this.totalApps = matches.length;
      }
    });
  }

  irAEditar() {
    this.router.navigate(['/actor-edit-profile']);
  }

  irAChats() {
    this.router.navigate(['/mis-chats']);
  }

  verDetalleCasting(id: string) {
    this.router.navigate(['/script-detail', id]);
  }

  verPerfilGuardado(id: string) {
    this.router.navigate(['/user-profile', id]);
  }

  async gestionarPortfolioItem(item: any, index: number) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: item.titulo || 'Gestionar Media',
      buttons: [
        {
          text: 'Ver / Abrir',
          icon: 'eye-outline',
          handler: () => {
            if (item.url) window.open(item.url, '_blank');
          }
        },
        {
          text: 'Editar Título',
          icon: 'pencil-outline',
          handler: () => {
            this.editarTituloMedia(item, index);
          }
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          icon: 'trash-outline',
          handler: () => {
            this.confirmarEliminarMedia(index);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async confirmarEliminarMedia(index: number) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar media',
      message: '¿Estás seguro de que quieres eliminar este archivo de tu portfolio?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.user.portfolio.splice(index, 1);
            this.calcularPortfolioStats();
            this.guardarPerfil();
          }
        }
      ]
    });
    await alert.present();
  }

  async editarTituloMedia(item: any, index: number) {
    const alert = await this.alertCtrl.create({
      header: 'Editar Título',
      inputs: [
        {
          name: 'titulo',
          type: 'text',
          value: item.titulo,
          placeholder: 'Título (Ej. Monólogo Dramático)'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.titulo && data.titulo.trim() !== '') {
              this.user.portfolio[index].titulo = data.titulo.trim();
              this.guardarPerfil();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  guardarPerfil() {
    const token = this.authService.obtenerToken();
    if (token) {
      this.usersService.updateProfile(this.user._id, { portfolio: this.user.portfolio }, token).subscribe({
        next: () => {
          this.authService.guardarSesion(token, this.user);
        },
        error: (err) => console.error('Error actualizando perfil', err)
      });
    }
  }

  elegirMedia(tipo: 'video' | 'foto') {
    this.mostrarPickerMedia = false;
    // Pequeño timeout para que el overlay desaparezca antes de abrir el selector
    setTimeout(() => {
      if (tipo === 'video') {
        this.inputVideoRef?.nativeElement?.click();
      } else {
        this.inputFotoRef?.nativeElement?.click();
      }
    }, 200);
  }

  onArchivoSeleccionado(event: Event, tipo: 'video' | 'foto') {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const uploadObs = tipo === 'video' 
      ? this.uploadsService.subirVideo(file)
      : this.uploadsService.subirFoto(file);

    uploadObs.subscribe({
      next: (res) => {
        if (res.status && res.url) {
          const nuevoItem = {
            tipo,
            titulo: file.name,
            url: res.url
          };

          if (!this.user.portfolio) this.user.portfolio = [];
          this.user.portfolio.push(nuevoItem);
          this.calcularPortfolioStats();

          const token = this.authService.obtenerToken();
          if (token) {
            this.usersService.updateProfile(this.user._id, { portfolio: this.user.portfolio }, token).subscribe({
              next: () => {
                this.authService.guardarSesion(token, this.user);
              },
              error: (err) => console.error('Error actualizando perfil', err)
            });
          }
        }
        input.value = '';
      },
      error: (err) => {
        console.error('Error al subir archivo', err);
        input.value = '';
      }
    });
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

  getInitial(nombre?: string): string {
    return nombre ? nombre.charAt(0).toUpperCase() : '?';
  }

  getGeneros(genero: string): string[] {
    if (!genero) return [];
    return genero.split(/[,\/]/).map((g: string) => g.trim()).filter(Boolean);
  }

  getImgUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${this.serverUrl}/${cleanPath}`;
  }
}

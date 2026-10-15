import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButtons, IonButton, IonIcon, IonSpinner, IonFooter,
  ToastController, AlertController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  closeOutline, cameraOutline, locationOutline,
  addOutline, playOutline, imageOutline, linkOutline,
  trashOutline, chevronDownOutline, filmOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth';
import { UsersService } from '../../services/users';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-actor-edit-profile',
  templateUrl: './actor-edit-profile.page.html',
  styleUrls: ['./actor-edit-profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, TitleCasePipe,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonButton, IonIcon, IonSpinner, IonFooter
  ]
})
export class ActorEditProfilePage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly toastCtrl = inject(ToastController);
  private readonly alertCtrl = inject(AlertController);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  fotoPreview: string | null = null;
  archivoFoto: File | null = null;
  guardando = false;

  private readonly serverUrl = environment.apiUrl.replace('/api/kino', '');

  generosDisponibles = [
    'Ciencia Ficción', 'Acción', 'Thriller', 'Drama',
    'Comedia', 'Terror', 'Romance', 'Fantasía', 'Misterio'
  ];

  form = {
    nombre: '',
    edad: null as number | null,
    altura: '',
    ciudad: '',
    idiomas: '',
    unionStatus: '',
    bio: '',
    generos: [] as string[],
    portfolio: [] as { tipo: string; url: string; titulo?: string }[],
    links: [] as string[]
  };

  constructor() {
    addIcons({
      closeOutline, cameraOutline, locationOutline,
      addOutline, playOutline, imageOutline, linkOutline,
      trashOutline, chevronDownOutline, filmOutline
    });
  }

  ngOnInit() {
    const user = this.authService.obtenerUser();
    if (user) {
      this.form.nombre = user.nombre || '';
      this.form.edad = user.edad ?? null;
      this.form.altura = user.altura || '';
      this.form.ciudad = user.ciudad || '';
      this.form.idiomas = user.idiomas || '';
      this.form.unionStatus = user.unionStatus || '';
      this.form.bio = user.bio || '';
      this.form.generos = user.generos ? [...user.generos] : [];
      this.form.portfolio = user.portfolio ? [...user.portfolio] : [];
      this.form.links = user.links ? [...user.links] : [];

      if (user.foto) {
        this.fotoPreview = this.serverUrl + '/' + user.foto;
      }
    }
  }

  cambiarFoto() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.archivoFoto = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.fotoPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  toggleGenero(genero: string) {
    if (this.form.generos.includes(genero)) {
      this.form.generos = this.form.generos.filter(g => g !== genero);
    } else {
      if (this.form.generos.length < 8) {
        this.form.generos.push(genero);
      }
    }
  }

  async agregarGenero() {
    const alert = await this.alertCtrl.create({
      header: 'Nuevo género',
      inputs: [{ name: 'genero', type: 'text', placeholder: 'Ej: Western' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Añadir',
          handler: (data) => {
            const g = data.genero?.trim();
            if (g && !this.generosDisponibles.includes(g)) {
              this.generosDisponibles.push(g);
              this.form.generos.push(g);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async agregarMedia() {
    const alert = await this.alertCtrl.create({
      header: 'Añadir media',
      inputs: [
        { name: 'titulo', type: 'text', placeholder: 'Título (ej. Demo reel 2024)' },
        { name: 'url', type: 'url', placeholder: 'https://vimeo.com/...' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Añadir',
          handler: (data) => {
            if (data.url?.trim()) {
              this.form.portfolio.push({
                tipo: 'link',
                url: data.url.trim(),
                titulo: data.titulo?.trim() || data.url.trim()
              });
            }
          }
        }
      ]
    });
    await alert.present();
  }

  quitarMedia(index: number) {
    this.form.portfolio.splice(index, 1);
  }

  agregarLink() {
    this.form.links.push('');
  }

  quitarLink(index: number) {
    this.form.links.splice(index, 1);
  }

  async guardar() {
    this.guardando = true;
    const token = this.authService.obtenerToken();
    const user = this.authService.obtenerUser();
    if (!token || !user) return;

    try {
      if (this.archivoFoto) {
        const formData = new FormData();
        formData.append('file', this.archivoFoto);
        const resUpload: any = await this.http
          .post(environment.apiUrl + '/uploads/foto', formData, {
            headers: { Authorization: `Bearer ${token}` }
          }).toPromise();

        if (resUpload?.url) {
          await this.usersService.updateProfile(user._id, {
            foto: resUpload.url.replace(this.serverUrl + '/', '')
          }, token).toPromise();
        }
      }

      const datos = {
        nombre: this.form.nombre,
        edad: this.form.edad,
        altura: this.form.altura,
        ciudad: this.form.ciudad,
        idiomas: this.form.idiomas,
        unionStatus: this.form.unionStatus,
        bio: this.form.bio,
        generos: this.form.generos,
        portfolio: this.form.portfolio,
        links: this.form.links.filter(l => l.trim())
      };

      this.usersService.updateProfile(user._id, datos, token).subscribe({
        next: async (res: any) => {
          const userActualizado = res.user || res;
          this.authService.guardarSesion(token, userActualizado);
          this.guardando = false;
          const toast = await this.toastCtrl.create({
            message: '¡Perfil actualizado!',
            duration: 2000,
            color: 'success',
            position: 'top'
          });
          await toast.present();
          this.router.navigate(['/tabs-actor/profile']);
        },
        error: () => { this.guardando = false; }
      });

    } catch {
      this.guardando = false;
    }
  }

  cancelar() {
    this.router.navigate(['/tabs-actor/profile']);
  }

  getInitial(): string {
    return this.form.nombre ? this.form.nombre.charAt(0).toUpperCase() : '?';
  }
}

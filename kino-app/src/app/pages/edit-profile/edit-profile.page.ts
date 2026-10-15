import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonToast,
  IonSpinner
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth';
import { UsersService } from '../../services/users';
import { UploadsService } from '../../services/uploads';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  closeOutline,
  personOutline,
  calendarOutline,
  briefcaseOutline,
  locationOutline,
  mailOutline,
  alertCircleOutline,
  informationCircleOutline,
  bulbOutline,
  warningOutline,
  cameraOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonToast,
    IonSpinner
  ]
})
export class EditProfilePage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly uploadsService = inject(UploadsService);
  private readonly router = inject(Router);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private userId = '';
  fotoPreview: string | null = null;
  archivoFoto: File | null = null;
  emailInvalido = false;
  mostrarToast = false;
  guardando = false;

  private readonly serverUrl = environment.apiUrl.replace('/api/kino', '');

  perfil = {
    nombre: '',
    edad: null as number | null,
    agencia: '',
    ciudad: '',
    acercaDeMi: '',
    emailContacto: ''
  };

  constructor() {
    addIcons({
      closeOutline,
      personOutline,
      calendarOutline,
      briefcaseOutline,
      locationOutline,
      mailOutline,
      alertCircleOutline,
      informationCircleOutline,
      bulbOutline,
      warningOutline,
      cameraOutline
    });
  }

  ngOnInit() {
    const user = this.authService.obtenerUser();
    if (user) {
      this.userId = user._id || '';
      this.perfil.nombre = user.nombre || '';
      this.perfil.edad = user.edad ?? null;
      this.perfil.emailContacto = user.email || '';
      this.perfil.acercaDeMi = user.bio || '';
      this.perfil.agencia = user.agencia || '';
      this.perfil.ciudad = user.ciudad || '';
      if (user.foto) {
        this.fotoPreview = this.serverUrl + '/' + user.foto;
      }
    }
  }

  guardarCambios() {
    this.emailInvalido = false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.perfil.emailContacto && !emailRegex.test(this.perfil.emailContacto)) {
      this.emailInvalido = true;
      return;
    }

    const token = this.authService.obtenerToken();
    if (!token || !this.userId) {
      this.router.navigate(['/tabs-director/perfil']);
      return;
    }

    this.guardando = true;

    const realizarUpdate = (fotoUrl?: string) => {
      const data: any = {
        nombre: this.perfil.nombre,
        bio: this.perfil.acercaDeMi,
        edad: this.perfil.edad,
        agencia: this.perfil.agencia,
        ciudad: this.perfil.ciudad,
        emailContacto: this.perfil.emailContacto
      };

      if (fotoUrl) {
        data.foto = fotoUrl.replace(this.serverUrl + '/', '');
      }

      this.usersService.updateProfile(this.userId, data, token).subscribe({
        next: (res: any) => {
          const userActualizado = res.user || res;
          this.authService.guardarSesion(token, userActualizado);
          this.mostrarToast = true;
          this.guardando = false;
          setTimeout(() => {
            this.router.navigate(['/tabs-director/perfil']);
          }, 1500);
        },
        error: () => {
          this.guardando = false;
          this.router.navigate(['/tabs-director/perfil']);
        }
      });
    };

    if (this.archivoFoto) {
      this.uploadsService.subirFoto(this.archivoFoto).subscribe({
        next: (res: any) => {
          realizarUpdate(res.url);
        },
        error: () => {
          realizarUpdate();
        }
      });
    } else {
      realizarUpdate();
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

  cancelar() {
    this.router.navigate(['/tabs-director/perfil']);
  }

  getInitial(): string {
    return this.perfil.nombre ? this.perfil.nombre.charAt(0).toUpperCase() : '?';
  }
}

import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButtons, IonButton, IonIcon, IonSpinner, IonFooter
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline, addOutline, cameraOutline,
  alertCircleOutline, chevronDownOutline
} from 'ionicons/icons';
import { AuthService } from '../../../services/auth';
import { UsersService } from '../../../services/users';
import { UploadsService } from '../../../services/uploads';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-profile-setup-step1',
  templateUrl: './step1.page.html',
  styleUrls: ['./step1.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonButton, IonIcon, IonSpinner, IonFooter
  ]
})
export class Step1Page implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly uploadsService = inject(UploadsService);
  private readonly router = inject(Router);

  private readonly serverUrl = environment.apiUrl.replace('/api/kino', '');

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  fotoPreview: string | null = null;
  archivoFoto: File | null = null;
  guardando = false;
  mostrarError = false;

  focusNombre = false;
  focusEdad = false;
  focusBio = false;

  form = {
    nombre: '',
    edad: null as number | null,
    unionStatus: '',
    bio: ''
  };

  constructor() {
    addIcons({
      chevronBackOutline, addOutline, cameraOutline,
      alertCircleOutline, chevronDownOutline
    });
  }

  ngOnInit() {
    const user = this.authService.obtenerUser();
    if (user) {
      this.form.nombre = user.nombre || '';
      this.form.edad = user.edad ?? null;
      this.form.bio = user.bio || '';
      this.form.unionStatus = user.unionStatus || '';
      if (user.foto) {
        this.fotoPreview = this.serverUrl + '/' + user.foto;
      }
    }
  }

  cambiarFoto() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.archivoFoto = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.fotoPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  esValido(): boolean {
    return !!(
      this.form.nombre.trim() &&
      this.form.edad &&
      this.form.edad >= 16 &&
      this.form.unionStatus &&
      this.form.bio.trim()
    );
  }

  async siguiente() {
    this.mostrarError = false;

    if (!this.esValido()) {
      this.mostrarError = true;
      return;
    }

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
          })
          .toPromise();

        if (resUpload?.url) {
          await this.usersService.updateProfile(user._id, {
            foto: resUpload.url.replace(this.serverUrl + '/', '')
          }, token).toPromise();
        }
      }

      this.usersService.updateProfile(user._id, {
        nombre: this.form.nombre,
        edad: this.form.edad,
        bio: this.form.bio,
        unionStatus: this.form.unionStatus
      }, token).subscribe({
        next: (res: any) => {
          const userActualizado = res.user || res;
          this.authService.guardarSesion(token, userActualizado);
          this.guardando = false;
          this.router.navigate(['/actor-onboarding/step2']);
        },
        error: () => { this.guardando = false; }
      });

    } catch {
      this.guardando = false;
    }
  }

  saltar() {
    this.router.navigate(['/tabs/inicio']);
  }

  volver() {
    this.router.navigate(['/register']);
  }
}

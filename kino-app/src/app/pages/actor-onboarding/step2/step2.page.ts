import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButtons, IonButton, IonIcon, IonSpinner, IonFooter,
  AlertController, ToastController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline, chevronForwardOutline, alertCircleOutline,
  playOutline, cloudUploadOutline, imageOutline,
  linkOutline, closeOutline, checkmarkOutline
} from 'ionicons/icons';
import { AuthService } from '../../../services/auth';
import { UsersService } from '../../../services/users';

@Component({
  selector: 'app-profile-setup-step2',
  templateUrl: './step2.page.html',
  styleUrls: ['/step2.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, TitleCasePipe,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonButton, IonIcon, IonSpinner, IonFooter
  ]
})
export class Step2Page implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('fotoInput') fotoInput!: ElementRef<HTMLInputElement>;

  guardando = false;
  mostrarError = false;

  generosDisponibles = [
    'Sci-Fi', 'Action', 'Thriller', 'Drama',
    'Comedy', 'Horror', 'Romance', 'Fantasy'
  ];
  generosSeleccionados: string[] = [];

  portfolioItems: { tipo: 'video' | 'foto' | 'link'; url: string; titulo?: string }[] = [];

  constructor() {
    addIcons({
      chevronBackOutline, chevronForwardOutline, alertCircleOutline,
      playOutline, cloudUploadOutline, imageOutline,
      linkOutline, closeOutline, checkmarkOutline
    });
  }

  ngOnInit() {
    const user = this.authService.obtenerUser();
    if (user?.generos) {
      this.generosSeleccionados = [...user.generos];
    }
  }

  toggleGenero(genero: string) {
    if (this.generosSeleccionados.includes(genero)) {
      this.generosSeleccionados = this.generosSeleccionados.filter(g => g !== genero);
    } else {
      this.generosSeleccionados.push(genero);
    }
  }

  async addLink() {
    const alert = await this.alertCtrl.create({
      header: 'Add Reel Link',
      inputs: [
        { name: 'titulo', type: 'text', placeholder: 'Title (e.g. Action Reel 2024)' },
        { name: 'url', type: 'url', placeholder: 'https://vimeo.com/...' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add',
          handler: (data) => {
            if (data.url?.trim()) {
              this.portfolioItems.push({
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

  seleccionarArchivo() {
    this.fileInput.nativeElement.click();
  }

  seleccionarFoto() {
    this.fotoInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const tipo = file.type.startsWith('video') ? 'video' : 'foto';
    this.portfolioItems.push({ tipo, url: file.name, titulo: file.name });
  }

  onFotoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.portfolioItems.push({ tipo: 'foto', url: file.name, titulo: file.name });
  }

  quitarItem(index: number) {
    this.portfolioItems.splice(index, 1);
  }

  async finalizar() {
    this.mostrarError = false;

    if (this.generosSeleccionados.length === 0) {
      this.mostrarError = true;
      return;
    }

    this.guardando = true;
    const token = this.authService.obtenerToken();
    const user = this.authService.obtenerUser();
    if (!token || !user) return;

    this.usersService.updateProfile(user._id, {
      generos: this.generosSeleccionados,
      onboardingCompleto: true
    }, token).subscribe({
      next: (res: any) => {
        const userActualizado = res.user || res;
        this.authService.guardarSesion(token, userActualizado);
        this.guardando = false;
        this.router.navigate(['/tabs-actor/home'], { replaceUrl: true });
      },
      error: () => {
        this.guardando = false;
      }
    });
  }

  volver() {
    this.router.navigate(['/profile-setup-step1']);
  }

  saltar() {
    this.router.navigate(['/tabs-actor/home'], { replaceUrl: true });
  }
}

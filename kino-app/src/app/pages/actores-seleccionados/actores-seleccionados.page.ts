import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonIcon, IonSpinner, IonButtons, IonButton,
  ToastController, AlertController, ActionSheetController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline, filmOutline, locationOutline,
  personOutline, trashOutline, peopleOutline, addOutline,
  calendarOutline, starOutline, radioButtonOnOutline,
  ellipsisHorizontalOutline, checkmarkCircleOutline,
  chatbubbleOutline, searchOutline, shareOutline,
  closeOutline, checkmarkOutline, timeOutline,
  documentTextOutline, downloadOutline, megaphoneOutline
} from 'ionicons/icons';
import { SeleccionesService } from '../../services/selecciones';
import { MatchesService } from '../../services/matches';
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-actores-seleccionados',
  templateUrl: './actores-seleccionados.page.html',
  styleUrls: ['./actores-seleccionados.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonIcon, IonSpinner, IonButtons, IonButton
  ]
})
export class ActoresSeleccionadosPage implements OnInit {
  private readonly seleccionesService = inject(SeleccionesService);
  private readonly matchesService = inject(MatchesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastCtrl = inject(ToastController);
  private readonly alertCtrl = inject(AlertController);
  private readonly actionSheetCtrl = inject(ActionSheetController);
  private readonly serverUrl = environment.apiUrl.replace('/api/kino', '');

  scriptId = '';
  scriptTitulo = '';
  actores: any[] = [];
  matches: any[] = [];
  cargando = false;

  // Modal callback
  mostrarModalCallback = false;
  actorSeleccionado: any = null;
  guardandoCallback = false;
  callbackForm = {
    fecha: '',
    hora: '',
    notas: ''
  };

  get hoyString(): string {
    return new Date().toISOString().split('T')[0];
  }

  constructor() {
    addIcons({
      chevronBackOutline, filmOutline, locationOutline,
      personOutline, trashOutline, peopleOutline, addOutline,
      calendarOutline, starOutline, radioButtonOnOutline,
      ellipsisHorizontalOutline, checkmarkCircleOutline,
      chatbubbleOutline, searchOutline, shareOutline,
      closeOutline, checkmarkOutline, timeOutline,
      documentTextOutline, downloadOutline, megaphoneOutline
    });
  }

  ngOnInit(): void {
    this.scriptId = this.route.snapshot.paramMap.get('scriptId') || '';
    this.scriptTitulo = this.route.snapshot.queryParamMap.get('titulo') || 'Casting';
    this.cargarActores();
    this.cargarMatches();
  }

  cargarActores(): void {
    this.cargando = true;
    this.seleccionesService.getByScript(this.scriptId).subscribe({
      next: (data: any) => {
        this.actores = (data.selecciones || data).map((s: any) => s.actor || s);
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  cargarMatches(): void {
    this.matchesService.getMatchesPorGuionista().subscribe({
      next: (data: any) => {
        const todos = data.matches || data;
        this.matches = todos.filter((m: any) =>
          m.script?._id === this.scriptId || m.script === this.scriptId
        );
      }
    });
  }

  getMatchDeActor(actorId: string): any {
    return this.matches.find((m: any) =>
      m.actor?._id === actorId || m.actor === actorId
    );
  }

  abrirModalCallback(actor: any, event: Event) {
    event.stopPropagation();
    this.actorSeleccionado = actor;

    const match = this.getMatchDeActor(actor._id);
    if (match?.fechaCallback) {
      this.callbackForm.fecha = new Date(match.fechaCallback).toISOString().split('T')[0];
      this.callbackForm.hora = match.horaCallback || '';
      this.callbackForm.notas = match.notasCallback || '';
    } else {
      this.callbackForm = { fecha: '', hora: '', notas: '' };
    }

    this.mostrarModalCallback = true;
  }

  cerrarModalCallback() {
    this.mostrarModalCallback = false;
    this.actorSeleccionado = null;
    this.callbackForm = { fecha: '', hora: '', notas: '' };
  }

  async guardarCallback() {
    if (!this.callbackForm.fecha || !this.callbackForm.hora) return;

    const match = this.getMatchDeActor(this.actorSeleccionado._id);
    if (!match) {
      const toast = await this.toastCtrl.create({
        message: 'No se encontró el match del actor',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
      return;
    }

    this.guardandoCallback = true;

    this.matchesService.setCallback(
      match._id,
      this.callbackForm.fecha,
      this.callbackForm.hora,
      this.callbackForm.notas
    ).subscribe({
      next: async (res: any) => {
        const matchActualizado = res.match || res;

        // Actualizamos el match en local
        const index = this.matches.findIndex(m => m._id === match._id);
        if (index !== -1) {
          this.matches[index] = {
            ...this.matches[index],
            fechaCallback: matchActualizado.fechaCallback,
            horaCallback: matchActualizado.horaCallback,
            notasCallback: matchActualizado.notasCallback
          };
        }

        this.guardandoCallback = false;
        this.cerrarModalCallback();

        const toast = await this.toastCtrl.create({
          message: `✅ Callback programado para ${this.actorSeleccionado?.nombre}`,
          duration: 2500,
          color: 'success',
          position: 'top'
        });
        await toast.present();
      },
      error: async () => {
        this.guardandoCallback = false;
        const toast = await this.toastCtrl.create({
          message: 'Error al programar el callback',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  irAlChat(actorId: string, event: Event) {
    event.stopPropagation();
    this.matchesService.getMatchesPorGuionista().subscribe({
      next: (data: any) => {
        const matches = data.matches || data;
        const match = matches.find((m: any) =>
          (m.actor?._id === actorId || m.actor === actorId) &&
          (m.script?._id === this.scriptId || m.script === this.scriptId)
        );
        if (match) {
          this.router.navigate(['/chat', match._id]);
        }
      }
    });
  }

  getProgressPercentage(): number {
    const maxActores = 15;
    return Math.min(Math.round((this.actores.length / maxActores) * 100), 100);
  }

  async quitarActor(actorId: string, event?: Event): Promise<void> {
    if (event) event.stopPropagation();

    const alert = await this.alertCtrl.create({
      header: 'Quitar actor',
      message: '¿Estás seguro de que quieres quitar este actor del elenco?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Quitar',
          role: 'destructive',
          handler: () => {
            this.seleccionesService.rechazarActor(actorId).subscribe({
              next: async () => {
                this.actores = this.actores.filter(a => a._id !== actorId);
                this.matches = this.matches.filter(m =>
                  m.actor?._id !== actorId && m.actor !== actorId
                );
                const toast = await this.toastCtrl.create({
                  message: 'Actor eliminado del elenco',
                  duration: 2000,
                  color: 'success'
                });
                await toast.present();
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  buscarMasActores(): void {
    this.router.navigate(['/buscar']);
  }

  verDetallesCasting(): void {
    this.router.navigate(['/script-detail', this.scriptId]);
  }

  async abrirOpciones() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones del Elenco',
      buttons: [
        {
          text: 'Contactar al Elenco',
          icon: 'megaphone-outline',
          handler: () => {
            this.contactarElenco();
          }
        },
        {
          text: 'Exportar Lista',
          icon: 'download-outline',
          handler: () => {
            this.exportarLista();
          }
        },
        {
          text: 'Vaciar Elenco',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            this.vaciarElenco();
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async contactarElenco() {
    if (this.actores.length === 0) {
      const toast = await this.toastCtrl.create({
        message: 'No hay actores en el elenco para contactar.',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Mensaje Masivo',
      subHeader: `Se notificará a ${this.actores.length} actores seleccionados`,
      message: 'Redacta el mensaje que recibirán todos los miembros de este elenco. Se enviará de forma individual a sus chats.',
      inputs: [
        {
          name: 'mensaje',
          type: 'textarea',
          placeholder: 'Ej: ¡Bienvenidos al proyecto! Adjunto el plan de rodaje y los horarios...',
          attributes: {
            rows: 5
          }
        }
      ],
      buttons: [
        { 
          text: 'Cancelar', 
          role: 'cancel',
          handler: async () => {
            const toast = await this.toastCtrl.create({
              message: 'Se ha cancelado el envío del mensaje.',
              duration: 2500,
              color: 'danger',
              icon: 'close-outline',
              position: 'top'
            });
            await toast.present();
          }
        },
        {
          text: 'Enviar Mensaje',
          handler: async (data) => {
            if (!data.mensaje?.trim()) {
              const toast = await this.toastCtrl.create({
                message: 'No puedes enviar un mensaje vacío.',
                duration: 2000,
                color: 'warning'
              });
              await toast.present();
              return false; // Evita que se cierre el alert
            }
            // Lógica de enviar el mensaje a cada match (Simulada para la demo)
            const toast = await this.toastCtrl.create({
              message: `¡Mensaje enviado a ${this.actores.length} actores correctamente!`,
              duration: 3500,
              color: 'warning',
              icon: 'megaphone-outline',
              position: 'top'
            });
            await toast.present();
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async exportarLista() {
    if (this.actores.length === 0) {
      const toast = await this.toastCtrl.create({
        message: 'No hay actores para exportar.',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    let texto = `ELENCO: ${this.scriptTitulo.toUpperCase()}\n`;
    texto += `===================================\n\n`;
    this.actores.forEach((a, index) => {
      texto += `${index + 1}. ${a.nombre || 'Actor'} \n   📍 ${a.ciudad || 'Sin ubicación'}\n`;
      if (a.bio) texto += `   📝 ${a.bio.substring(0, 50)}...\n`;
      texto += '\n';
    });
    
    const alert = await this.alertCtrl.create({
      header: 'Lista Exportada',
      message: 'Aquí tienes un resumen en texto del elenco. Puedes copiarlo para compartir.',
      inputs: [
        {
          name: 'lista',
          type: 'textarea',
          value: texto,
          attributes: {
            readonly: true,
            rows: 10
          }
        }
      ],
      buttons: [
        {
          text: 'Copiar Portapapeles',
          handler: async (data) => {
            navigator.clipboard.writeText(data.lista);
            const toast = await this.toastCtrl.create({
              message: 'Lista copiada al portapapeles',
              duration: 2000,
              color: 'success',
              icon: 'checkmark-circle-outline'
            });
            await toast.present();
          }
        },
        { text: 'Cerrar', role: 'cancel' }
      ]
    });
    await alert.present();
  }

  async vaciarElenco() {
    if (this.actores.length === 0) {
      const toast = await this.toastCtrl.create({
        message: 'El elenco ya está vacío.',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Vaciar Elenco',
      message: '¿Estás seguro de que quieres quitar a TODOS los actores seleccionados? Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Vaciar',
          role: 'destructive',
          handler: async () => {
             // Realizamos el borrado llamando al backend por cada actor
             const promesas = this.actores.map(actor => {
                return new Promise(resolve => {
                  this.seleccionesService.rechazarActor(actor._id).subscribe({
                    next: resolve,
                    error: resolve // Si falla alguno, continua
                  });
                });
             });

             await Promise.all(promesas);

             this.actores = [];
             this.matches = [];
             
             const toast = await this.toastCtrl.create({
               message: 'El elenco ha sido vaciado.',
               duration: 2000,
               color: 'success'
             });
             await toast.present();
          }
        }
      ]
    });
    await alert.present();
  }

  verPerfil(actorId: string) {
    this.router.navigate(['/user-profile', actorId]);
  }

  volver(): void {
    window.history.back();
  }

  getInitial(nombre?: string): string {
    return nombre ? nombre.charAt(0).toUpperCase() : '?';
  }

  getImgUrl(path: string): string {
    if (!path) return '';
    return this.serverUrl + '/' + path;
  }
}

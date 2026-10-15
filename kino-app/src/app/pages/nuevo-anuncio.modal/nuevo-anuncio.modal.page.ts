import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonIcon, IonSpinner, IonButtons, IonButton, IonFooter,
  ModalController, ToastController, AlertController, NavParams
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline, ellipsisVerticalOutline, imageOutline, imagesOutline,
  createOutline, addOutline, peopleOutline, locationOutline,
  filmOutline, personOutline, megaphoneOutline, checkmarkCircleOutline,
  documentTextOutline, documentAttachOutline, closeCircleOutline, globeOutline,
  chevronDownOutline, searchOutline
} from 'ionicons/icons';
import { ScriptsService } from '../../services/scripts';
import { AuthService } from '../../services/auth';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-nuevo-anuncio',
  templateUrl: './nuevo-anuncio.modal.page.html',
  styleUrls: ['./nuevo-anuncio.modal.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonIcon, IonSpinner, IonButtons, IonButton, IonFooter
  ]
})
export class NuevoAnuncioModal implements OnInit {
  private readonly scriptsService = inject(ScriptsService);
  private readonly authService = inject(AuthService);
  private readonly modalCtrl = inject(ModalController);
  private readonly toastCtrl = inject(ToastController);
  private readonly alertCtrl = inject(AlertController);
  private readonly http = inject(HttpClient);
  private readonly navParams = inject(NavParams);

  usuarioNombre = '';
  guardando = false;
  nuevoRequisito = '';
  nombrePdf = '';
  archivoPdfParaSubir: any = null;

  generosDisponibles = ['Drama', 'Ciencia Ficcion', 'Thriller', 'Acción', 'Comedia', 'Horror'];
  generosSeleccionados: string[] = [];

  form = {
    titulo: '',
    sinopsis: '',
    edadMin: null as number | null,
    edadMax: null as number | null,
    ubicacion: '',
    imagenUrl: '',
    imagenesUrls: [] as string[],
    pdfUrl: '',
    contacto: '',
    publico: false,
    requisitos: [] as string[]
  };

  paisSeleccionado = '';
  paises: any[] = [];
  estados: any[] = [];
  cargandoPaises = false;
  cargandoEstados = false;
  idiomaUbicacion: 'es' | 'en' = 'es';
  dropdownPaisAbierto = false;
  dropdownEstadoAbierto = false;
  filtroPais = '';

  nuevaImagenUrl = '';
  readonly MAX_IMAGENES = 5;

  constructor() {
    addIcons({
      closeOutline, ellipsisVerticalOutline, imageOutline, imagesOutline,
      createOutline, addOutline, peopleOutline, locationOutline,
      filmOutline, personOutline, megaphoneOutline, checkmarkCircleOutline,
      documentTextOutline, documentAttachOutline, closeCircleOutline, globeOutline,
      chevronDownOutline, searchOutline
    });
  }

  ngOnInit() {
    const user = this.authService.obtenerUser();
    this.usuarioNombre = user?.nombre || 'KINO Casting';

    const modoEdit = this.navParams.get('modoEdicion');
    const datos = this.navParams.get('datosGuion');

    if (modoEdit && datos) {
      this.form.titulo    = datos.titulo    || '';
      this.form.sinopsis  = datos.sinopsis  || '';
      this.form.edadMin   = datos.edadMin   ?? null;
      this.form.edadMax   = datos.edadMax   ?? null;
      this.form.ubicacion = datos.ubicacion || '';
      this.form.imagenUrl = datos.imagenUrl || '';

      const urlsExistentes = datos.imagenesUrls?.filter((u: string) => !!u) || [];
      if (urlsExistentes.length === 0 && datos.imagenUrl) {
        this.form.imagenesUrls = [datos.imagenUrl];
      } else {
        this.form.imagenesUrls = urlsExistentes;
      }

      this.form.pdfUrl     = datos.pdfUrl     || '';
      this.form.requisitos = datos.requisitos || [];

      if (datos.genero) {
        this.generosSeleccionados = datos.genero
          .split(',')
          .map((g: string) => g.trim())
          .filter(Boolean);
      }

      if (datos.pdfUrl) {
        this.nombrePdf = 'PDF existente';
        this.archivoPdfParaSubir = 'existente';
      }
    }

    this.cargarPaises();
  }

  // ── PAÍSES Y ESTADOS ─────────────────────────────────────

  cargarPaises() {
    this.cargandoPaises = true;
    fetch('https://restcountries.com/v3.1/all?fields=name,translations,cca2')
      .then(r => r.json())
      .then(res => {
        this.paises = res
          .map((c: any) => ({
            nameEs: c.translations?.spa?.common || c.name.common,
            nameEn: c.name.common,
            cca2: c.cca2.toLowerCase()
          }))
          .sort((a: any, b: any) => a.nameEs.localeCompare(b.nameEs, 'es'));
        this.cargandoPaises = false;
      })
      .catch(() => {
        this.cargandoPaises = false;
        this.toastCtrl.create({
          message: 'No se pudieron cargar los países',
          duration: 2000,
          color: 'warning'
        }).then(t => t.present());
      });
  }

  getPaisesFiltrados(): any[] {
    if (!this.filtroPais.trim()) return this.paises;
    const q = this.filtroPais.toLowerCase();
    return this.paises.filter((p: any) =>
      p.nameEs.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q)
    );
  }

  seleccionarPais(p: any) {
    this.paisSeleccionado = p.nameEs;
    this.dropdownPaisAbierto = false;
    this.filtroPais = '';
    this.onPaisChange(p.nameEs);
  }

  seleccionarEstado(estado: any) {
    this.form.ubicacion = estado.nameEn;
    this.dropdownEstadoAbierto = false;
  }

  getPaisCca2(nameEs: string): string {
    return this.paises.find((p: any) => p.nameEs === nameEs)?.cca2 || '';
  }

  getPaisNameEn(nameEs: string): string {
    return this.paises.find((p: any) => p.nameEs === nameEs)?.nameEn || nameEs;
  }

  onPaisChange(paisEs: string) {
    this.form.ubicacion = '';
    this.estados = [];
    if (!paisEs) return;

    const paisObj = this.paises.find((p: any) => p.nameEs === paisEs);
    const paisEnIngles = paisObj?.nameEn || paisEs;

    this.cargandoEstados = true;
    fetch('https://countriesnow.space/api/v0.1/countries/states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: paisEnIngles })
    })
      .then(r => r.json())
      .then(async res => {
        const estadosEn: any[] = res.data?.states || [];

        // Dividir en lotes de máx 400 chars para MyMemory
        const nombres = estadosEn.map((e: any) => e.name);
        const lotes: string[][] = [];
        let loteActual: string[] = [];
        let charCount = 0;

        for (const nombre of nombres) {
          if (charCount + nombre.length + 1 > 400 && loteActual.length > 0) {
            lotes.push(loteActual);
            loteActual = [];
            charCount = 0;
          }
          loteActual.push(nombre);
          charCount += nombre.length + 1;
        }
        if (loteActual.length > 0) lotes.push(loteActual);

        // Traducir cada lote
        const traducidos: string[] = [];
        for (const lote of lotes) {
          try {
            const query = lote.join('\n');
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=en|es`;
            const resp = await fetch(url);
            const data = await resp.json();
            const traducciones = (data.responseData?.translatedText || '').split('\n');
            traducidos.push(...traducciones);
          } catch {
            traducidos.push(...lote);
          }
        }

        this.estados = estadosEn.map((e: any, i: number) => ({
          nameEn: e.name,
          nameEs: traducidos[i]?.trim() || e.name
        }));

        this.cargandoEstados = false;
      })
      .catch(() => {
        this.cargandoEstados = false;
        this.toastCtrl.create({
          message: 'No se pudieron cargar los estados',
          duration: 2000,
          color: 'warning'
        }).then(t => t.present());
      });
  }

  // ── IMÁGENES ─────────────────────────────────────────────

  agregarImagenUrl() {
    const url = this.nuevaImagenUrl.trim();
    if (!url) return;
    if (this.form.imagenesUrls.length >= this.MAX_IMAGENES) return;
    if (!this.form.imagenesUrls.includes(url)) {
      this.form.imagenesUrls.push(url);
      if (!this.form.imagenUrl) this.form.imagenUrl = url;
    }
    this.nuevaImagenUrl = '';
  }

  quitarImagenUrl(index: number) {
    this.form.imagenesUrls.splice(index, 1);
    this.form.imagenUrl = this.form.imagenesUrls[0] || '';
  }

  // ── GÉNEROS ──────────────────────────────────────────────

  toggleGenero(genero: string) {
    if (this.generosSeleccionados.includes(genero)) {
      this.generosSeleccionados = this.generosSeleccionados.filter(g => g !== genero);
    } else {
      this.generosSeleccionados.push(genero);
    }
  }

  async agregarGeneroCustom() {
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
              this.generosSeleccionados.push(g);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async pedirImagenUrl() {
    const alert = await this.alertCtrl.create({
      header: 'URL de la imagen',
      inputs: [{ name: 'url', type: 'url', placeholder: 'https://...', value: this.form.imagenUrl }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Aplicar',
          handler: (data) => { this.form.imagenUrl = data.url?.trim() || ''; }
        }
      ]
    });
    await alert.present();
  }

  // ── PDF ───────────────────────────────────────────────────

  seleccionarPdf() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = (e: any) => {
      const archivo = e.target.files[0];
      if (archivo) {
        this.nombrePdf = archivo.name;
        this.archivoPdfParaSubir = archivo;
        this.form.pdfUrl = 'seleccionado';
      }
    };
    input.click();
  }

  quitarPdf() {
    this.form.pdfUrl = '';
    this.nombrePdf = '';
    this.archivoPdfParaSubir = null;
  }

  private subirPdfAlBackend(): Promise<string> {
    return new Promise((resolve, reject) => {
      const token = this.authService.obtenerToken();
      const formData = new FormData();
      formData.append('file', this.archivoPdfParaSubir);
      this.http.post(environment.apiUrl + '/uploads/pdf', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).subscribe({
        next: (res: any) => { resolve(res.url); },
        error: (err) => { reject(err); }
      });
    });
  }

  // ── PUBLICAR ─────────────────────────────────────────────

  async publicar() {
    if (!this.form.titulo.trim()) return;

    const estaEditando = this.navParams.get('modoEdicion');
    const datosGuion   = this.navParams.get('datosGuion');

    if (!estaEditando && !this.archivoPdfParaSubir) {
      this.toastCtrl.create({
        message: 'Debes adjuntar el PDF del guion',
        duration: 2000,
        color: 'danger'
      }).then(t => t.present());
      return;
    }

    this.guardando = true;

    try {
      let pdfUrlFinal = this.form.pdfUrl;
      if (this.archivoPdfParaSubir && this.archivoPdfParaSubir !== 'existente' && this.form.pdfUrl === 'seleccionado') {
        pdfUrlFinal = await this.subirPdfAlBackend();
      }

      const datosAGuardar = {
        titulo:       this.form.titulo,
        sinopsis:     this.form.sinopsis,
        genero:       this.generosSeleccionados.join(', '),
        edadMin:      this.form.edadMin,
        edadMax:      this.form.edadMax,
        ubicacion:    this.form.ubicacion,
        imagenUrl:    this.form.imagenesUrls[0] || this.form.imagenUrl,
        imagenesUrls: this.form.imagenesUrls,
        pdfUrl:       pdfUrlFinal,
        requisitos:   this.form.requisitos
      };

      const token = this.authService.obtenerToken();
      let peticion;

      if (estaEditando && datosGuion?._id) {
        peticion = this.http.patch(
          `${environment.apiUrl}/scripts/${datosGuion._id}`,
          datosAGuardar,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      } else {
        peticion = this.http.post(
          environment.apiUrl + '/scripts',
          datosAGuardar,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      }

      peticion.subscribe({
        next: (res: any) => {
          this.guardando = false;
          this.modalCtrl.dismiss(res, 'ok');
        },
        error: () => {
          this.guardando = false;
          this.toastCtrl.create({
            message: 'Error al guardar.',
            duration: 2000,
            color: 'danger'
          }).then(t => t.present());
        }
      });

    } catch (error) {
      this.guardando = false;
      this.toastCtrl.create({
        message: 'Error al subir el PDF.',
        duration: 2000,
        color: 'danger'
      }).then(t => t.present());
    }
  }

  // ── OTROS ────────────────────────────────────────────────

  cerrar() {
    this.modalCtrl.dismiss({ creado: false });
  }

  agregarRequisito() {
    const req = this.nuevoRequisito.trim();
    if (!req) return;
    this.form.requisitos.push(req);
    this.nuevoRequisito = '';
  }

  quitarRequisito(index: number) {
    this.form.requisitos.splice(index, 1);
  }
}

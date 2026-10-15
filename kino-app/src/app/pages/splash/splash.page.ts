import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent]
})
export class SplashPage implements OnInit {
  progreso = 0;
  mensajeCarga = '';

  private readonly mensajes = [
    'Cargando experiencia...',
    'Preparando castings...',
    'Conectando actores...',
    'Casi listo...'
  ];

  constructor(private readonly router: Router) {}

  ngOnInit() {
    this.iniciarCarga();
  }

  iniciarCarga() {
    const duracionTotal = 3000;
    const intervalo = 50;
    const incremento = 100 / (duracionTotal / intervalo);
    let mensajeIndex = 0;

    this.mensajeCarga = this.mensajes[0];

    const timer = setInterval(() => {
      this.progreso += incremento;

      const nuevoIndex = Math.floor((this.progreso / 100) * this.mensajes.length);
      if (nuevoIndex !== mensajeIndex && nuevoIndex < this.mensajes.length) {
        mensajeIndex = nuevoIndex;
        this.mensajeCarga = this.mensajes[mensajeIndex];
      }

      if (this.progreso >= 100) {
        this.progreso = 100;
        clearInterval(timer);
        setTimeout(() => {
          this.router.navigate(['/login'], { replaceUrl: true });
        }, 300);
      }
    }, intervalo);
  }
}

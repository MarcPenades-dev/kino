import { Component, inject, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonSpinner
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonSpinner
  ]
})
export class RegisterPage implements AfterViewInit, OnDestroy {

  @ViewChild('starsCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly authService: AuthService = inject(AuthService);
  private readonly router: Router = inject(Router);

  nombre: string = '';
  email: string = '';
  password: string = '';
  rol: string = 'actor';
  codigoGuionista: string = '';
  error: string = '';
  cargando: boolean = false;

  private ctx!: CanvasRenderingContext2D;
  private animationId!: number;
  private stars: any[] = [];

  ngAfterViewInit() {
    this.initCanvas();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
  }

  initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.ctx = canvas.getContext('2d')!;

    this.stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.5,
      speedY: Math.random() * 0.4 + 0.1,
      speedX: Math.random() * 0.2 - 0.1,
      opacity: Math.random() * 0.5 + 0.3,
      twinkle: Math.random() * Math.PI * 2
    }));

    this.animate();
  }

  animate() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.stars.forEach(star => {
      star.twinkle += 0.02;
      const opacity = star.opacity + Math.sin(star.twinkle) * 0.2;

      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      this.ctx.fill();

      star.y += star.speedY;
      star.x += star.speedX;

      if (star.y > canvas.height) {
        star.y = 0;
        star.x = Math.random() * canvas.width;
      }
      if (star.x < 0) star.x = canvas.width;
      if (star.x > canvas.width) star.x = 0;
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  register() {
    this.cargando = true;
    this.error = '';

    const data: any = {
      nombre: this.nombre,
      email: this.email,
      password: this.password,
      rol: this.rol
    };

    if (this.rol === 'guionista') {
      data.codigoGuionista = this.codigoGuionista;
    }

    this.authService.register(data).subscribe({
      next: data => {
        this.authService.guardarSesion(data.token, data.user);
        this.cargando = false;
        if (data.user.rol === 'actor') {
          this.router.navigate(['/actor-onboarding/step1']);
        } else {
          this.router.navigate(['/tabs-director/inicio']);
        }
      },
      error: err => {
        this.error = err.error?.message || 'Error al registrarse';
        this.cargando = false;
      }
    });
  }

  irALogin() {
    this.router.navigate(['/login']);
  }
}

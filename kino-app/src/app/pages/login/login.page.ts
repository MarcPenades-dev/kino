import { Component, inject, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonSpinner
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonSpinner
  ]
})
export class LoginPage implements AfterViewInit, OnDestroy {

  @ViewChild('starsCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly authService: AuthService = inject(AuthService);
  private readonly router: Router = inject(Router);

  email: string = '';
  password: string = '';
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

  login() {
    this.cargando = true;
    this.error = '';
    this.authService.login(this.email, this.password).subscribe({
      next: data => {
        this.cargando = false;
        this.authService.guardarSesion(data.token, data.user);
        if (data.user.rol === 'actor') {
          this.router.navigate(['/tabs-actor/home']);
        } else {
          this.router.navigate(['/tabs-director/inicio']);
        }
      },
      error: err => {
        this.error = 'Email o contraseña incorrectos';
        this.cargando = false;
        console.log(err);
      }
    });
  }

  irARegistro() {
    this.router.navigate(['/register']);
  }
}

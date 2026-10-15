<p align="center">
  <img src="kino-app/src/assets/logo-kino.jpeg" alt="KINO" width="120">
</p>

<h1 align="center">KINO</h1>

<p align="center">
  <strong>App móvil de gestión de castings que conecta a directores y guionistas con actores.</strong><br>
  <em>«Kino» significa «cine» en alemán.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Ionic-3880FF?style=flat&logo=ionic&logoColor=white" alt="Ionic">
  <img src="https://img.shields.io/badge/Angular_20-DD0031?style=flat&logo=angular&logoColor=white" alt="Angular">
  <img src="https://img.shields.io/badge/Capacitor-119EFF?style=flat&logo=capacitor&logoColor=white" alt="Capacitor">
  <img src="https://img.shields.io/badge/NestJS_11-E0234E?style=flat&logo=nestjs&logoColor=white" alt="NestJS">
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white" alt="JWT">
</p>

---

## El problema

En los castings, el contacto entre quien busca actores y quien se presenta suele ir por WhatsApp, correo y hojas de cálculo: mensajes perdidos, audiciones sin confirmar y ningún sitio donde ver el estado de cada candidatura.

**KINO** centraliza todo el proceso en una sola app: publicar el casting, recibir candidaturas, seleccionar, convocar a callback y hablar con el actor, sin salir de la aplicación.

> Proyecto final del CFGS en Desarrollo de Aplicaciones Multiplataforma (DigitechFP, 2026).

## Funcionalidades

**Para directores y guionistas**
- Publicar castings con guion en PDF, sinopsis, género, rango de edad, ubicación, imágenes y requisitos.
- Buscar actores y guardarlos en una lista de seleccionados.
- Revisar candidaturas y aceptarlas o rechazarlas.
- Programar callbacks con fecha, hora y notas, y ver las convocatorias en un calendario.

**Para actores**
- Onboarding guiado y perfil profesional: foto, bio, edad, altura, idiomas, agencia, géneros y portfolio.
- Feed de castings públicos, con detalle del guion y comentarios.
- Postularse a un casting y seguir el estado de cada candidatura (pendiente, aceptada o rechazada).
- Confirmar disponibilidad para los callbacks y consultarlos en su calendario.

**Comunes**
- Chat por cada candidatura aceptada, con mensajes de texto, **notas de voz** e imágenes, edición, borrado y estado de leído.
- Panel de notificaciones.
- Registro e inicio de sesión con **JWT** y control de acceso por rol (`actor` / `guionista`).

## Arquitectura

```
┌─────────────────────┐   HTTP + JWT   ┌──────────────────────┐   Mongoose   ┌───────────┐
│  kino-app           │ ─────────────► │  kino-api            │ ───────────► │  MongoDB  │
│  Ionic + Angular 20 │                │  NestJS 11 (REST)    │              └───────────┘
│  Capacitor (Android)│ ◄───────────── │  /api/kino/*         │
└─────────────────────┘     JSON       │  /uploads (estáticos)│ ← fotos, PDFs y audios (Multer)
                                       └──────────────────────┘
```

| Módulo de la API | Responsabilidad |
|---|---|
| `auth` | Registro, login, estrategia JWT y guard de roles |
| `users` | Perfiles, búsqueda de actores y actores guardados |
| `scripts` | Castings: CRUD, feed público, guardados y comentarios |
| `matches` | Candidaturas, aceptación o rechazo, callbacks y disponibilidad |
| `selecciones` | Listas de actores seleccionados por cada director |
| `chat` | Conversaciones por candidatura: texto, audio, imágenes y leídos |
| `uploads` | Subida de fotos, guiones en PDF y notas de voz |

## Estructura del repositorio

```
kino/
├── kino-api/   # Backend NestJS + MongoDB
└── kino-app/   # App Ionic + Angular + Capacitor
```

## Cómo ejecutarlo

**Requisitos:** Node.js 20 o superior, MongoDB (local o Atlas) y, para el móvil, Android Studio.

### 1. API

```bash
cd kino-api
npm install
cp .env.example .env      # rellena URL (MongoDB) y JWT_SECRET
npm run start:dev         # http://localhost:3000/api/kino
```

### 2. App

```bash
cd kino-app
npm install
npx ionic serve           # en el navegador
```

La URL de la API se configura en `src/environments/environment.ts`. Para probar en un móvil físico, usa la IP local del ordenador donde corre la API.

**Android:**

```bash
npx ionic build
npx cap add android       # solo la primera vez
npx cap sync android
npx cap open android
```

## Autor

**Marc Penadés Roig** · Full Stack Developer
[GitHub](https://github.com/MarcPenades-dev) · [LinkedIn](https://www.linkedin.com/in/marcpenades)

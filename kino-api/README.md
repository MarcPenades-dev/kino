# kino-api

API REST de [KINO](../README.md), construida con NestJS 11 y MongoDB (Mongoose).

```bash
npm install
cp .env.example .env      # URL de MongoDB y JWT_SECRET
npm run start:dev         # http://localhost:3000/api/kino
```

| Variable | Descripción |
|---|---|
| `URL` | Cadena de conexión a MongoDB |
| `JWT_SECRET` | Clave para firmar los tokens de sesión |

Los archivos subidos (fotos, PDFs y audios) se guardan en `uploads/` y se sirven en `/uploads`.

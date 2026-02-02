# Cocliper API

API en TypeScript para comprimir y optimizar videos (mp4/webm) para compartir en plataformas como Discord o WhatsApp.

## Requisitos
- Node.js 20+
- ffmpeg instalado (el Dockerfile ya lo incluye)

## Variables de entorno
Copia `.env.example` a `.env` y ajusta valores.

- `API_KEY_HASH` (requerida): clave usada para autenticar solicitudes.
- `PORT` (opcional): puerto HTTP. Por defecto `3000`.
- `MAX_FILE_SIZE` (opcional): tamaño máximo en bytes. Por defecto 4 GB.

## Endpoints

### `POST /api/optimize`
- Header: `x-api-key: <API_KEY_HASH>`
- Form-data: `video` (archivo mp4 o webm, hasta 4 GB)
- Respuesta: video optimizado en formato mp4.

## Desarrollo

- `npm run dev` inicia el servidor con recarga.
- `npm run build` compila a `dist/`.
- `npm start` ejecuta el build.

## Docker (Coolify)
Usa el `Dockerfile` incluido para build y deploy.

# Cocliper API

A TypeScript API for compressing and optimizing videos (mp4/webm) for sharing on messaging platforms like Discord or WhatsApp.

## Requirements
- Node.js 20+
- ffmpeg installed (included in Docker and Nixpacks)

## Environment Variables
Copy `.env.example` to `.env` and adjust the values.

- `API_KEY_HASH` (required): API key used to authenticate requests.
- `PORT` (optional): HTTP port. Default is `3000`.
- `MAX_FILE_SIZE` (optional): maximum file size in bytes. Default is 10 GB.

## Endpoints

### `POST /api/optimize`
- Header: `x-api-key: <API_KEY_HASH>`
- Form-data: `video` (mp4, webm, avi, or mov file, up to 10 GB)
- Response: optimized video in mp4 format.

## Development

- `npm run dev` starts the server with auto-reload.
- `npm run build` compiles TypeScript to `dist/`.
- `npm start` runs the compiled build.

## Docker (Coolify)
Use the included `Dockerfile` for build and deployment.

## Nixpacks (Railway, Render, Fly.io)
Use `nixpacks.toml` for deployments with Nixpacks. The configuration includes:
- Node.js 20
- ffmpeg (for video optimization)
- Automatic build and start scripts

Example with Railway:
```bash
railway link
```

Or simply push to your repository and Railway/Render will automatically detect `nixpacks.toml`.

```

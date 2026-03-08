# BidsConnect Frontend

Vue 3 + Vite frontend for the BidsConnect procurement and tender management platform.

## Prerequisites

- Node.js 20+
- npm

## Project Setup

```sh
npm install
```

Copy environment variables and configure for your environment:

```sh
cp .env.example .env
# Edit .env with your API URL and app settings
```

## Development

```sh
npm run dev
```

Runs at http://localhost:5173 with API proxy to the backend.

## Production Build

```sh
npm run build
```

Output is in `dist/`. Serve with any static file server or use `npm run preview` to test locally.

## Deployment

### Option 1: Static hosting (Vercel, Netlify, S3, etc.)

1. Set build command: `npm run build`
2. Set output directory: `dist`
3. Configure environment variables from `.env.example` in the host's dashboard
4. For SPA routing, ensure the server serves `index.html` for all routes (most platforms do this by default)

### Option 2: PM2 (Node server)

1. Build: `npm run build`
2. Start: `pm2 start ecosystem.config.cjs`
3. App runs at http://localhost:4173

### Option 3: Nginx / Apache

1. Build: `npm run build`
2. Copy `dist/` contents to your web root
3. Add SPA fallback (e.g. Nginx: `try_files $uri $uri/ /index.html`)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (e.g. `https://bidsconnect.co.tz/api/v1/`) |
| `VITE_APP_URL` | Frontend base URL |
| `VITE_APP_NAME` | Application name |
| `NODE_ENV` | `development` or `production` |

See `.env.example` for all options.

## IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur).

# Perf Lab Web

A lightweight React web app for exploring training prescriptions and a simple “digital twin” of human performance. The app talks to a FastAPI backend to:

- Ping the service for availability
- Fetch the recommended next session based on a goal
- Log completed workouts and update the model state
- Simulate the dose/response of a workout without updating state

Footer in the UI: “Built by Nalakram · React + FastAPI · VO₂ + Digital Twin”.

This repository contains the frontend only. It is built with Vite + TypeScript + React and styled with Tailwind CSS.

## Stack

- Language: TypeScript
- Framework: React 19
- Build tool / Dev server: Vite (rolldown-vite)
- Styling: Tailwind CSS 4, PostCSS (Autoprefixer)
- Linting: ESLint (flat config) with React Hooks and React Refresh plugins

## Requirements

- Node.js 18 or newer (recommended 18+ due to Vite 7 / rolldown)
- npm (comes with Node.js)

## Getting Started

1) Clone the repository and install dependencies

```bash
npm install
```

2) Configure environment variables

Create a `.env` file in the project root if one does not exist. The app expects the API base URL in `VITE_API_BASE_URL`:

```bash
# .env
VITE_API_BASE_URL=https://perf-lab-api.onrender.com
```

Notes:
- The value must be an absolute URL. Do not include a trailing slash.
- In development, Vite will load `.env` automatically. For production builds, ensure your hosting injects this variable or it is baked at build time.

3) Run the app in development mode

```bash
npm run dev
```

Vite will print a local URL (typically http://localhost:5173). Open it in your browser.

4) Build for production

```bash
npm run build
```

5) Preview the production build locally

```bash
npm run preview
```

## Available Scripts

These are defined in `package.json`:

- `npm run dev` – Start Vite dev server
- `npm run build` – Type-check the project (`tsc -b`) and build with Vite
- `npm run preview` – Preview the production build locally
- `npm run lint` – Run ESLint over the project

## Entry Points

- `index.html` – HTML template Vite uses to mount the app
- `src/main.tsx` – Bootstraps React and renders `<App />`
- `src/App.tsx` – Main application component and UI

## Environment Variables

The frontend reads variables via Vite’s `import.meta.env` at build/runtime.

- `VITE_API_BASE_URL` (required): Base URL of the backend API service.
  - Used in `src/api/perfLabClient.ts`.
  - The client derives endpoints like:
    - `GET {VITE_API_BASE_URL}/ping`
    - `GET {VITE_API_BASE_URL}/v1/next-session?goal=...`
    - `POST {VITE_API_BASE_URL}/v1/log-workout`
    - `POST {VITE_API_BASE_URL}/v1/simulate-dose`

If `VITE_API_BASE_URL` is not set, the app will warn in the console and API calls will fail.

## API Client

See `src/api/perfLabClient.ts` for fetch helpers and error handling. Types live in `src/types.ts`.

## Styling

Tailwind CSS 4 is configured via `tailwind.config.cjs` and PostCSS via `postcss.config.cjs`. Global styles are in `src/index.css`.

## Project Structure

Top-level:

```
.
├─ index.html
├─ package.json
├─ vite.config.ts
├─ eslint.config.js
├─ postcss.config.cjs
├─ tailwind.config.cjs
├─ tsconfig*.json
├─ public/
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ index.css
│  ├─ api/
│  │  └─ perfLabClient.ts
│  ├─ components/
│  │  └─ Dashboard.tsx
│  └─ types.ts
└─ dist/  (build output)
```

## Running Against a Local Backend

If you run the FastAPI backend locally, update `.env` to point to it, for example:

```
VITE_API_BASE_URL=http://localhost:8000
```

Ensure the backend enables CORS for your Vite origin (e.g., http://localhost:5173).

## Testing

No test tooling is configured yet in this repo.

TODO:
- Add unit tests with Vitest + React Testing Library
- Optionally add end-to-end tests with Cypress or Playwright

## Deployment

The app is a static build output produced by Vite in `dist/`.

General steps:
1. Set `VITE_API_BASE_URL` appropriately at build time
2. `npm run build`
3. Upload the `dist/` directory to your static hosting provider (e.g., Netlify, Vercel, Cloudflare, GitHub Pages with SPA fallback)

TODO:
- Document the chosen hosting provider and any SPA fallback/redirect rules

## License

No license file is present in this repository.

TODO:
- Add a `LICENSE` file and state the license here (e.g., MIT, Apache-2.0)

## Acknowledgements

- Built with Vite, React, TypeScript, and Tailwind CSS
- Uses an external FastAPI backend (not part of this repository)

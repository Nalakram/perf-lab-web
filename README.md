# Perf Lab Web

A React app for exploring training prescriptions and a simple “digital twin” of human performance. It talks to a FastAPI backend (`perf-lab-api`) for:

- **VO₂ / tactical flow** — field-test inputs → metrics and pace zones (legacy API route)
- **Digital twin** — ping, simulate dose, log workouts, fetch the recommended next session

Footer in the UI (see `App.tsx`): **“Built by Nalakram · React + FastAPI · backed by perf-lab-api”**.

This repository contains the **frontend only**. It is built with Vite + TypeScript + React 19 and styled with Tailwind CSS 4.

---

## Stack

- **Language:** TypeScript
- **Framework:** React 19
- **Build / dev server:** Vite (package uses `rolldown-vite` as the Vite implementation)
- **Styling:** Tailwind CSS 4, PostCSS (Autoprefixer)
- **Linting:** ESLint (flat config) with React Hooks and React Refresh plugins

---

## Requirements

- Node.js 18 or newer (recommended for current Vite 7 / rolldown toolchain)
- npm (bundled with Node.js)

---

## Getting started

**1. Install dependencies**

```bash
npm install
```

**2. Environment variables**

Create a `.env` in the project root. The app expects the API base URL in `VITE_API_BASE_URL`:

```bash
# .env
VITE_API_BASE_URL=https://your-api-host.example.com
```

- Use an **absolute** URL with **no** trailing slash.
- Vite loads `.env` in development. Production builds bake this value at build time unless your host injects it.

**3. Development server**

```bash
npm run dev
```

Open the URL Vite prints (typically http://localhost:5173).

**4. Production build**

```bash
npm run build
```

**5. Preview production build**

```bash
npm run preview
```

---

## Backend coupling (important)

The UI calls **two different shapes** of API depending on the panel:

| UI area | HTTP usage | Which backend |
|---------|------------|----------------|
| **HeroFlowColumn** | `POST {VITE_API_BASE_URL}/compute-metrics` | **Legacy** `uvicorn main:app` from `perf-lab-api` (not mounted on `app.main:app`) |
| **DigitalTwinPanel** | `GET /ping`, `GET /v1/next-session`, `POST /v1/log-workout`, `POST /v1/simulate-dose` | **Primary** `uvicorn app.main:app` |

So for **full local functionality** you may need the **legacy** FastAPI app for the VO₂ column, and the **primary** app for `/v1` routes—or a single deployed API that exposes **both** `/compute-metrics` and the v1 paths.

### JWT gap

On the current `perf-lab-api` primary app:

- `POST /v1/simulate-dose` is **unauthenticated**.
- `POST /v1/log-workout` and `GET /v1/next-session` require a **Bearer JWT**.

[`src/api/perfLabClient.ts`](src/api/perfLabClient.ts) does **not** send an `Authorization` header today. Expect **401** from a correctly configured JWT-protected API for log-workout and next-session until the client adds login (e.g. `/auth/token`), token storage, and `Authorization: Bearer …` on those requests.

---

## Available scripts

Defined in `package.json`:

- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b` then Vite build
- `npm run preview` — Preview production build locally
- `npm run lint` — ESLint

---

## Entry points

- `index.html` — HTML shell
- `src/main.tsx` — React bootstrap
- `src/App.tsx` — Layout, header, grid, footer

---

## Environment variables

Vite exposes `import.meta.env.*` at build time.

- **`VITE_API_BASE_URL` (required)** — Base URL of the backend.
  - Used from [`src/api/perfLabClient.ts`](src/api/perfLabClient.ts) and from `HeroFlowColumn` for `/compute-metrics`.
  - Derived calls include: `GET …/ping`, `GET …/v1/next-session?goal=…`, `POST …/v1/log-workout`, `POST …/v1/simulate-dose`, `POST …/compute-metrics`.

If `VITE_API_BASE_URL` is unset, the console warns and API calls fail.

---

## API client and types

- [`src/api/perfLabClient.ts`](src/api/perfLabClient.ts) — fetch helpers and error shaping
- [`src/types.ts`](src/types.ts) — shared TypeScript types

---

## Styling

Tailwind CSS 4 via `tailwind.config.cjs` and PostCSS via `postcss.config.cjs`. Global styles in `src/index.css`; component-level styles in `src/App.css` where used.

---

## Project structure

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
│  ├─ App.css
│  ├─ index.css
│  ├─ types.ts
│  ├─ api/
│  │  └─ perfLabClient.ts
│  ├─ components/
│  │  ├─ HeroFlowColumn.tsx    # VO₂ / compute-metrics flow
│  │  └─ DigitalTwinPanel.tsx  # v1 twin + dose simulation
│  └─ assets/
└─ dist/   # build output
```

---

## Running against a local backend

Point `.env` at your API, for example:

```
VITE_API_BASE_URL=http://localhost:8000
```

Ensure CORS allows the Vite origin (e.g. http://localhost:5173). If you only run `app.main:app`, the **VO₂ column** will not work until `/compute-metrics` is available (legacy app or a combined deployment).

---

## Testing

No test runner is configured in this repo yet.

Possible next steps: Vitest + React Testing Library; optional E2E with Cypress or Playwright.

---

## Deployment

Static output is produced in `dist/` via `npm run build`.

1. Set `VITE_API_BASE_URL` at build time to an API that exposes the routes your UI needs.
2. `npm run build`
3. Upload `dist/` to static hosting (Netlify, Vercel, Cloudflare, GitHub Pages with SPA fallback, etc.)

---

## License

No `LICENSE` file is present in this repository; add one if you want to publish under a specific license.

---

## Acknowledgements

Built with Vite, React, TypeScript, and Tailwind CSS. Backend: **perf-lab-api** (separate repository).

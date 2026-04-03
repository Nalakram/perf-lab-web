// src/App.tsx
import "./App.css";
import "./index.css";
import { AuthStrip } from "./components/AuthStrip";
import { DigitalTwinPanel } from "./components/DigitalTwinPanel";
import { HeroFlowColumn } from "./components/HeroFlowColumn";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

function App() {
  const year = new Date().getFullYear();

  return (
    <div className="app-shell">
      <header className="sticky top-0 z-20 -mx-4 border-b border-slate-200/60 bg-white/70 px-4 py-5 backdrop-blur-xl sm:-mx-6 sm:rounded-b-2xl sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/60 bg-teal-50/80 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-teal-800">
              <span
                className="h-1.5 w-1.5 rounded-full bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.85)]"
                aria-hidden
              />
              <span>Perf Lab · Tactical Engine</span>
            </div>

            <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-gradient-hero sm:text-4xl">
              Turn a simple field test into a digital twin.
            </h1>

            <p className="max-w-xl text-[0.95rem] leading-relaxed text-slate-600">
              300m + 1.5 mile → VO₂, pace zones, fatigue profile, and an adaptive
              S(t) engine prescribing your next session.
            </p>
          </div>

          <div className="flex w-full flex-col gap-4 lg:w-auto lg:min-w-[min(100%,20rem)] lg:items-end">
            <div className="flex w-full flex-wrap items-center justify-between gap-3 lg:justify-end">
              <div className="flex flex-wrap gap-2">
                <span className="pill-accent badge-dot">VO₂ Lab</span>
                <span className="pill-muted">Digital Twin</span>
              </div>
              <code className="max-w-full truncate rounded-lg border border-slate-200/80 bg-slate-50 px-2 py-1 text-[0.65rem] text-slate-500">
                {API_BASE}
              </code>
            </div>
            <AuthStrip />
          </div>
        </div>
      </header>

      <main className="app-grid">
        <HeroFlowColumn apiBase={API_BASE} />
        <DigitalTwinPanel />
      </main>

      <section>
        <div className="glass-card relative overflow-hidden border-teal-100/80">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-teal-400/15 blur-3xl"
            aria-hidden
          />
          <p className="section-label">How the engine thinks</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
            perf-lab-api maintains a unified internal state <code className="rounded bg-slate-100 px-1 py-0.5 text-xs text-slate-800">S(t)</code>{" "}
            and applies stress doses <code className="rounded bg-slate-100 px-1 py-0.5 text-xs text-slate-800">D(t)</code> for every workout you
            log. Over time, it updates your systems on multiple time scales –
            fast fatigue, slower fitness, and deeper structural changes –
            instead of following a static plan.
          </p>
          <p className="mt-3 text-xs text-slate-500">
            These panels read live state, doses, and adaptive prescriptions from
            your own twin so you can see why the next session was chosen.
          </p>
        </div>
      </section>

      <footer className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-200/60 pt-8 text-xs text-slate-500">
        <span className="font-medium text-slate-600">perf-lab-web</span>
        <span className="hidden text-slate-300 sm:inline" aria-hidden>
          ·
        </span>
        <span>{year}</span>
        <span className="hidden text-slate-300 sm:inline" aria-hidden>
          ·
        </span>
        <span>Built by Nalakram · React + FastAPI · perf-lab-api</span>
      </footer>
    </div>
  );
}

export default App;

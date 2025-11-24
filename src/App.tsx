// src/App.tsx
import "./App.css";
import "./index.css";
import { HeroFlowColumn } from "./components/HeroFlowColumn";
import { DigitalTwinPanel } from "./components/DigitalTwinPanel";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

function App() {
  const year = new Date().getFullYear();

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
                <span>Perf Lab · Tactical Engine</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
                Turn a simple field test into a digital twin.
              </h1>

              <p className="text-sm text-slate-500 max-w-xl">
                300m + 1.5 mile → VO₂, pace zones, fatigue profile, and an adaptive
                S(t) engine prescribing your next session.
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2 text-[0.7rem]">
              <div className="flex gap-2">
                <span className="pill-accent badge-dot">VO₂ Lab</span>
                <span className="pill-muted">Digital Twin Engine</span>
              </div>
              <span className="text-slate-500">API: {API_BASE}</span>
            </div>
          </div>
        </header>

      {/* Main dashboard grid */}
      <main className="mt-6 app-grid">
        <HeroFlowColumn apiBase={API_BASE} />
        <DigitalTwinPanel />
      </main>

      {/* Explainer at bottom */}
      <section className="mt-6">
        <div className="glass-card">
          <p className="section-label">How the engine thinks</p>
          <p className="mt-2 text-sm text-slate-400">
            perf-lab-api maintains a unified internal state <code>S(t)</code>{" "}
            and applies stress doses <code>D(t)</code> for every workout you
            log. Over time, it updates your systems on multiple time scales –
            fast fatigue, slower fitness, and deeper structural changes –
            instead of following a static plan.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            These panels read live state, doses, and adaptive prescriptions from
            your own twin so you can see why the next session was chosen.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-8 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>perf-lab-web · {year}</span>
        <span className="hidden text-slate-700 sm:inline">•</span>
        <span>
          Built by Nalakram · React + FastAPI · backed by perf-lab-api
        </span>
      </footer>
    </div>
  );
}

export default App;

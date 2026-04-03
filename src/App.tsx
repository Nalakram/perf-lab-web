// src/App.tsx
import { useId, useState } from "react";
import "./App.css";
import "./index.css";
import { AuthStrip } from "./components/AuthStrip";
import { DigitalTwinPanel } from "./components/DigitalTwinPanel";
import { EngineExplainer } from "./components/EngineExplainer";
import { HeroFlowColumn } from "./components/HeroFlowColumn";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

type MainTab = "field" | "twin";

function App() {
  const year = new Date().getFullYear();
  const [mainTab, setMainTab] = useState<MainTab>("field");
  const tabListId = useId();
  const fieldTabId = `${tabListId}-field`;
  const twinTabId = `${tabListId}-twin`;

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
            <div className="flex w-full flex-wrap items-center justify-end gap-3">
              <div className="flex flex-wrap gap-2">
                <span className="pill-accent badge-dot">VO₂ Lab</span>
                <span className="pill-muted">Digital Twin</span>
              </div>
            </div>
            <AuthStrip />
          </div>
        </div>
      </header>

      <div
        className="glass-card-dense flex flex-col gap-1 border border-slate-200/80 p-1.5 sm:flex-row"
        role="tablist"
        aria-label="Workspace"
      >
        <button
          type="button"
          role="tab"
          id={fieldTabId}
          aria-selected={mainTab === "field"}
          aria-controls="main-workspace-panel"
          tabIndex={mainTab === "field" ? 0 : -1}
          className={`tab-pill flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            mainTab === "field"
              ? "tab-pill-active text-teal-950 shadow-sm"
              : "text-slate-600 hover:bg-slate-100/80"
          }`}
          onClick={() => setMainTab("field")}
        >
          Field test
        </button>
        <button
          type="button"
          role="tab"
          id={twinTabId}
          aria-selected={mainTab === "twin"}
          aria-controls="main-workspace-panel"
          tabIndex={mainTab === "twin" ? 0 : -1}
          className={`tab-pill flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            mainTab === "twin"
              ? "tab-pill-active text-teal-950 shadow-sm"
              : "text-slate-600 hover:bg-slate-100/80"
          }`}
          onClick={() => setMainTab("twin")}
        >
          Digital twin
        </button>
      </div>

      <EngineExplainer />

      <main>
        <div
          id="main-workspace-panel"
          role="tabpanel"
          aria-labelledby={mainTab === "field" ? fieldTabId : twinTabId}
        >
          {mainTab === "field" ? (
            <HeroFlowColumn apiBase={API_BASE} />
          ) : (
            <DigitalTwinPanel />
          )}
        </div>
      </main>

      <footer className="flex flex-col gap-3 border-t border-slate-200/60 pt-8 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-medium text-slate-600">perf-lab-web</span>
          <span className="hidden text-slate-300 sm:inline" aria-hidden>
            ·
          </span>
          <span>{year}</span>
          <span className="hidden text-slate-300 sm:inline" aria-hidden>
            ·
          </span>
          <span>Built by Nalakram · React + FastAPI · perf-lab-api</span>
        </div>
        <details className="details-disclosure rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-2">
          <summary className="cursor-pointer font-medium text-slate-600 [&::-webkit-details-marker]:hidden">
            API endpoint
            <span
              className="details-chevron ml-2 inline-block h-2 w-2 rotate-45 border-r-2 border-b-2 border-slate-400 align-middle transition-transform duration-200"
              aria-hidden
            />
          </summary>
          <code className="mt-2 block break-all rounded-lg border border-slate-200/80 bg-white px-2 py-1.5 text-[0.65rem] text-slate-600">
            {API_BASE}
          </code>
          {import.meta.env.DEV ? (
            <p className="mt-1 text-[0.65rem] text-teal-700">Development build</p>
          ) : null}
        </details>
      </footer>
    </div>
  );
}

export default App;

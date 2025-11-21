// src/App.tsx
import { useEffect, useState } from "react";
import {
  getNextSession,
  logWorkout as logDtWorkout,
  simulateDose,
} from "./api/perfLabClient";
import type {
  WorkoutLog,
  UnifiedStateVector,
  WorkoutPrescription,
  StressDose,
  Modality,
  ApiError,
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

type Zone = {
  name: string;
  slow_pace_sec: number;
  fast_pace_sec: number;
  notes: string;
};

type MetricsResponse = {
  vo2_max: number;
  vo2_category: string;
  result_category: string;
  fatigue_percent: number;
  fatigue_profile: string;
  race_pace_sec_per_mile: number;
  zones: Zone[];
};

function formatMMSS(sec: number) {
  if (!isFinite(sec) || sec <= 0) return "–";
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

const DEFAULT_DT_LOG: WorkoutLog = {
  timestamp: nowIso(),
  modality: "Strength",
  duration_minutes: 45,
  session_rpe: 7,
  sleep_quality: 5,
  life_stress_inverse: 5,
  avg_rir: 2,
};

// --- Error helpers for Digital Twin API ---

function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof (value as { message: unknown }).message === "string"
  );
}

function toApiError(err: unknown): ApiError {
  if (isApiError(err)) {
    return err;
  }
  if (err instanceof Error) {
    return { message: err.message };
  }
  return { message: "Unknown error", details: err };
}

function App() {
  // --- Existing 1.5 mile / VO2 calculator state ---
  const [age, setAge] = useState(35);
  const [sex, setSex] = useState<"male" | "female">("male");
  const [time300, setTime300] = useState("0:55");
  const [time15, setTime15] = useState("12:30");

  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  // --- Digital Twin state ---
  const [dtGoal, setDtGoal] = useState<string>("Strength");
  const [dtLog, setDtLog] = useState<WorkoutLog>(DEFAULT_DT_LOG);
  const [dtState, setDtState] = useState<UnifiedStateVector | null>(null);
  const [dtRx, setDtRx] = useState<WorkoutPrescription | null>(null);
  const [dtDose, setDtDose] = useState<StressDose | null>(null);
  const [dtLoading, setDtLoading] = useState(false);
  const [dtRxLoading, setDtRxLoading] = useState(false);
  const [dtError, setDtError] = useState<ApiError | null>(null);

  async function computeMetrics(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoadingMetrics(true);
    setMetricsError(null);

    try {
      const res = await fetch(`${API_BASE}/compute-metrics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age,
          sex,
          time_300m: time300,
          time_1p5mi: time15,
        }),
      });

      if (!res.ok) {
        setMetricsError(`API error ${res.status}`);
        setMetrics(null);
        return;
      }

      const data = (await res.json()) as MetricsResponse;
      setMetrics(data);
    } catch (caughtError: unknown) {
      const errorMessage =
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to compute metrics";
      setMetricsError(errorMessage);
      setMetrics(null);
    } finally {
      setLoadingMetrics(false);
    }
  }

  // initial compute on mount (legacy calculator)
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    computeMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // initial Digital Twin recommendation
  useEffect(() => {
    let cancelled = false;

    const loadRx = async () => {
      setDtRxLoading(true);
      setDtError(null);
      try {
        const rx = await getNextSession(dtGoal);
        if (!cancelled) setDtRx(rx);
      } catch (err: unknown) {
        if (!cancelled) {
          setDtError(toApiError(err));
        }
      } finally {
        if (!cancelled) {
          setDtRxLoading(false);
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadRx();

    return () => {
      cancelled = true;
    };
  }, [dtGoal]);

  // --- Digital Twin handlers ---

  function updateDtLog(field: keyof WorkoutLog, value: unknown) {
    setDtLog((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleDtLog(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setDtLoading(true);
    setDtError(null);
    setDtDose(null);

    try {
      const newState = await logDtWorkout({
        ...dtLog,
        timestamp: nowIso(),
      });
      setDtState(newState);

      const rx = await getNextSession(dtGoal);
      setDtRx(rx);
    } catch (err: unknown) {
      setDtError(toApiError(err));
    } finally {
      setDtLoading(false);
    }
  }

  async function handleDtSimulate() {
    setDtError(null);
    setDtDose(null);
    try {
      const dose = await simulateDose({
        ...dtLog,
        timestamp: nowIso(),
      });
      setDtDose(dose);
    } catch (err: unknown) {
      setDtError(toApiError(err));
    }
  }

  async function handleDtCrash() {
    setDtLoading(true);
    setDtError(null);
    setDtDose(null);

    const crash: WorkoutLog = {
      timestamp: nowIso(),
      modality: "Strength",
      duration_minutes: 90,
      session_rpe: 10,
      sleep_quality: 2,
      life_stress_inverse: 2,
      avg_rir: 0,
    };

    try {
      const newState = await logDtWorkout(crash);
      setDtState(newState);
      const rx = await getNextSession(dtGoal);
      setDtRx(rx);
    } catch (err: unknown) {
      setDtError(toApiError(err));
    } finally {
      setDtLoading(false);
    }
  }

  async function handleDtRefreshRx() {
    setDtRxLoading(true);
    setDtError(null);
    try {
      const rx = await getNextSession(dtGoal);
      setDtRx(rx);
    } catch (err: unknown) {
      setDtError(toApiError(err));
    } finally {
      setDtRxLoading(false);
    }
  }

  function renderFatigueBar(label: string, value: number | undefined) {
    const v = value ?? 0;
    const pct = Math.max(0, Math.min(100, v));
    return (
      <div key={label} className="mb-3">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>{label}</span>
          <span>{pct.toFixed(1)}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-cyan-400 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  function renderDtSkillList() {
    if (!dtState || !dtState.skill_state) return null;
    const entries = Object.entries(dtState.skill_state);
    if (!entries.length) return null;

    return (
      <div className="mt-3">
        <div className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500 mb-1">
          Skill State
        </div>
        <ul className="text-xs text-slate-300 space-y-1">
          {entries.map(([movement, skill]) => (
            <li key={movement} className="flex justify-between">
              <span>{movement}</span>
              <span>{(skill * 100).toFixed(0)}%</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  function renderDtDosePreview() {
    if (!dtDose) return null;
    const d = dtDose;
    return (
      <div className="mt-4 bg-slate-900/80 border border-slate-700 rounded-lg p-3">
        <div className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400 mb-2">
          Stress Dose D(t)
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-200">
          <div>Metabolic: {d.d_met_systemic.toFixed(1)}</div>
          <div>NM Peripheral: {d.d_nm_peripheral.toFixed(1)}</div>
          <div>NM Central: {d.d_nm_central.toFixed(1)}</div>
          <div>Struct Damage: {d.d_struct_damage.toFixed(1)}</div>
          <div className="col-span-2">
            Struct Signal: {d.d_struct_signal.toFixed(1)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-950 to-black text-slate-100 flex">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-sm tracking-[0.3em] uppercase text-slate-200 font-semibold">
              Performance Lab
            </h1>
            <p className="text-xs text-slate-400">
              1.5 Mile · VO₂ · Fatigue Profile · Pace Zones · Digital Twin
            </p>
          </div>
          <span className="text-[0.7rem] text-slate-500 hidden sm:inline">
            API: {API_BASE}
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-5 flex flex-col gap-4">
        {/* Inputs (existing calculator) */}
        <section className="bg-slate-950/80 border border-cyan-500/50 rounded-xl shadow-xl shadow-cyan-900/30 p-4">
          <h2 className="text-sm font-semibold mb-3">Inputs</h2>
          <form
            onSubmit={computeMetrics}
            className="grid gap-3 sm:grid-cols-4 text-sm"
          >
            <div className="flex flex-col gap-1">
              <label className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
                Age
              </label>
              <input
                type="number"
                min={15}
                max={80}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
                Sex
              </label>
              <select
                value={sex}
                onChange={(e) =>
                  setSex(e.target.value as "male" | "female")
                }
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
                300 m (mm:ss)
              </label>
              <input
                value={time300}
                onChange={(e) => setTime300(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
                1.5 mile (mm:ss)
              </label>
              <input
                value={time15}
                onChange={(e) => setTime15(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            <div className="sm:col-span-4 flex items-center gap-3 mt-1">
              <button
                type="submit"
                disabled={loadingMetrics}
                className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-semibold text-xs shadow-lg shadow-cyan-900/40 disabled:opacity-60"
              >
                {loadingMetrics ? "Computing..." : "Compute"}
              </button>
              <span className="text-xs text-slate-500">
                Edit values and press Enter or click Compute.
              </span>
            </div>
          </form>
        </section>

        {/* Metrics row */}
        <section className="grid gap-3 md:grid-cols-3 text-sm">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-lg shadow-slate-950/70">
            <h2 className="text-xs font-semibold mb-1">VO₂ Max</h2>
            <p className="text-xl font-semibold">
              {metrics ? metrics.vo2_max.toFixed(1) : "–"}
            </p>
            <p className="text-xs text-slate-400">
              Category: {metrics ? metrics.vo2_category : "–"}
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-lg shadow-slate-950/70">
            <h2 className="text-xs font-semibold mb-1">1.5 Mile Result</h2>
            <p className="text-xl font-semibold">
              {metrics
                ? `${formatMMSS(metrics.race_pace_sec_per_mile)} /mi`
                : "–"}
            </p>
            <p className="text-xs text-slate-400">
              Category: {metrics ? metrics.result_category : "–"}
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-lg shadow-slate-950/70">
            <h2 className="text-xs font-semibold mb-1">Fatigue Profile</h2>
            <p className="text-xl font-semibold">
              {metrics ? `${metrics.fatigue_percent.toFixed(1)}%` : "–"}
            </p>
            <p className="text-xs text-slate-400">
              {metrics ? metrics.fatigue_profile : "Speed / endurance mix"}
            </p>
          </div>
        </section>

        {/* Coach summary */}
        <section className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-sm shadow-lg shadow-slate-950/70">
          <h2 className="text-xs font-semibold mb-2">Coach Summary</h2>
          {metricsError && (
            <p className="text-xs text-rose-400 mb-1">
              Error: {metricsError}. Check API base URL and try again.
            </p>
          )}
          <p className="text-sm text-slate-200 leading-relaxed">
            {metrics ? (
              <>
                You are a{" "}
                <strong>{metrics.fatigue_profile.toLowerCase()}</strong> runner
                with VO₂ max in the{" "}
                <strong>{metrics.vo2_category}</strong> range and a current
                1.5-mile pace of{" "}
                <strong>
                  {formatMMSS(metrics.race_pace_sec_per_mile)} per mile
                </strong>
                .
              </>
            ) : (
              <>
                Enter your times above and compute to see your profile and pace
                zones.
              </>
            )}
          </p>
        </section>

        {/* Zones table */}
        <section className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-sm shadow-lg shadow-slate-950/70">
          <h2 className="text-xs font-semibold mb-3">Pace Zones (min/mile)</h2>
          <div className="overflow-x-auto text-xs">
            <table className="min-w-full border-collapse">
              <thead className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  <th className="border-b border-slate-800 py-1 pr-2 text-left">
                    Zone
                  </th>
                  <th className="border-b border-slate-800 py-1 px-2 text-left">
                    Slower
                  </th>
                  <th className="border-b border-slate-800 py-1 px-2 text-left">
                    Faster
                  </th>
                  <th className="border-b border-slate-800 py-1 pl-2 text-left">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {metrics &&
                  metrics.zones.map((z) => (
                    <tr
                      key={z.name}
                      className="odd:bg-slate-900/60 hover:bg-slate-800/70"
                    >
                      <td className="py-1 pr-2 align-top">{z.name}</td>
                      <td className="py-1 px-2 align-top">
                        {formatMMSS(z.slow_pace_sec)}
                      </td>
                      <td className="py-1 px-2 align-top">
                        {formatMMSS(z.fast_pace_sec)}
                      </td>
                      <td className="py-1 pl-2 align-top text-slate-400">
                        {z.notes}
                      </td>
                    </tr>
                  ))}
                {!metrics && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-2 text-slate-500 text-center"
                    >
                      Zones will appear here after you compute metrics.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Digital Twin Panel */}
        <section className="bg-slate-950/80 border border-cyan-700/60 rounded-xl p-4 text-sm shadow-xl shadow-cyan-900/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <div>
              <h2 className="text-sm font-semibold">
                Digital Twin · S(t) / D(t) / u(t)
              </h2>
              <p className="text-xs text-slate-400">
                Log sessions, see latent state and next-best action.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
                Goal
                <select
                  className="ml-2 text-xs rounded-md border border-slate-700 bg-slate-950 px-2 py-1"
                  value={dtGoal}
                  onChange={(e) => setDtGoal(e.target.value)}
                >
                  <option value="Strength">Strength</option>
                  <option value="Hypertrophy">Hypertrophy</option>
                  <option value="Power">Power</option>
                  <option value="General">General</option>
                </select>
              </label>
              <button
                type="button"
                onClick={handleDtRefreshRx}
                className="text-[0.7rem] px-2 py-1 rounded-full border border-slate-700 text-slate-300 hover:bg-slate-900"
              >
                Refresh u(t)
              </button>
            </div>
          </div>

          {dtError && (
            <p className="text-xs text-rose-400 mb-2">
              Digital Twin error: {dtError.message}
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {/* DT log form */}
            <form
              onSubmit={handleDtLog}
              className="border border-slate-800 rounded-lg p-3 bg-slate-950/70"
            >
              <h3 className="text-xs font-semibold mb-3 text-slate-300">
                Log Workout (Sensor Input)
              </h3>

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
                    Modality
                  </label>
                  <select
                    className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1"
                    value={dtLog.modality}
                    onChange={(e) =>
                      updateDtLog("modality", e.target.value as Modality)
                    }
                  >
                    <option value="Running">Running</option>
                    <option value="Strength">Strength</option>
                    <option value="Hypertrophy">Hypertrophy</option>
                    <option value="Power">Power</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1"
                    value={dtLog.duration_minutes}
                    onChange={(e) =>
                      updateDtLog("duration_minutes", Number(e.target.value))
                    }
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
                    Session RPE (1–10)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1"
                    value={dtLog.session_rpe}
                    onChange={(e) =>
                      updateDtLog("session_rpe", Number(e.target.value))
                    }
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
                    Avg RIR (optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1"
                    value={dtLog.avg_rir ?? ""}
                    onChange={(e) =>
                      updateDtLog(
                        "avg_rir",
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                      )
                    }
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
                    Sleep Quality (1–10)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1"
                    value={dtLog.sleep_quality}
                    onChange={(e) =>
                      updateDtLog("sleep_quality", Number(e.target.value))
                    }
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
                    Life Stress Inverse (1–10)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1"
                    value={dtLog.life_stress_inverse}
                    onChange={(e) =>
                      updateDtLog(
                        "life_stress_inverse",
                        Number(e.target.value),
                      )
                    }
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  type="submit"
                  disabled={dtLoading}
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-cyan-500 text-slate-950 text-xs font-semibold shadow disabled:opacity-60"
                >
                  {dtLoading ? "Logging..." : "Log & Update S(t)"}
                </button>
                <button
                  type="button"
                  onClick={handleDtSimulate}
                  className="inline-flex items-center px-3 py-1.5 rounded-full border border-slate-700 text-xs text-slate-200 hover:bg-slate-900"
                >
                  Simulate D(t) Only
                </button>
                <button
                  type="button"
                  onClick={handleDtCrash}
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-rose-600 text-slate-50 text-xs font-semibold shadow hover:bg-rose-700"
                >
                  🔥 Crash Session
                </button>
              </div>

              {renderDtDosePreview()}
            </form>

            {/* DT outputs: prescription + state */}
            <div className="space-y-3">
              <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/70">
                <h3 className="text-xs font-semibold mb-2 text-slate-300">
                  Recommended Next Session u(t)
                </h3>
                {dtRxLoading ? (
                  <div className="h-16 rounded-md bg-slate-900 animate-pulse" />
                ) : dtRx ? (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-semibold text-cyan-300">
                          {dtRx.type}
                        </p>
                        <p className="text-xs text-slate-200">{dtRx.focus}</p>
                      </div>
                      <span className="text-[0.7rem] px-2 py-1 rounded-full bg-slate-900 text-slate-200">
                        {dtRx.duration_min} min
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 italic">
                      “{dtRx.rationale}”
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-slate-500">
                    No recommendation yet. Log a workout to start the loop.
                  </p>
                )}
              </div>

              <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/70">
                <h3 className="text-xs font-semibold mb-2 text-slate-300">
                  Latest State S(t)
                </h3>
                {dtState ? (
                  <>
                    <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                      <div>
                        <div className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500 mb-1">
                          Capacities
                        </div>
                        <div className="space-y-1 text-slate-200">
                          <div>Met Aerobic: {dtState.c_met_aerobic.toFixed(1)}</div>
                          <div>NM Force: {dtState.c_nm_force.toFixed(1)}</div>
                          <div>Struct: {dtState.c_struct.toFixed(1)}</div>
                          <div>W&apos;: {dtState.b_met_anaerobic.toFixed(1)}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500 mb-1">
                          Habit & Signal
                        </div>
                        <div className="space-y-1 text-slate-200 text-xs">
                          <div>
                            Habit: {(dtState.habit_strength * 100).toFixed(0)}%
                          </div>
                          <div>
                            Struct Signal: {dtState.s_struct_signal.toFixed(1)}
                          </div>
                        </div>
                        {renderDtSkillList()}
                      </div>
                    </div>

                    <div className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500 mb-1">
                      Fatigues (0–100)
                    </div>
                    {renderFatigueBar(
                      "Systemic",
                      dtState.f_met_systemic,
                    )}
                    {renderFatigueBar(
                      "NM Peripheral",
                      dtState.f_nm_peripheral,
                    )}
                    {renderFatigueBar(
                      "NM Central",
                      dtState.f_nm_central,
                    )}
                    {renderFatigueBar(
                      "Structural",
                      dtState.f_struct_damage,
                    )}
                  </>
                ) : (
                  <p className="text-xs text-slate-500">
                    State will appear after the first logged workout.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="text-center text-[0.7rem] text-slate-500 border-t border-slate-900 py-2">
        Built by Nalakram · React + FastAPI · VO₂ + Digital Twin
      </footer>
    </div>
  );
}

export default App;

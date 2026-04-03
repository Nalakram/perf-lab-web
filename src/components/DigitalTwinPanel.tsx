// src/components/DigitalTwinPanel.tsx
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/useAuth";
import {
  getNextSession,
  logWorkout as logDtWorkout,
  simulateDose,
} from "../api/perfLabClient";
import type {
  WorkoutLog,
  UnifiedStateVector,
  WorkoutPrescription,
  StressDose,
  Modality,
  ApiError,
} from "../types";

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
  dominant_movement_pattern: "mixed",
  novelty: 1,
};

const MOVEMENT_PATTERN_OPTIONS = [
  "mixed",
  "squat",
  "hinge",
  "run",
  "push_horizontal",
  "push_vertical",
  "pull_horizontal",
  "pull_vertical",
  "single_leg",
  "core",
  "jump",
  "bike",
  "row",
] as const;

function toApiWorkoutLog(log: WorkoutLog): WorkoutLog {
  const base: WorkoutLog = {
    timestamp: log.timestamp,
    modality: log.modality,
    duration_minutes: log.duration_minutes,
    session_rpe: log.session_rpe,
    sleep_quality: log.sleep_quality,
    life_stress_inverse: log.life_stress_inverse,
  };
  if (log.avg_rir !== undefined) base.avg_rir = log.avg_rir;
  if (log.distance_meters !== undefined && log.distance_meters !== 0) {
    base.distance_meters = log.distance_meters;
  }
  if (log.total_volume_load !== undefined && log.total_volume_load !== 0) {
    base.total_volume_load = log.total_volume_load;
  }
  base.dominant_movement_pattern =
    log.dominant_movement_pattern && log.dominant_movement_pattern !== ""
      ? log.dominant_movement_pattern
      : "mixed";
  base.novelty = log.novelty ?? 1;
  if (log.estimated_sets !== undefined) {
    base.estimated_sets = log.estimated_sets;
  }
  return base;
}

function readinessScore(s: UnifiedStateVector): string {
  const f = s.fatigue_f;
  const fMean =
    (f.cns +
      f.muscular +
      f.metabolic +
      f.structural +
      f.tendon +
      f.grip) /
    6;
  const t = s.tissue_t;
  const tMax = Math.max(
    t.shoulder,
    t.elbow,
    t.wrist,
    t.lumbar,
    t.hip,
    t.knee,
    t.ankle,
    t.finger,
  );
  const v = 100 - 0.55 * fMean - 0.45 * tMax;
  return Math.max(0, Math.min(100, Math.round(v))).toFixed(0);
}

function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof (value as { message: unknown }).message === "string"
  );
}

function toApiError(err: unknown): ApiError {
  if (isApiError(err)) return err;
  if (err instanceof Error) return { message: err.message };
  return { message: "Unknown error", details: err };
}

function FatigueBar({
  label,
  value,
}: {
  label: string;
  value: number | undefined;
}) {
  const v = value ?? 0;
  const pct = Math.max(0, Math.min(100, v));

  return (
    <div className="mb-2">
      <div className="mb-1 flex justify-between text-[0.7rem] text-slate-500">
        <span>{label}</span>
        <span>{pct.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-cyan-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function DosePanel({ dose }: { dose: StressDose | null }) {
  if (!dose) return null;
  const d = dose;
  const six = d.dose_six;

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
        Dose D(t) · Simulated
      </div>
      {six ? (
        <>
          <p className="mb-2 text-[0.65rem] leading-snug text-slate-500">
            Six-dose factors are relative session load (model units). Legacy
            channels below match the familiar fatigue/signal scale.
          </p>
          <div className="mb-3 grid grid-cols-2 gap-1 text-[0.7rem] text-slate-600">
            <div>Vol: {six.volume.toFixed(2)}</div>
            <div>Int: {six.intensity.toFixed(2)}</div>
            <div>Density: {six.density.toFixed(2)}</div>
            <div>Impact: {six.impact.toFixed(2)}</div>
            <div>Skill: {six.skill.toFixed(2)}</div>
            <div>Metab: {six.metabolic.toFixed(2)}</div>
          </div>
        </>
      ) : null}
      <div className="grid grid-cols-2 gap-2 text-[0.75rem] text-slate-700">
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

function SkillPanel({ state }: { state: UnifiedStateVector | null }) {
  if (!state || !state.skill_state) return null;
  const entries = Object.entries(state.skill_state);
  if (!entries.length) return null;

  return (
    <div className="mt-2">
      <div className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
        Skill State
      </div>
      <ul className="space-y-1 text-[0.75rem] text-slate-700">
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

export function DigitalTwinPanel() {
  const { token, isAuthenticated: signedIn } = useAuth();
  const [dtGoal, setDtGoal] = useState<string>("Strength");
  const [dtLog, setDtLog] = useState<WorkoutLog>(DEFAULT_DT_LOG);
  const [dtState, setDtState] = useState<UnifiedStateVector | null>(null);
  const [dtRx, setDtRx] = useState<WorkoutPrescription | null>(null);
  const [dtDose, setDtDose] = useState<StressDose | null>(null);
  const [dtLoading, setDtLoading] = useState(false);
  const [dtRxLoading, setDtRxLoading] = useState(false);
  const [dtError, setDtError] = useState<ApiError | null>(null);
  const prevModalityRef = useRef(dtLog.modality);

  useEffect(() => {
    if (
      dtLog.modality === "Running" &&
      prevModalityRef.current !== "Running" &&
      dtLog.dominant_movement_pattern === "mixed"
    ) {
      setDtLog((prev) => ({ ...prev, dominant_movement_pattern: "run" }));
    }
    prevModalityRef.current = dtLog.modality;
  }, [dtLog.modality, dtLog.dominant_movement_pattern]);

  // Prescription requires JWT
  useEffect(() => {
    let cancelled = false;

    const loadRx = async () => {
      if (!token) {
        setDtRx(null);
        setDtRxLoading(false);
        return;
      }
      setDtRxLoading(true);
      setDtError(null);
      try {
        const rx = await getNextSession(dtGoal, token);
        if (!cancelled) setDtRx(rx);
      } catch (err: unknown) {
        if (!cancelled) setDtError(toApiError(err));
      } finally {
        if (!cancelled) setDtRxLoading(false);
      }
    };

    void loadRx();
    return () => {
      cancelled = true;
    };
  }, [dtGoal, token]);

  function updateDtLog(field: keyof WorkoutLog, value: unknown) {
    setDtLog((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleDtLog(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!token) return;
    setDtLoading(true);
    setDtError(null);
    setDtDose(null);

    try {
      const newState = await logDtWorkout(
        toApiWorkoutLog({ ...dtLog, timestamp: nowIso() }),
        token,
      );
      setDtState(newState);
      const rx = await getNextSession(dtGoal, token);
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
      const dose = await simulateDose(
        toApiWorkoutLog({ ...dtLog, timestamp: nowIso() }),
      );
      setDtDose(dose);
    } catch (err: unknown) {
      setDtError(toApiError(err));
    }
  }

  async function handleDtCrash() {
    if (!token) return;
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
      dominant_movement_pattern: "mixed",
      novelty: 1,
    };

    try {
      const newState = await logDtWorkout(toApiWorkoutLog(crash), token);
      setDtState(newState);
      const rx = await getNextSession(dtGoal, token);
      setDtRx(rx);
    } catch (err: unknown) {
      setDtError(toApiError(err));
    } finally {
      setDtLoading(false);
    }
  }

  async function handleDtRefreshRx() {
    if (!token) return;
    setDtRxLoading(true);
    setDtError(null);
    try {
      const rx = await getNextSession(dtGoal, token);
      setDtRx(rx);
    } catch (err: unknown) {
      setDtError(toApiError(err));
    } finally {
      setDtRxLoading(false);
    }
  }

  const readiness =
    dtState != null && dtState.fatigue_f && dtState.tissue_t
      ? readinessScore(dtState)
      : "—";

  return (
    <section className="space-y-4">
      {/* Main twin console */}
      <section className="glass-card card-hover text-sm border-cyan-100">
        {/* Header row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="section-label">Digital Twin · Control Loop</p>
            <h2 className="mt-1 text-sm font-semibold text-slate-900">
              S(t), D(t), and your next session
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-[0.7rem] font-medium text-slate-600">
              Goal
              <select
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[0.7rem]"
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
              disabled={!token}
              onClick={() => void handleDtRefreshRx()}
              className="rounded-full border border-slate-300 px-2 py-1 text-[0.7rem] text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Refresh u(t)
            </button>
          </div>
        </div>

        {/* Summary strip */}
        <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
          <div className="glass-card-dense card-subtle">
            <p className="metric-heading">Readiness</p>
            <p className="metric-value mt-1">{readiness}</p>
            <p className="metric-sub mt-1">
              100 − 0.55·mean(F) − 0.45·max(T); higher is better.
            </p>
          </div>
          <div className="glass-card-dense card-subtle">
            <p className="metric-heading">Habit Strength</p>
            <p className="metric-value mt-1">
              {dtState ? (dtState.habit_strength * 100).toFixed(0) : "—"}%
            </p>
            <p className="metric-sub mt-1">How automatic training is.</p>
          </div>
          <div className="glass-card-dense card-subtle">
            <p className="metric-heading">Next Session</p>
            <p className="metric-value mt-1">
              {dtRx ? dtRx.duration_min : "—"} min
            </p>
            <p className="metric-sub mt-1">
              {dtRx ? dtRx.type : "Waiting for first log."}
            </p>
          </div>
        </div>

        {/* Error, if any */}
        {dtError && (
          <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[0.75rem] text-rose-700">
            {dtError.status === 401
              ? "Session expired or not authorized — sign in again."
              : dtError.message}
          </div>
        )}

        {/* Main grid: log on left, outputs on right */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {/* Log form + dose */}
          <form
            onSubmit={handleDtLog}
            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            <h3 className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Log Workout
            </h3>
            {!signedIn ? (
              <p className="mb-3 text-[0.7rem] text-amber-800">
                Sign in above to log workouts, update S(t), and load your next
                session. <strong>Simulate D(t)</strong> still works without an
                account.
              </p>
            ) : null}

            <div className="grid gap-3 text-[0.75rem] sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-[0.65rem] font-medium text-slate-600">
                  Modality
                </label>
                <select
                  className="rounded-md border border-slate-300 bg-white px-2 py-1"
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
                <label className="text-[0.65rem] font-medium text-slate-600">
                  Duration (min)
                </label>
                <input
                  type="number"
                  min={1}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1"
                  value={dtLog.duration_minutes}
                  onChange={(e) =>
                    updateDtLog("duration_minutes", Number(e.target.value))
                  }
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[0.65rem] font-medium text-slate-600">
                  Session RPE (1–10)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1"
                  value={dtLog.session_rpe}
                  onChange={(e) =>
                    updateDtLog("session_rpe", Number(e.target.value))
                  }
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[0.65rem] font-medium text-slate-600">
                  Avg RIR (optional)
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1"
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
                <label className="text-[0.65rem] font-medium text-slate-600">
                  Sleep (1–10)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1"
                  value={dtLog.sleep_quality}
                  onChange={(e) =>
                    updateDtLog("sleep_quality", Number(e.target.value))
                  }
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[0.65rem] font-medium text-slate-600">
                  Life Stress Inverse (1–10)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1"
                  value={dtLog.life_stress_inverse}
                  onChange={(e) =>
                    updateDtLog("life_stress_inverse", Number(e.target.value))
                  }
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-[0.65rem] font-medium text-slate-600">
                  Dominant movement pattern
                </label>
                <select
                  className="rounded-md border border-slate-300 bg-white px-2 py-1"
                  value={dtLog.dominant_movement_pattern ?? "mixed"}
                  onChange={(e) =>
                    updateDtLog("dominant_movement_pattern", e.target.value)
                  }
                >
                  {MOVEMENT_PATTERN_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[0.65rem] font-medium text-slate-600">
                  Novelty (coordination tax)
                </label>
                <select
                  className="rounded-md border border-slate-300 bg-white px-2 py-1"
                  value={String(dtLog.novelty ?? 1)}
                  onChange={(e) =>
                    updateDtLog("novelty", Number(e.target.value))
                  }
                >
                  <option value="0.8">0.8 familiar</option>
                  <option value="1">1.0 typical</option>
                  <option value="1.2">1.2 somewhat new</option>
                  <option value="1.5">1.5 novel</option>
                  <option value="2">2.0 very novel</option>
                  <option value="2.5">2.5 high novelty</option>
                  <option value="3">3.0 max</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[0.65rem] font-medium text-slate-600">
                  Est. working sets (optional)
                </label>
                <input
                  type="number"
                  min={1}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1"
                  value={dtLog.estimated_sets ?? ""}
                  placeholder="—"
                  onChange={(e) =>
                    updateDtLog(
                      "estimated_sets",
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={dtLoading || !token}
                className="inline-flex items-center rounded-full bg-cyan-500 px-3 py-1.5 text-[0.75rem] font-semibold text-white shadow disabled:opacity-60"
              >
                {dtLoading ? "Logging..." : "Log & update S(t)"}
              </button>
              <button
                type="button"
                onClick={handleDtSimulate}
                className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1.5 text-[0.75rem] text-slate-700 hover:bg-slate-100"
              >
                Simulate D(t)
              </button>
              <button
                type="button"
                disabled={!token}
                onClick={() => void handleDtCrash()}
                className="inline-flex items-center rounded-full bg-rose-500 px-3 py-1.5 text-[0.75rem] font-semibold text-white shadow hover:bg-rose-600 disabled:opacity-50"
              >
                Crash session
              </button>
            </div>

            <DosePanel dose={dtDose} />
          </form>

          {/* Recommendation + state */}
          <div className="space-y-3">
            {/* Recommendation */}
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <h3 className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Next Session · u(t)
              </h3>
              {!token ? (
                <p className="text-[0.75rem] text-slate-500">
                  Sign in to load a personalized next session from the API.
                </p>
              ) : dtRxLoading ? (
                <div className="h-16 animate-pulse rounded-md bg-slate-100" />
              ) : dtRx ? (
                <>
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {dtRx.type}
                      </p>
                      <p className="text-[0.8rem] text-slate-600">
                        {dtRx.focus}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[0.7rem] text-slate-700">
                      {dtRx.duration_min} min
                    </span>
                  </div>
                  <p className="text-[0.75rem] text-slate-500">
                    “{dtRx.rationale}”
                  </p>
                </>
              ) : (
                <p className="text-[0.75rem] text-slate-500">
                  Log one workout to get a first prescription.
                </p>
              )}
            </div>

            {/* State */}
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <h3 className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                State · S(t)
              </h3>
              {dtState ? (
                <>
                  <div className="mb-3 grid grid-cols-2 gap-3 text-[0.75rem]">
                    <div>
                      <div className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Capacities
                      </div>
                      <div className="space-y-1 text-slate-700">
                        <div>
                          Met aerobic: {dtState.c_met_aerobic.toFixed(1)}
                        </div>
                        <div>NM force: {dtState.c_nm_force.toFixed(1)}</div>
                        <div>Structural: {dtState.c_struct.toFixed(1)}</div>
                        <div>W&apos;: {dtState.b_met_anaerobic.toFixed(1)}</div>
                      </div>
                      {dtState.capacity_x ? (
                        <div className="mt-2 border-t border-slate-100 pt-2">
                          <div className="mb-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
                            Capacity X(t)
                          </div>
                          <div className="space-y-0.5 text-[0.65rem] text-slate-600">
                            <div>
                              Aerobic: {dtState.capacity_x.aerobic.toFixed(1)}
                            </div>
                            <div>
                              Glycolytic:{" "}
                              {dtState.capacity_x.glycolytic.toFixed(1)}
                            </div>
                            <div>
                              Max strength:{" "}
                              {dtState.capacity_x.max_strength.toFixed(1)}
                            </div>
                            <div>
                              Hypertrophy:{" "}
                              {dtState.capacity_x.hypertrophy.toFixed(1)}
                            </div>
                            <div>
                              Power: {dtState.capacity_x.power.toFixed(1)}
                            </div>
                            <div>
                              Skill: {dtState.capacity_x.skill.toFixed(1)}
                            </div>
                            <div>
                              Mobility: {dtState.capacity_x.mobility.toFixed(1)}
                            </div>
                            <div>
                              Work cap:{" "}
                              {dtState.capacity_x.work_capacity.toFixed(1)}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div>
                      <div className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Habit & signal
                      </div>
                      <div className="space-y-1 text-slate-700">
                        <div>
                          Habit:{" "}
                          {(dtState.habit_strength * 100).toFixed(0)}%
                        </div>
                        <div>
                          Struct signal:{" "}
                          {dtState.s_struct_signal.toFixed(1)}
                        </div>
                      </div>
                      <SkillPanel state={dtState} />
                    </div>
                  </div>

                  <div className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Fatigues (0–100)
                  </div>
                  <FatigueBar label="Systemic" value={dtState.f_met_systemic} />
                  <FatigueBar
                    label="NM peripheral"
                    value={dtState.f_nm_peripheral}
                  />
                  <FatigueBar
                    label="NM central"
                    value={dtState.f_nm_central}
                  />
                  <FatigueBar
                    label="Structural"
                    value={dtState.f_struct_damage}
                  />

                  <div className="mt-3 mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Component fatigue F(t)
                  </div>
                  <FatigueBar label="CNS" value={dtState.fatigue_f.cns} />
                  <FatigueBar label="Muscular" value={dtState.fatigue_f.muscular} />
                  <FatigueBar label="Metabolic" value={dtState.fatigue_f.metabolic} />
                  <FatigueBar label="Structural" value={dtState.fatigue_f.structural} />
                  <FatigueBar label="Tendon" value={dtState.fatigue_f.tendon} />
                  <FatigueBar label="Grip" value={dtState.fatigue_f.grip} />

                  <div className="mt-3 mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Tissue stress T(t)
                  </div>
                  <FatigueBar label="Shoulder" value={dtState.tissue_t.shoulder} />
                  <FatigueBar label="Elbow" value={dtState.tissue_t.elbow} />
                  <FatigueBar label="Wrist" value={dtState.tissue_t.wrist} />
                  <FatigueBar label="Lumbar" value={dtState.tissue_t.lumbar} />
                  <FatigueBar label="Hip" value={dtState.tissue_t.hip} />
                  <FatigueBar label="Knee" value={dtState.tissue_t.knee} />
                  <FatigueBar label="Ankle" value={dtState.tissue_t.ankle} />
                  <FatigueBar label="Finger" value={dtState.tissue_t.finger} />
                </>
              ) : (
                <p className="text-[0.75rem] text-slate-500">
                  State will appear after your first logged session.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mini plan preview – keep copy very short */}
      <section className="glass-card card-hover">
        <p className="section-label">Pattern Preview · Demo</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            If you ran this 3× per week…
          </h2>
          <p className="text-[0.7rem] text-slate-500">
            UI only for now – later this can read from repeated next-session calls.
          </p>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto text-[0.75rem] text-slate-700 scrollbar-thin">
          <div className="glass-card-dense card-subtle min-w-[9rem]">
            <p className="metric-heading">Week 1</p>
            <p className="metric-sub mt-1">
              Base pattern, no progression.
            </p>
          </div>
          <div className="glass-card-dense card-subtle min-w-[9rem]">
            <p className="metric-heading">Week 2</p>
            <p className="metric-sub mt-1">
              Slightly more volume / intensity.
            </p>
          </div>
          <div className="glass-card-dense card-subtle min-w-[9rem]">
            <p className="metric-heading">Week 3</p>
            <p className="metric-sub mt-1">
              Future: driven from <code>next-session</code>.
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}

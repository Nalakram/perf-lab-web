// src/components/Dashboard.tsx
import { useEffect, useState, FormEvent } from "react";
import {
  getNextSession,
  logWorkout,
  simulateDose,
} from "../api/perfLabClient";
import type {
  UnifiedStateVector,
  WorkoutPrescription,
  WorkoutLog,
  Modality,
  StressDose,
  ApiError,
} from "../types";

const MODALITIES: Modality[] = ["Running", "Strength", "Hypertrophy", "Power", "Mixed"];

function nowIso(): string {
  return new Date().toISOString();
}

const DEFAULT_LOG: WorkoutLog = {
  timestamp: nowIso(),
  modality: "Strength",
  duration_minutes: 45,
  session_rpe: 7,
  sleep_quality: 5,
  life_stress_inverse: 5,
  avg_rir: 2,
};

export default function Dashboard() {
  const [prescription, setPrescription] = useState<WorkoutPrescription | null>(null);
  const [latestState, setLatestState] = useState<UnifiedStateVector | null>(null);
  const [simulatedDose, setSimulatedDose] = useState<StressDose | null>(null);

  const [logForm, setLogForm] = useState<WorkoutLog>(DEFAULT_LOG);
  const [goal, setGoal] = useState<string>("Strength");

  const [loadingRx, setLoadingRx] = useState(false);
  const [loggingWorkout, setLoggingWorkout] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // initial recommendation
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingRx(true);
      setError(null);
      try {
        const rx = await getNextSession(goal);
        if (!cancelled) setPrescription(rx);
      } catch (e: any) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoadingRx(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [goal]);

  const updateLogField = (field: keyof WorkoutLog, value: any) => {
    setLogForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoggingWorkout(true);
    setError(null);
    setSimulatedDose(null);

    try {
      const newState = await logWorkout({ ...logForm, timestamp: nowIso() });
      setLatestState(newState);
      const rx = await getNextSession(goal);
      setPrescription(rx);
    } catch (e: any) {
      setError(e);
    } finally {
      setLoggingWorkout(false);
    }
  };

  const handleSimulateDose = async () => {
    setError(null);
    setSimulatedDose(null);
    try {
      const dose = await simulateDose({ ...logForm, timestamp: nowIso() });
      setSimulatedDose(dose);
    } catch (e: any) {
      setError(e);
    }
  };

  const handleCrashWorkout = async () => {
    setLoggingWorkout(true);
    setError(null);
    setSimulatedDose(null);

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
      const newState = await logWorkout(crash);
      setLatestState(newState);
      const rx = await getNextSession(goal);
      setPrescription(rx);
    } catch (e: any) {
      setError(e);
    } finally {
      setLoggingWorkout(false);
    }
  };

  const handleRefreshRx = async () => {
    setLoadingRx(true);
    setError(null);
    try {
      const rx = await getNextSession(goal);
      setPrescription(rx);
    } catch (e: any) {
      setError(e);
    } finally {
      setLoadingRx(false);
    }
  };

  const renderFatigueBar = (label: string, value: number | undefined) => {
    const v = value ?? 0;
    const pct = Math.max(0, Math.min(100, v));
    return (
      <div key={label} className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{label}</span>
          <span>{pct.toFixed(1)}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  const renderSkillList = () => {
    if (!latestState || !latestState.skill_state) return null;
    const entries = Object.entries(latestState.skill_state);
    if (!entries.length) return null;
    return (
      <div className="mt-3">
        <div className="text-xs font-semibold text-gray-600 mb-1">Skill State</div>
        <ul className="text-xs text-gray-700 space-y-1">
          {entries.map(([movement, skill]) => (
            <li key={movement} className="flex justify-between">
              <span>{movement}</span>
              <span>{(skill * 100).toFixed(0)}%</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderDosePreview = () => {
    if (!simulatedDose) return null;
    const d = simulatedDose;
    return (
      <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-3">
        <div className="text-xs font-semibold text-slate-700 mb-2">
          Stress Dose Preview D(t)
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-800">
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
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Performance Lab – Digital Twin</h1>
            <p className="text-sm text-slate-600">
              S(t) • D(t) • u(t) — end-to-end control loop
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600">
              Goal
              <select
                className="ml-2 text-xs border border-slate-300 rounded-md px-2 py-1 bg-white"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              >
                <option value="Strength">Strength</option>
                <option value="Hypertrophy">Hypertrophy</option>
                <option value="Power">Power</option>
                <option value="General">General</option>
              </select>
            </label>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg px-4 py-3">
            <div className="font-semibold mb-1">Error</div>
            <div>{error.message}</div>
          </div>
        )}

        {/* Top row: Rx + State */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Prescription */}
          <div className="bg-white shadow-md rounded-xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Recommended Next Session (u_t)
              </h2>
              <button
                type="button"
                onClick={handleRefreshRx}
                className="text-xs px-2 py-1 rounded-md border border-slate-300 bg-slate-50 hover:bg-slate-100"
              >
                Refresh
              </button>
            </div>

            {loadingRx ? (
              <div className="animate-pulse h-24 bg-slate-100 rounded-lg" />
            ) : prescription ? (
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-indigo-600">
                      {prescription.type}
                    </h3>
                    <p className="text-sm text-slate-800">{prescription.focus}</p>
                  </div>
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium">
                    {prescription.duration_min} min
                  </span>
                </div>
                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-3 rounded-r">
                  <p className="text-xs text-indigo-900 italic">
                    “{prescription.rationale}”
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No prescription yet.</p>
            )}
          </div>

          {/* State */}
          <div className="bg-white shadow-md rounded-xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Latest State S(t)
              </h2>
              {latestState && (
                <span className="text-[10px] text-slate-500">
                  Updated: {new Date(latestState.timestamp).toLocaleString()}
                </span>
              )}
            </div>

            {latestState ? (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase mb-1">
                      Capacities
                    </div>
                    <div className="text-xs text-slate-800 space-y-1">
                      <div>Met Aerobic: {latestState.c_met_aerobic.toFixed(1)}</div>
                      <div>NM Force: {latestState.c_nm_force.toFixed(1)}</div>
                      <div>Struct: {latestState.c_struct.toFixed(1)}</div>
                      <div>W&apos;: {latestState.b_met_anaerobic.toFixed(1)}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase mb-1">
                      Habit & Signal
                    </div>
                    <div className="text-xs text-slate-800 space-y-1">
                      <div>
                        Habit Strength: {(latestState.habit_strength * 100).toFixed(0)}%
                      </div>
                      <div>
                        Struct Signal: {latestState.s_struct_signal.toFixed(1)}
                      </div>
                    </div>
                    {renderSkillList()}
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 uppercase mb-1">
                  Fatigues (0–100)
                </div>
                {renderFatigueBar("Systemic", latestState.f_met_systemic)}
                {renderFatigueBar("NM Peripheral", latestState.f_nm_peripheral)}
                {renderFatigueBar("NM Central", latestState.f_nm_central)}
                {renderFatigueBar("Structural", latestState.f_struct_damage)}
              </>
            ) : (
              <p className="text-sm text-slate-500">
                No state yet. Log a workout to create S₀ → S₁.
              </p>
            )}
          </div>
        </div>

        {/* Bottom row: form + quick actions */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {/* Workout form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md rounded-xl p-5 border border-slate-200 md:col-span-2"
          >
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">
              Log Workout (Sensor Input)
            </h2>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Modality
                </label>
                <select
                  className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm bg-white"
                  value={logForm.modality}
                  onChange={(e) =>
                    updateLogField("modality", e.target.value as Modality)
                  }
                >
                  {MODALITIES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm"
                  value={logForm.duration_minutes}
                  onChange={(e) =>
                    updateLogField("duration_minutes", Number(e.target.value))
                  }
                  min={1}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Session RPE (1–10)
                </label>
                <input
                  type="number"
                  className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm"
                  value={logForm.session_rpe}
                  onChange={(e) =>
                    updateLogField("session_rpe", Number(e.target.value))
                  }
                  min={1}
                  max={10}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Avg RIR (optional)
                </label>
                <input
                  type="number"
                  className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm"
                  value={logForm.avg_rir ?? ""}
                  onChange={(e) =>
                    updateLogField(
                      "avg_rir",
                      e.target.value === "" ? undefined : Number(e.target.value),
                    )
                  }
                  min={0}
                  max={10}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Sleep Quality (1–10)
                </label>
                <input
                  type="number"
                  className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm"
                  value={logForm.sleep_quality}
                  onChange={(e) =>
                    updateLogField("sleep_quality", Number(e.target.value))
                  }
                  min={1}
                  max={10}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Life Stress Inverse (1–10)
                </label>
                <input
                  type="number"
                  className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm"
                  value={logForm.life_stress_inverse}
                  onChange={(e) =>
                    updateLogField("life_stress_inverse", Number(e.target.value))
                  }
                  min={1}
                  max={10}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <button
                type="submit"
                disabled={loggingWorkout}
                className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-semibold shadow hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loggingWorkout ? "Logging..." : "Log Workout & Update State"}
              </button>

              <button
                type="button"
                onClick={handleSimulateDose}
                className="inline-flex items-center justify-center px-3 py-2 rounded-md bg-slate-100 text-slate-800 text-xs font-medium border border-slate-300 hover:bg-slate-200"
              >
                Simulate Stress Dose Only
              </button>
            </div>

            {renderDosePreview()}
          </form>

          {/* Quick actions */}
          <div className="space-y-4">
            <div className="bg-white shadow-md rounded-xl p-4 border border-slate-200">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                Quick Actions
              </h2>

              <button
                type="button"
                onClick={handleCrashWorkout}
                disabled={loggingWorkout}
                className="w-full mb-3 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 px-3 rounded-lg shadow disabled:opacity-60 disabled:cursor-not-allowed"
              >
                🔥 Log “Crash” Workout
                <div className="text-[10px] font-normal opacity-90">
                  (RPE 10, low sleep, high stress)
                </div>
              </button>

              <button
                type="button"
                onClick={handleRefreshRx}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium py-2 px-3 rounded-lg border border-slate-300"
              >
                🔄 Refresh Recommendation
              </button>
            </div>

            <p className="text-[10px] text-slate-500 text-center px-2">
              Powered by Unified State Vector S(t), Stress Dose D(t), and Controller u(t).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

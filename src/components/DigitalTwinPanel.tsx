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
  ApiError,
} from "../types";
import { LogWorkoutForm } from "./twin/LogWorkoutForm";
import { NextSessionCard } from "./twin/NextSessionCard";
import { PatternPreviewDemo } from "./twin/PatternPreviewDemo";
import {
  nowIso,
  readinessScore,
  toApiError,
  toApiWorkoutLog,
} from "./twin/stateUtils";
import { StateSnapshot } from "./twin/StateSnapshot";
import { TwinConsoleHeader } from "./twin/TwinConsoleHeader";
import { TwinSummaryStrip } from "./twin/TwinSummaryStrip";

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
    <div className="space-y-4">
      <section className="glass-card card-hover relative overflow-hidden text-sm border-teal-100/80">
        <TwinConsoleHeader
          dtGoal={dtGoal}
          onGoalChange={setDtGoal}
          onRefreshRx={() => void handleDtRefreshRx()}
          token={token}
        />

        <TwinSummaryStrip
          readiness={readiness}
          dtState={dtState}
          dtRx={dtRx}
        />

        {dtError && (
          <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[0.75rem] text-rose-700">
            {dtError.status === 401
              ? "Session expired or not authorized — sign in again."
              : dtError.message}
          </div>
        )}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <LogWorkoutForm
            dtLog={dtLog}
            updateDtLog={updateDtLog}
            signedIn={signedIn}
            token={token}
            dtLoading={dtLoading}
            dtDose={dtDose}
            onSubmit={handleDtLog}
            onSimulate={handleDtSimulate}
            onCrash={() => void handleDtCrash()}
          />

          <div className="space-y-3">
            <NextSessionCard
              token={token}
              dtRxLoading={dtRxLoading}
              dtRx={dtRx}
            />
            <StateSnapshot dtState={dtState} />
          </div>
        </div>
      </section>

      <PatternPreviewDemo />
    </div>
  );
}

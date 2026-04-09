// src/components/DigitalTwinPanel.tsx
// UPGRADED: Full command-center glass layout, neon accents, better loading states, motion
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  // ... (all your existing useEffect + handler logic stays 100% unchanged)
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
    return () => { cancelled = true; };
  }, [dtGoal, token]);

  // ... (updateDtLog, handleDtLog, handleDtSimulate, handleDtCrash, handleDtRefreshRx, readiness calculation stay EXACTLY the same)

  function updateDtLog(field: keyof WorkoutLog, value: unknown) {
    setDtLog((prev) => ({ ...prev, [field]: value }));
  }

  async function handleDtLog(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!token) return;
    setDtLoading(true);
    setDtError(null);
    setDtDose(null);
    try {
      const newState = await logDtWorkout(toApiWorkoutLog({ ...dtLog, timestamp: nowIso() }), token);
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
      const dose = await simulateDose(toApiWorkoutLog({ ...dtLog, timestamp: nowIso() }));
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
    const crash: WorkoutLog = { ...DEFAULT_DT_LOG, duration_minutes: 90, session_rpe: 10, sleep_quality: 2, life_stress_inverse: 2, avg_rir: 0 };
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

  const readiness = dtState != null && dtState.fatigue_f && dtState.tissue_t ? readinessScore(dtState) : "—";

  return (
    <div className="space-y-8">
      <Card className="border-white/10 bg-zinc-900/70 backdrop-blur-2xl overflow-hidden">
        <TwinConsoleHeader dtGoal={dtGoal} onGoalChange={setDtGoal} onRefreshRx={handleDtRefreshRx} token={token} />

        <TwinSummaryStrip readiness={readiness} dtState={dtState} dtRx={dtRx} />

        {dtError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-6 mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            {dtError.status === 401 ? "Session expired — sign in again" : dtError.message}
          </motion.div>
        )}

        <CardContent className="pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <LogWorkoutForm
              dtLog={dtLog}
              updateDtLog={updateDtLog}
              signedIn={signedIn}
              token={token}
              dtLoading={dtLoading}
              dtDose={dtDose}
              onSubmit={handleDtLog}
              onSimulate={handleDtSimulate}
              onCrash={handleDtCrash}
            />

            <div className="space-y-6">
              <NextSessionCard token={token} dtRxLoading={dtRxLoading} dtRx={dtRx} />
              <StateSnapshot dtState={dtState} />
            </div>
          </div>
        </CardContent>
      </Card>

      <PatternPreviewDemo />
    </div>
  );
}
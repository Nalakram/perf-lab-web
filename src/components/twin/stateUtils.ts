import type { ApiError, UnifiedStateVector, WorkoutLog } from "../../types";

export function nowIso(): string {
  return new Date().toISOString();
}

export function toApiWorkoutLog(log: WorkoutLog): WorkoutLog {
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

export function readinessScore(s: UnifiedStateVector): string {
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

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof (value as { message: unknown }).message === "string"
  );
}

export function toApiError(err: unknown): ApiError {
  if (isApiError(err)) return err;
  if (err instanceof Error) return { message: err.message };
  return { message: "Unknown error", details: err };
}

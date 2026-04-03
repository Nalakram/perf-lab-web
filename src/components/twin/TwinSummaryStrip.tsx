import type { UnifiedStateVector, WorkoutPrescription } from "../../types";

type TwinSummaryStripProps = {
  readiness: string;
  dtState: UnifiedStateVector | null;
  dtRx: WorkoutPrescription | null;
};

export function TwinSummaryStrip({
  readiness,
  dtState,
  dtRx,
}: TwinSummaryStripProps) {
  return (
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
  );
}

import type { Modality, StressDose, WorkoutLog } from "../../types";
import { DosePanel } from "./widgets";

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

type LogWorkoutFormProps = {
  dtLog: WorkoutLog;
  updateDtLog: (field: keyof WorkoutLog, value: unknown) => void;
  signedIn: boolean;
  token: string | null;
  dtLoading: boolean;
  dtDose: StressDose | null;
  onSubmit: (e: React.FormEvent) => void;
  onSimulate: () => void;
  onCrash: () => void;
};

export function LogWorkoutForm({
  dtLog,
  updateDtLog,
  signedIn,
  token,
  dtLoading,
  dtDose,
  onSubmit,
  onSimulate,
  onCrash,
}: LogWorkoutFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-slate-200/90 bg-gradient-to-b from-slate-50/95 to-white p-4 shadow-sm"
    >
      <h3 className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
        Log Workout
      </h3>
      {!signedIn ? (
        <p className="mb-3 text-[0.7rem] text-amber-800">
          Sign in to log workouts, update S(t), and load your next session.{" "}
          <strong>Simulate D(t)</strong> still works without an account.
        </p>
      ) : null}

      <div className="grid gap-3 text-[0.75rem] sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-[0.65rem] font-medium text-slate-600">
            Modality
          </label>
          <select
            className="select-control py-1.5 text-[0.75rem]"
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
            className="input-control py-1.5 text-[0.75rem]"
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
            className="input-control py-1.5 text-[0.75rem]"
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
            className="input-control py-1.5 text-[0.75rem]"
            value={dtLog.avg_rir ?? ""}
            onChange={(e) =>
              updateDtLog(
                "avg_rir",
                e.target.value === "" ? undefined : Number(e.target.value),
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
            className="input-control py-1.5 text-[0.75rem]"
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
            className="input-control py-1.5 text-[0.75rem]"
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
            className="select-control py-1.5 text-[0.75rem]"
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
            className="select-control py-1.5 text-[0.75rem]"
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
            className="input-control py-1.5 text-[0.75rem]"
            value={dtLog.estimated_sets ?? ""}
            placeholder="—"
            onChange={(e) =>
              updateDtLog(
                "estimated_sets",
                e.target.value === "" ? undefined : Number(e.target.value),
              )
            }
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={dtLoading || !token}
          className="btn-primary text-[0.75rem]"
        >
          {dtLoading ? "Logging..." : "Log & update S(t)"}
        </button>
        <button
          type="button"
          onClick={onSimulate}
          className="btn-secondary text-[0.75rem]"
        >
          Simulate D(t)
        </button>
      </div>

      <details className="details-disclosure mt-3 rounded-xl border border-rose-200/60 bg-rose-50/30 px-3 py-2">
        <summary className="cursor-pointer text-[0.7rem] font-semibold text-rose-900 [&::-webkit-details-marker]:hidden">
          Danger zone
          <span
            className="details-chevron ml-2 inline-block h-2 w-2 rotate-45 border-r-2 border-b-2 border-rose-400 align-middle transition-transform duration-200"
            aria-hidden
          />
        </summary>
        <p className="mt-2 text-[0.65rem] leading-relaxed text-rose-800/90">
          Logs an extreme session into your twin for testing. Use only if you
          understand the effect on S(t).
        </p>
        <button
          type="button"
          disabled={!token || dtLoading}
          onClick={() => void onCrash()}
          className="btn-danger mt-2 text-[0.75rem]"
        >
          Crash session
        </button>
      </details>

      <DosePanel dose={dtDose} />
    </form>
  );
}

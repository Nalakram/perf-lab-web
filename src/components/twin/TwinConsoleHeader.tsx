import { TRAINING_GOALS } from "../../trainingGoals";

type TwinConsoleHeaderProps = {
  dtGoal: string;
  onGoalChange: (goal: string) => void;
  onRefreshRx: () => void;
  token: string | null;
};

export function TwinConsoleHeader({
  dtGoal,
  onGoalChange,
  onRefreshRx,
  token,
}: TwinConsoleHeaderProps) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-indigo-500 via-teal-500 to-teal-400"
        aria-hidden
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="section-label">Digital Twin · Control Loop</p>
          <h2 className="mt-1.5 text-base font-semibold text-slate-900">
            S(t), D(t), and your next session
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            Goal
            <select
              className="select-control min-w-[min(100%,12rem)] max-w-[min(100%,18rem)] py-1.5 text-xs"
              value={dtGoal}
              onChange={(e) => onGoalChange(e.target.value)}
            >
              {TRAINING_GOALS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={!token}
            onClick={onRefreshRx}
            className="btn-ghost border-slate-200 py-1.5 disabled:cursor-not-allowed"
          >
            Refresh u(t)
          </button>
        </div>
      </div>
    </>
  );
}

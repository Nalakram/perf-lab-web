import type { WorkoutPrescription } from "../../types";

type NextSessionCardProps = {
  token: string | null;
  dtRxLoading: boolean;
  dtRx: WorkoutPrescription | null;
};

export function NextSessionCard({
  token,
  dtRxLoading,
  dtRx,
}: NextSessionCardProps) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white/95 p-4 shadow-sm">
      <h3 className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
        Next Session · u(t)
      </h3>
      {!token ? (
        <p className="text-[0.75rem] text-slate-500">
          Sign in to load a personalized next session from the API.
        </p>
      ) : dtRxLoading ? (
        <div className="h-16 animate-pulse rounded-xl bg-gradient-to-r from-slate-100 via-teal-50/50 to-slate-100" />
      ) : dtRx ? (
        <>
          <div className="mb-2 flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">{dtRx.type}</p>
              <p className="text-[0.8rem] text-slate-600">{dtRx.focus}</p>
            </div>
            <span className="rounded-full border border-teal-200/60 bg-teal-50 px-2.5 py-1 text-[0.7rem] font-semibold text-teal-900">
              {dtRx.duration_min} min
            </span>
          </div>
          <p className="text-[0.75rem] text-slate-500">“{dtRx.rationale}”</p>
        </>
      ) : (
        <p className="text-[0.75rem] text-slate-500">
          Log one workout to get a first prescription.
        </p>
      )}
    </div>
  );
}

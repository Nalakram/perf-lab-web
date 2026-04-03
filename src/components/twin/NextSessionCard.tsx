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
          {dtRx.why ? (
            <details className="details-disclosure mt-3 rounded-lg border border-slate-200/80 bg-slate-50/50 px-2 py-1.5 text-left">
              <summary className="cursor-pointer text-[0.65rem] font-semibold text-slate-600 [&::-webkit-details-marker]:hidden">
                Why this session?
                <span
                  className="details-chevron ml-2 inline-block h-1.5 w-1.5 rotate-45 border-r-2 border-b-2 border-slate-400 align-middle"
                  aria-hidden
                />
              </summary>
              <div className="mt-2 space-y-2 text-[0.65rem] leading-relaxed text-slate-600">
                {dtRx.why.state_drivers?.length ? (
                  <div>
                    <span className="font-semibold text-slate-700">State: </span>
                    {dtRx.why.state_drivers.join("; ")}
                  </div>
                ) : null}
                {dtRx.why.goal_alignment ? (
                  <div>
                    <span className="font-semibold text-slate-700">Goal: </span>
                    {dtRx.why.goal_alignment}
                  </div>
                ) : null}
                {dtRx.why.structured_template_name || dtRx.why.template_id ? (
                  <div>
                    <span className="font-semibold text-slate-700">Template: </span>
                    {dtRx.why.structured_template_name ?? dtRx.why.template_id}
                  </div>
                ) : null}
                {dtRx.why.source_alignment?.length ? (
                  <div>
                    <span className="font-semibold text-slate-700">Sources: </span>
                    {dtRx.why.source_alignment.join("; ")}
                  </div>
                ) : null}
                {dtRx.why.constraints_applied?.length ? (
                  <div>
                    <span className="font-semibold text-slate-700">Constraints: </span>
                    {dtRx.why.constraints_applied.join("; ")}
                  </div>
                ) : null}
                {dtRx.why.score != null && dtRx.why.score !== undefined ? (
                  <div>
                    <span className="font-semibold text-slate-700">Fit score: </span>
                    {dtRx.why.score.toFixed(2)}
                  </div>
                ) : null}
                {dtRx.why.warnings?.length ? (
                  <div className="text-amber-900">
                    <span className="font-semibold text-slate-700">Warnings: </span>
                    {dtRx.why.warnings.join("; ")}
                  </div>
                ) : null}
                {dtRx.why.validation ? (
                  <div
                    className={
                      dtRx.why.validation.passed
                        ? "text-teal-800"
                        : "text-amber-800"
                    }
                  >
                    Validation:{" "}
                    {dtRx.why.validation.passed ? "passed" : "issues noted"}
                    {dtRx.why.validation.hard_violations?.length
                      ? ` — ${dtRx.why.validation.hard_violations.join(", ")}`
                      : ""}
                  </div>
                ) : null}
              </div>
            </details>
          ) : null}
        </>
      ) : (
        <p className="text-[0.75rem] text-slate-500">
          Log one workout to get a first prescription.
        </p>
      )}
    </div>
  );
}

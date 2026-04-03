export function EngineExplainer() {
  return (
    <details className="details-disclosure glass-card relative overflow-hidden border-teal-100/80">
      <summary className="relative cursor-pointer list-none pr-8 text-left [&::-webkit-details-marker]:hidden">
        <span className="section-label">How the engine thinks</span>
        <span
          className="details-chevron pointer-events-none absolute right-1 top-1 h-2.5 w-2.5 shrink-0 rotate-45 border-r-2 border-b-2 border-slate-400 transition-transform duration-200"
          aria-hidden
        />
      </summary>
      <div className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
        <p>
          perf-lab-api maintains a unified internal state{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs text-slate-800">
            S(t)
          </code>{" "}
          and applies stress doses{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs text-slate-800">
            D(t)
          </code>{" "}
          for every workout you log. Over time, it updates your systems on
          multiple time scales – fast fatigue, slower fitness, and deeper
          structural changes – instead of following a static plan.
        </p>
        <p className="mt-3 text-xs text-slate-500">
          These panels read live state, doses, and adaptive prescriptions from
          your own twin so you can see why the next session was chosen.
        </p>
      </div>
    </details>
  );
}

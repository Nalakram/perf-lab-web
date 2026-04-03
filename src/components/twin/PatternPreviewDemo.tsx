export function PatternPreviewDemo() {
  return (
    <details className="details-disclosure glass-card card-hover">
      <summary className="relative cursor-pointer list-none pr-8 text-left [&::-webkit-details-marker]:hidden">
        <p className="section-label">Demo · Pattern preview</p>
        <span
          className="details-chevron pointer-events-none absolute right-3 top-3 h-2.5 w-2.5 shrink-0 rotate-45 border-r-2 border-b-2 border-slate-400 transition-transform duration-200"
          aria-hidden
        />
      </summary>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900">
          If you ran this 3× per week…
        </h2>
        <p className="text-[0.7rem] text-slate-500">
          UI only for now – later this can read from repeated next-session
          calls.
        </p>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto text-[0.75rem] text-slate-700 scrollbar-thin">
        <div className="glass-card-dense card-subtle min-w-[9rem]">
          <p className="metric-heading">Week 1</p>
          <p className="metric-sub mt-1">Base pattern, no progression.</p>
        </div>
        <div className="glass-card-dense card-subtle min-w-[9rem]">
          <p className="metric-heading">Week 2</p>
          <p className="metric-sub mt-1">
            Slightly more volume / intensity.
          </p>
        </div>
        <div className="glass-card-dense card-subtle min-w-[9rem]">
          <p className="metric-heading">Week 3</p>
          <p className="metric-sub mt-1">
            Future: driven from <code>next-session</code>.
          </p>
        </div>
      </div>
    </details>
  );
}

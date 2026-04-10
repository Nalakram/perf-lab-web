export function PatternPreviewDemo() {
  return (
    <details className="group my-6 rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl overflow-hidden">
      <summary className="cursor-pointer list-none px-6 py-4 flex items-center justify-between [&::-webkit-details-marker]:hidden">
        <span className="text-xs font-mono tracking-widest text-neon-cyan">DEMO &middot; PATTERN PREVIEW</span>
        <span
          className="h-2.5 w-2.5 shrink-0 rotate-45 border-r-2 border-b-2 border-zinc-400 transition-transform duration-200 group-open:rotate-[225deg]"
          aria-hidden
        />
      </summary>
      <div className="mt-2 px-6 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-white">
          If you ran this 3&times; per week&hellip;
        </h2>
        <p className="text-[0.7rem] text-zinc-300">
          UI only for now &ndash; later this can read from repeated next-session
          calls.
        </p>
      </div>

      <div className="mt-3 px-6 pb-5 flex gap-2 overflow-x-auto text-[0.75rem] text-zinc-100 scrollbar-thin">
        <div className="rounded-xl border border-white/10 bg-black/30 p-3 min-w-[9rem]">
          <p className="metric-heading">Week 1</p>
          <p className="metric-sub mt-1">Base pattern, no progression.</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-3 min-w-[9rem]">
          <p className="metric-heading">Week 2</p>
          <p className="metric-sub mt-1">
            Slightly more volume / intensity.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-3 min-w-[9rem]">
          <p className="metric-heading">Week 3</p>
          <p className="metric-sub mt-1">
            Future: driven from <code>next-session</code>.
          </p>
        </div>
      </div>
    </details>
  );
}

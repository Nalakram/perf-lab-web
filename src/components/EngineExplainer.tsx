export function EngineExplainer() {
  return (
    <details className="group my-6 rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl overflow-hidden">
      <summary className="cursor-pointer list-none px-6 py-4 flex items-center justify-between [&::-webkit-details-marker]:hidden">
        <span className="text-xs font-mono tracking-widest text-neon-cyan">HOW THE ENGINE THINKS</span>
        <span className="h-2.5 w-2.5 shrink-0 rotate-45 border-r-2 border-b-2 border-zinc-400 transition-transform duration-200 group-open:rotate-[225deg]" aria-hidden />
      </summary>
      <div className="px-6 pb-5 space-y-3 text-sm leading-relaxed text-zinc-200">
        <p>
          perf-lab-api maintains a unified internal state{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-neon-cyan font-mono">S(t)</code>{" "}
          and applies stress doses{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-neon-magenta font-mono">D(t)</code>{" "}
          for every workout you log. Over time it updates your systems on multiple time scales
          &mdash; fast fatigue, slower fitness, and deeper structural changes &mdash; instead of
          following a static plan.
        </p>
        <p className="text-zinc-400 text-xs">
          These panels read live state, doses, and adaptive prescriptions from your own twin
          so you can see why the next session was chosen.
        </p>
      </div>
    </details>
  );
}

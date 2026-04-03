// src/components/HeroFlowColumn.tsx
import { useEffect, useState } from "react";

type Zone = {
  name: string;
  slow_pace_sec: number;
  fast_pace_sec: number;
  notes: string;
};

type MetricsResponse = {
  vo2_max: number;
  vo2_category: string;
  result_category: string;
  fatigue_percent: number;
  fatigue_profile: string;
  race_pace_sec_per_mile: number;
  zones: Zone[];
};

interface HeroFlowColumnProps {
  apiBase: string;
}

function formatMMSS(sec: number) {
  if (!isFinite(sec) || sec <= 0) return "–";
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function HeroFlowColumn({ apiBase }: HeroFlowColumnProps) {
  const [age, setAge] = useState(35);
  const [sex, setSex] = useState<"male" | "female">("male");
  const [time300, setTime300] = useState("0:55");
  const [time15, setTime15] = useState("12:30");

  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  async function computeMetrics(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setMetricsError(null);

    try {
      const res = await fetch(`${apiBase}/compute-metrics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age,
          sex,
          time_300m: time300,
          time_1p5mi: time15,
        }),
      });

      if (!res.ok) {
        setMetrics(null);
        setMetricsError(`API error ${res.status}`);
        return;
      }

      const data = (await res.json()) as MetricsResponse;
      setMetrics(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to compute metrics. Check API and network.";
      setMetrics(null);
      setMetricsError(msg);
    } finally {
      setLoading(false);
    }
  }

  // initial compute on mount (keeps legacy behavior)
  useEffect(() => {
    computeMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  return (
    <section className="space-y-4">
        <div className="feature-dark mb-1">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-teal-300/90">
            Hero Flow
          </p>
          <div className="mt-4 flex flex-col gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-teal-400/50 bg-teal-500/15 text-xs font-bold text-teal-200">
                1
              </div>
              <div>
                <p className="font-semibold text-white">Enter your tactical test</p>
                <p className="mt-0.5 text-sm text-slate-400">
                  300 m and 1.5 mile times, age, and sex.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-600 bg-slate-800/80 text-xs font-bold text-slate-300">
                2
              </div>
              <div>
                <p className="font-semibold text-white">See VO₂, zones, fatigue</p>
                <p className="mt-0.5 text-sm text-slate-400">
                  Get your VO₂ band, 1.5-mile category, and pace zones.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-600 bg-slate-800/80 text-xs font-bold text-slate-300">
                3
              </div>
              <div>
                <p className="font-semibold text-white">Log sessions into S(t)</p>
                <p className="mt-0.5 text-sm text-slate-400">
                  Feed the digital twin and see how your internal state evolves.
                </p>
              </div>
            </div>
          </div>
        </div>

      {/* Inputs card */}
      <section className="glass-card card-hover relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 via-teal-400 to-indigo-400"
          aria-hidden
        />
        <p className="section-label">Tactical Field Test</p>
        <h2 className="mt-2 text-base font-semibold text-slate-900">
          Build your profile from one 300m + 1.5 mile
        </h2>

        <form
          onSubmit={computeMetrics}
          className="mt-5 grid gap-4 text-sm sm:grid-cols-4"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-slate-500">
              Age
            </label>
            <input
              type="number"
              min={15}
              max={80}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="input-control"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-slate-500">
              Sex
            </label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value as "male" | "female")}
              className="select-control"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-slate-500">
              300 m (mm:ss)
            </label>
            <input
              value={time300}
              onChange={(e) => setTime300(e.target.value)}
              className="input-control bg-slate-50/80"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-slate-500">
              1.5 mile (mm:ss)
            </label>
            <input
              value={time15}
              onChange={(e) => setTime15(e.target.value)}
              className="input-control bg-slate-50/80"
            />
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-3 sm:col-span-4">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Computing..." : "Compute"}
            </button>
            <span className="text-xs text-slate-500">
              Edit values and press Enter or click Compute.
            </span>
          </div>
        </form>

        {metricsError && (
          <p className="mt-3 text-xs text-rose-400">
            Error: {metricsError}. Check base URL and try again.
          </p>
        )}
      </section>

      {/* Snapshot metrics */}
      <section className="grid gap-4 text-sm md:grid-cols-3">
        <div className="glass-card relative overflow-hidden pt-6">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-teal-500 to-teal-300" aria-hidden />
          <h2 className="metric-heading mb-1 text-xs">VO₂ Max</h2>
          <p className="metric-value">
            {metrics ? metrics.vo2_max.toFixed(1) : "–"}
          </p>
          <p className="metric-sub">
            Category: {metrics ? metrics.vo2_category : "–"}
          </p>
        </div>

        <div className="glass-card relative overflow-hidden pt-6">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-400" aria-hidden />
          <h2 className="metric-heading mb-1 text-xs">1.5 mile result</h2>
          <p className="metric-value">
            {metrics
              ? `${formatMMSS(metrics.race_pace_sec_per_mile)} /mi`
              : "–"}
          </p>
          <p className="metric-sub">
            Category: {metrics ? metrics.result_category : "–"}
          </p>
        </div>

        <div className="glass-card relative overflow-hidden pt-6">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-400" aria-hidden />
          <h2 className="metric-heading mb-1 text-xs">Fatigue profile</h2>
          <p className="metric-value">
            {metrics ? `${metrics.fatigue_percent.toFixed(1)}%` : "–"}
          </p>
          <p className="metric-sub">
            {metrics ? metrics.fatigue_profile : "Speed / endurance mix"}
          </p>
        </div>
      </section>

      {/* Coach summary */}
      <section className="glass-card text-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Coach Summary
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {metrics ? (
            <>
              You are a{" "}
              <strong>{metrics.fatigue_profile.toLowerCase()}</strong> runner
              with VO₂ max in the{" "}
              <strong>{metrics.vo2_category}</strong> range and a current
              1.5-mile pace of{" "}
              <strong>
                {formatMMSS(metrics.race_pace_sec_per_mile)} per mile
              </strong>
              .
            </>
          ) : (
            <>Enter your times above and compute to see your profile and zones.</>
          )}
        </p>
      </section>

      {/* Zones table */}
      <section className="glass-card text-sm">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Pace Zones (min/mile, demo)
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 text-xs">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50/90 text-[0.7rem] uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="border-b border-slate-200 py-2.5 pr-3 pl-3 text-left font-semibold">
                  Zone
                </th>
                <th className="border-b border-slate-200 py-2.5 px-3 text-left font-semibold">
                  Slower
                </th>
                <th className="border-b border-slate-200 py-2.5 px-3 text-left font-semibold">
                  Faster
                </th>
                <th className="border-b border-slate-200 py-2.5 pl-3 pr-3 text-left font-semibold">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {metrics &&
                metrics.zones.map((z) => (
                  <tr
                    key={z.name}
                    className="odd:bg-slate-50/50 transition-colors hover:bg-teal-50/40"
                  >
                    <td className="border-b border-slate-100 py-2 pr-3 pl-3 align-top font-medium">
                      {z.name}
                    </td>
                    <td className="border-b border-slate-100 py-2 px-3 align-top tabular-nums">
                      {formatMMSS(z.slow_pace_sec)}
                    </td>
                    <td className="border-b border-slate-100 py-2 px-3 align-top tabular-nums">
                      {formatMMSS(z.fast_pace_sec)}
                    </td>
                    <td className="border-b border-slate-100 py-2 pl-3 pr-3 align-top text-slate-500">
                      {z.notes}
                    </td>
                  </tr>
                ))}
              {!metrics && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
                    Zones will appear here after you compute metrics.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

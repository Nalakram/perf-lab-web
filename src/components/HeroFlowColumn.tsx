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
        {/* inside HeroFlowColumn, before the first <section className="glass-card"> */}
        <div className="glass-card mb-3">
          <p className="section-label">Hero Flow</p>
          <div className="mt-3 flex flex-col gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full border border-cyan-500/70 flex items-center justify-center text-[0.7rem] font-semibold text-cyan-300 bg-slate-950">
                1
              </div>
              <div>
                <p className="font-semibold text-slate-100">Enter your tactical test</p>
                <p className="text-slate-500">
                  300 m and 1.5 mile times, age, and sex.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full border border-slate-700 flex items-center justify-center text-[0.7rem] font-semibold text-slate-300 bg-slate-950">
                2
              </div>
              <div>
                <p className="font-semibold text-slate-100">See VO₂, zones, fatigue</p>
                <p className="text-slate-500">
                  Get your VO₂ band, 1.5-mile category, and pace zones.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full border border-slate-700 flex items-center justify-center text-[0.7rem] font-semibold text-slate-300 bg-slate-950">
                3
              </div>
              <div>
                <p className="font-semibold text-slate-100">Log sessions into S(t)</p>
                <p className="text-slate-500">
                  Feed the digital twin and see how your internal state evolves.
                </p>
              </div>
            </div>
          </div>
        </div>

      {/* Inputs card */}
      <section className="glass-card card-hover">
        <p className="section-label">Tactical Field Test</p>
        <h2 className="mt-2 text-sm font-semibold text-slate-50">
          Build your profile from one 300m + 1.5 mile
        </h2>

        <form
          onSubmit={computeMetrics}
          className="mt-4 grid gap-3 text-sm sm:grid-cols-4"
        >
          <div className="flex flex-col gap-1">
            <label className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
              Age
            </label>
            <input
              type="number"
              min={15}
              max={80}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900
                    focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
              Sex
            </label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value as "male" | "female")}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900
                focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
              300 m (mm:ss)
            </label>
            <input
              value={time300}
              onChange={(e) => setTime300(e.target.value)}
              className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
              1.5 mile (mm:ss)
            </label>
            <input
              value={time15}
              onChange={(e) => setTime15(e.target.value)}
              className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="mt-1 flex items-center gap-3 sm:col-span-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-900/40 disabled:opacity-60"
            >
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
      <section className="grid gap-3 text-sm md:grid-cols-3">
        <div className="glass-card">
          <h2 className="metric-heading mb-1 text-xs">VO₂ Max</h2>
          <p className="metric-value">
            {metrics ? metrics.vo2_max.toFixed(1) : "–"}
          </p>
          <p className="metric-sub">
            Category: {metrics ? metrics.vo2_category : "–"}
          </p>
        </div>

        <div className="glass-card">
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

        <div className="glass-card">
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
        <h2 className="text-xs font-semibold">Coach Summary</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-200">
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
        <h2 className="text-xs font-semibold mb-3">
          Pace Zones (min/mile, demo)
        </h2>
        <div className="overflow-x-auto text-xs">
          <table className="min-w-full border-collapse">
            <thead className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-400">
              <tr>
                <th className="border-b border-slate-800 py-1 pr-2 text-left">
                  Zone
                </th>
                <th className="border-b border-slate-800 py-1 px-2 text-left">
                  Slower
                </th>
                <th className="border-b border-slate-800 py-1 px-2 text-left">
                  Faster
                </th>
                <th className="border-b border-slate-800 py-1 pl-2 text-left">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {metrics &&
                metrics.zones.map((z) => (
                  <tr
                    key={z.name}
                    className="odd:bg-slate-900/40 hover:bg-slate-800/60"
                  >
                    <td className="py-1 pr-2 align-top">{z.name}</td>
                    <td className="py-1 px-2 align-top">
                      {formatMMSS(z.slow_pace_sec)}
                    </td>
                    <td className="py-1 px-2 align-top">
                      {formatMMSS(z.fast_pace_sec)}
                    </td>
                    <td className="py-1 pl-2 align-top text-slate-400">
                      {z.notes}
                    </td>
                  </tr>
                ))}
              {!metrics && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-2 text-center text-slate-500"
                  >
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

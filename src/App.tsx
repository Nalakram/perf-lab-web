import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

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

function formatMMSS(sec: number) {
  if (!isFinite(sec) || sec <= 0) return "–";
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function App() {
  const [age, setAge] = useState(35);
  const [sex, setSex] = useState<"male" | "female">("male");
  const [time300, setTime300] = useState("0:55");
  const [time15, setTime15] = useState("12:30");
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function computeMetrics(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/compute-metrics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age,
          sex,
          time_300m: time300,
          time_1p5mi: time15,
        }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = (await res.json()) as MetricsResponse;
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || "Failed to compute metrics");
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    computeMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-950 to-black text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-sm tracking-[0.3em] uppercase text-slate-200 font-semibold">
              Performance Lab
            </h1>
            <p className="text-xs text-slate-400">
              1.5 Mile · VO₂ Max · Fatigue Profile · Pace Zones
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-5 flex flex-col gap-4">
        {/* Inputs card */}
        <section className="bg-slate-950/80 border border-cyan-500/50 rounded-xl shadow-xl shadow-cyan-900/30 p-4">
          <h2 className="text-sm font-semibold mb-3">Inputs</h2>
          <form
            onSubmit={computeMetrics}
            className="grid gap-3 sm:grid-cols-4 text-sm"
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
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
                Sex
              </label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as "male" | "female")}
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
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
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-400">
                1.5 mile (mm:ss)
              </label>
              <input
                value={time15}
                onChange={(e) => setTime15(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>

            <div className="sm:col-span-4 flex items-center gap-3 mt-1">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-semibold text-xs shadow-lg shadow-cyan-900/40 disabled:opacity-60"
              >
                {loading ? "Computing..." : "Compute"}
              </button>
              <span className="text-xs text-slate-500">
                Edit values and press Enter or click Compute.
              </span>
            </div>
          </form>
        </section>

        {/* Metrics row */}
        <section className="grid gap-3 md:grid-cols-3 text-sm">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-lg shadow-slate-950/70">
            <h2 className="text-xs font-semibold mb-1">VO₂ Max</h2>
            <p className="text-xl font-semibold">
              {metrics ? metrics.vo2_max.toFixed(1) : "–"}
            </p>
            <p className="text-xs text-slate-400">
              Category: {metrics ? metrics.vo2_category : "–"}
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-lg shadow-slate-950/70">
            <h2 className="text-xs font-semibold mb-1">1.5 Mile Result</h2>
            <p className="text-xl font-semibold">
              {metrics
                ? `${formatMMSS(metrics.race_pace_sec_per_mile)} /mi`
                : "–"}
            </p>
            <p className="text-xs text-slate-400">
              Category: {metrics ? metrics.result_category : "–"}
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-lg shadow-slate-950/70">
            <h2 className="text-xs font-semibold mb-1">Fatigue Profile</h2>
            <p className="text-xl font-semibold">
              {metrics ? `${metrics.fatigue_percent.toFixed(1)}%` : "–"}
            </p>
            <p className="text-xs text-slate-400">
              {metrics ? metrics.fatigue_profile : "Speed / endurance mix"}
            </p>
          </div>
        </section>

        {/* Coach summary */}
        <section className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-sm shadow-lg shadow-slate-950/70">
          <h2 className="text-xs font-semibold mb-2">Coach Summary</h2>
          {error && (
            <p className="text-xs text-rose-400 mb-1">
              Error: {error}. Check API base URL and try again.
            </p>
          )}
          <p className="text-sm text-slate-200 leading-relaxed">
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
              <>
                Enter your times above and compute to see your profile and pace
                zones.
              </>
            )}
          </p>
        </section>

        {/* Zones table */}
        <section className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-sm shadow-lg shadow-slate-950/70">
          <h2 className="text-xs font-semibold mb-3">Pace Zones (min/mile)</h2>
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
                      className="odd:bg-slate-900/60 hover:bg-slate-800/70"
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
                      className="py-2 text-slate-500 text-center"
                    >
                      Zones will appear here after you compute metrics.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="text-center text-[0.7rem] text-slate-500 border-t border-slate-900 py-2">
        Built by Nalakram · React + FastAPI edition
      </footer>
    </div>
  );
}

export default App;

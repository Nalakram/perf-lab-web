// src/components/HeroFlowColumn.tsx
// UPGRADED: Premium dark glass cards, shadcn form components, Framer Motion metric reveals, neon accents
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
        body: JSON.stringify({ age, sex, time_300m: time300, time_1p5mi: time15 }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = (await res.json()) as MetricsResponse;
      setMetrics(data);
    } catch (err: unknown) {
      setMetricsError(err instanceof Error ? err.message : "Failed to compute metrics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    computeMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      {/* How it works */}
      <Card className="border-white/10 bg-zinc-900/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-neon-cyan text-sm font-mono tracking-widest">HOW THE ENGINE WORKS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: n * 0.1 }}
                className="flex gap-4"
              >
                <div className="h-7 w-7 shrink-0 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-violet flex items-center justify-center text-xs font-bold text-black">
                  {n}
                </div>
                <div>
                  <p className="font-semibold">
                    {n === 1 && "Enter tactical test"}
                    {n === 2 && "Instant VO₂ + zones"}
                    {n === 3 && "Feed into S(t) twin"}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {n === 1 && "300 m + 1.5 mile times"}
                    {n === 2 && "See fatigue profile & pace zones"}
                    {n === 3 && "Log sessions → adaptive prescription"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tactical Field Test Form */}
      <Card className="border-white/10 bg-zinc-900/50 backdrop-blur-xl overflow-hidden">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="flex items-center gap-3">
            <span className="text-neon-cyan">TACTICAL FIELD TEST</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={computeMetrics} className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="text-xs font-medium text-zinc-400">AGE</label>
              <Input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="bg-black/60 border-white/10" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">SEX</label>
              <Select value={sex} onValueChange={(v) => setSex(v as "male" | "female")}>
                <SelectTrigger className="bg-black/60 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">300 M (MM:SS)</label>
              <Input value={time300} onChange={(e) => setTime300(e.target.value)} className="bg-black/60 border-white/10 font-mono" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">1.5 MILE (MM:SS)</label>
              <Input value={time15} onChange={(e) => setTime15(e.target.value)} className="bg-black/60 border-white/10 font-mono" />
            </div>

            <div className="md:col-span-4 flex items-center gap-4">
              <Button type="submit" disabled={loading} size="lg" className="bg-gradient-to-r from-neon-cyan to-neon-violet text-black font-semibold">
                {loading ? "COMPUTING…" : "COMPUTE METRICS"}
              </Button>
              <span className="text-xs text-zinc-500">Press Enter or click above</span>
            </div>
          </form>

          {metricsError && <p className="mt-4 text-rose-400 text-sm">{metricsError}</p>}
        </CardContent>
      </Card>

      {/* Live Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-white/10 bg-gradient-to-br from-zinc-900 to-black h-full">
            <CardContent className="pt-8">
              <div className="text-neon-cyan text-xs font-mono tracking-widest">VO₂ MAX</div>
              <div className="text-6xl font-semibold tabular-nums mt-1 text-white">
                {metrics ? metrics.vo2_max.toFixed(1) : "––"}
              </div>
              <div className="text-zinc-400 text-sm mt-2">
                {metrics ? metrics.vo2_category : "—"}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-white/10 bg-gradient-to-br from-zinc-900 to-black h-full">
            <CardContent className="pt-8">
              <div className="text-neon-violet text-xs font-mono tracking-widest">1.5 MILE PACE</div>
              <div className="text-6xl font-semibold tabular-nums mt-1 text-white">
                {metrics ? formatMMSS(metrics.race_pace_sec_per_mile) : "––"} <span className="text-base font-normal">/mi</span>
              </div>
              <div className="text-zinc-400 text-sm mt-2">
                {metrics ? metrics.result_category : "—"}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-white/10 bg-gradient-to-br from-zinc-900 to-black h-full">
            <CardContent className="pt-8">
              <div className="text-amber-400 text-xs font-mono tracking-widest">FATIGUE PROFILE</div>
              <div className="text-6xl font-semibold tabular-nums mt-1 text-white">
                {metrics ? `${metrics.fatigue_percent.toFixed(0)}%` : "––"}
              </div>
              <div className="text-zinc-400 text-sm mt-2">
                {metrics ? metrics.fatigue_profile : "—"}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pace Zones Table */}
      <Card className="border-white/10 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-sm font-mono tracking-widest text-neon-cyan">PACE ZONES (MIN/MILE)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead>ZONE</TableHead>
                <TableHead>SLOWER</TableHead>
                <TableHead>FASTER</TableHead>
                <TableHead>NOTES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics?.zones.map((z) => (
                <TableRow key={z.name} className="border-white/10">
                  <TableCell className="font-medium">{z.name}</TableCell>
                  <TableCell className="font-mono">{formatMMSS(z.slow_pace_sec)}</TableCell>
                  <TableCell className="font-mono">{formatMMSS(z.fast_pace_sec)}</TableCell>
                  <TableCell className="text-zinc-400 text-sm">{z.notes}</TableCell>
                </TableRow>
              ))}
              {!metrics && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-zinc-500 py-12">
                    Compute your test to unlock pace zones
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
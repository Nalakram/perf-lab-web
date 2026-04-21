// src/components/twin/LogWorkoutForm.tsx
import { motion } from "framer-motion";
import type { Modality, PlannedSessionRead, StressDose, WorkoutLog } from "../../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DosePanel } from "./widgets";

const MOVEMENT_PATTERN_OPTIONS = [
  "mixed", "squat", "hinge", "run", "push_horizontal", "push_vertical",
  "pull_horizontal", "pull_vertical", "single_leg", "core", "jump", "bike", "row",
] as const;

type LogWorkoutFormProps = {
  dtLog: WorkoutLog;
  updateDtLog: (field: keyof WorkoutLog, value: unknown) => void;
  todaySession: PlannedSessionRead | null;
  benchmarkKey: string;
  benchmarkValue: string;
  onBenchmarkKeyChange: (v: string) => void;
  onBenchmarkValueChange: (v: string) => void;
  signedIn: boolean;
  token: string | null;
  dtLoading: boolean;
  dtDose: StressDose | null;
  onSubmit: (e: React.FormEvent) => void;
  onSimulate: () => void;
  onCrash: () => void;
};

export function LogWorkoutForm({
  dtLog,
  updateDtLog,
  todaySession,
  benchmarkKey,
  benchmarkValue,
  onBenchmarkKeyChange,
  onBenchmarkValueChange,
  signedIn,
  token,
  dtLoading,
  dtDose,
  onSubmit,
  onSimulate,
  onCrash,
}: LogWorkoutFormProps) {
  return (
    <Card className="border-white/10 bg-zinc-900/70 backdrop-blur-2xl overflow-hidden">
      <CardContent className="p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight text-white">
              Log Workout
            </h3>
            {todaySession && (
              <div className="text-xs text-zinc-300 border border-zinc-700 rounded-lg px-2 py-1">
                Today: {todaySession.category} ({todaySession.scheduled_date})
              </div>
            )}
            {!signedIn && (
              <Badge variant="outline" className="text-amber-400 border-amber-400/30">
                Demo Mode
              </Badge>
            )}
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Modality + Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-200 text-xs">Modality</Label>
                <Select value={dtLog.modality} onValueChange={(v) => updateDtLog("modality", v as Modality)}>
                  <SelectTrigger className="bg-black/60 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Strength">Strength</SelectItem>
                    <SelectItem value="Hypertrophy">Hypertrophy</SelectItem>
                    <SelectItem value="Power">Power</SelectItem>
                    <SelectItem value="Running">Running</SelectItem>
                    <SelectItem value="Mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-zinc-200 text-xs">Duration (min)</Label>
                <Input
                  type="number"
                  value={dtLog.duration_minutes}
                  onChange={(e) => updateDtLog("duration_minutes", Number(e.target.value))}
                  className="bg-black/60 border-white/20 text-white"
                />
              </div>
            </div>

            {/* RPE, RIR, Sleep, Stress */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-200 text-xs">Session RPE (1-10)</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={dtLog.session_rpe}
                  onChange={(e) => updateDtLog("session_rpe", Number(e.target.value))}
                  className="bg-black/60 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-200 text-xs">Avg RIR (optional)</Label>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  value={dtLog.avg_rir ?? ""}
                  onChange={(e) => updateDtLog("avg_rir", e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-black/60 border-white/20 text-white"
                />
              </div>
            </div>

            {/* Sleep & Life Stress */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-200 text-xs">Sleep (1-10)</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={dtLog.sleep_quality}
                  onChange={(e) => updateDtLog("sleep_quality", Number(e.target.value))}
                  className="bg-black/60 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-200 text-xs">Life Stress Inverse (1-10)</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={dtLog.life_stress_inverse}
                  onChange={(e) => updateDtLog("life_stress_inverse", Number(e.target.value))}
                  className="bg-black/60 border-white/20 text-white"
                />
              </div>
            </div>

            {/* Movement Pattern & Novelty */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-200 text-xs">Dominant Movement Pattern</Label>
                <Select
                  value={dtLog.dominant_movement_pattern ?? "mixed"}
                  onValueChange={(v) => updateDtLog("dominant_movement_pattern", v)}
                >
                  <SelectTrigger className="bg-black/60 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOVEMENT_PATTERN_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-zinc-200 text-xs">Novelty (coordination tax)</Label>
                <Select
                  value={String(dtLog.novelty ?? 1)}
                  onValueChange={(v) => updateDtLog("novelty", Number(v))}
                >
                  <SelectTrigger className="bg-black/60 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.8">0.8 familiar</SelectItem>
                    <SelectItem value="1.0">1.0 typical</SelectItem>
                    <SelectItem value="1.2">1.2 somewhat new</SelectItem>
                    <SelectItem value="1.5">1.5 novel</SelectItem>
                    <SelectItem value="2.0">2.0 very novel</SelectItem>
                    <SelectItem value="2.5">2.5 high novelty</SelectItem>
                    <SelectItem value="3.0">3.0 max</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Estimated Sets */}
            <div>
              <Label className="text-zinc-200 text-xs">Est. working sets (optional)</Label>
              <Input
                type="number"
                value={dtLog.estimated_sets ?? ""}
                onChange={(e) => updateDtLog("estimated_sets", e.target.value ? Number(e.target.value) : undefined)}
                className="bg-black/60 border-white/20 text-white"
                placeholder="—"
              />
            </div>

            {todaySession?.is_benchmark && (
              <div className="rounded-xl border border-violet-400/40 bg-violet-950/20 p-4 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                  Benchmark Session Payload
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="is-benchmark"
                    type="checkbox"
                    checked={Boolean(dtLog.is_benchmark)}
                    onChange={(e) => updateDtLog("is_benchmark", e.target.checked)}
                  />
                  <Label htmlFor="is-benchmark" className="text-zinc-200 text-xs">
                    Send benchmark payload with this log
                  </Label>
                </div>
                {dtLog.is_benchmark && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-zinc-200 text-xs">Benchmark Key</Label>
                      <Input
                        value={benchmarkKey}
                        onChange={(e) => onBenchmarkKeyChange(e.target.value)}
                        className="bg-black/60 border-white/20 text-white"
                        placeholder="periodic_retest"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-200 text-xs">Result Value</Label>
                      <Input
                        type="number"
                        value={benchmarkValue}
                        onChange={(e) => onBenchmarkValueChange(e.target.value)}
                        className="bg-black/60 border-white/20 text-white"
                        placeholder="e.g. 120"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={dtLoading || !token}
                className="flex-1 bg-gradient-to-r from-neon-cyan to-neon-violet text-black font-semibold"
              >
                {dtLoading ? "Logging..." : "Log & Update S(t)"}
              </Button>

              <Button
                type="button"
                onClick={onSimulate}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/5"
              >
                Simulate D(t)
              </Button>
            </div>

            {/* Danger Zone */}
            <details className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 text-sm">
              <summary className="cursor-pointer font-medium text-rose-400 flex items-center gap-2">
                ⚠️ Danger Zone
              </summary>
              <div className="mt-3 text-xs text-rose-300">
                Logs an extreme fatigue session for testing the twin.
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onCrash}
                disabled={!token || dtLoading}
                className="mt-3 w-full"
              >
                Crash Session (extreme load)
              </Button>
            </details>
          </form>

          <DosePanel dose={dtDose} />
        </motion.div>
      </CardContent>
    </Card>
  );
}

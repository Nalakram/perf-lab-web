// src/components/twin/TwinSummaryStrip.tsx
import type { UnifiedStateVector, WorkoutPrescription } from "../../types";
import { Card, CardContent } from "@/components/ui/card";

type TwinSummaryStripProps = {
  readiness: string;
  dtState: UnifiedStateVector | null;
  dtRx: WorkoutPrescription | null;
};

export function TwinSummaryStrip({
  readiness,
  dtState,
  dtRx,
}: TwinSummaryStripProps) {
  return (
    <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-black/40 border-t border-white/10">
      <Card className="border-white/10 bg-zinc-900/70">
        <CardContent className="p-4 text-center">
          <p className="text-xs font-mono tracking-widest text-neon-cyan">READINESS</p>
          <p className="text-4xl font-semibold text-white mt-1">{readiness}</p>
          <p className="text-xs text-zinc-400 mt-2">Higher is better</p>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-zinc-900/70">
        <CardContent className="p-4 text-center">
          <p className="text-xs font-mono tracking-widest text-neon-magenta">HABIT STRENGTH</p>
          <p className="text-4xl font-semibold text-white mt-1">
            {dtState ? `${(dtState.habit_strength * 100).toFixed(0)}%` : "—"}
          </p>
          <p className="text-xs text-zinc-400 mt-2">Automatic training</p>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-zinc-900/70">
        <CardContent className="p-4 text-center">
          <p className="text-xs font-mono tracking-widest text-neon-violet">NEXT SESSION</p>
          <p className="text-4xl font-semibold text-white mt-1">
            {dtRx ? `${dtRx.duration_min} min` : "—"}
          </p>
          <p className="text-xs text-zinc-400 mt-2">{dtRx ? dtRx.type : "Waiting for first log"}</p>
        </CardContent>
      </Card>
    </div>
  );
}
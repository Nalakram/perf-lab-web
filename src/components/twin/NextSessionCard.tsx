// src/components/twin/NextSessionCard.tsx
import { motion } from "framer-motion";
import type { WorkoutPrescription } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type NextSessionCardProps = {
  token: string | null;
  dtRxLoading: boolean;
  dtRx: WorkoutPrescription | null;
};

export function NextSessionCard({
  token,
  dtRxLoading,
  dtRx,
}: NextSessionCardProps) {
  return (
    <Card className="border-white/10 bg-zinc-900/70 backdrop-blur-2xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold tracking-tight text-white">
            Next Session &bull; u(t)
          </CardTitle>
          {dtRx && (
            <Badge className="bg-neon-cyan text-black font-medium">
              {dtRx.duration_min} min
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!token ? (
          <div className="text-center py-8 text-zinc-300">
            Sign in to load your personalized next session
          </div>
        ) : dtRxLoading ? (
          <div className="h-32 animate-pulse rounded-2xl bg-zinc-800/50" />
        ) : dtRx ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div>
              <p className="text-xl font-semibold text-white">{dtRx.type}</p>
              <p className="text-neon-cyan text-sm">{dtRx.focus}</p>
            </div>

            <p className="text-zinc-100 italic">{`"${dtRx.rationale}"`}</p>

            {dtRx.why && (
              <details className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm">
                <summary className="cursor-pointer text-zinc-200 font-medium flex items-center gap-2">
                  Why this session?
                </summary>
                <div className="mt-4 text-xs leading-relaxed text-zinc-300 space-y-3">
                  {dtRx.why.state_drivers && (
                    <div>
                      <span className="text-neon-violet">State drivers:</span>{" "}
                      {dtRx.why.state_drivers.join(", ")}
                    </div>
                  )}
                  {dtRx.why.goal_alignment && (
                    <div>
                      <span className="text-neon-violet">Goal alignment:</span>{" "}
                      {dtRx.why.goal_alignment}
                    </div>
                  )}
                  {dtRx.why.warnings && dtRx.why.warnings.length > 0 && (
                    <div className="text-amber-400">
                      &#9888; {dtRx.why.warnings.join(", ")}
                    </div>
                  )}
                </div>
              </details>
            )}
          </motion.div>
        ) : (
          <div className="text-center py-8 text-zinc-300">
            Log one workout to generate your first prescription
          </div>
        )}
      </CardContent>
    </Card>
  );
}

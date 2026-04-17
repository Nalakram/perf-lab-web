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
            <div className="flex items-center gap-2">
              {dtRx.model_version && (
                <span className="text-xs text-zinc-500 border border-zinc-700 rounded px-1.5 py-0.5">
                  {dtRx.model_version}
                </span>
              )}
              <Badge className="bg-neon-cyan text-black font-medium">
                {dtRx.duration_min} min
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!token ? (
          <div className="text-center py-8 text-zinc-100">
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

            {dtRx.exercises && dtRx.exercises.length > 0 && (
              <ul className="space-y-1 text-sm border border-white/10 rounded-xl p-3 bg-black/20">
                {dtRx.exercises.map((ex, i) => (
                  <li key={i} className="flex flex-wrap gap-2 items-baseline">
                    <span className="font-medium text-zinc-200">{ex.name}</span>
                    {ex.sets != null && ex.reps != null && (
                      <span className="text-zinc-400">{ex.sets}×{ex.reps}</span>
                    )}
                    {ex.load_note && (
                      <span className="text-zinc-500 italic">{ex.load_note}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {dtRx.why && (
              <details className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm">
                <summary className="cursor-pointer text-zinc-200 font-medium flex items-center gap-2">
                  Why this session?
                </summary>
                <div className="mt-4 text-xs leading-relaxed text-zinc-100 space-y-3">
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
                  {dtRx.why.constraints_applied && dtRx.why.constraints_applied.filter(c => c.startsWith("weak_point:")).length > 0 && (
                    <div>
                      <span className="text-neon-violet">Weak points:</span>{" "}
                      <span className="flex flex-wrap gap-1 mt-1">
                        {dtRx.why.constraints_applied
                          .filter(c => c.startsWith("weak_point:"))
                          .map(c => (
                            <span key={c} className="text-xs bg-amber-900/30 text-amber-300 rounded px-1.5 py-0.5">
                              {c.replace("weak_point:", "")}
                            </span>
                          ))}
                      </span>
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
          <div className="text-center py-8 text-zinc-100">
            Log one workout to generate your first prescription
          </div>
        )}
      </CardContent>
    </Card>
  );
}

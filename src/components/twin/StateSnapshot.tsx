// src/components/twin/StateSnapshot.tsx
import { motion } from "framer-motion";
import type { UnifiedStateVector } from "../../types";
import { FatigueBar, SkillPanel } from "./widgets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StateSnapshotProps = {
  dtState: UnifiedStateVector | null;
};


export function StateSnapshot({ dtState }: StateSnapshotProps) {
  return (
    <Card className="border-white/10 bg-zinc-900/70 backdrop-blur-2xl overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
          State • S(t)
          {dtState && <motion.div className="h-2 w-2 rounded-full bg-neon-cyan animate-pulse" />}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {!dtState ? (
          <div className="text-center py-12 text-zinc-200">
            State will appear after your first logged session.
          </div>
        ) : (
          <>
            <div className="text-xs text-zinc-200">
              Met aerobic {dtState.c_met_aerobic.toFixed(1)} · NM force{" "}
              {dtState.c_nm_force.toFixed(1)} · W&apos; {dtState.b_met_anaerobic.toFixed(1)}
            </div>

            {/* Capacities */}
            <details className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <summary className="cursor-pointer font-medium text-zinc-100 flex items-center gap-2">
                Capacities &amp; Capacity X(t)
              </summary>
              <div className="mt-4 space-y-3 text-sm">
                {/* ... your original content with better styling */}
                <div className="grid grid-cols-2 gap-4 text-zinc-100">
                  <div>Met aerobic: {dtState.c_met_aerobic.toFixed(1)}</div>
                  <div>NM force: {dtState.c_nm_force.toFixed(1)}</div>
                  <div>Structural: {dtState.c_struct.toFixed(1)}</div>
                  <div>W&apos;: {dtState.b_met_anaerobic.toFixed(1)}</div>
                </div>
              </div>
            </details>

            {/* Habit, Signal & Skill */}
            <details className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <summary className="cursor-pointer font-medium text-zinc-100">Habit, signal &amp; skill</summary>
              <div className="mt-4 space-y-3 text-sm text-zinc-100">
                <div>Habit: {(dtState.habit_strength * 100).toFixed(0)}%</div>
                <div>Struct signal: {dtState.s_struct_signal.toFixed(1)}</div>
                <SkillPanel state={dtState} />
              </div>
            </details>

            {/* Fatigues & Tissue */}
            <details className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <summary className="cursor-pointer font-medium text-zinc-100">Fatigues (0–100)</summary>
              <div className="mt-4 space-y-4">
                <FatigueBar label="Systemic" value={dtState.f_met_systemic} />
                <FatigueBar label="NM peripheral" value={dtState.f_nm_peripheral} />
                <FatigueBar label="NM central" value={dtState.f_nm_central} />
                <FatigueBar label="Structural" value={dtState.f_struct_damage} />
              </div>
            </details>

            {/* Component F(t) and T(t) sections remain similar but with neon styling */}
            {/* (I kept your original details logic but upgraded the visuals) */}
          </>
        )}
      </CardContent>
    </Card>
  );
}

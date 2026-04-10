// src/components/twin/widgets.tsx
import { motion } from "framer-motion";
import type { StressDose, UnifiedStateVector } from "../../types";

export function FatigueBar({
  label,
  value,
}: {
  label: string;
  value: number | undefined;
}) {
  const v = value ?? 0;
  const pct = Math.max(0, Math.min(100, v));

  return (
    <div className="mb-4">
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="text-zinc-200">{label}</span>
        <span className="font-mono text-neon-cyan">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/60">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet"
        />
      </div>
    </div>
  );
}

export function DosePanel({ dose }: { dose: StressDose | null }) {
  if (!dose) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-6 rounded-3xl border border-white/10 bg-zinc-900/70 backdrop-blur-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono tracking-widest text-neon-magenta">SIMULATED DOSE • D(t)</span>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-200">Metabolic</span>
          <span className="font-mono text-white">{dose.d_met_systemic.toFixed(1)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-200">NM Peripheral</span>
          <span className="font-mono text-white">{dose.d_nm_peripheral.toFixed(1)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-200">NM Central</span>
          <span className="font-mono text-white">{dose.d_nm_central.toFixed(1)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-200">Structural Damage</span>
          <span className="font-mono text-white">{dose.d_struct_damage.toFixed(1)}</span>
        </div>
        <div className="col-span-2 flex justify-between border-t border-white/10 pt-3">
          <span className="text-zinc-200">Structural Signal</span>
          <span className="font-mono text-neon-cyan">{dose.d_struct_signal.toFixed(1)}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function SkillPanel({ state }: { state: UnifiedStateVector | null }) {
  if (!state?.skill_state || Object.keys(state.skill_state).length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <p className="text-xs font-mono tracking-widest text-neon-violet mb-3">SKILL STATE</p>
      <div className="space-y-3">
        {Object.entries(state.skill_state).map(([movement, value]) => (
          <div key={movement} className="flex items-center justify-between">
            <span className="text-sm text-zinc-100 capitalize">{movement.replace(/_/g, " ")}</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 bg-black/60 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(value * 100)}%` }}
                  className="h-full bg-gradient-to-r from-neon-violet to-neon-cyan"
                />
              </div>
              <span className="font-mono text-xs text-white w-10 text-right">
                {(value * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
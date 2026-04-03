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
    <div className="mb-2">
      <div className="mb-1 flex justify-between text-[0.7rem] text-slate-500">
        <span>{label}</span>
        <span>{pct.toFixed(1)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/90 ring-1 ring-inset ring-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-600 to-teal-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function DosePanel({ dose }: { dose: StressDose | null }) {
  if (!dose) return null;
  const d = dose;
  const six = d.dose_six;

  return (
    <div className="mt-3 rounded-xl border border-slate-200/90 bg-gradient-to-b from-slate-50 to-white p-3.5 shadow-sm">
      <div className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
        Dose D(t) · Simulated
      </div>
      {six ? (
        <>
          <p className="mb-2 text-[0.65rem] leading-snug text-slate-500">
            Six-dose factors are relative session load (model units). Legacy
            channels below match the familiar fatigue/signal scale.
          </p>
          <div className="mb-3 grid grid-cols-2 gap-1 text-[0.7rem] text-slate-600">
            <div>Vol: {six.volume.toFixed(2)}</div>
            <div>Int: {six.intensity.toFixed(2)}</div>
            <div>Density: {six.density.toFixed(2)}</div>
            <div>Impact: {six.impact.toFixed(2)}</div>
            <div>Skill: {six.skill.toFixed(2)}</div>
            <div>Metab: {six.metabolic.toFixed(2)}</div>
          </div>
        </>
      ) : null}
      <div className="grid grid-cols-2 gap-2 text-[0.75rem] text-slate-700">
        <div>Metabolic: {d.d_met_systemic.toFixed(1)}</div>
        <div>NM Peripheral: {d.d_nm_peripheral.toFixed(1)}</div>
        <div>NM Central: {d.d_nm_central.toFixed(1)}</div>
        <div>Struct Damage: {d.d_struct_damage.toFixed(1)}</div>
        <div className="col-span-2">
          Struct Signal: {d.d_struct_signal.toFixed(1)}
        </div>
      </div>
    </div>
  );
}

export function SkillPanel({ state }: { state: UnifiedStateVector | null }) {
  if (!state || !state.skill_state) return null;
  const entries = Object.entries(state.skill_state);
  if (!entries.length) return null;

  return (
    <div className="mt-2">
      <div className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
        Skill State
      </div>
      <ul className="space-y-1 text-[0.75rem] text-slate-700">
        {entries.map(([movement, skill]) => (
          <li key={movement} className="flex justify-between">
            <span>{movement}</span>
            <span>{(skill * 100).toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

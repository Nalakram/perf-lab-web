import type { UnifiedStateVector } from "../../types";
import { FatigueBar, SkillPanel } from "./widgets";

type StateSnapshotProps = {
  dtState: UnifiedStateVector | null;
};

function detailsClass() {
  return "details-disclosure mt-2 rounded-lg border border-slate-200/80 bg-slate-50/40 px-3 py-2";
}

function summaryClass() {
  return "cursor-pointer text-[0.7rem] font-semibold text-slate-700 [&::-webkit-details-marker]:hidden";
}

export function StateSnapshot({ dtState }: StateSnapshotProps) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white/95 p-4 shadow-sm">
      <h3 className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
        State · S(t)
      </h3>
      {!dtState ? (
        <p className="text-[0.75rem] text-slate-500">
          State will appear after your first logged session.
        </p>
      ) : (
        <>
          <p className="text-[0.75rem] leading-relaxed text-slate-600">
            Snapshot loaded. Expand sections for capacities, fatigue channels,
            and tissue stress.
          </p>
          <p className="mt-1 text-[0.65rem] text-slate-500">
            Met aerobic {dtState.c_met_aerobic.toFixed(1)} · NM force{" "}
            {dtState.c_nm_force.toFixed(1)} · W&apos;{" "}
            {dtState.b_met_anaerobic.toFixed(1)}
          </p>

          <details className={detailsClass()}>
            <summary className={summaryClass()}>
              Capacities &amp; Capacity X(t)
              <span
                className="details-chevron ml-2 inline-block h-2 w-2 rotate-45 border-r-2 border-b-2 border-slate-400 align-middle transition-transform duration-200"
                aria-hidden
              />
            </summary>
            <div className="mt-2 space-y-1 text-[0.75rem] text-slate-700">
              <div>Met aerobic: {dtState.c_met_aerobic.toFixed(1)}</div>
              <div>NM force: {dtState.c_nm_force.toFixed(1)}</div>
              <div>Structural: {dtState.c_struct.toFixed(1)}</div>
              <div>W&apos;: {dtState.b_met_anaerobic.toFixed(1)}</div>
              {dtState.capacity_x ? (
                <div className="mt-2 border-t border-slate-200 pt-2">
                  <div className="mb-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Capacity X(t)
                  </div>
                  <div className="space-y-0.5 text-[0.65rem] text-slate-600">
                    <div>Aerobic: {dtState.capacity_x.aerobic.toFixed(1)}</div>
                    <div>
                      Glycolytic: {dtState.capacity_x.glycolytic.toFixed(1)}
                    </div>
                    <div>
                      Max strength: {dtState.capacity_x.max_strength.toFixed(1)}
                    </div>
                    <div>
                      Hypertrophy: {dtState.capacity_x.hypertrophy.toFixed(1)}
                    </div>
                    <div>Power: {dtState.capacity_x.power.toFixed(1)}</div>
                    <div>Skill: {dtState.capacity_x.skill.toFixed(1)}</div>
                    <div>
                      Mobility: {dtState.capacity_x.mobility.toFixed(1)}
                    </div>
                    <div>
                      Work cap: {dtState.capacity_x.work_capacity.toFixed(1)}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </details>

          <details className={detailsClass()}>
            <summary className={summaryClass()}>
              Habit, signal &amp; skill
              <span
                className="details-chevron ml-2 inline-block h-2 w-2 rotate-45 border-r-2 border-b-2 border-slate-400 align-middle transition-transform duration-200"
                aria-hidden
              />
            </summary>
            <div className="mt-2 space-y-1 text-[0.75rem] text-slate-700">
              <div>
                Habit: {(dtState.habit_strength * 100).toFixed(0)}%
              </div>
              <div>Struct signal: {dtState.s_struct_signal.toFixed(1)}</div>
              <SkillPanel state={dtState} />
            </div>
          </details>

          <details className={detailsClass()}>
            <summary className={summaryClass()}>
              Fatigues (0–100)
              <span
                className="details-chevron ml-2 inline-block h-2 w-2 rotate-45 border-r-2 border-b-2 border-slate-400 align-middle transition-transform duration-200"
                aria-hidden
              />
            </summary>
            <div className="mt-2">
              <FatigueBar label="Systemic" value={dtState.f_met_systemic} />
              <FatigueBar
                label="NM peripheral"
                value={dtState.f_nm_peripheral}
              />
              <FatigueBar label="NM central" value={dtState.f_nm_central} />
              <FatigueBar label="Structural" value={dtState.f_struct_damage} />
            </div>
          </details>

          <details className={detailsClass()}>
            <summary className={summaryClass()}>
              Component fatigue F(t)
              <span
                className="details-chevron ml-2 inline-block h-2 w-2 rotate-45 border-r-2 border-b-2 border-slate-400 align-middle transition-transform duration-200"
                aria-hidden
              />
            </summary>
            <div className="mt-2">
              <FatigueBar label="CNS" value={dtState.fatigue_f.cns} />
              <FatigueBar
                label="Muscular"
                value={dtState.fatigue_f.muscular}
              />
              <FatigueBar
                label="Metabolic"
                value={dtState.fatigue_f.metabolic}
              />
              <FatigueBar
                label="Structural"
                value={dtState.fatigue_f.structural}
              />
              <FatigueBar label="Tendon" value={dtState.fatigue_f.tendon} />
              <FatigueBar label="Grip" value={dtState.fatigue_f.grip} />
            </div>
          </details>

          <details className={detailsClass()}>
            <summary className={summaryClass()}>
              Tissue stress T(t)
              <span
                className="details-chevron ml-2 inline-block h-2 w-2 rotate-45 border-r-2 border-b-2 border-slate-400 align-middle transition-transform duration-200"
                aria-hidden
              />
            </summary>
            <div className="mt-2">
              <FatigueBar label="Shoulder" value={dtState.tissue_t.shoulder} />
              <FatigueBar label="Elbow" value={dtState.tissue_t.elbow} />
              <FatigueBar label="Wrist" value={dtState.tissue_t.wrist} />
              <FatigueBar label="Lumbar" value={dtState.tissue_t.lumbar} />
              <FatigueBar label="Hip" value={dtState.tissue_t.hip} />
              <FatigueBar label="Knee" value={dtState.tissue_t.knee} />
              <FatigueBar label="Ankle" value={dtState.tissue_t.ankle} />
              <FatigueBar label="Finger" value={dtState.tissue_t.finger} />
            </div>
          </details>
        </>
      )}
    </div>
  );
}

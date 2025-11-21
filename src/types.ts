// src/types.ts

export interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}

export type Modality = "Running" | "Strength" | "Hypertrophy" | "Power" | "Mixed";

export interface UnifiedStateVector {
  timestamp: string;

  // Capacities (Ceilings)
  c_met_aerobic: number;
  c_nm_force: number;
  c_struct: number;
  b_met_anaerobic: number;

  // Fatigues (0–100)
  f_met_systemic: number;
  f_nm_peripheral: number;
  f_nm_central: number;
  f_struct_damage: number;

  // Signal
  s_struct_signal: number;

  // Human Factors
  habit_strength: number; // 0–1
  skill_state: Record<string, number>;
}

export interface WorkoutPrescription {
  type: string;
  focus: string;
  rationale: string;
  duration_min: number;
}

export interface WorkoutLog {
  timestamp: string; // ISO string
  modality: Modality;

  duration_minutes: number;
  session_rpe: number; // 1–10

  sleep_quality: number;      // 1–10 (1 = terrible)
  life_stress_inverse: number; // 1–10 (1 = high stress, 10 = low stress)

  avg_rir?: number;
  distance_meters?: number;
  total_volume_load?: number;
}

export interface StressDose {
  d_met_systemic: number;
  d_nm_peripheral: number;
  d_nm_central: number;
  d_struct_damage: number;
  d_struct_signal: number;
}

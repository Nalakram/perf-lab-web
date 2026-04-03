/**
 * Must match `TrainingGoal` in perf-lab-api `app/schemas/training_goals.py`
 * (used as `goal` query param for GET /v1/next-session).
 */
export const TRAINING_GOALS: readonly { value: string; label: string }[] = [
  { value: "Strength", label: "Strength" },
  { value: "Hypertrophy", label: "Hypertrophy" },
  { value: "Power", label: "Power (speed–strength)" },
  { value: "General", label: "General physical prep" },
  { value: "OlympicLifts", label: "Olympic weightlifting" },
  { value: "Powerlifting", label: "Powerlifting (SBD)" },
  { value: "MetCon", label: "Metabolic conditioning" },
  { value: "Calisthenics", label: "Calisthenics" },
  { value: "Gymnastics", label: "Gymnastics skills" },
  { value: "Grip", label: "Grip strength" },
  { value: "Running", label: "Running (base / easy)" },
  { value: "Sprinting", label: "Sprinting" },
  { value: "HalfMarathon", label: "Half marathon" },
  { value: "FullMarathon", label: "Full marathon" },
] as const;

export type TrainingGoalValue = (typeof TRAINING_GOALS)[number]["value"];

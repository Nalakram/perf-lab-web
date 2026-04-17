// src/components/OnboardingForm.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "../auth/useAuth";
import { TRAINING_GOALS } from "../trainingGoals";
import type { OnboardRequest } from "../types";

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "elite", label: "Elite" },
] as const;

export function OnboardingForm() {
  const { email, completeOnboarding } = useAuth();

  const [experienceLevel, setExperienceLevel] = useState("intermediate");
  const [experienceYears, setExperienceYears] = useState("");
  const [squat1rm, setSquat1rm] = useState("");
  const [deadlift1rm, setDeadlift1rm] = useState("");
  const [bench1rm, setBench1rm] = useState("");
  const [bodyweight, setBodyweight] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [goal, setGoal] = useState("Strength");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parseOptionalKg = (val: string): number | null =>
    val.trim() !== "" && !isNaN(parseFloat(val)) ? parseFloat(val) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const req: Partial<OnboardRequest> = {
      email,
      experience_level: experienceLevel,
      experience_years: experienceYears ? parseFloat(experienceYears) : undefined,
      available_days_per_week: daysPerWeek,
      goal,
      squat_1rm_kg: parseOptionalKg(squat1rm),
      deadlift_1rm_kg: parseOptionalKg(deadlift1rm),
      bench_1rm_kg: parseOptionalKg(bench1rm),
      bodyweight_kg: parseOptionalKg(bodyweight),
    };
    await completeOnboarding(req);
    setIsSubmitting(false);
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    await completeOnboarding({ email, experience_level: "intermediate" });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-3xl border border-neon-cyan/30 bg-black/40 px-4 py-1.5 text-xs font-bold uppercase tracking-[1.5px] text-neon-cyan">
            <div className="h-2 w-2 animate-pulse rounded-full bg-neon-cyan" />
            PERF LAB • SETUP
          </div>
          <h2 className="text-3xl font-semibold tracking-tight">
            Set up your{" "}
            <span className="bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent">
              training profile
            </span>
          </h2>
          <p className="text-sm text-zinc-400">
            Tell us a bit about yourself so we can seed an accurate baseline. All fields are optional.
          </p>
        </div>

        <Card className="border-white/10 bg-zinc-900/70 backdrop-blur-2xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Section 1: Experience */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Experience
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="exp-level" className="text-zinc-300">Level</Label>
                    <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                      <SelectTrigger id="exp-level" className="bg-zinc-800 border-white/10 text-zinc-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10">
                        {EXPERIENCE_LEVELS.map(l => (
                          <SelectItem key={l.value} value={l.value} className="text-zinc-100">{l.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="exp-years" className="text-zinc-300">Years training</Label>
                    <Input
                      id="exp-years"
                      type="number"
                      min={0}
                      step={0.5}
                      placeholder="e.g. 4"
                      value={experienceYears}
                      onChange={e => setExperienceYears(e.target.value)}
                      className="bg-zinc-800 border-white/10 text-zinc-100 placeholder-zinc-600"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Lifts */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  1-Rep Maxes (kg) — optional
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "squat", label: "Squat", value: squat1rm, setter: setSquat1rm },
                    { id: "deadlift", label: "Deadlift", value: deadlift1rm, setter: setDeadlift1rm },
                    { id: "bench", label: "Bench", value: bench1rm, setter: setBench1rm },
                    { id: "bw", label: "Bodyweight", value: bodyweight, setter: setBodyweight },
                  ].map(({ id, label, value, setter }) => (
                    <div key={id} className="space-y-1.5">
                      <Label htmlFor={id} className="text-zinc-300">{label}</Label>
                      <Input
                        id={id}
                        type="number"
                        min={1}
                        step={0.5}
                        placeholder="kg"
                        value={value}
                        onChange={e => setter(e.target.value)}
                        className="bg-zinc-800 border-white/10 text-zinc-100 placeholder-zinc-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Training context */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Training Context
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-zinc-300">
                      Days / week: <span className="text-neon-cyan font-bold">{daysPerWeek}</span>
                    </Label>
                    <input
                      type="range"
                      min={1}
                      max={7}
                      value={daysPerWeek}
                      onChange={e => setDaysPerWeek(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="goal" className="text-zinc-300">Primary goal</Label>
                    <Select value={goal} onValueChange={setGoal}>
                      <SelectTrigger id="goal" className="bg-zinc-800 border-white/10 text-zinc-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 max-h-60">
                        {TRAINING_GOALS.map(g => (
                          <SelectItem key={g.value} value={g.value} className="text-zinc-100">{g.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-neon-cyan text-black font-bold hover:bg-neon-cyan/90"
                >
                  {isSubmitting ? "Setting up…" : "Start Training"}
                </Button>
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={isSubmitting}
                  className="text-sm text-zinc-500 hover:text-zinc-300 underline underline-offset-2"
                >
                  Skip for now
                </button>
              </div>

            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

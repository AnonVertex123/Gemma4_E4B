/**
 * Health Profile — Activation + Retention
 * onboarding: age, symptoms
 * retention: lastVisitDate, lastSymptom
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type HealthProfile = {
  age?: number;
  symptoms?: string;
  onboardingDone: boolean;
  lastVisitDate: string;
  lastSymptomSummary: string;
};

interface HealthProfileState extends HealthProfile {
  setOnboarding: (age: number, symptoms: string) => void;
  setLastSymptom: (symptom: string) => void;
  getFollowUpPrompt: () => string | null;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function isYesterday(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return d.toDateString() === yesterday.toDateString();
}

export const useHealthProfile = create<HealthProfileState>()(
  persist(
    (set, get) => ({
      onboardingDone: false,
      lastVisitDate: "",
      lastSymptomSummary: "",

      setOnboarding: (age, symptoms) =>
        set({
          age,
          symptoms,
          onboardingDone: true,
          lastVisitDate: todayISO(),
        }),

      setLastSymptom: (symptom) =>
        set({
          lastSymptomSummary: symptom.slice(0, 100),
          lastVisitDate: todayISO(),
        }),

      getFollowUpPrompt: () => {
        const { lastVisitDate, lastSymptomSummary } = get();
        if (!lastSymptomSummary || !lastVisitDate) return null;
        if (!isYesterday(lastVisitDate)) return null;
        return `${lastSymptomSummary} — hôm nay sao rồi?`;
      },
    }),
    { name: "tuminh-health-profile" }
  )
);

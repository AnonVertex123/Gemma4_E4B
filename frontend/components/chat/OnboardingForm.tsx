"use client";

import { useState } from "react";
import { useHealthProfile } from "@/state/useHealthProfile";

/**
 * Activation — hỏi tuổi + triệu chứng trước khi chat
 */
export default function OnboardingForm({ onDone }: { onDone?: () => void }) {
  const { onboardingDone, setOnboarding } = useHealthProfile();
  const [age, setAge] = useState("");
  const [symptoms, setSymptoms] = useState("");

  if (onboardingDone) return null;

  function submit() {
    const a = parseInt(age, 10);
    const s = symptoms.trim();
    if (isNaN(a) || a < 1 || a > 120) {
      alert("Vui lòng nhập tuổi hợp lệ (1–120)");
      return;
    }
    if (!s) {
      alert("Vui lòng mô tả triệu chứng");
      return;
    }
    setOnboarding(a, s);
    onDone?.();
  }

  return (
    <div className="p-4 rounded-xl bg-[#E1F5EE] border border-[#0F6E56]/20">
      <h3 className="text-sm font-semibold text-[#1B1B2F]">
        Để tư vấn chính xác hơn, cho Tự Minh biết:
      </h3>
      <div className="mt-3 space-y-2">
        <div>
          <label className="text-xs text-[#6B6B8A]">Tuổi của bạn</label>
          <input
            type="number"
            min={1}
            max={120}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Ví dụ: 28"
            className="mt-1 w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-[#6B6B8A]">Triệu chứng / vấn đề sức khỏe</label>
          <input
            type="text"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Ví dụ: đau dạ dày, mất ngủ, stress..."
            className="mt-1 w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm"
          />
        </div>
        <button
          type="button"
          onClick={submit}
          className="w-full py-2 rounded-lg bg-[#0F6E56] text-white text-sm font-medium"
        >
          Bắt đầu tư vấn
        </button>
      </div>
    </div>
  );
}

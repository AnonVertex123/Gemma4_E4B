"use client";

import type { ChatMessage } from "@/state/useBot";

export default function Message({ m }: { m: ChatMessage }) {
  const role = m.role;
  const time = m.time ?? m.ts ?? "";
  const isWarning = m.type === "warning";
  const isDiagnosis = m.type === "diagnosis";

  return (
    <div className={`flex gap-3 mb-4 ${role === "user" ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-full shrink-0 ${
          role === "user" ? "bg-[#0F6E56]" : "bg-[#6B6B8A]"
        }`}
      />
      <div className={`flex-1 min-w-0 ${role === "user" ? "text-right" : ""}`}>
        <div className="text-xs text-[#6B6B8A] mb-1">
          {role === "user" ? "Bạn" : "Bot"} • {time}
        </div>
        <div
          className={`p-3 rounded-lg ${
            isWarning
              ? "border-l-4 border-red-500 bg-red-50 text-red-900"
              : isDiagnosis
                ? "border-l-4 border-amber-500 bg-amber-50/80"
                : role === "user"
                  ? "bg-[#0F6E56] text-white"
                  : "bg-[#F5F5FA] text-[#1B1B2F]"
          }`}
        >
          <span className="whitespace-pre-wrap text-sm">{m.text}</span>
        </div>
      </div>
    </div>
  );
}

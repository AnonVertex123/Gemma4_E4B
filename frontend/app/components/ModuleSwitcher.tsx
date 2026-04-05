"use client";

import React from "react";

export type V12ModuleKey = "medicine" | "code" | "study" | "data";

const ITEMS: Array<{ key: V12ModuleKey; label: string; emoji: string }> = [
  { key: "medicine", label: "Y học", emoji: "🌿" },
  { key: "code", label: "Code", emoji: "💻" },
  { key: "study", label: "Học tập", emoji: "📚" },
  { key: "data", label: "Dữ liệu", emoji: "📊" },
];

export default function ModuleSwitcher({
  active,
  onChange,
}: {
  active: V12ModuleKey;
  onChange: (k: V12ModuleKey) => void;
}) {
  return (
    <div className="w-full max-w-[980px] mx-auto p-4">
      <div className="flex flex-wrap gap-2">
        {ITEMS.map((it) => {
          const isActive = it.key === active;
          return (
            <button
              key={it.key}
              type="button"
              onClick={() => onChange(it.key)}
              className={[
                "px-3 py-2 rounded-lg text-[13px] border transition-all",
                isActive
                  ? "bg-[#7B68EE] border-[#7B68EE] text-white"
                  : "bg-white border-[#E8E8F0] text-[#1B1B2F] hover:border-[#CFCFE6]",
              ].join(" ")}
            >
              <span aria-hidden className="mr-2">
                {it.emoji}
              </span>
              {it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}


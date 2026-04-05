"use client";

import { useBot } from "@/state/useBot";

const BOT_CONFIG: Record<string, { emoji: string; label: string }> = {
  herbal: { emoji: "🌿", label: "Herbal" },
  medical: { emoji: "🏥", label: "Medical" },
  doc: { emoji: "📚", label: "Doc" },
  legal: { emoji: "⚖️", label: "Legal" },
  edu: { emoji: "📖", label: "Edu" },
};

export default function Sidebar() {
  const { currentBot, setBot, sessions } = useBot();

  return (
    <div className="w-64 bg-[#1B1B2F] text-white p-4 shrink-0 flex flex-col">
      <h2 className="text-sm font-bold text-white/90">Workspace</h2>

      <div className="mt-6">
        <p className="text-[11px] font-medium text-white/50 uppercase tracking-wider">Bots</p>
        <div className="mt-2 space-y-1">
          {Object.entries(BOT_CONFIG).map(([id, { emoji, label }]) => (
            <button
              key={id}
              type="button"
              onClick={() => setBot(id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                currentBot === id ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10"
              }`}
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex-1 min-h-0">
        <p className="text-[11px] font-medium text-white/50 uppercase tracking-wider">Sessions</p>
        <div className="mt-2 space-y-1 overflow-y-auto max-h-48">
          {sessions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setBot(s.bot)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10 truncate"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

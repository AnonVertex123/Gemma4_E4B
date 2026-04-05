"use client";

import { useBot } from "@/state/useBot";

const BOT_LABELS: Record<string, string> = {
  herbal: "🌿 Thuốc nam",
  medical: "🩺 Chẩn đoán",
  doc: "📄 Tài liệu",
  legal: "⚖️ Pháp luật",
  edu: "📚 Học tập",
};

const BOT_ORDER = ["medical", "herbal", "doc", "legal", "edu"];

export default function BotSelector() {
  const { currentBot, setBot } = useBot();

  return (
    <div className="flex flex-wrap gap-2">
      {BOT_ORDER.map((bot) => (
        <button
          key={bot}
          type="button"
          onClick={() => setBot(bot)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentBot === bot
              ? "bg-[#0F6E56] text-white shadow-sm"
              : "bg-white border border-[#E8E8E8] text-[#6B6B8A] hover:border-[#0F6E56]/30 hover:text-[#0F6E56]"
          }`}
        >
          {BOT_LABELS[bot] ?? bot}
        </button>
      ))}
    </div>
  );
}

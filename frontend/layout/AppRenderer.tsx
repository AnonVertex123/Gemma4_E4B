"use client";

import { useState } from "react";
import { apps, getAppById } from "@/core/appRegistry";

export default function AppRenderer() {
  const [currentApp, setCurrentApp] = useState("chat");
  const app = getAppById(currentApp);
  const Component = app?.component;

  return (
    <div className="flex h-screen bg-[var(--bg-primary)]">
      {/* === SIDEBAR === */}
      <div className="w-[72px] shrink-0 bg-[var(--bg-sidebar)] flex flex-col items-center py-5 gap-1 border-r border-[var(--border)]">
        {/* Logo */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold mb-4 shadow-lg shadow-blue-500/20">
          TM
        </div>

        <div className="w-8 h-px bg-[var(--border)] mb-3" />

        {/* App Icons */}
        {apps.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setCurrentApp(a.id)}
            title={a.name}
            className={`group relative w-11 h-11 flex items-center justify-center rounded-xl text-lg transition-all duration-200 mb-1 ${
              currentApp === a.id
                ? "bg-[var(--accent)] text-white shadow-lg shadow-blue-500/25"
                : "text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
            }`}
          >
            {a.icon}
            {/* Tooltip */}
            <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-[var(--bg-card)] text-xs text-[var(--text-primary)] border border-[var(--border)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              {a.name}
            </span>
          </button>
        ))}

        {/* Bottom spacer + Status */}
        <div className="mt-auto flex flex-col items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--success)] pulse-glow" title="Ollama Online" />
          <span className="text-[9px] text-[var(--text-muted)] font-medium">G4</span>
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {Component ? <Component /> : (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
            Chọn app để bắt đầu
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { pluginManifests } from "@/core/appRegistry";
import type { PluginManifest } from "@/core/plugin/pluginSpec";

/**
 * App Store — danh sách plugin, nút Install
 */
export default function AppStore() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-lg font-bold text-[#1B1B2F]">🛒 App Store</h1>
      <p className="text-sm text-[#6B6B8A] mt-0.5">
        Plugins — cài đặt để mở rộng workspace
      </p>

      <div className="mt-6 space-y-4">
        {pluginManifests.map((p: PluginManifest) => (
          <div
            key={p.id}
            className="flex items-center justify-between p-4 rounded-xl border border-[#E8E8E8] bg-white"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{p.icon}</span>
              <div>
                <h3 className="font-semibold text-[#1B1B2F]">{p.name}</h3>
                <p className="text-xs text-[#6B6B8A]">v{p.version} • {p.tier ?? "free"}</p>
                {p.capabilities?.length ? (
                  <p className="text-[10px] text-[#6B6B8A] mt-1">
                    {p.capabilities.join(", ")}
                  </p>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-[#0F6E56] text-white text-sm font-medium hover:opacity-90"
            >
              Đã cài
            </button>
          </div>
        ))}

        {pluginManifests.length === 0 && (
          <p className="text-sm text-[#6B6B8A]">Chưa có plugin nào.</p>
        )}
      </div>
    </div>
  );
}

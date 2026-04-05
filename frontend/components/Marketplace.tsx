"use client";

import { useEffect, useState } from "react";
import {
  getMarketplacePlugins,
  getInstalledPlugins,
  installPlugin,
  type MarketplacePlugin,
} from "@/lib/marketplace-api";

/**
 * Marketplace — danh sách plugin, Install / Buy
 */
export default function Marketplace() {
  const [plugins, setPlugins] = useState<MarketplacePlugin[]>([]);
  const [installed, setInstalled] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getMarketplacePlugins(), getInstalledPlugins()])
      .then(([pl, inst]) => {
        setPlugins(pl);
        setInstalled(inst);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleInstall(p: MarketplacePlugin) {
    setInstalling(p.id);
    try {
      const r = await installPlugin(p.id);
      if (r.status === "installed" || r.status === "already_installed") {
        setInstalled((prev) => (prev.includes(p.id) ? prev : [...prev, p.id]));
      }
      if (r.status === "payment_required") {
        alert(`Plugin này có phí: ${(r.price ?? 0).toLocaleString("vi-VN")}₫. Liên hệ để mua.`);
      }
    } catch (e) {
      alert("Lỗi: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setInstalling(null);
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-[#6B6B8A]">Đang tải marketplace...</div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-lg font-bold text-[#1B1B2F]">🛒 Marketplace</h1>
      <p className="text-sm text-[#6B6B8A] mt-0.5">
        Cài plugin để mở rộng workspace — Install (free) / Buy (paid)
      </p>

      <div className="mt-6 space-y-4">
        {plugins.map((p) => {
          const isInstalled = installed.includes(p.id);
          const isFree = p.price === 0;
          return (
            <div
              key={p.id}
              className="flex items-center justify-between p-4 rounded-xl border border-[#E8E8E8] bg-white"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.icon ?? "📦"}</span>
                <div>
                  <h3 className="font-semibold text-[#1B1B2F]">{p.name}</h3>
                  <p className="text-sm text-[#6B6B8A] mt-0.5">
                    {p.description}
                  </p>
                  <p className="text-xs text-[#6B6B8A] mt-1">
                    {isFree ? "Miễn phí" : `${(p.price ?? 0).toLocaleString("vi-VN")}₫`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleInstall(p)}
                disabled={isInstalled || installing === p.id}
                className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60 ${
                  isInstalled
                    ? "bg-[#E8E8E8] text-[#6B6B8A]"
                    : "bg-[#0F6E56] text-white hover:opacity-90"
                }`}
              >
                {isInstalled
                  ? "Đã cài"
                  : installing === p.id
                    ? "..."
                    : isFree
                      ? "Install"
                      : "Buy"}
              </button>
            </div>
          );
        })}

        {plugins.length === 0 && (
          <p className="text-sm text-[#6B6B8A]">Chưa có plugin nào.</p>
        )}
      </div>
    </div>
  );
}

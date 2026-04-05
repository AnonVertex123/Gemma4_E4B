"use client";

/**
 * Dashboard App — Tổng quan, thống kê
 */
export default function DashboardApp() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div>
        <h1 className="text-lg font-bold text-[#1B1B2F]">📊 Dashboard</h1>
        <p className="text-sm text-[#6B6B8A] mt-0.5">
          Tổng quan sử dụng, thống kê
        </p>
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Chats hôm nay", value: "—" },
          { label: "Usage", value: "—" },
          { label: "Medical sessions", value: "—" },
          { label: "Plan", value: "Free" },
        ].map((card, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-[#E8E8E8] bg-white"
          >
            <p className="text-xs text-[#6B6B8A]">{card.label}</p>
            <p className="text-lg font-bold text-[#1B1B2F] mt-1">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

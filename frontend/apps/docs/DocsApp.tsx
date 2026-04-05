"use client";

/**
 * Docs App — Quản lý Tri thức RAG
 */
export default function DocsApp() {
  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <h1 className="text-lg font-bold text-[var(--text-primary)]">📚 Tri thức — RAG Manager</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">Quản lý kho tri thức nội bộ của Tự Minh AGI</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: "📂", label: "Dự án đã nạp", value: "—", desc: "Tổng số dự án trong RAG" },
            { icon: "📄", label: "Files đã học", value: "—", desc: "Tổng files đã index" },
            { icon: "🧠", label: "Chunks tri thức", value: "—", desc: "Số mảnh tri thức trong ChromaDB" },
            { icon: "⚡", label: "Trạng thái", value: "Online", desc: "Hệ thống RAG hoạt động" },
          ].map((card, i) => (
            <div key={i} className="glass-card p-5 fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider">{card.label}</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)] mt-2">{card.value}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{card.desc}</p>
                </div>
                <span className="text-2xl">{card.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-5 mt-6 fade-in">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">🔧 Công cụ Quản trị</h3>
          <div className="flex gap-3">
            <button className="glow-btn px-4 py-2.5 text-xs">🔄 Đồng bộ RAG</button>
            <button className="px-4 py-2.5 text-xs rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)] transition-all">
              🗑️ Reset Tri thức
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

type AnalysisResult = {
  status: "idle" | "scanning" | "done" | "error";
  files: string[];
  report: string;
  progress: number;
};

export default function AnalyzerApp() {
  const [folderPath, setFolderPath] = useState("");
  const [result, setResult] = useState<AnalysisResult>({
    status: "idle", files: [], report: "", progress: 0,
  });

  const handleScan = async () => {
    if (!folderPath.trim()) return;
    setResult({ status: "scanning", files: [], report: "", progress: 10 });

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: folderPath }),
      });
      const data = await res.json();
      setResult({
        status: "done",
        files: data.files || [],
        report: data.report || "Phân tích hoàn tất.",
        progress: 100,
      });
    } catch {
      setResult({ status: "error", files: [], report: "⚠️ Không thể kết nối backend.", progress: 0 });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <h1 className="text-lg font-bold text-[var(--text-primary)]">🔍 Phân tích Dự án</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">Quét code, đánh giá cấu trúc, đề xuất tối ưu</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Input Section */}
        <div className="glass-card p-5 fade-in">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 block">
            Đường dẫn Dự án
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
              placeholder="Ví dụ: I:\Projects\MyApp"
              className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-[var(--accent)] transition-all"
            />
            <button
              onClick={handleScan}
              disabled={result.status === "scanning"}
              className="glow-btn px-6 py-3 text-sm disabled:opacity-50"
            >
              {result.status === "scanning" ? "⏳ Đang quét..." : "📂 Nạp & Quét"}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {result.status === "scanning" && (
          <div className="fade-in">
            <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2">
              <span>Đang phân tích...</span>
              <span>{result.progress}%</span>
            </div>
            <div className="w-full h-2 bg-[var(--bg-card)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${result.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Results */}
        {result.status === "done" && (
          <div className="space-y-4 fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-card p-4 text-center">
                <p className="text-2xl font-bold text-[var(--accent)]">{result.files.length}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Files</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-2xl font-bold text-[var(--success)]">✓</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Hoàn tất</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-2xl font-bold text-[var(--warning)]">100%</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Coverage</p>
              </div>
            </div>

            {/* Report */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">📋 Báo cáo Phân tích</h3>
              <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {result.report}
              </div>
            </div>

            {/* File List */}
            {result.files.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">📁 Danh sách File ({result.files.length})</h3>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {result.files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[var(--bg-primary)] transition-colors text-xs text-[var(--text-muted)]">
                      <span className="text-[var(--accent)]">•</span>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {result.status === "error" && (
          <div className="glass-card p-5 border-[var(--danger)] fade-in">
            <p className="text-sm text-[var(--danger)]">{result.report}</p>
          </div>
        )}

        {/* Empty State */}
        {result.status === "idle" && (
          <div className="flex items-center justify-center h-64 fade-in">
            <div className="text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Sẵn sàng Phân tích</h2>
              <p className="text-[var(--text-muted)] text-sm max-w-md">
                Dán đường dẫn thư mục dự án rồi nhấn &quot;Nạp &amp; Quét&quot; để Lucian bóc tách từng module code.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

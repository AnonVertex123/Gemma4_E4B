"use client";

import React, { useCallback, useMemo, useState } from "react";
import { postDiagnoseV12, type DiagnoseV12Response } from "@/lib/api";

export default function DiagnosisPanel({
  onResult,
  onLoading,
}: {
  onResult?: (r: DiagnoseV12Response) => void;
  onLoading?: (v: boolean) => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => text.trim().length > 0 && !loading, [text, loading]);

  const onSubmit = useCallback(async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    onLoading?.(true);

    try {
      const resp = await postDiagnoseV12({ text: text.trim() });
      onResult?.(resp);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      onLoading?.(false);
    }
  }, [text, onResult, onLoading]);

  return (
    <div className="p-4 border border-[#E8E8F0] rounded-xl bg-white w-full">
      <textarea
        className="w-full min-h-[120px] p-3 border border-[#E8E8F0] rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#7B68EE]/40"
        placeholder="Ví dụ: đau ngực trái, khó thở, mồ hôi lạnh (age 68, male)..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex items-center justify-between mt-3 gap-3">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={onSubmit}
          className="px-4 py-2 rounded-lg bg-[#7B68EE] text-white disabled:opacity-60"
        >
          {loading ? "Tự Minh đang phân tích..." : "Chẩn đoán"}
        </button>
      </div>

      {error ? (
        <div className="mt-3 p-3 rounded-lg bg-red-50 text-red-800 text-[12px] whitespace-pre-wrap">
          {error}
        </div>
      ) : null}
    </div>
  );
}


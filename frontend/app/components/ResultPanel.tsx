"use client";

import React from "react";
import type { DiagnoseV12Response } from "@/lib/api";

export default function ResultPanel({
  result,
  onAskMore,
}: {
  result: DiagnoseV12Response;
  onAskMore?: (q: string) => void;
}) {
  const riskColor =
    result.risk_level === "high"
      ? "text-red-700"
      : result.risk_level === "medium"
        ? "text-amber-700"
        : "text-green-700";

  const confidence =
    typeof result.confidence === "number"
      ? result.confidence
      : typeof (result.trace as any)?.confidence === "number"
        ? (result.trace as any)?.confidence
        : null;

  return (
    <div className="p-4 border border-[#E8E8F0] rounded-xl bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[14px] font-semibold text-[#1B1B2F] truncate">
            Kết quả ({result.status})
          </div>
          <div className={`text-[12px] font-semibold ${riskColor}`}>Nguy cơ: {result.risk_level}</div>
        </div>
        {typeof result.latency_ms === "number" ? (
          <div className="text-[12px] text-[#6B6B8A]">
            ~{result.latency_ms.toFixed(0)} ms
          </div>
        ) : null}
      </div>

      {typeof confidence === "number" ? (
        <div className="mt-3 flex items-center gap-2">
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full"
              style={{ width: `${Math.round(confidence * 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-[#6B6B8A] font-semibold min-w-[54px] text-right">
            {Math.round(confidence * 100)}%
          </div>
        </div>
      ) : null}

      <div className="mt-3 text-[13px] leading-relaxed text-[#1B1B2F] whitespace-pre-wrap">
        {result.message}
      </div>

      {result.summary ? (
        <div className="mt-3 text-[12px] text-[#6B6B8A] whitespace-pre-wrap">
          <div className="font-semibold text-[#1B1B2F]">Tóm tắt</div>
          {result.summary}
        </div>
      ) : null}

      {result.details ? (
        <div className="mt-3 text-[12px] text-[#6B6B8A] whitespace-pre-wrap">
          <div className="font-semibold text-[#1B1B2F]">Chi tiết</div>
          {result.details}
        </div>
      ) : null}

      {result.is_emergency && result.emergency_reason ? (
        <div className="mt-3 p-3 rounded-lg bg-red-50 text-red-800 text-[12px]">
          {result.emergency_reason}
        </div>
      ) : null}

      {result.status === "ask_more" ? (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => onAskMore?.("Bạn có thể cung cấp thêm triệu chứng về thời điểm, mức độ nặng và yếu tố kích phát không?")}
            className="w-full px-3 py-2 rounded-lg bg-[#EEF0FF] text-[#7B68EE] text-[12px] font-semibold hover:bg-[#E2E6FF]"
          >
            Cần thêm thông tin (gợi ý)
          </button>
        </div>
      ) : null}
    </div>
  );
}


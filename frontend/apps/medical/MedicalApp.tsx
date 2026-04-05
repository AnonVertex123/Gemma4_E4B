"use client";

import React, { useState } from "react";
import DiagnosisPanel from "@/app/components/DiagnosisPanel";
import ResultPanel from "@/app/components/ResultPanel";
import EmergencyMap from "@/app/components/EmergencyMap";
import type { DiagnoseV12Response } from "@/lib/api";

/**
 * Medical App — Chẩn đoán, map, panel
 */
export default function MedicalApp() {
  const [diagResult, setDiagResult] = useState<DiagnoseV12Response | null>(null);
  const [diagLoading, setDiagLoading] = useState(false);
  const isEmergency = Boolean(
    diagResult && (diagResult.status === "emergency" || diagResult.is_emergency)
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto w-full space-y-4">
        <div>
          <h1 className="text-lg font-bold text-[#1B1B2F]">🏥 Phân tích chuyên sâu</h1>
          <p className="text-sm text-[#6B6B8A] mt-0.5">
            Chẩn đoán sơ bộ + bản đồ khẩn cấp — mô tả triệu chứng, Tự Minh phân tích
          </p>
        </div>

        <DiagnosisPanel
          onResult={(r) => setDiagResult(r)}
          onLoading={(v) => setDiagLoading(v)}
        />

        {diagLoading && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
            <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-blue-600">Tự Minh đang phân tích...</span>
          </div>
        )}

        {diagResult && !diagLoading && (
          <ResultPanel
            result={diagResult}
            onAskMore={(q) => console.log("ask more:", q)}
          />
        )}

        {isEmergency && (
          <div className="mt-4">
            <EmergencyMap />
          </div>
        )}

        <div className="mt-6">
          <p className="text-xs font-medium text-[#6B6B8A] uppercase tracking-wide mb-2">
            Ca khám gần đây
          </p>
          <div className="space-y-2">
            {["Ca khám #001", "Ca khám #002", "Ca khám #003"].map((ca, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 cursor-pointer transition-all"
              >
                <span className="text-sm text-gray-600">{ca}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    i === 1 ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"
                  }`}
                >
                  {i === 1 ? "urgent" : "routine"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

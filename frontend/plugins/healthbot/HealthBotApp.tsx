"use client";

import { useState } from "react";
import type { PluginSDK } from "@/core/plugin/pluginSDK";

type Props = { sdk: PluginSDK };

/**
 * Health AI Plugin — ví dụ plugin gọi SDK
 */
export default function HealthBotApp({ sdk }: Props) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const user = sdk.getUser();

  async function askHerbal() {
    setLoading(true);
    setAnswer("");
    try {
      const res = await sdk.chat("herbal", "đau đầu uống gì?");
      const data = await res.json();
      setAnswer(data.answer || data.detail || JSON.stringify(data));
    } catch (e) {
      setAnswer(`Lỗi: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  }

  async function askDiagnosis() {
    setLoading(true);
    setAnswer("");
    try {
      sdk.checkAccess("premium");
      const res = await sdk.diagnose("đau bụng, buồn nôn");
      const data = await res.json();
      setAnswer(data.message || data.detail || JSON.stringify(data));
    } catch (e) {
      setAnswer(`Lỗi: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-lg font-bold text-[#1B1B2F]">🏥 Health AI</h1>
        <p className="text-sm text-[#6B6B8A] mt-0.5">
          Plugin ví dụ — gọi SDK.chat, SDK.diagnose
        </p>
        <p className="text-xs text-[#6B6B8A] mt-1">
          User: {user.id} • Plan: {user.plan}
        </p>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={askHerbal}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#0F6E56] text-white text-sm font-medium disabled:opacity-50"
          >
            Test herbal chat
          </button>
          <button
            type="button"
            onClick={askDiagnosis}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#7B68EE] text-white text-sm font-medium disabled:opacity-50"
          >
            Test diagnose (Pro)
          </button>
        </div>

        {loading && (
          <p className="mt-4 text-sm text-[#6B6B8A]">Đang xử lý...</p>
        )}
        {answer && (
          <div className="mt-4 p-4 rounded-xl bg-[#F5F5FA] text-sm whitespace-pre-wrap">
            {answer}
          </div>
        )}
      </div>
    </div>
  );
}

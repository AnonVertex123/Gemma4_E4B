"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useBot } from "@/state/useBot";
import { useHealthProfile } from "@/state/useHealthProfile";
import { chat, getToken, me } from "@/lib/chat-api";

export default function ChatBox({
  initialInput = "",
  onInputCleared,
}: {
  initialInput?: string;
  onInputCleared?: () => void;
}) {
  const { currentBot, messagesByBot, addMessage } = useBot();
  const [input, setInput] = useState(initialInput);
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<number | null>(null);
  const [limit, setLimit] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = messagesByBot[currentBot] ?? [];
  const { setLastSymptom, age, symptoms, onboardingDone } = useHealthProfile();

  useEffect(() => {
    if (initialInput) setInput(initialInput);
  }, [initialInput]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const refreshUsage = useCallback(() => {
    const t = getToken();
    if (t) {
      me()
        .then((d) => {
          setUsage(d.usage);
          setLimit(d.limit);
        })
        .catch(() => {});
    } else {
      setUsage(null);
      setLimit(null);
    }
  }, []);

  useEffect(() => {
    refreshUsage();
  }, [messages, refreshUsage]);

  useEffect(() => {
    const onAuth = () => refreshUsage();
    window.addEventListener("tuminh-auth", onAuth);
    return () => window.removeEventListener("tuminh-auth", onAuth);
  }, [refreshUsage]);

  async function send() {
    const q = input.trim();
    if (!q || loading) return;

    const t = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user" as const,
      text: q,
      time: t,
      ts: t,
    };
    addMessage(currentBot, userMsg);
    setInput("");
    onInputCleared?.();
    setLoading(true);

    if (currentBot === "herbal" || currentBot === "medical") {
      setLastSymptom(q);
    }

    let questionToSend = q;
    if (
      onboardingDone &&
      (currentBot === "herbal" || currentBot === "medical") &&
      messages.length === 0
    ) {
      questionToSend = `Tôi ${age ?? "?"} tuổi, triệu chứng: ${symptoms ?? ""}. Hỏi: ${q}`;
    }

    try {
      const res = await chat(currentBot, questionToSend);

      const bt = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      const botMsg = {
        id: `b-${Date.now()}`,
        role: "bot" as const,
        text: res.answer || "Không có phản hồi.",
        time: bt,
        ts: bt,
      };
      addMessage(currentBot, botMsg);
      if (typeof res.usage === "number") setUsage(res.usage);
    } catch (e) {
      const et = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      const errMsg = {
        id: `e-${Date.now()}`,
        role: "bot" as const,
        text: `Lỗi: ${e instanceof Error ? e.message : String(e)}`,
        time: et,
        ts: et,
      };
      addMessage(currentBot, errMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto min-h-[200px] max-h-[400px] border border-[#E8E8E8] rounded-xl bg-white p-4 space-y-3"
      >
        {messages.length === 0 ? (
          <p className="text-sm text-[#6B6B8A]">Nhập câu hỏi để bắt đầu chat với bot {currentBot}.</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                  m.role === "user"
                    ? "bg-[#0F6E56] text-white"
                    : "bg-[#F5F5FA] text-[#1B1B2F]"
                }`}
              >
                <span className="whitespace-pre-wrap">{m.text}</span>
                <span className="block text-[10px] opacity-70 mt-1">{m.ts}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2 mt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
          placeholder="Nhập câu hỏi..."
          className="flex-1 px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/30"
          disabled={loading}
        />
        <button
          type="button"
          onClick={send}
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-[#0F6E56] text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Gửi"}
        </button>
      </div>

      {usage != null && limit != null && (
        <p className="text-xs text-[#6B6B8A] mt-2">
          Usage: {usage} / {limit}
        </p>
      )}
    </div>
  );
}

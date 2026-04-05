"use client";

import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history: messages }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: fullText };
            return updated;
          });
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "⚠️ Không thể kết nối Ollama." };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <h1 className="text-lg font-bold text-[var(--text-primary)]">💬 Chat AI — Lucian</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">Cố vấn đa năng, powered by Gemma 4 E4B</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center fade-in">
              <div className="text-6xl mb-4">🏮</div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Chào Eric!</h2>
              <p className="text-[var(--text-secondary)] text-base max-w-md">
                Lucian sẵn sàng phục vụ. Hãy hỏi bất cứ điều gì — từ lập trình, phân tích dự án đến kiến thức tổng quát.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} fade-in`}>
            <div className="relative group">
              <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-[16px] font-medium leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[var(--accent)] text-white rounded-br-md shadow-md"
                  : "glass-card text-[var(--text-primary)] rounded-bl-md shadow-sm"
              }`}>
                {msg.content || (
                  <span className="flex gap-1 py-1">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </span>
                )}
              </div>
              {msg.role === "assistant" && msg.content && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(msg.content);
                    setCopiedId(i);
                    setTimeout(() => setCopiedId(null), 2000);
                  }}
                  className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]"
                >
                  {copiedId === i ? "✓ Đã copy" : "📋 Copy"}
                </button>
              )}
            </div>
          </div>
        ))}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-6 py-4 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Hỏi Lucian..."
            className="flex-1 px-5 py-4 rounded-xl fix-input-visibility text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all shadow-xl shadow-black/20"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="glow-btn px-5 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "..." : "Gửi"}
          </button>
        </div>
      </div>
    </div>
  );
}

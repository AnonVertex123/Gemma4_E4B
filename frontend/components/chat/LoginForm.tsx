"use client";

import { useState } from "react";
import { login, getToken, setToken, me } from "@/lib/chat-api";

export default function LoginForm({
  onLoggedIn,
  compact = false,
}: {
  onLoggedIn?: () => void;
  compact?: boolean;
}) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = typeof window !== "undefined" ? getToken() : null;

  async function doLogin() {
    const u = username.trim();
    if (!u) {
      setError("Nhập username.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await login(u);
      setToken(res.token);
      window.dispatchEvent(new CustomEvent("tuminh-auth"));
      onLoggedIn?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi đăng nhập.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken(null);
    window.dispatchEvent(new CustomEvent("tuminh-auth"));
    onLoggedIn?.();
  }

  if (token) {
    return (
      <div className={compact ? "flex items-center gap-2" : "flex items-center gap-3"}>
        <span className="text-sm text-[#6B6B8A]">Đã đăng nhập</span>
        <button
          type="button"
          onClick={logout}
          className="text-xs px-2 py-1 rounded border border-[#E8E8E8] hover:bg-[#F5F5FA]"
        >
          Đăng xuất
        </button>
      </div>
    );
  }

  return (
    <div className={compact ? "flex items-center gap-2" : "flex flex-col gap-2"}>
      <div className="flex gap-2">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="px-2 py-1.5 border border-[#E8E8E8] rounded text-sm w-32"
        />
        <button
          type="button"
          onClick={doLogin}
          disabled={loading}
          className="px-3 py-1.5 bg-[#0F6E56] text-white rounded text-sm disabled:opacity-50"
        >
          {loading ? "..." : "Đăng nhập"}
        </button>
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

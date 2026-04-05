/**
 * Chat API — unified /chat, /login, /me
 * Uses Next.js proxy /api/platform/* when no direct URL (avoid CORS).
 */

function getBaseUrl(): string {
  const direct =
    process.env.NEXT_PUBLIC_AI_PLATFORM_URL ||
    process.env.TUMINHAGI_AI_PLATFORM_URL ||
    process.env.TUMINHAGI_BACKEND_API_BASE;
  if (direct) return direct.replace(/\/$/, "");
  // Proxy via Next.js (same-origin)
  if (typeof window !== "undefined") return "";
  return "http://127.0.0.1:8001";
}

function getChatApiPath(path: string): string {
  const base = getBaseUrl();
  return base ? `${base}${path}` : `/api/platform${path}`;
}

const TOKEN_KEY = "tuminh_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export type ChatResponse = {
  bot: string;
  answer: string;
  usage?: number;
};

export type MeResponse = {
  user_id: string;
  plan: string;
  usage: number;
  limit: number;
  allowed_bots: string[];
};

export type LoginResponse = {
  token: string;
};

export async function login(username: string): Promise<LoginResponse> {
  const url = getChatApiPath("/login");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || `HTTP ${res.status}`);
  return data;
}

export async function me(): Promise<MeResponse> {
  const t = getToken();
  if (!t) throw new Error("Not logged in");
  const url = getChatApiPath("/me");
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${t}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || `HTTP ${res.status}`);
  return data;
}

export async function chat(botName: string, question: string): Promise<ChatResponse> {
  const url = getChatApiPath("/chat");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const t = getToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ bot_name: botName, question }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || `HTTP ${res.status}`);
  return data;
}

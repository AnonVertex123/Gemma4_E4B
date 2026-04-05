import { NextRequest, NextResponse } from "next/server";

const BASE =
  process.env.TUMINHAGI_AI_PLATFORM_URL ||
  process.env.TUMINHAGI_BACKEND_API_BASE ||
  "http://127.0.0.1:8001";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const auth = req.headers.get("Authorization");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (auth) headers.Authorization = auth;

    const res = await fetch(`${BASE.replace(/\/$/, "")}/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { error: String(e), detail: "Proxy to AI Platform failed" },
      { status: 502 }
    );
  }
}

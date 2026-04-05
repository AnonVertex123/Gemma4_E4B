import { NextRequest, NextResponse } from "next/server";

const BASE =
  process.env.TUMINHAGI_AI_PLATFORM_URL ||
  process.env.TUMINHAGI_BACKEND_API_BASE ||
  "http://127.0.0.1:8001";

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("Authorization");
    const res = await fetch(`${BASE.replace(/\/$/, "")}/me`, {
      headers: auth ? { Authorization: auth } : {},
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

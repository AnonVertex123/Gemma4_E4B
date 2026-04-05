import { NextRequest, NextResponse } from "next/server";

const BASE =
  process.env.TUMINHAGI_AI_PLATFORM_URL ||
  process.env.TUMINHAGI_BACKEND_API_BASE ||
  "http://127.0.0.1:8001";

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("Authorization");
    const body = await req.json();
    const res = await fetch(`${BASE.replace(/\/$/, "")}/marketplace/install`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { error: String(e) },
      { status: 502 }
    );
  }
}

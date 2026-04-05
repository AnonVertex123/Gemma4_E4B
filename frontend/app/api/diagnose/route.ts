import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.TUMINHAGI_BACKEND_API_BASE ||
  process.env.TUMINH_API_BASE ||
  process.env.NEXT_PUBLIC_BACKEND_API_BASE ||
  // backend_api wrapper default port (user can override later)
  "http://127.0.0.1:8001";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = `${API_BASE.replace(/\/$/, "")}/api/diagnose`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { detail: text };
    }

    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { error: String(e), detail: "Proxy to TuminhAGI backend_api failed" },
      { status: 502 },
    );
  }
}


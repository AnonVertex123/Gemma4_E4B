export type DiagnoseV12Request = {
  text: string;
  symptoms?: string[];
  context?: Record<string, unknown>;
  client_id?: string;
};

export type DiagnoseV12Response = {
  case_id: string;
  is_emergency: boolean;
  emergency_reason?: string | null;
  latency_ms?: number | null;
  embed_model?: string | null;
  risk_level: "low" | "medium" | "high";
  status: "ok" | "ask_more" | "refuse" | "emergency";
  message: string;
  confidence?: number | null;
  summary?: string | null;
  details?: string | null;
  candidates?: Array<Record<string, unknown>> | null;
  trace?: Record<string, unknown> | null;
};

const baseRoute = "/api/diagnose";

export async function postDiagnoseV12(
  payload: DiagnoseV12Request,
): Promise<DiagnoseV12Response> {
  const res = await fetch(baseRoute, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const j: unknown = await res.json().catch(() => ({ error: "Invalid JSON" }));
  if (!res.ok) {
    throw new Error(
      (j as any)?.detail?.toString?.() ||
        (j as any)?.error?.toString?.() ||
        `HTTP ${res.status}`,
    );
  }

  // Backfill `confidence` from trace (backend wrapper keeps confidence in trace).
  const out = j as DiagnoseV12Response;
  const maybeConf = (out.trace as any)?.confidence;
  if (typeof maybeConf === "number") {
    out.confidence = maybeConf;
  }
  return out;
}

export async function diagnose({
  text,
  source,
}: {
  text: string;
  source?: string;
}): Promise<DiagnoseV12Response> {
  // Spec Fix 2 expects: diagnose({ text, source: "web" })
  return postDiagnoseV12({
    text,
    context: source ? { source } : undefined,
  });
}


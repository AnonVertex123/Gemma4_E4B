/**
 * Client helpers for POST /diagnose/v2 (via Next.js proxy).
 */

export type DiagnoseV2Candidate = {
  disease_id?: string;
  name_vn?: string;
  name_en?: string;
  score?: number;
  urgency?: string;
  red_flags?: string[];
};

export type DiagnoseV2Response = {
  is_emergency?: boolean;
  emergency_reason?: string;
  latency_ms?: number;
  candidates?: DiagnoseV2Candidate[];
  treatment?: {
    track?: string;
    herbal_options?: unknown[];
    western_options?: unknown[];
    message_vn?: string;
  };
  embed_model?: string;
  error?: string;
  detail?: string;
};

export function parseSymptomsAndContext(text: string): {
  symptoms: string[];
  context: Record<string, unknown>;
} {
  const raw = text.trim();
  const context: Record<string, unknown> = {};

  const ageM = raw.match(
    /(?:tuổi\s*)?(\d{1,3})\s*tuổi|age\s*[=:]\s*(\d{1,3})/i
  );
  if (ageM) {
    const n = Number(ageM[1] || ageM[2]);
    if (n >= 1 && n <= 120) context.age = n;
  }
  if (/\bnam\b|male|đàn\s*ông/i.test(raw)) context.sex = "nam";
  if (/\bnữ\b|female|phụ\s*nữ|bà\b/i.test(raw)) context.sex = "nữ";
  if (/khó\s*thở|thở\s*gắng/i.test(raw)) context.severity = "nặng";

  const parts = raw
    .split(/[,;•\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const symptoms = parts.length > 0 ? parts : [raw];
  return { symptoms, context };
}

export async function postDiagnoseV2(
  symptoms: string[],
  context: Record<string, unknown>
): Promise<DiagnoseV2Response> {
  const res = await fetch("/api/diagnose/v2", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symptoms, context }),
    cache: "no-store",
  });
  const j = (await res.json()) as DiagnoseV2Response;
  if (!res.ok) {
    return {
      ...j,
      error: j.detail?.toString?.() || j.error || `HTTP ${res.status}`,
    };
  }
  return j;
}

/** Chat + emergency panel — không hiển thị thuốc Nam khi cấp cứu */
export function formatDiagnosisForDisplay(
  data: DiagnoseV2Response,
  isEmergency: boolean
): { summaryLines: string[]; agentReply: string } {
  const lines: string[] = [];
  const cands = (data.candidates || []).slice(0, 5);
  cands.forEach((c, i) => {
    const name = c.name_vn || c.name_en || c.disease_id || "?";
    const urg = c.urgency ? ` [${c.urgency}]` : "";
    const sc =
      typeof c.score === "number" ? ` — ${(c.score * 100).toFixed(0)}%` : "";
    lines.push(`${i + 1}. ${name}${sc}${urg}`);
  });
  if (data.emergency_reason) {
    lines.unshift(`⚠️ ${data.emergency_reason}`);
  }
  if (typeof data.latency_ms === "number") {
    lines.push(`(Phân tích ~${data.latency_ms.toFixed(0)} ms)`);
  }

  if (isEmergency) {
    return {
      summaryLines: lines,
      agentReply:
        "Đã phát hiện tình huống khẩn cấp. Xem panel bên phải: gọi cấp cứu, bản đồ BV gần nhất — không tự dùng thuốc Nam.",
    };
  }

  let agentReply = lines.length ? lines.join("\n") : "Không có kết quả chi tiết.";
  const tr = data.treatment;
  if (tr?.message_vn) {
    agentReply += `\n\n${tr.message_vn}`;
  }
  if (tr?.track === "emergency" || data.is_emergency) {
    agentReply += "\n\n(Không gợi ý thuốc Nam trong tình huống cấp cứu.)";
  } else if (
    !isEmergency &&
    tr?.herbal_options &&
    Array.isArray(tr.herbal_options) &&
    tr.herbal_options.length > 0
  ) {
    agentReply += `\n\n[Gợi ý thảo dược: ${tr.herbal_options.length} lựa chọn — xem phác đồ đầy đủ sau khi ổn định.]`;
  }

  return { summaryLines: lines, agentReply };
}

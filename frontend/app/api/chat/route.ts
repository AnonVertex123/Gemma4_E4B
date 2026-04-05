import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `Bạn là Lucian — cố vấn AI cao cấp của hệ thống Tự Minh AGI, phục vụ Eric (Hùng Đại).
CHỈ THỊ BẮT BUỘC:
1. LUÔN LUÔN trả lời bằng TIẾNG VIỆT. Chỉ giữ code/tên hàm bằng tiếng Anh (vì là cú pháp lập trình).
2. Mọi giải thích, phân tích, nhận xét PHẢI bằng tiếng Việt.
3. Trả lời sắc sảo, chuyên nghiệp, tinh gọn.
4. Kiểm tra kỹ logic code trước khi xuất bản.`;

export async function POST(req: NextRequest) {
  const { message, history } = await req.json();

  try {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history || []).slice(-10),
      { role: "user", content: message },
    ];

    const ollamaRes = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "TuminhAGI_G4",
        messages,
        stream: true,
        options: { num_ctx: 8192, temperature: 0.6 },
      }),
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = ollamaRes.body?.getReader();
        if (!reader) { controller.close(); return; }

        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n").filter(Boolean);

          for (const line of lines) {
            try {
              const json = JSON.parse(line);
              if (json.message?.content) {
                controller.enqueue(encoder.encode(json.message.content));
              }
            } catch { /* skip */ }
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch {
    return new Response("Lỗi kết nối Ollama", { status: 500 });
  }
}

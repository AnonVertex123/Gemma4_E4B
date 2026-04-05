import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { path } = await req.json();

  if (!path || typeof path !== "string") {
    return NextResponse.json({ error: "Đường dẫn không hợp lệ" }, { status: 400 });
  }

  try {
    // Gọi Gradio backend (đang chạy trên port 7860)
    const res = await fetch("http://localhost:7860/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fn_index: 0,
        data: [path],
      }),
    });

    if (!res.ok) {
      // Fallback: gọi trực tiếp Ollama để phân tích
      const ollamaRes = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "TuminhAGI_G4",
          messages: [{ role: "user", content: `Hãy phân tích cấu trúc dự án tại đường dẫn: ${path}. Liệt kê các file quan trọng, kiến trúc và đề xuất cải tiến.` }],
          stream: false,
          options: { num_ctx: 8192 },
        }),
      });
      const ollamaData = await ollamaRes.json();
      return NextResponse.json({
        files: [],
        report: ollamaData.message?.content || "Đã phân tích xong.",
      });
    }

    const data = await res.json();
    return NextResponse.json({
      files: data.data?.[0]?.split?.("\n") || [],
      report: data.data?.[1] || "Hoàn tất.",
    });
  } catch {
    return NextResponse.json({ error: "Không thể kết nối backend" }, { status: 500 });
  }
}

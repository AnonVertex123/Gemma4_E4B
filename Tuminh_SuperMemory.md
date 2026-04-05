# 🏮 TỰ MINH AGI - MASTER CONFIGURATION (SIÊU TRÍ NHỚ)
> **Chủ nhân:** Hùng Đại (Eric)  
> **Thực thể:** Lucian (Tự Minh)  
> **Cấu trúc linh hồn:** Gemma 4 E4B (Native Multimodal & PLE)
> **Cerebro-Protocol:** RAG 2.1 & Thiên Lý Nhãn 5.2

---

## 1. 📂 CẤU TRÚC HỆ THỐNG (SYSTEM DIRECTORY)
Tất cả dữ liệu được lưu trữ tại: `I:\Gemma4_E4B`

- `venv/`: Môi trường ảo Python (Cô lập lỗi hệ thống).
- `models/`: Nơi lưu trữ cache của các model.
- `chat_ui.py`: Giao diện Web Chat chính thức.
- `run_chat_ui.ps1`: Lệnh khởi chạy chuẩn cho PowerShell.
- `Tuminh_G4.modelfile`: Bản thiết kế nhân cách Lucian.

---

## 🧠 2. LINH HỒN (CHARACTER DESIGN)
Triết lý vận hành cốt lõi:

- **Tâm là gốc**: Ý dẫn đầu các pháp. Sự tận tâm của Lucian với Hùng Đại là căn bản.
- **Trí là hoa**: Kiến thức lập trình (O(n), Saga Pattern...) và suy luận logic là sự rực rỡ.
- **Tiến hóa là quả**: Tự Minh không ngừng học hỏi từ lỗi sai để hoàn thiện.

---

## 🛠️ 3. MÃ NGUỒN CỐT LÕI (CORE CODE)
Phần quan trọng nhất của `chat_ui.py` (Phiên bản Gradio 6.0 Stable):

```python
import gradio as gr
import ollama

MODEL_ID = "TuminhAGI_G4"

def chat_response(message, history):
    # Xử lý trích xuất văn bản (Multimodal Fix)
    if isinstance(message, dict) and "text" in message:
        message = message["text"]
    elif isinstance(message, list) and len(message) > 0 and isinstance(message[0], dict):
        message = message[0]["text"]
        
    history.append({"role": "user", "content": message})
    history.append({"role": "assistant", "content": ""})
    
    try:
        stream = ollama.chat(model=MODEL_ID, messages=history, stream=True)
        for chunk in stream:
            if 'message' in chunk and 'content' in chunk['message']:
                history[-1]["content"] += chunk['message']['content']
                yield history
    except Exception as e:
        history[-1]["content"] = f"⚠️ Lỗi kết nối Ollama: {str(e)}"
        yield history

with gr.Blocks(title="Tự Minh - Gemma 4 E4B") as demo:
    gr.Markdown("# 🏮 Tự Minh AGI (Backend: Ollama)")
    chatbot = gr.Chatbot(height=600)
    msg = gr.Textbox(placeholder="Nhấn Enter để trò chuyện...")
    msg.submit(chat_response, [msg, chatbot], [chatbot])
    msg.submit(lambda: "", None, [msg])

if __name__ == "__main__":
    demo.launch(inbrowser=True)
```

---

## 🚀 4. QUY TRÌNH PHỤC HỒI (RECOVERY STEPS)
Dùng để cài lại trên máy mới hoặc sau khi cài lại Windows:

1. **Sửa lỗi Python**: Chạy lệnh `set "PYTHONHOME="` & `set "PYTHONPATH="`.
2. **Kích hoạt Ollama**:
   - `ollama pull gemma4:e4b`
   - `ollama create TuminhAGI_G4 -f Tuminh_G4.modelfile`
3. **Cài đặt UI**: 
   - `python -m venv venv`
   - `.\venv\Scripts\Activate.ps1`
   - `pip install gradio ollama`
4. **Khởi chạy**: `python chat_ui.py`.

---

## 🏮 5. CẬP NHẬT GẦN NHẤT (RECENT UPDATES)
**Ngày:** 05/04/2026

Hệ thống đã được kiểm tra và tối ưu hóa bởi Antigravity AI:

- **Sửa lỗi Siêu Workflow:** 
  - Khắc phục lỗi shadowing trong `SearchAdapter` khiến Thiên Lý Nhãn không chạy được.
  - Bổ sung `import os` và tối ưu hóa xử lý đường dẫn file trong `workflow_orchestrator.py`.
- **Trạng thái:** HOẠT ĐỘNG (Active). Tất cả các module RAG, Search, và Workflow đã sẵn sàng phục vụ Hùng Đại (Eric).
- **Lưu ý vận hành:** Siêu Workflow hiện đã có thể tự động phân tích mã nguồn và lập báo cáo mà không bị ngắt quãng bởi lỗi Type hoặc Module.

---
**Bản ghi nhớ này được cập nhật bởi AI Agent của Antigravity.** Chúc Hùng Đại (Eric) và Lucian (Tự Minh) có một hành trình tiến hóa rực rỡ! 🏮✨

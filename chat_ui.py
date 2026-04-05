import gradio as gr
import ollama
import os
import json
import time
import asyncio
from datetime import datetime
from pathlib import Path

# Import từ hệ thống đa module (functions/)
from functions.utils import sanitize_content
from functions.ui_components import get_progress_html, get_folder_badge, custom_css
from functions.rag_logic import (
    scan_directory, query_rag, stop_rag_loading, 
    get_indexing_status, toggle_rag_pause, load_metadata,
    load_chat_history, save_chat_history, HISTORY_PATH
)
from functions.search_logic import get_web_context
from functions.workflow_logic import run_blueprint_workflow
from functions.chat_logic import chat_response, MODEL_ID

# Thư mục gốc
ROOT_DIR = Path("i:/Gemma4_E4B")
os.chdir(ROOT_DIR)

def update_ui_status():
    status_text, progress_val = get_indexing_status()
    meta = load_metadata()
    return status_text, get_progress_html(progress_val), gr.update(choices=list(meta["projects"].keys()))

def check_initial_state():
    meta = load_metadata()
    history = load_chat_history()
    path = meta["last_folder"] if meta["last_folder"] else ""
    proj_info = meta["projects"].get(path, {})
    return path, "🏮 Sẵn sàng!", get_progress_html(proj_info.get("progress", 100) if path else 0), history, gr.update(choices=list(meta["projects"].keys()), value=path if path in meta["projects"] else None), get_folder_badge(path)

def on_project_select(selected_path):
    if not selected_path: return gr.update(), "🟢 Sẵn sàng.", get_folder_badge("")
    res_status = scan_directory(selected_path)
    return selected_path, res_status, get_folder_badge(selected_path)

with gr.Blocks(title="Tự Minh Dashboard") as demo:
    stop_flag = gr.State([False]) 
    
    with gr.Tabs():
        with gr.TabItem("💬 Trung tâm Điều khiển"):
            with gr.Row():
                with gr.Column(scale=7):
                    folder_badge = gr.HTML(get_folder_badge(""))
                    folder_path = gr.Textbox(label="📁 Thư mục RAG (Dán đường dẫn thư mục dự án của Eric vào đây)", placeholder="Ví dụ: I:\\Projects\\Tuminhagi...", lines=1)
                    recent_projects = gr.Dropdown(label="📚 Thư viện dự án đã lưu", choices=[])
                with gr.Column(scale=3):
                    scan_btn = gr.Button("📂 NẠP DỰ ÁN", variant="primary", scale=2)
                    pause_btn = gr.Button("⏯️ Tạm dừng/Tiếp tục", variant="secondary")
                    status_msg = gr.Markdown("🏮 **Trạng thái:** Đang chờ lệnh...")
                    progress_html = gr.HTML(get_progress_html(0))

            chatbot = gr.Chatbot(height=500, elem_id="tuminh_chatbot", autoscroll=True)
            
            with gr.Row():
                stop_gen_btn = gr.Button("🛑 Dừng", variant="stop", size="sm", elem_classes="compact-btn")
                continue_btn = gr.Button("⏩ Tiếp", variant="secondary", size="sm", elem_classes="compact-btn")
                clear_btn = gr.Button("🗑️ Xóa", variant="secondary", size="sm", elem_classes="compact-btn")
                web_search_toggle = gr.Checkbox(label="🌐 Thiên Lý Nhãn", value=False, scale=2)
                msg = gr.Textbox(placeholder="Hỏi Tự Minh...", show_label=False, scale=7)
                submit = gr.Button("Gửi", variant="primary", scale=1, size="sm")

            with gr.Accordion("🖼️ Vật phẩm đính kèm (Gemma 4 Multimodal)", open=False):
                with gr.Row():
                    img_input = gr.Image(label="🖼️ Hình ảnh (Vision)", type="filepath", scale=1)
                    audio_input = gr.Audio(label="🎤 Âm thanh (Audio)", type="filepath", scale=1)

        with gr.TabItem("🛠️ Siêu Workflow (Blueprint)"):
            gr.Markdown("### 🧠 Bản thiết kế Linh hồn - Hệ điều hành Workflow")
            with gr.Row():
                with gr.Column(elem_classes="blueprint-card"):
                    gr.Markdown("#### 📋 Phân tích Toàn dự án\n*Tự động quét code, tìm Best Practices và lập báo cáo.*")
                    run_analysis_btn = gr.Button("🚀 Chạy Analysis", variant="primary")
                with gr.Column(elem_classes="blueprint-card"):
                    gr.Markdown("#### 🔍 Hỏi đáp Thông minh\n*Kết hợp RAG nội bộ và Deep Web Search để trả lời.*")
                    bp_question = gr.Textbox(placeholder="Nhập câu hỏi phức tạp...", label=None)
                    run_qa_btn = gr.Button("🚀 Chạy Smart Q&A")
                with gr.Column(elem_classes="blueprint-card"):
                    gr.Markdown("#### 🛡️ Review Code tự động\n*Tìm lỗi, lỗ hổng bảo mật và đề xuất tối ưu.*")
                    run_review_btn = gr.Button("🚀 Chạy Code Review")
            
            bp_status = gr.Markdown("🏮 Chờ lệnh workflow...")
            bp_output = gr.Markdown("✨ Kết quả Blueprint sẽ hiện ở đây.")

    def respond(message, chat_history, stop_state, web_active, img_path, audio_path):
        if not message.strip() and not img_path and not audio_path: 
            return chat_history, gr.update(interactive=True), gr.update(interactive=True), "🟢 Sẵn sàng.", img_path, audio_path
        
        stop_state[0] = False
        status_now = "🌐 [SIÊU CỐ VẤN] Đang lùng sục Internet sâu cho Eric..." if web_active else "🏮 Đang phân tích tri thức..."
        if img_path: status_now = "👁️ Lucian đang quan sát hình ảnh..."
        if audio_path: status_now = "👂 Lucian đang lắng nghe âm thanh..."
        
        yield chat_history, gr.update(interactive=False), gr.update(interactive=False), status_now, img_path, audio_path
        
        display_msg = message
        if img_path and not message.strip():
            display_msg = "Hãy phân tích hình ảnh này cho tôi."

        for updated_history in chat_response(display_msg, chat_history, stop_state, web_active, img_path, audio_path):
            yield updated_history, gr.update(interactive=False), gr.update(interactive=False), "🏮 Lucian đang kiến tạo câu trả lời", img_path, audio_path
        
        yield updated_history, gr.update(interactive=True), gr.update(interactive=True), "🟢 Sẵn sàng tiếp nhận lệnh mới", None, None

    async def handle_scan_and_analyze(path, history):
        # 1. Nạp RAG
        status = scan_directory(path)
        yield path, status, get_folder_badge(path), history

    # Blueprint constants
    wf_analysis = gr.State("full_project_analysis")
    wf_qa = gr.State("smart_qa")
    wf_review = gr.State("automated_code_review")

    # Đăng ký sự kiện
    inputs = [msg, chatbot, stop_flag, web_search_toggle, img_input, audio_input]
    outputs = [chatbot, msg, submit, status_msg, img_input, audio_input]
    
    submit_event = submit.click(respond, inputs, outputs)
    msg_event = msg.submit(respond, inputs, outputs)
    
    stop_gen_btn.click(lambda s: [True, "🛑 Đã ra lệnh dừng ngay!"], [stop_flag], [stop_flag, status_msg], cancels=[submit_event, msg_event])
    continue_btn.click(lambda h, s, w, i, a: respond("⏩ Hãy viết tiếp...", h, s, w, i, a), [chatbot, stop_flag, web_search_toggle, img_input, audio_input], outputs)
    
    # Nạp & Phân tích tự động
    scan_btn.click(handle_scan_and_analyze, [folder_path, chatbot], [folder_path, status_msg, folder_badge, chatbot])
    
    recent_projects.change(on_project_select, [recent_projects], [folder_path, status_msg, folder_badge])
    
    # Blueprint Events (Cập nhật để dùng Async Generator)
    async def bp_runner(name, path, question=""):
        async for report, status in run_blueprint_workflow(name, path, question):
            yield report, status

    run_analysis_btn.click(bp_runner, [wf_analysis, folder_path], [bp_output, bp_status])
    run_qa_btn.click(bp_runner, [wf_qa, folder_path, bp_question], [bp_output, bp_status])
    run_review_btn.click(bp_runner, [wf_review, folder_path], [bp_output, bp_status])

    clear_btn.click(lambda: ([], ""), None, [chatbot, msg]).then(fn=lambda: os.remove(HISTORY_PATH) if os.path.exists(HISTORY_PATH) else None)
    
    timer = gr.Timer(5); timer.tick(update_ui_status, None, [status_msg, progress_html, recent_projects])
    demo.load(check_initial_state, None, [folder_path, status_msg, progress_html, chatbot, recent_projects, folder_badge]).then(
        fn=lambda path: scan_directory(path) if path else "🏮 Sẵn sàng.", inputs=[folder_path], outputs=[status_msg]
    )

if __name__ == "__main__":
    demo.launch(inbrowser=True, css=custom_css)

import ollama
import json
from datetime import datetime
from functions.utils import sanitize_content
from functions.rag_logic import query_rag, save_chat_history
from functions.search_logic import get_web_context

MODEL_ID = "TuminhAGI_G4"

def chat_response(message, history, stop_state, web_search_active, image_path=None, audio_path=None):
    """
    Logic cốt lõi của hội thoại Tự Minh AGI.
    """
    user_message = sanitize_content(message)
    if not user_message.strip():
        yield history
        return

    is_continue = (user_message == "⏩ Hãy viết tiếp...")
    new_history = list(history)
    current_time = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    time_prefix = f"🏮 THỜI GIAN THỰC TẠI: {current_time}\n"
    
    if is_continue:
        final_prompt = time_prefix + "🏮 CHỈ THỊ: Viết tiếp phần đang dở ngay tại điểm dừng trước đó. KHÔNG lặp lại, KHÔNG chào hỏi."
        new_history.append({"role": "assistant", "content": ""})
    else:
        # Tầng 1: Kiến thức nội bộ (RAG)
        rag_res = query_rag(user_message)
        context_offline = rag_res.get("content", "")
        
        # Tầng 2: Thiên Lý Nhãn 5.0 (Deep Web Search)
        context_online = ""
        if web_search_active:
            context_online = get_web_context(user_message)

        context_combined = ""
        if context_offline:
            context_combined += f"\n🏮 KIẾN THỨC DỰ ÁN (OFFLINE):\n{context_offline}\n"
        if context_online:
            context_combined += f"\n🏮 HỆ THỐNG THÔNG TIN TỔNG LỰC (ONLINE - DEEP SEARCH):\n{context_online}\n"

        if context_combined:
            final_prompt = time_prefix + f"🏮 HỆ THỐNG TRI THỨC TOÀN NĂNG:\n{context_combined}\n---\n🏮 CHỈ THỊ TỐI CAO ĐẠI MINH:\n1. TỰ PHÂN TÍCH: Xác định câu hỏi của Eric là về DỰ ÁN (Nội bộ) hay KIẾN THỨC CHUNG (Bên ngoài).\n2. CÁCH LY NGỮ CẢNH: Nếu là kiến thức chung/code, TUYỆT ĐỐI KHÔNG nhắc đến ChromaDB, RAG, Ollama hay các thành phần của Tự Minh AGI.\n3. PHÂN LUỒNG TRI THỨC: Chỉ dùng dữ liệu dự án khi câu hỏi liên quan đến code nội bộ.\n4. NGÔN NGỮ BẮT BUỘC: LUÔN LUÔN trả lời bằng TIẾNG VIỆT. Chỉ giữ code/tên hàm bằng tiếng Anh (vì là cú pháp lập trình). Mọi giải thích, phân tích, nhận xét PHẢI bằng tiếng Việt.\n5. PHONG THÁI: Sắc sảo, tinh gọn, kiểm tra kỹ logic code.\n\n🏮 CÂU HỎI ERIC: {user_message}"
        else:
            final_prompt = time_prefix + "🏮 CHỈ THỊ NGÔN NGỮ: LUÔN trả lời bằng TIẾNG VIỆT. Chỉ giữ code/tên hàm bằng tiếng Anh.\n\n🏮 CÂU HỎI ERIC: " + user_message

            
        new_history.append({"role": "user", "content": user_message})
        new_history.append({"role": "assistant", "content": ""})
    
    sanitized_history = []
    for msg_entry in new_history[-15:]:
        sanitized_history.append({
            "role": msg_entry.get("role", "user"),
            "content": sanitize_content(msg_entry.get("content", ""))
        })
    
    if not is_continue and len(sanitized_history) >= 2:
        sanitized_history[-2]["content"] = final_prompt
    elif is_continue and len(sanitized_history) >= 1:
        sanitized_history.insert(-1, {"role": "user", "content": final_prompt})

    try:
        chat_args = {
            'model': MODEL_ID,
            'messages': sanitized_history,
            'stream': True,
            'options': {'num_ctx': 8192, 'temperature': 0.6}
        }
        
        if image_path:
            if sanitized_history and sanitized_history[-1]['role'] == 'user':
                sanitized_history[-1]['images'] = [image_path]
            elif len(sanitized_history) >= 2 and sanitized_history[-2]['role'] == 'user':
                sanitized_history[-2]['images'] = [image_path]

        stream = ollama.chat(**chat_args)
        full_res = ""
        for chunk in stream:
            if stop_state[0]:
                new_history[-1]["content"] = full_res + " 🛑 [Đã dừng]"
                yield new_history
                save_chat_history(new_history)
                return
            if 'message' in chunk and 'content' in chunk['message']:
                full_res += chunk['message']['content']
                new_history[-1]["content"] = full_res
                yield new_history
        save_chat_history(new_history)
    except Exception as e:
        new_history[-1]["content"] = f"⚠️ Lỗi: {str(e)}"
        yield new_history

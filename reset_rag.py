import os
import shutil
import json
import time

KNOWLEDGE_ROOT = "i:/Gemma4_E4B/knowledge_base"
METADATA_PATH = "i:/Gemma4_E4B/rag_metadata.json"
HISTORY_PATH = "i:/Gemma4_E4B/chat_history.json"

def reset_rag():
    print("🚀 Đang khởi động quy trình Tẩy Não (RAG Reset)...")
    
    # 1. Xóa sạch tri thức cũ với cơ chế thử lại (Retry)
    if os.path.exists(KNOWLEDGE_ROOT):
        max_retries = 3
        for i in range(max_retries):
            try:
                shutil.rmtree(KNOWLEDGE_ROOT)
                os.makedirs(KNOWLEDGE_ROOT, exist_ok=True)
                print(f"✅ Đã xóa sạch tri thức cũ tại {KNOWLEDGE_ROOT}")
                break
            except PermissionError:
                if i < max_retries - 1:
                    print(f"⚠️ Thư mục đang bị khóa! Đang thử lại sau 2 giây ({i+1}/{max_retries})...")
                    time.sleep(2)
                else:
                    print(f"❌ Không thể xóa thư mục! Eric hãy đảm bảo đã tắt Dashboard (Ctrl+C) trước khi reset.")
            except Exception as e:
                print(f"❌ Lỗi không xác định: {e}")
                break
    
    # 2. Reset Metadata
    try:
        with open(METADATA_PATH, 'w', encoding='utf-8') as f:
            json.dump({"projects": {}, "last_folder": ""}, f, ensure_ascii=False, indent=4)
        print(f"✅ Đã reset metadata tại {METADATA_PATH}")
    except Exception as e:
        print(f"❌ Lỗi reset metadata: {e}")

    # 3. Reset Lịch sử chat
    try:
        with open(HISTORY_PATH, 'w', encoding='utf-8') as f:
            json.dump([], f, ensure_ascii=False, indent=4)
        print(f"✅ Đã dọn dẹp lịch sử chat tại {HISTORY_PATH}")
    except Exception as e:
        print(f"❌ Lỗi dọn dẹp lịch sử: {e}")

if __name__ == "__main__":
    reset_rag()

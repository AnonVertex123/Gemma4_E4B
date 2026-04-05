import ollama
import sys

def setup_gemma4():
    """Kiểm tra kết nối và khởi chạy TuminhAGI với model Gemma 4 E4B."""
    print("[INFO] Kích hoạt kết nối đến TuminhAGI_G4...")
    
    prompt_text = "Hệ thống Dual-Core đã kết nối. Hãy xác nhận trạng thái hiện tại của bạn theo triết lý Đế chế Đại Minh."
    
    try:
        response = ollama.chat(model='TuminhAGI_G4', messages=[
            {
                'role': 'user', 
                'content': prompt_text
            }
        ])
        
        print("\n[RESPONSE - TỰ MINH]:")
        print(response['message']['content'])
        
    except Exception as e:
        print(f"[ERROR] Không thể kết nối. Đảm bảo Ollama đang chạy và model đã được build. Chi tiết: {e}")
        sys.exit(1)

if __name__ == "__main__":
    setup_gemma4()

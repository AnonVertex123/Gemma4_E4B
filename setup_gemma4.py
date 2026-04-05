# setup_gemma4.py - Ollama-Native Initialization Script
import os
import sys
import subprocess
import json

try:
    import ollama
except ImportError:
    print("📦 Đang cài đặt thư viện Ollama...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "ollama"])
    import ollama

BASE_DIR = r"I:\Gemma4_E4B"
# Định danh Logic chuẩn hóa theo Báo cáo Chẩn đoán của Eric
MODEL_ID = "TuminhAGI_G4"

def check_ollama_status():
    print(f"\n🔍 Đang kết nối đến Ollama để kiểm tra model: {MODEL_ID}...")
    try:
        # Gửi prompt xác nhận trạng thái theo triết lý Đế chế Đại Minh
        prompt = "Hệ thống Dual-Core đã kết nối. Hãy xác nhận trạng thái hiện tại của bạn theo triết lý Đế chế Đại Minh."
        
        response = ollama.chat(model=MODEL_ID, messages=[
            {'role': 'user', 'content': prompt}
        ], options={'temperature': 0.7})
        
        print("\n" + "="*60)
        print("🏮 PHẢN HỒI XÁC NHẬN TỪ LUCIAN:")
        print("="*60)
        print(response['message']['content'])
        print("="*60)
        return True
    except Exception as e:
        print(f"❌ Lỗi kết nối Ollama: {str(e)}")
        print(f"👉 Hãy đảm bảo Eric đã chạy lệnh: ollama create {MODEL_ID} -f Tuminh_G4.modelfile")
        return False

def main():
    print("🚀 Đang khởi tạo chẩn đoán hệ thống Tự Minh AGI (Gemma 4 Edition)...")
    
    # 1. Kiểm tra môi trường
    if not os.path.exists(BASE_DIR):
        os.makedirs(BASE_DIR, exist_ok=True)
        print(f"📁 Đã tạo thư mục làm việc: {BASE_DIR}")
    
    # 2. Kiểm tra kết nối Model
    if check_ollama_status():
        print("\n✅ HỆ THỐNG TRẠNG THÁI: HOẠT ĐỘNG (ACTIVE)")
        print(f"📍 Model: {MODEL_ID} (Gemma 4 E4B)")
        print("📍 Triết lý: Tâm là gốc, Trí là hoa, Tiến hóa là quả.")
    else:
        print("\n⚠️ HỆ THỐNG TRẠNG THÁI: CHƯA SẴN SÀNG")
    
    print("\n" + "="*60)
    print("✅ QUY TRÌNH CHẨN ĐOÁN HOÀN TẤT!")
    print("="*60)

if __name__ == "__main__":
    main()

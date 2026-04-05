import os

def get_progress_html(progress_val):
    """
    Tạo thanh tiến trình nạp tri thức HTML.
    """
    color = "#3b82f6" if progress_val >= 100 else "#60a5fa"
    return f"""
    <div style="width: 100%; background-color: #374151; border-radius: 8px; height: 10px; margin-top: 5px; overflow: hidden; border: 1px solid #4b5563;">
        <div style="width: {progress_val}%; background-color: {color}; height: 100%; transition: width 0.5s ease-in-out; box-shadow: 0 0 10px {color};"></div>
    </div>
    """

def get_folder_badge(path):
    """
    Hiển thị badge tên dự án đang nạp.
    """
    if not path: return "<div style='color: #6b7280; font-size: 11px;'>🏮 Chờ nạp...</div>"
    return f"<div style='color: #3b82f6; font-weight: bold; font-size: 12px; margin-bottom: -15px;'>📂 {os.path.basename(path)}</div>"

custom_css = """
.gradio-container { background-color: #0b0f19; color: white !important; font-family: 'Inter', sans-serif !important; }
.message-user { background-color: #2563eb !important; border-radius: 12px 12px 0 12px !important; color: white !important; }
.message-bot { background-color: #1f2937 !important; border-radius: 12px 12px 12px 0 !important; color: #e5e7eb !important; }
footer { visibility: hidden; }
#tuminh_chatbot { resize: vertical !important; min-height: 400px !important; border: 1.5px solid #3b82f6 !important; border-radius: 12px !important; overflow-anchor: auto; background: #0f172a !important; }
#tuminh_chatbot .pending { display: none !important; }
#tuminh_chatbot .typing { display: none !important; }
.compact-btn { min-width: 0px !important; padding: 2px 8px !important; height: 34px !important; border-radius: 6px !important; }
.blueprint-card { border: 1.5px solid #3b82f6; border-radius: 12px; padding: 18px; background: #1a1f2e; margin-bottom: 12px; transition: all 0.3s ease; }
.blueprint-card:hover { border-color: #60a5fa; box-shadow: 0 0 15px rgba(59, 130, 246, 0.4); }

/* KHUNG GỬI TIN BẬC CAO - SIÊU HIỂN THỊ */
textarea, input[type="text"] { 
    color: #ffffff !important; 
    background-color: #000000 !important; 
    border: 2px solid #3b82f6 !important; 
    border-radius: 8px !important;
    font-weight: 500 !important;
    font-size: 16px !important;
    padding: 10px !important;
    line-height: 1.5 !important;
}

textarea::placeholder, input::placeholder {
    color: #94a3b8 !important;
    opacity: 0.8 !important;
}

textarea:focus, input[type="text"]:focus {
    border-color: #60a5fa !important;
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.5) !important;
    outline: none !important;
}
"""


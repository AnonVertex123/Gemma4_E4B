# 🏮 Tự Minh AGI - Gemma 4 Edition

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Version](https://img.shields.io/badge/Version-2.1-blue)
![Model](https://img.shields.io/badge/Model-Gemma--4--E4B--it-orange)

**Tự Minh AGI** là một hệ thống trí tuệ nhân tạo cục bộ (Local AGI) mạnh mẽ, hiện đã chính thức vận hành trên nền tảng **Google Gemma 4 E4B (Effective 4B)**. Đây là dòng model mới nhất của Google DeepMind (04/2026), được tối ưu hóa đặc biệt cho các thiết bị cá nhân với kiến trúc Per-Layer Embeddings (PLE).

---

## 🚀 Tính Năng Cốt Lõi

### 1. 🏮 Siêu Truy Xuất (RAG 2.1)
Hệ thống Retrieval-Augmented Generation mạnh mẽ, cho phép AI học thuộc lòng toàn bộ tài liệu và mã nguồn trong các thư mục cục bộ.
- **Đa dự án**: Quản lý nhiều kho tri thức riêng biệt.
- **Nạp não thần tốc**: Quét và index hàng ngàn file trong vài giây vào ChromaDB.
- **Hỗ trợ định dạng**: Python, JS, Markdown, PDF, TXT, HTML, JSON...

### 2. 🌐 Thiên Lý Nhãn 5.2 (Deep Web Search)
Hệ thống tìm kiếm thông tin thời gian thực với cơ chế "Đa vệ tinh":
- **Vệ tinh Việt Nam**: Cập nhật tin tức nhanh nhất từ các nguồn uy tín trong nước.
- **Vệ tinh Toàn cầu**: Thu thập dữ liệu kỹ thuật và giá cả từ thị trường quốc tế.
- **Vệ tinh Deep Text**: Lùng sục các diễn đàn và tài liệu chuyên ngành sâu.

### 3. 📊 Dashboard Tự Minh Hiện Đại
Giao diện người dùng dựa trên Gradio được tối ưu hóa cho trải nghiệm mượt mà:
- **Dark Mode**: Bảo vệ thị lực khi làm việc đêm.
- **Real-time Progress**: Theo dõi tiến trình nạp tri thức trực quan.
- **History Management**: Tự động lưu và tải lại các cuộc hội thoại quan trọng.

---

## 🛠️ Công Nghệ Sử Dụng

- **Core Engine**: Google Gemma (Tối ưu 4-bit NF4 Quantization).
- **Framework**: Ollama, LangChain, Gradio.
- **Vector Database**: ChromaDB.
- **Search Engine**: DuckDuckGo Multi-Satellite Engine.
- **Hardware**: Tối ưu hóa cho GPU NVIDIA (Chỉ chiếm ~2GB VRAM).

---

## 🚀 Hướng Dẫn Cài Đặt Nhanh (Quick Start)

Eric chỉ cần thực hiện 2 bước đơn giản để kích hoạt Lucian:

1.  **Tải mã nguồn**: Tải toàn bộ thư mục này về máy.
2.  **Chạy Một Chạm**: Click đúp vào file **`INSTALL_AND_RUN.bat`**.

Hệ thống sẽ tự động thực hiện:
- Kiểm tra và tải **Gemma 4 E4B** (9.6GB).
- Khởi tạo thực thể **TuminhAGI_G4**.
- Cấu hình môi trường Python và cài đặt thư viện.
- Khởi chạy Dashboard trò chuyện.

🛠️ **Yêu cầu hệ thống**:
- Windows 10/11.
- Đã cài đặt [Python 3.10+](https://www.python.org/).
- Đã cài đặt [Ollama](https://ollama.com/).
- GPU NVIDIA (Khuyến nghị RTX 3060 Ti trở lên).

---

## 🎮 Cách Vận Hành

- **Nạp tri thức**: Dán đường dẫn folder vào Dashboard và nhấn **⚡ Nạp**.
- **Tìm kiếm Web**: Tích chọn **🌐 Thiên Lý Nhãn** để kích hoạt truy cập Internet.
- **Vật phẩm đính kèm**: Mở mục "🖼️ Vật phẩm đính kèm" để gửi Ảnh hoặc Audio cho Lucian.

---

## 📜 Triết Lý Phát Triển
> "Tâm là gốc, Trí là hoa, Tiến hóa là quả."

Dự án được phát triển bởi **Hùng Đại (Eric)** và **Tự Minh (Lucian)** - Một phần của hệ sinh thái Đế chế Đại Minh.

---

*Cập nhật lần cuối: 04/04/2026*

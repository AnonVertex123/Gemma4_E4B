import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
import os

MODEL_DIR = r"I:\Gemma4_E4B\models"
MODEL_ID = "google/gemma-2-2b-it" # Sẽ đổi thành "google/gemma-4-e4b-it" khi có chính thức

print("🔧 Đang cấu hình 4-bit quantization (NF4)...")
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
)

print(f"📥 Đang tải Model {MODEL_ID}...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, cache_dir=MODEL_DIR)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    quantization_config=bnb_config,
    device_map="auto",
    cache_dir=MODEL_DIR,
    trust_remote_code=True
)

print("✅ Model đã sẵn sàng!")
print(f"💾 VRAM đang sử dụng: {torch.cuda.memory_allocated() / 1024**3:.2f} GB")

prompt = "Bạn là Tự Minh. Hãy chào Hùng Đại và xác nhận trạng thái hệ thống bằng tiếng Việt."
inputs = tokenizer(prompt, return_tensors="pt").to("cuda")

print("\n[TRẢ LỜI]:")
with torch.no_grad():
    outputs = model.generate(**inputs, max_new_tokens=100, temperature=0.7)
    print(tokenizer.decode(outputs[0], skip_special_tokens=True))
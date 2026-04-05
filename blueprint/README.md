# TỰ MINH AGI - BLUEPRINT SYSTEM 🧠

> "Tâm là gốc, Trí là hoa, Tiến hóa là quả"

## 📋 Tổng Quan

Hệ thống Blueprint cho phép Tự Minh AGI quản lý và thực thi các task phức tạp thông qua **workflow-based orchestration**. Kết hợp sức mạnh của:

- **Cerebro-RAG 2.2**: Truy xuất tri thức nội bộ
- **Thiên Lý Nhãn 5.2**: Tìm kiếm web thời gian thực
- **Gemma 4 E4B**: Native multimodal reasoning
- **Event-Driven Workflow**: Orchestration thông minh

## 🏗️ Kiến Trúc

```
blueprints/
├── task_schema.yaml           # Blueprint schema (định nghĩa task & workflow)
├── workflow_orchestrator.py   # Workflow execution engine
├── integration_adapter.py     # Kết nối với các module hiện có
└── tuminh_cli.py             # Command-line interface
```

### Luồng hoạt động

```
User Request → CLI/API
    ↓
Workflow Orchestrator
    ↓
┌─────────────┬──────────────┬──────────────┐
│   RAG       │   Search     │   Model      │
│ (Local KB)  │  (Web)       │  (Gemma 4)   │
└─────────────┴──────────────┴──────────────┘
    ↓
Task Execution Pipeline
    ↓
Result Synthesis
    ↓
User Response
```

## 🚀 Cài Đặt

### 1. Dependencies

```bash
pip install pyyaml ollama chromadb duckduckgo-search
```

### 2. Cấu Trúc Thư Mục

```bash
tuminh_agi_project/
├── blueprints/              # Blueprint system (folder mới)
│   ├── task_schema.yaml
│   ├── workflow_orchestrator.py
│   ├── integration_adapter.py
│   └── tuminh_cli.py
├── rag_logic.py            # Module hiện có
├── search_logic.py         # Module hiện có
├── chat_ui.py              # Module hiện có
└── logs/                   # Auto-created
```

### 3. Khởi Tạo Model

```bash
# Pull Gemma 4 E4B qua Ollama
ollama pull gemma4:e4b

# Tạo custom model với modelfile
ollama create TuminhAGI_G4 -f Tuminh_G4.modelfile
```

## 📖 Sử Dụng

### A. Command Line Interface (CLI)

#### 1. Liệt kê các workflow có sẵn

```bash
python blueprints/tuminh_cli.py list
```

**Output:**
```
📋 Danh sách Workflows có sẵn:

1. full_project_analysis
   📝 Index toàn bộ code, tìm kiếm web bổ trợ, và tạo báo cáo
   🔢 Số bước: 4

2. smart_qa
   📝 Hỏi đáp thông minh với RAG + Web
   🔢 Số bước: 3

3. automated_code_review
   📝 Review code tự động
   🔢 Số bước: 3
```

#### 2. Xem chi tiết workflow

```bash
python blueprints/tuminh_cli.py show smart_qa
```

#### 3. Chạy workflow

**Ví dụ 1: Smart Q&A**
```bash
python blueprints/tuminh_cli.py run smart_qa \
  --inputs '{"question": "Làm thế nào để tối ưu RAG?", "project_folder": "./my_project"}' \
  --output results.json
```

**Ví dụ 2: Full Project Analysis**
```bash
python blueprints/tuminh_cli.py run full_project_analysis \
  --inputs '{"project_path": "/path/to/project"}' \
  --verbose
```

#### 4. Quick Query (không cần workflow)

```bash
# Query với RAG + Web
python blueprints/tuminh_cli.py query "Gemma 4 E4B có gì đặc biệt?" \
  --project ./tuminh_agi_project

# Query chỉ RAG (no web)
python blueprints/tuminh_cli.py query "Hàm nào xử lý chunking?" \
  --project ./my_code \
  --no-web
```

#### 5. Index Project Folder

```bash
python blueprints/tuminh_cli.py index /path/to/project \
  --extensions .py,.js,.md,.yaml
```

### B. Python API

#### 1. Sử dụng Integration Adapter

```python
import asyncio
from blueprints.integration_adapter import TuminhAGIIntegration

async def main():
    # Initialize
    integration = TuminhAGIIntegration(
        rag_logic_path="./rag_logic.py",
        search_logic_path="./search_logic.py",
        model_name="TuminhAGI_G4"
    )
    
    # Quick query
    result = await integration.quick_query(
        question="Làm thế nào để implement RAG với ChromaDB?",
        project_folder="./my_project",
        use_web=True
    )
    
    print(result['answer'])
    print(f"Sources: {result['sources']}")

asyncio.run(main())
```

#### 2. Sử dụng Workflow Orchestrator

```python
import asyncio
from blueprints.integration_adapter import TuminhAGIIntegration

async def main():
    # Tạo orchestrator
    integration = TuminhAGIIntegration()
    orchestrator = integration.create_orchestrator(
        blueprint_path="./blueprints/task_schema.yaml"
    )
    
    # Execute workflow
    execution = await orchestrator.execute_workflow(
        workflow_name="automated_code_review",
        inputs={
            "file_path": "./my_script.py"
        }
    )
    
    # Lấy stats
    stats = orchestrator.get_workflow_stats(execution)
    print(f"Status: {stats['status']}")
    print(f"Success rate: {stats['success_rate']*100:.1f}%")
    
    # Lấy kết quả từ từng task
    for task in execution.tasks:
        if task.result and task.result.success:
            print(f"{task.name}: {task.result.outputs}")

asyncio.run(main())
```

## 🔧 Tùy Chỉnh Blueprint

### 1. Tạo Custom Task Type

Thêm vào `task_schema.yaml`:

```yaml
task_types:
  # Custom task mới
  ml_model_training:
    description: "Train một ML model"
    required_inputs:
      - dataset_path:
          type: string
      - model_type:
          type: enum
          values: ["random_forest", "xgboost", "neural_net"]
    outputs:
      - model_path:
          type: string
      - metrics:
          type: dict
    modules_used:
      - "Custom ML Module"
```

Rồi đăng ký executor:

```python
async def train_ml_model(inputs):
    dataset = inputs["dataset_path"]
    model_type = inputs["model_type"]
    
    # Your training logic
    model_path = f"./models/{model_type}.pkl"
    metrics = {"accuracy": 0.95}
    
    return {
        "model_path": model_path,
        "metrics": metrics
    }

# Đăng ký
orchestrator.register_executor("ml_model_training", train_ml_model)
```

### 2. Tạo Custom Workflow

Thêm vào `task_schema.yaml`:

```yaml
workflow_templates:
  
  # Workflow mới
  data_pipeline:
    name: "ETL Data Pipeline"
    description: "Extract, Transform, Load data"
    steps:
      - step_1:
          task_type: "document_processing"
          name: "Extract raw data"
          inputs:
            document_path: "${input.source_file}"
            processing_type: "extract"
          next: "step_2"
      
      - step_2:
          task_type: "custom"
          name: "Transform data"
          action: "clean_and_transform"
          inputs:
            raw_data: "${step_1.processed_content}"
          next: "step_3"
      
      - step_3:
          task_type: "rag_query"
          name: "Load to knowledge base"
          inputs:
            query: "${step_2.transformed_data}"
          next: "final"
```

## 📊 Monitoring & Logging

### Logs Location

```
logs/
├── tuminh_orchestrator.log    # Workflow execution logs
└── tuminh_agi.log             # General system logs
```

### Log Format

```json
{
  "timestamp": "2024-01-15T10:30:45",
  "level": "INFO",
  "workflow_id": "smart_qa_20240115_103045",
  "task_id": "step_1",
  "task_type": "rag_query",
  "status": "completed",
  "duration": 2.34,
  "message": "Task completed successfully"
}
```

### Metrics

Blueprint system tự động track:
- Task completion rate
- Average response time
- RAG hit rate
- Web search frequency
- Error rate by task type

Access metrics:

```python
stats = orchestrator.get_workflow_stats(execution)
print(stats)
```

## 🎯 Use Cases

### 1. Phân Tích Dự Án Lớn

```bash
# Index toàn bộ codebase
python tuminh_cli.py index /path/to/large_project

# Chạy full analysis
python tuminh_cli.py run full_project_analysis \
  --inputs '{"project_path": "/path/to/large_project"}' \
  --output project_report.json
```

### 2. Code Review Tự Động

```bash
python tuminh_cli.py run automated_code_review \
  --inputs '{"file_path": "./suspicious_code.py"}'
```

### 3. Research Assistant

```bash
# Query kết hợp local knowledge + web
python tuminh_cli.py query "Xu hướng AI 2024" \
  --project ./research_notes
```

### 4. Documentation Generator

```python
# Custom workflow
await orchestrator.execute_workflow(
    workflow_name="generate_docs",
    inputs={
        "code_files": ["./module1.py", "./module2.py"],
        "output_format": "markdown"
    }
)
```

## 🔐 Best Practices

### 1. Task Design

- ✅ **DO**: Tách task nhỏ, dễ test riêng lẻ
- ✅ **DO**: Định nghĩa rõ ràng inputs/outputs
- ❌ **DON'T**: Tạo task quá phức tạp, phụ thuộc nhiều state

### 2. Workflow Design

- ✅ **DO**: Dùng condition để branch logic
- ✅ **DO**: Cache kết quả của task tốn thời gian
- ❌ **DON'T**: Tạo workflow quá sâu (>10 steps)

### 3. Error Handling

- ✅ **DO**: Set timeout hợp lý cho mỗi task type
- ✅ **DO**: Configure retry với backoff
- ✅ **DO**: Log lỗi chi tiết

### 4. Performance

- ✅ **DO**: Enable caching cho RAG và web search
- ✅ **DO**: Chạy task song song khi có thể (future enhancement)
- ❌ **DON'T**: Query web cho mọi request (dùng RAG trước)

## 🛠️ Troubleshooting

### Issue: "Module not found"

**Solution:**
```bash
# Đảm bảo đúng structure
ls -la blueprints/
# Should see: workflow_orchestrator.py, integration_adapter.py, etc.

# Check Python path
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

### Issue: "Ollama connection failed"

**Solution:**
```bash
# Check Ollama service
ollama list

# Start Ollama if needed
ollama serve

# Test model
ollama run TuminhAGI_G4 "xin chào"
```

### Issue: "ChromaDB error"

**Solution:**
```bash
# Xóa DB cũ và rebuild
rm -rf ./chroma_db/
python tuminh_cli.py index ./your_project
```

## 🚀 Roadmap

### V1.1 (Next Release)
- [ ] Parallel task execution
- [ ] Workflow versioning
- [ ] Visual workflow designer (web UI)
- [ ] More built-in task types

### V1.2
- [ ] Distributed task queue (Celery)
- [ ] Real-time monitoring dashboard
- [ ] A/B testing for workflows
- [ ] Auto-optimization based on metrics

### V2.0
- [ ] Multi-agent collaboration
- [ ] Self-healing workflows
- [ ] Neural workflow synthesis (AI tự tạo workflow)

## 📚 Tài Liệu Tham Khảo

- [Gemma 4 E4B Documentation](https://ollama.com/library/gemma4)
- [ChromaDB Guide](https://docs.trychroma.com/)
- [Workflow Patterns](https://www.workflowpatterns.com/)

## 🤝 Contributing

Blueprint system là open for customization! Để thêm task type hoặc workflow mới:

1. Fork repository
2. Thêm vào `task_schema.yaml`
3. Implement executor trong `integration_adapter.py`
4. Test với CLI
5. Submit PR với docs

## 📄 License

MIT License - Tự Minh AGI Project

---

**Tác giả:** Eric (Hùng Đại) - LoAiD (League of AI Dragons)  
**Triết lý:** "Dùng tâm, trí, tiến hóa, sáng tạo để khám phá thế giới"  
**Contact:** [Your contact info]

---

*"Một hệ thống tốt không chỉ chạy được, mà còn dễ mở rộng và bảo trì. Blueprint là bản thiết kế để Tự Minh AGI tiến hóa bền vững."* 🌱

# TỰ MINH AGI - BLUEPRINT SYSTEM
## Project Overview & File Structure

```
blueprints/
│
├── 📋 CORE FILES
│   ├── task_schema.yaml              # Blueprint schema (config all workflows & tasks)
│   ├── workflow_orchestrator.py      # Workflow execution engine
│   ├── integration_adapter.py        # Kết nối với RAG, Search, Model
│   └── tuminh_cli.py                 # Command-line interface
│
├── 📚 DOCUMENTATION
│   ├── README.md                     # Hướng dẫn đầy đủ
│   └── PROJECT_OVERVIEW.md           # File này
│
├── 🔧 SETUP & TESTING
│   ├── setup.sh                      # Setup script (one-click install)
│   ├── requirements.txt              # Python dependencies
│   ├── test_blueprint.py             # Test suite
│   └── .gitignore                    # Git ignore file
│
└── 💡 EXAMPLES
    └── custom_tasks_example.py       # Ví dụ custom task executors
```

## 🎯 Mục Đích Chính

Blueprint System giải quyết các vấn đề:

1. **Task Management**: Quản lý các task phức tạp một cách có cấu trúc
2. **Workflow Orchestration**: Điều phối các workflow multi-step
3. **Modularity**: Tách biệt logic thành các module độc lập
4. **Extensibility**: Dễ dàng thêm custom task và workflow
5. **Monitoring**: Track performance và debug dễ dàng

## 🔄 Workflow Lifecycle

```
User Input
    ↓
[Parse Request] → Load workflow template from YAML
    ↓
[Plan Execution] → Parse steps into Task objects
    ↓
[Execute Tasks] → Run tasks sequentially/parallel
    │
    ├─→ [RAG Query] → Cerebro-RAG 2.2
    ├─→ [Web Search] → Thiên Lý Nhãn 5.2
    ├─→ [Model Generation] → TuminhAGI_G4
    └─→ [Custom Tasks] → User-defined executors
    ↓
[Aggregate Results] → Combine outputs from all tasks
    ↓
[Return Response] → Final answer to user
```

## 📦 Core Components

### 1. task_schema.yaml
**Purpose**: Định nghĩa toàn bộ task types và workflow templates

**Sections**:
- `blueprint_metadata`: Version, agent info, philosophy
- `task_types`: Định nghĩa các loại task (rag_query, web_search, etc.)
- `workflow_templates`: Các workflow có sẵn (smart_qa, code_review, etc.)
- `execution_policies`: Retry, timeout, caching rules
- `agent_personas`: Multi-agent definitions (planner, executor, validator)
- `monitoring`: Metrics và alerts

**Example Task Type**:
```yaml
task_types:
  rag_query:
    description: "Tìm kiếm trong knowledge base nội bộ"
    required_inputs:
      - query: string
      - project_folder: string (optional)
    outputs:
      - relevant_chunks: list
      - sources: list
```

**Example Workflow**:
```yaml
workflow_templates:
  smart_qa:
    name: "Smart Q&A"
    steps:
      - step_1:
          task_type: "rag_query"
          inputs:
            query: "${input.question}"
          next: "step_2"
      - step_2:
          task_type: "web_search"
          inputs:
            query: "${input.question}"
          next: "final"
```

### 2. workflow_orchestrator.py
**Purpose**: Engine thực thi workflow

**Key Classes**:
- `WorkflowOrchestrator`: Main orchestrator
- `Task`: Task definition
- `TaskResult`: Task execution result
- `WorkflowExecution`: Workflow state container

**Key Methods**:
```python
async def execute_workflow(workflow_name, inputs) -> WorkflowExecution
async def _execute_task(task, context) -> TaskResult
def register_executor(task_type, executor_function)
```

**Features**:
- Async execution
- Retry with exponential backoff
- Caching
- Timeout handling
- Detailed logging

### 3. integration_adapter.py
**Purpose**: Kết nối orchestrator với các module hiện có

**Adapters**:
- `RAGAdapter`: Wrap rag_logic.py
- `SearchAdapter`: Wrap search_logic.py
- `ModelAdapter`: Wrap Ollama API
- `TuminhAGIIntegration`: All-in-one integration

**Usage**:
```python
integration = TuminhAGIIntegration(
    rag_logic_path="./rag_logic.py",
    search_logic_path="./search_logic.py",
    model_name="TuminhAGI_G4"
)

orchestrator = integration.create_orchestrator()
```

### 4. tuminh_cli.py
**Purpose**: Command-line interface

**Commands**:
```bash
tuminh_cli.py list                    # List workflows
tuminh_cli.py show <workflow>         # Show workflow details
tuminh_cli.py run <workflow> -i {}    # Run workflow
tuminh_cli.py query "question"        # Quick query
tuminh_cli.py index <folder>          # Index project
```

## 🚀 Quick Start Guide

### Installation
```bash
cd blueprints
chmod +x setup.sh
./setup.sh
```

### Basic Usage
```bash
# 1. List available workflows
python tuminh_cli.py list

# 2. Run a workflow
python tuminh_cli.py run smart_qa \
  --inputs '{"question": "What is RAG?", "project_folder": "./docs"}'

# 3. Quick query (no workflow)
python tuminh_cli.py query "How to optimize ChromaDB?"
```

### Python API
```python
import asyncio
from integration_adapter import TuminhAGIIntegration

async def main():
    integration = TuminhAGIIntegration()
    orchestrator = integration.create_orchestrator()
    
    execution = await orchestrator.execute_workflow(
        workflow_name="smart_qa",
        inputs={"question": "What is Gemma 4 E4B?"}
    )
    
    print(execution.status)

asyncio.run(main())
```

## 🎨 Extension Points

### 1. Add Custom Task Type

**Step 1**: Define in `task_schema.yaml`
```yaml
task_types:
  my_custom_task:
    description: "My custom task"
    required_inputs:
      - param1: string
    outputs:
      - result: string
```

**Step 2**: Implement executor
```python
async def execute_my_custom_task(inputs):
    param1 = inputs["param1"]
    # Your logic here
    return {"result": "done"}

# Register
orchestrator.register_executor("my_custom_task", execute_my_custom_task)
```

### 2. Create Custom Workflow

Add to `task_schema.yaml`:
```yaml
workflow_templates:
  my_workflow:
    name: "My Custom Workflow"
    steps:
      - step_1:
          task_type: "my_custom_task"
          inputs:
            param1: "${input.value}"
```

## 📊 Monitoring

### Logs
```
logs/
├── tuminh_orchestrator.log   # Workflow execution logs
└── tuminh_agi.log             # General logs
```

### Metrics
```python
stats = orchestrator.get_workflow_stats(execution)
# Returns:
{
  "workflow_id": "...",
  "status": "completed",
  "total_tasks": 5,
  "completed_tasks": 5,
  "success_rate": 1.0,
  "total_duration": 12.5
}
```

## 🔐 Best Practices

1. **Keep Tasks Small**: Mỗi task nên làm 1 việc cụ thể
2. **Use Caching**: Enable cache cho task tốn thời gian
3. **Set Timeouts**: Đặt timeout hợp lý
4. **Log Everything**: Detailed logging giúp debug
5. **Test Individually**: Test từng task trước khi ghép workflow
6. **Version Control**: Track changes trong task_schema.yaml

## 🐛 Troubleshooting

### Issue: Task timeout
**Solution**: Increase timeout in task_schema.yaml
```yaml
execution_policies:
  timeouts:
    your_task_type: 120  # 2 minutes
```

### Issue: Module not found
**Solution**: Check sys.path and file locations
```python
import sys
print(sys.path)
```

### Issue: Ollama connection failed
**Solution**: Check Ollama service
```bash
ollama serve
ollama list
```

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core workflow orchestration
- ✅ RAG/Search/Model integration
- ✅ CLI interface
- ✅ Basic monitoring

### Phase 2 (Next)
- [ ] Parallel task execution
- [ ] Visual workflow designer
- [ ] Advanced caching strategies
- [ ] Workflow versioning

### Phase 3 (Future)
- [ ] Multi-agent collaboration
- [ ] Self-healing workflows
- [ ] Neural workflow synthesis
- [ ] Distributed execution

## 📚 Additional Resources

- **README.md**: Detailed documentation
- **custom_tasks_example.py**: Example custom tasks
- **test_blueprint.py**: Test suite
- **Ollama Docs**: https://ollama.com/docs
- **ChromaDB Docs**: https://docs.trychroma.com/

---

**Built with ❤️ by Eric (Hùng Đại) - LoAiD**

**Triết lý**: "Tâm là gốc, Trí là hoa, Tiến hóa là quả"

**Contact**: [Your contact info]

---

*"Good systems evolve, great systems empower evolution."* 🌱

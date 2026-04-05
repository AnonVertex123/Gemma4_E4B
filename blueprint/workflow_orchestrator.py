"""
============================================================
TỰ MINH AGI - WORKFLOW ORCHESTRATOR ENGINE
Phiên bản: 1.0.0
Triết lý: "Tâm là gốc, Trí là hoa, Tiến hóa là quả"
============================================================

Hệ thống điều phối workflow và quản lý task cho Tự Minh AGI
Kết nối với: Cerebro-RAG 2.2, Thiên Lý Nhãn 5.2, Gemma 4 E4B
"""

import yaml
import json
import asyncio
import logging
import os
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
import traceback


# ============================================================
# ENUMS & DATA STRUCTURES
# ============================================================

class TaskStatus(Enum):
    """Trạng thái của một task"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRYING = "retrying"
    CANCELLED = "cancelled"


class WorkflowStatus(Enum):
    """Trạng thái của một workflow"""
    INITIALIZED = "initialized"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class TaskResult:
    """Kết quả thực thi một task"""
    task_id: str
    task_type: str
    status: TaskStatus
    outputs: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration: Optional[float] = None
    retry_count: int = 0
    
    @property
    def success(self) -> bool:
        return self.status == TaskStatus.COMPLETED
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "task_id": self.task_id,
            "task_type": self.task_type,
            "status": self.status.value,
            "outputs": self.outputs,
            "error": self.error,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "duration": self.duration,
            "retry_count": self.retry_count
        }


@dataclass
class Task:
    """Định nghĩa một task"""
    task_id: str
    task_type: str
    name: str
    inputs: Dict[str, Any]
    next_step: Optional[str] = None
    condition: Optional[str] = None
    timeout: int = 30
    result: Optional[TaskResult] = None


@dataclass
class WorkflowExecution:
    """Thông tin thực thi workflow"""
    workflow_id: str
    workflow_name: str
    status: WorkflowStatus
    tasks: List[Task] = field(default_factory=list)
    completed_tasks: List[str] = field(default_factory=list)
    failed_tasks: List[str] = field(default_factory=list)
    context: Dict[str, Any] = field(default_factory=dict)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


# ============================================================
# WORKFLOW ORCHESTRATOR
# ============================================================

class WorkflowOrchestrator:
    """
    Bộ điều phối workflow chính
    
    Chức năng:
    - Load blueprint từ YAML
    - Parse và validate workflow
    - Quản lý task queue
    - Thực thi task theo dependency graph
    - Retry logic và error handling
    - Caching và logging
    """
    
    def __init__(
        self,
        blueprint_path: str = "./blueprints/task_schema.yaml",
        rag_module = None,
        search_module = None,
        model_module = None
    ):
        """
        Khởi tạo Orchestrator
        
        Args:
            blueprint_path: Đường dẫn đến file blueprint YAML
            rag_module: Module Cerebro-RAG 2.2
            search_module: Module Thiên Lý Nhãn 5.2
            model_module: Module TuminhAGI_G4
        """
        self.blueprint_path = Path(blueprint_path)
        self.blueprint: Dict[str, Any] = {}
        self.task_executors: Dict[str, Callable] = {}
        self.cache: Dict[str, Any] = {}
        
        # Modules
        self.rag_module = rag_module
        self.search_module = search_module
        self.model_module = model_module
        
        # Logging
        self._setup_logging()
        
        # Load blueprint
        self.load_blueprint()
        
        # Register default task executors
        self._register_default_executors()
    
    def _setup_logging(self):
        """Cấu hình logging"""
        log_dir = Path("./logs")
        log_dir.mkdir(exist_ok=True)
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_dir / "tuminh_orchestrator.log", encoding='utf-8'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger("TuminhOrchestrator")
    
    def load_blueprint(self):
        """Load và parse blueprint YAML"""
        try:
            with open(self.blueprint_path, 'r', encoding='utf-8') as f:
                self.blueprint = yaml.safe_load(f)
            
            self.logger.info(f"✅ Loaded blueprint: {self.blueprint['blueprint_metadata']['version']}")
            self.logger.info(f"📜 Philosophy: {self.blueprint['blueprint_metadata']['philosophy']}")
            
        except FileNotFoundError:
            self.logger.error(f"❌ Blueprint not found: {self.blueprint_path}")
            raise
        except yaml.YAMLError as e:
            self.logger.error(f"❌ Invalid YAML: {e}")
            raise
    
    def _register_default_executors(self):
        """Đăng ký các task executor mặc định"""
        self.task_executors = {
            "rag_query": self._execute_rag_query,
            "web_search": self._execute_web_search,
            "code_analysis": self._execute_code_analysis,
            "multimodal_analysis": self._execute_multimodal,
            "document_processing": self._execute_document_processing,
            "custom": self._execute_custom
        }
    
    def register_executor(self, task_type: str, executor: Callable):
        """
        Đăng ký custom task executor
        
        Args:
            task_type: Loại task (vd: "custom_ml_task")
            executor: Function thực thi task, signature: async def executor(inputs) -> outputs
        """
        self.task_executors[task_type] = executor
        self.logger.info(f"📌 Registered executor for task type: {task_type}")
    
    async def execute_workflow(
        self,
        workflow_name: str,
        inputs: Dict[str, Any],
        callback: Optional[Callable] = None
    ) -> WorkflowExecution:
        """
        Thực thi một workflow
        
        Args:
            workflow_name: Tên workflow template (vd: "full_project_analysis")
            inputs: Input data cho workflow
            
        Returns:
            WorkflowExecution object chứa kết quả
        """
        # Lấy workflow template
        workflow_template = self.blueprint["workflow_templates"].get(workflow_name)
        if not workflow_template:
            raise ValueError(f"Workflow '{workflow_name}' not found in blueprint")
        
        # Khởi tạo workflow execution
        execution = WorkflowExecution(
            workflow_id=f"{workflow_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            workflow_name=workflow_name,
            status=WorkflowStatus.INITIALIZED,
            start_time=datetime.now()
        )
        
        # Parse các steps thành tasks
        steps = workflow_template["steps"]
        tasks = self._parse_steps_to_tasks(steps, inputs)
        execution.tasks = tasks
        
        self.logger.info(f"🚀 Starting workflow: {workflow_name}")
        self.logger.info(f"📋 Total tasks: {len(tasks)}")
        
        # Thực thi workflow
        execution.status = WorkflowStatus.RUNNING
        
        try:
            current_step = "step_1"
            retry_cnt = 0
            
            while current_step:
                task = self._find_task_by_id(execution.tasks, current_step)
                if not task:
                    break
                
                # Thực thi task
                self.logger.info(f"▶️  Executing task: {task.name} ({task.task_type}) - Attempt {retry_cnt + 1}")
                if callback:
                    await callback(f"🔄 Đang thực hiện: **{task.name}**...", step=task.task_id)

                result = await self._execute_task(task, execution.context)
                task.result = result
                
                if result.success:
                    execution.completed_tasks.append(task.task_id)
                    execution.context[task.task_id] = result.outputs
                    self.logger.info(f"✅ Task completed: {task.name}")
                    
                    if callback:
                        await callback(f"✅ Xong: **{task.name}**", step=task.task_id, outputs=result.outputs)

                    retry_cnt = 0
                    current_step = self._evaluate_next_step(task, result, execution.context)
                else:
                    self.logger.error(f"❌ Task failed: {task.name} - {result.error}")
                    
                    if retry_cnt < self._get_max_retries():
                        retry_cnt += 1
                        self.logger.info(f"🔄 Retrying task: {task.name} (Attempt {retry_cnt})")
                        await asyncio.sleep(self._get_backoff_delay(retry_cnt - 1))
                    else:
                        execution.failed_tasks.append(task.task_id)
                        execution.status = WorkflowStatus.FAILED
                        if callback:
                            await callback(f"❌ Lỗi: **{task.name}** - {result.error}", step=task.task_id, error=result.error)
                        break
            
            # Workflow hoàn thành
            if execution.status == WorkflowStatus.RUNNING:
                execution.status = WorkflowStatus.COMPLETED
                self.logger.info(f"🎉 Workflow completed: {workflow_name}")
            
        except Exception as e:
            execution.status = WorkflowStatus.FAILED
            self.logger.error(f"💥 Workflow failed with exception: {e}")
            self.logger.error(traceback.format_exc())
        
        finally:
            execution.end_time = datetime.now()
        
        return execution
    
    def _parse_steps_to_tasks(self, steps: List[Dict], workflow_inputs: Dict) -> List[Task]:
        """Parse workflow steps thành Task objects"""
        tasks = []
        
        for step_item in steps:
            # step_item is a dict like {"step_1": {...}}
            for step_key, step_config in step_item.items():
                if isinstance(step_config, dict):
                    # Resolve inputs với variable substitution
                    resolved_inputs = self._resolve_inputs(step_config.get("inputs", {}), workflow_inputs)
                    
                    task = Task(
                        task_id=step_key,
                        task_type=step_config["task_type"],
                        name=step_config.get("name", step_key),
                        inputs=resolved_inputs,
                        next_step=step_config.get("next"),
                        condition=step_config.get("condition"),
                        timeout=self._get_timeout(step_config["task_type"])
                    )
                    tasks.append(task)
        
        return tasks
    
    def _resolve_inputs(self, inputs: Dict, context: Dict) -> Dict:
        """
        Resolve input variables
        
        Hỗ trợ syntax: ${input.var}, ${step_1.output.field}
        """
        resolved = {}
        
        for key, value in inputs.items():
            if isinstance(value, str) and value.startswith("${") and value.endswith("}"):
                # Variable substitution
                var_path = value[2:-1]  # Remove ${ }
                resolved[key] = self._get_nested_value(context, var_path)
            else:
                resolved[key] = value
        
        return resolved
    
    def _get_nested_value(self, obj: Dict, path: str) -> Any:
        """Get nested value from dict using dot notation"""
        keys = path.split(".")
        current = obj
        
        for key in keys:
            if isinstance(current, dict):
                current = current.get(key)
            else:
                return None
        
        return current
    
    async def _execute_task(self, task: Task, context: Dict) -> TaskResult:
        """Thực thi một task"""
        result = TaskResult(
            task_id=task.task_id,
            task_type=task.task_type,
            status=TaskStatus.RUNNING,
            start_time=datetime.now()
        )
        
        try:
            # Lấy executor
            executor = self.task_executors.get(task.task_type)
            if not executor:
                raise ValueError(f"No executor registered for task type: {task.task_type}")
            
            # Check cache
            cache_key = self._get_cache_key(task)
            if cache_key in self.cache:
                self.logger.info(f"💾 Cache hit for task: {task.name}")
                result.outputs = self.cache[cache_key]
                result.status = TaskStatus.COMPLETED
            else:
                # Execute với timeout
                outputs = await asyncio.wait_for(
                    executor(task.inputs),
                    timeout=task.timeout
                )
                
                result.outputs = outputs
                result.status = TaskStatus.COMPLETED
                
                # Save to cache
                if self._is_cacheable(task.task_type):
                    self.cache[cache_key] = outputs
        
        except asyncio.TimeoutError:
            result.status = TaskStatus.FAILED
            result.error = f"Task timeout after {task.timeout}s"
        
        except Exception as e:
            result.status = TaskStatus.FAILED
            result.error = str(e)
            self.logger.error(f"Task error: {e}")
            self.logger.error(traceback.format_exc())
        
        finally:
            result.end_time = datetime.now()
            result.duration = (result.end_time - result.start_time).total_seconds()
        
        return result
    
    # ============================================================
    # TASK EXECUTORS (Kết nối với các module)
    # ============================================================
    
    async def _execute_rag_query(self, inputs: Dict) -> Dict:
        """Execute RAG query task"""
        if not self.rag_module:
            raise RuntimeError("RAG module not initialized")
        
        query = inputs["query"]
        project_folder = inputs.get("project_folder")
        
        # Gọi RAG module
        results = await asyncio.to_thread(
            self.rag_module.query,
            query=query,
            project_folder=project_folder
        )
        
        return {
            "relevant_chunks": results.get("chunks", []),
            "sources": results.get("sources", []),
            "relevance_scores": results.get("scores", [])
        }
    
    async def _execute_web_search(self, inputs: Dict) -> Dict:
        """Execute web search task"""
        if not self.search_module:
            raise RuntimeError("Search module not initialized")
        
        query = inputs["query"]
        max_results = inputs.get("max_results", 5)
        
        # Gọi search module
        results = await asyncio.to_thread(
            self.search_module.search,
            query=query,
            max_results=max_results
        )
        
        return {
            "search_results": results
        }
    
    async def _execute_code_analysis(self, inputs: Dict) -> Dict:
        """Execute code analysis task"""
        # Xử lý file_path (có thể là list hoặc None từ RAG)
        file_path_raw = inputs.get("file_path")
        analysis_type = inputs.get("analysis_type", "structure")
        
        # Nếu inputs["file_path"] là một path, nó có thể là string hoặc Path object
        file_path = None
        if isinstance(file_path_raw, list) and file_path_raw:
            file_path = file_path_raw[0]
        else:
            file_path = file_path_raw
            
        if not file_path:
            return {"analysis_report": "⚠️ Không tìm thấy file nguồn để phân tích cấu trúc."}
            
        path_str = str(file_path) if not isinstance(file_path, (str, bytes)) else file_path

        # Đọc file code
        try:
            with open(path_str, 'r', encoding='utf-8') as f:
                code_content = f.read()
        except Exception as e:
            return {"analysis_report": f"❌ Lỗi đọc file {path_str}: {str(e)}"}
        
        # Tạo prompt cho model
        prompts = {
            "structure": f"Phân tích cấu trúc code sau:\n\n{code_content}",
            "bugs": f"Tìm lỗi tiềm ẩn trong code:\n\n{code_content}",
            "optimization": f"Đề xuất tối ưu hóa cho code:\n\n{code_content}",
            "documentation": f"Tạo documentation cho code:\n\n{code_content}"
        }
        
        prompt = prompts.get(analysis_type, prompts["structure"])
        
        # Gọi model
        if self.model_module:
            analysis_resp = await asyncio.to_thread(
                self.model_module.generate,
                prompt=prompt
            )
            analysis = analysis_resp.get("response", "No response from model") if isinstance(analysis_resp, dict) else str(analysis_resp)
        else:
            analysis = "Model module not available"
        
        return {
            "analysis_report": analysis,
            "file_path": path_str,
            "analysis_type": analysis_type
        }
    
    async def _execute_multimodal(self, inputs: Dict) -> Dict:
        """Execute multimodal analysis task"""
        media_path = inputs["media_path"]
        media_type = inputs["media_type"]
        analysis_prompt = inputs["analysis_prompt"]
        
        # TODO: Implement multimodal với Gemma 4 native multimodal
        return {
            "analysis_result": f"Multimodal analysis for {media_path} (type: {media_type})"
        }
    
    async def _execute_document_processing(self, inputs: Dict) -> Dict:
        """Execute document processing task"""
        document_path = inputs["document_path"]
        processing_type = inputs["processing_type"]
        
        # TODO: Implement PDF processing
        return {
            "processed_content": f"Processed {document_path} with {processing_type}",
            "metadata": {}
        }
    
    async def _execute_custom(self, inputs: Dict) -> Dict:
        """Execute custom action"""
        action = inputs.get("action", "unknown")
        
        # Custom actions có thể extend ở đây
        if action == "generate_report":
            return {"report": "Generated report from inputs"}
        elif action == "synthesize_answer":
            return {"answer": "Synthesized answer"}
        
        return {"result": f"Executed custom action: {action}"}
    
    # ============================================================
    # HELPER METHODS
    # ============================================================
    
    def _find_task_by_id(self, tasks: List[Task], task_id: str) -> Optional[Task]:
        """Tìm task by ID"""
        return next((t for t in tasks if t.task_id == task_id), None)
    
    def _evaluate_next_step(self, task: Task, result: TaskResult, context: Dict) -> Optional[str]:
        """Evaluate next step (có thể có condition)"""
        if task.condition:
            # TODO: Implement condition evaluation
            # Syntax: "if step_1.relevant_chunks.length < 3 then step_2 else step_3"
            pass
        
        return task.next_step
    
    def _get_timeout(self, task_type: str) -> int:
        """Get timeout cho task type"""
        timeouts = self.blueprint.get("execution_policies", {}).get("timeouts", {})
        return timeouts.get(task_type, 30)
    
    def _get_max_retries(self) -> int:
        """Get max retry attempts"""
        return self.blueprint.get("execution_policies", {}).get("retry", {}).get("max_attempts", 3)
    
    def _get_backoff_delay(self, retry_count: int) -> float:
        """Calculate backoff delay"""
        strategy = self.blueprint.get("execution_policies", {}).get("retry", {}).get("backoff_strategy", "exponential")
        
        if strategy == "exponential":
            return 2 ** retry_count
        else:
            return 1.0
    
    def _is_cacheable(self, task_type: str) -> bool:
        """Check if task type is cacheable"""
        cache_config = self.blueprint.get("execution_policies", {}).get("cache", {})
        if not cache_config.get("enabled", False):
            return False
        
        cache_types = cache_config.get("cache_types", [])
        return task_type in cache_types
    
    def _get_cache_key(self, task: Task) -> str:
        """Generate cache key"""
        return f"{task.task_type}:{json.dumps(task.inputs, sort_keys=True)}"
    
    def get_workflow_stats(self, execution: WorkflowExecution) -> Dict:
        """Lấy thống kê workflow execution"""
        total_tasks = len(execution.tasks)
        completed = len(execution.completed_tasks)
        failed = len(execution.failed_tasks)
        
        total_duration = 0
        for task in execution.tasks:
            if task.result and task.result.duration:
                total_duration += task.result.duration
        
        return {
            "workflow_id": execution.workflow_id,
            "workflow_name": execution.workflow_name,
            "status": execution.status.value,
            "total_tasks": total_tasks,
            "completed_tasks": completed,
            "failed_tasks": failed,
            "success_rate": completed / total_tasks if total_tasks > 0 else 0,
            "total_duration": total_duration,
            "start_time": execution.start_time.isoformat() if execution.start_time else None,
            "end_time": execution.end_time.isoformat() if execution.end_time else None
        }


# ============================================================
# EXAMPLE USAGE
# ============================================================

async def main():
    """Example usage"""
    # Initialize orchestrator
    orchestrator = WorkflowOrchestrator(
        blueprint_path="./blueprints/task_schema.yaml"
    )
    
    # Execute workflow
    execution = await orchestrator.execute_workflow(
        workflow_name="smart_qa",
        inputs={
            "question": "Làm thế nào để tối ưu RAG performance?",
            "project_folder": "/path/to/project"
        }
    )
    
    # Get stats
    stats = orchestrator.get_workflow_stats(execution)
    print(json.dumps(stats, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    asyncio.run(main())

import os
import asyncio
from typing import Dict, Any

# Blueprint Integration Adapter
try:
    from blueprint.integration_adapter import TuminhAGIIntegration
    BLUEPRINT_AVAILABLE = True
except Exception as e:
    print(f"⚠️ Blueprint loading failed: {e}")
    BLUEPRINT_AVAILABLE = False

# Khởi tạo Orchestrator (Lazy loading)
_orchestrator = None

def get_orchestrator():
    global _orchestrator
    if _orchestrator is None and BLUEPRINT_AVAILABLE:
        integration = TuminhAGIIntegration()
        _orchestrator = integration.create_orchestrator()
    return _orchestrator

async def run_blueprint_workflow(workflow_name, project_path, question=""):
    """
    Hàm thực thi Siêu Workflow với Streaming tiến trình.
    """
    orchestrator = get_orchestrator()
    if not orchestrator:
        yield "⚠️ Blueprint System chưa được thiết lập.", "❌ Lỗi hệ thống."
        return

    report = f"### 🧠 Đang khởi chạy Siêu Workflow: **{workflow_name}**...\n\n"
    yield report, "⏳ Đang khởi tạo..."

    inputs = {
        "project_path": project_path, 
        "project_folder": project_path, 
        "question": question, 
        "file_path": project_path
    }

    async def streaming_callback(msg, step=None, outputs=None, error=None):
        nonlocal report
        if error:
            report += f"\n❌ **Lỗi tại {step}:** {error}\n"
        elif outputs:
            if "report" in outputs or "answer" in outputs or "analysis_report" in outputs:
                res = outputs.get("report") or outputs.get("answer") or outputs.get("analysis_report")
                res_str = res.get("response", str(res)) if isinstance(res, dict) else str(res)
                report += f"\n--- Kết quả bước {step} ---\n{res_str}\n"
            else:
                report += f"\n{msg}\n"
        else:
            report += f"\n{msg}\n"

    try:
        execution = await orchestrator.execute_workflow(workflow_name, inputs, callback=streaming_callback)
        stats = orchestrator.get_workflow_stats(execution)
        
        final_summary = f"\n\n---\n✅ **Hoàn tất Workflow!**\n📊 Thành công: {stats['success_rate']*100:.1f}% | Thời gian: {stats['total_duration']:.2f}s"
        report += final_summary
        yield report, "✅ Đã xong!"
        
    except Exception as e:
        yield report + f"\n\n❌ **Lỗi nghiêm trọng:** {str(e)}", "❌ Thất bại."

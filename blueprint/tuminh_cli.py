#!/usr/bin/env python3
"""
============================================================
TỰ MINH AGI - BLUEPRINT CLI
Command-line tool để test và chạy workflows
============================================================
"""

import asyncio
import argparse
import json
import sys
from pathlib import Path
from typing import Optional
import yaml

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

from workflow_orchestrator import WorkflowOrchestrator
from integration_adapter import TuminhAGIIntegration


def print_banner():
    """In banner Tự Minh AGI"""
    banner = """
╔═══════════════════════════════════════════════════════════╗
║           TỰ MINH AGI - BLUEPRINT SYSTEM                  ║
║   "Tâm là gốc, Trí là hoa, Tiến hóa là quả"             ║
║                                                           ║
║   Powered by: Gemma 4 E4B + Cerebro-RAG + Thiên Lý Nhãn  ║
╚═══════════════════════════════════════════════════════════╝
"""
    print(banner)


async def cmd_list_workflows(args):
    """List tất cả workflows có sẵn trong blueprint"""
    print("📋 Danh sách Workflows có sẵn:\n")
    
    blueprint_path = args.blueprint or "./blueprints/task_schema.yaml"
    
    with open(blueprint_path, 'r', encoding='utf-8') as f:
        blueprint = yaml.safe_load(f)
    
    workflows = blueprint.get("workflow_templates", {})
    
    for i, (name, config) in enumerate(workflows.items(), 1):
        print(f"{i}. {name}")
        print(f"   📝 {config.get('description', 'No description')}")
        print(f"   🔢 Số bước: {len(config.get('steps', []))}")
        print()


async def cmd_show_workflow(args):
    """Hiển thị chi tiết một workflow"""
    blueprint_path = args.blueprint or "./blueprints/task_schema.yaml"
    
    with open(blueprint_path, 'r', encoding='utf-8') as f:
        blueprint = yaml.safe_load(f)
    
    workflows = blueprint.get("workflow_templates", {})
    workflow = workflows.get(args.name)
    
    if not workflow:
        print(f"❌ Workflow '{args.name}' không tồn tại!")
        return
    
    print(f"📋 Workflow: {args.name}")
    print(f"📝 Mô tả: {workflow.get('description', 'N/A')}")
    print(f"\n🔄 Các bước thực thi:\n")
    
    steps = workflow.get("steps", [])
    for step_key, step_config in steps:
        if isinstance(step_config, dict):
            print(f"  {step_key}:")
            print(f"    - Loại: {step_config.get('task_type')}")
            print(f"    - Tên: {step_config.get('name')}")
            if step_config.get('next'):
                print(f"    - Tiếp theo: {step_config['next']}")
            print()


async def cmd_run_workflow(args):
    """Chạy một workflow"""
    print(f"🚀 Bắt đầu chạy workflow: {args.name}\n")
    
    # Parse inputs
    inputs = {}
    if args.inputs:
        try:
            inputs = json.loads(args.inputs)
        except json.JSONDecodeError:
            print("❌ Invalid JSON input!")
            return
    
    # Initialize integration
    integration = TuminhAGIIntegration(
        rag_logic_path=args.rag_module or "./rag_logic.py",
        search_logic_path=args.search_module or "./search_logic.py",
        model_name=args.model or "TuminhAGI_G4"
    )
    
    # Create orchestrator
    orchestrator = integration.create_orchestrator(
        blueprint_path=args.blueprint or "./blueprints/task_schema.yaml"
    )
    
    # Execute workflow
    execution = await orchestrator.execute_workflow(
        workflow_name=args.name,
        inputs=inputs
    )
    
    # Print results
    print("\n" + "="*60)
    print("📊 KẾT QUẢ WORKFLOW")
    print("="*60 + "\n")
    
    stats = orchestrator.get_workflow_stats(execution)
    
    print(f"Status: {stats['status']}")
    print(f"Tổng số task: {stats['total_tasks']}")
    print(f"Hoàn thành: {stats['completed_tasks']}")
    print(f"Thất bại: {stats['failed_tasks']}")
    print(f"Tỷ lệ thành công: {stats['success_rate']*100:.1f}%")
    print(f"Thời gian: {stats['total_duration']:.2f}s")
    
    # Print task results
    print("\n📋 Chi tiết các task:\n")
    for task in execution.tasks:
        if task.result:
            status_icon = "✅" if task.result.success else "❌"
            print(f"{status_icon} {task.name} ({task.task_type})")
            print(f"   Thời gian: {task.result.duration:.2f}s")
            
            if task.result.error:
                print(f"   Lỗi: {task.result.error}")
            
            if args.verbose and task.result.outputs:
                print(f"   Outputs: {json.dumps(task.result.outputs, indent=2, ensure_ascii=False)}")
            
            print()
    
    # Save results to file nếu được chỉ định
    if args.output:
        output_data = {
            "workflow_id": execution.workflow_id,
            "workflow_name": execution.workflow_name,
            "stats": stats,
            "tasks": [
                {
                    "task_id": t.task_id,
                    "name": t.name,
                    "result": t.result.to_dict() if t.result else None
                }
                for t in execution.tasks
            ]
        }
        
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Kết quả đã lưu vào: {args.output}")


async def cmd_quick_query(args):
    """Quick query (không dùng workflow)"""
    print(f"🔍 Quick Query: {args.question}\n")
    
    # Initialize integration
    integration = TuminhAGIIntegration(
        rag_logic_path=args.rag_module or "./rag_logic.py",
        search_logic_path=args.search_module or "./search_logic.py",
        model_name=args.model or "TuminhAGI_G4"
    )
    
    # Query
    result = await integration.quick_query(
        question=args.question,
        project_folder=args.project,
        use_web=not args.no_web
    )
    
    # Print result
    print("="*60)
    print("📝 TRẢ LỜI:")
    print("="*60)
    print(result['answer'])
    print()
    
    print(f"📊 Thống kê:")
    print(f"  - RAG hits: {result['rag_hits']}")
    print(f"  - Web hits: {result['web_hits']}")
    
    if result['sources']:
        print(f"\n📚 Nguồn:")
        for i, source in enumerate(result['sources'][:5], 1):
            print(f"  {i}. {source}")


async def cmd_index_project(args):
    """Index một project folder vào RAG"""
    print(f"📁 Indexing project: {args.folder}\n")
    
    integration = TuminhAGIIntegration(
        rag_logic_path=args.rag_module or "./rag_logic.py"
    )
    
    if not integration.rag_adapter:
        print("❌ RAG module không khả dụng!")
        return
    
    extensions = args.extensions.split(',') if args.extensions else None
    
    result = integration.rag_adapter.index_folder(
        folder_path=args.folder,
        file_extensions=extensions
    )
    
    if result['status'] == 'success':
        print(f"✅ Indexing thành công!")
        print(f"  - File đã index: {result['indexed_files']}")
        print(f"  - Tổng chunks: {result['total_chunks']}")
    else:
        print(f"❌ Indexing thất bại: {result.get('error')}")


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description="Tự Minh AGI Blueprint CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    # Global arguments
    parser.add_argument('--blueprint', '-b', help='Path to blueprint YAML file')
    parser.add_argument('--rag-module', help='Path to rag_logic.py')
    parser.add_argument('--search-module', help='Path to search_logic.py')
    parser.add_argument('--model', '-m', help='Ollama model name', default='TuminhAGI_G4')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    
    # Subcommands
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # list-workflows
    parser_list = subparsers.add_parser('list', help='List available workflows')
    parser_list.set_defaults(func=cmd_list_workflows)
    
    # show-workflow
    parser_show = subparsers.add_parser('show', help='Show workflow details')
    parser_show.add_argument('name', help='Workflow name')
    parser_show.set_defaults(func=cmd_show_workflow)
    
    # run-workflow
    parser_run = subparsers.add_parser('run', help='Run a workflow')
    parser_run.add_argument('name', help='Workflow name')
    parser_run.add_argument('--inputs', '-i', help='JSON string with workflow inputs')
    parser_run.add_argument('--output', '-o', help='Save results to file')
    parser_run.set_defaults(func=cmd_run_workflow)
    
    # quick-query
    parser_query = subparsers.add_parser('query', help='Quick query (RAG + Web)')
    parser_query.add_argument('question', help='Question to ask')
    parser_query.add_argument('--project', '-p', help='Project folder path')
    parser_query.add_argument('--no-web', action='store_true', help='Disable web search')
    parser_query.set_defaults(func=cmd_quick_query)
    
    # index
    parser_index = subparsers.add_parser('index', help='Index a project folder')
    parser_index.add_argument('folder', help='Folder path to index')
    parser_index.add_argument('--extensions', '-e', help='File extensions (comma-separated)')
    parser_index.set_defaults(func=cmd_index_project)
    
    # Parse arguments
    args = parser.parse_args()
    
    if not args.command:
        print_banner()
        parser.print_help()
        return
    
    # Print banner
    print_banner()
    
    # Execute command
    asyncio.run(args.func(args))


if __name__ == "__main__":
    main()

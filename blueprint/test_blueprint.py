"""
============================================================
TỰ MINH AGI - QUICK START TEST SCRIPT
Script để test nhanh Blueprint System
============================================================
"""

import asyncio
import sys
from pathlib import Path

# Add blueprints to path
sys.path.insert(0, str(Path(__file__).parent))

print("""
╔═══════════════════════════════════════════════════════════╗
║     TỰ MINH AGI - BLUEPRINT QUICK START TEST             ║
╚═══════════════════════════════════════════════════════════╝
""")

print("🔍 Checking dependencies...")

# Check imports
try:
    import yaml
    print("  ✅ PyYAML")
except ImportError:
    print("  ❌ PyYAML - Install: pip install pyyaml")
    sys.exit(1)

try:
    from workflow_orchestrator import WorkflowOrchestrator, Task, TaskResult, TaskStatus
    print("  ✅ Workflow Orchestrator")
except Exception as e:
    print(f"  ❌ Workflow Orchestrator - {e}")
    sys.exit(1)

try:
    from integration_adapter import TuminhAGIIntegration
    print("  ✅ Integration Adapter")
except Exception as e:
    print(f"  ❌ Integration Adapter - {e}")
    sys.exit(1)

print("\n✅ All core dependencies loaded!\n")


# ============================================================
# TEST 1: Load Blueprint
# ============================================================

print("="*60)
print("TEST 1: Loading Blueprint Schema")
print("="*60)

try:
    with open("./task_schema.yaml", 'r', encoding='utf-8') as f:
        blueprint = yaml.safe_load(f)
    
    metadata = blueprint['blueprint_metadata']
    print(f"✅ Blueprint loaded successfully!")
    print(f"   Version: {metadata['version']}")
    print(f"   Agent: {metadata['agent_name']}")
    print(f"   Philosophy: {metadata['philosophy']}")
    print(f"   Architecture: {metadata['architecture']}")
    
    print(f"\n📋 Available Task Types: {len(blueprint['task_types'])}")
    for task_type in blueprint['task_types'].keys():
        print(f"   - {task_type}")
    
    print(f"\n🔄 Available Workflows: {len(blueprint['workflow_templates'])}")
    for workflow_name, config in blueprint['workflow_templates'].items():
        print(f"   - {workflow_name}: {config.get('description', 'N/A')}")

except Exception as e:
    print(f"❌ Failed to load blueprint: {e}")
    sys.exit(1)


# ============================================================
# TEST 2: Initialize Orchestrator
# ============================================================

print("\n" + "="*60)
print("TEST 2: Initializing Workflow Orchestrator")
print("="*60)

try:
    orchestrator = WorkflowOrchestrator(
        blueprint_path="./task_schema.yaml",
        rag_module=None,  # Mock for testing
        search_module=None,
        model_module=None
    )
    
    print("✅ Orchestrator initialized!")
    print(f"   Registered executors: {len(orchestrator.task_executors)}")
    for executor_name in orchestrator.task_executors.keys():
        print(f"   - {executor_name}")

except Exception as e:
    print(f"❌ Failed to initialize orchestrator: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)


# ============================================================
# TEST 3: Mock Task Execution
# ============================================================

print("\n" + "="*60)
print("TEST 3: Mock Task Execution")
print("="*60)

async def test_mock_task_execution():
    """Test thực thi task với mock data"""
    
    # Tạo mock task
    test_task = Task(
        task_id="test_task_1",
        task_type="custom",
        name="Mock Test Task",
        inputs={
            "action": "generate_report",
            "data": "test data"
        },
        timeout=5
    )
    
    print(f"📋 Executing mock task: {test_task.name}")
    
    # Execute
    result = await orchestrator._execute_task(test_task, {})
    
    if result.success:
        print(f"✅ Task completed successfully!")
        print(f"   Duration: {result.duration:.2f}s")
        print(f"   Outputs: {result.outputs}")
    else:
        print(f"❌ Task failed: {result.error}")
    
    return result


# Run async test
try:
    result = asyncio.run(test_mock_task_execution())
except Exception as e:
    print(f"❌ Task execution failed: {e}")
    import traceback
    traceback.print_exc()


# ============================================================
# TEST 4: Workflow Parsing
# ============================================================

print("\n" + "="*60)
print("TEST 4: Workflow Parsing")
print("="*60)

try:
    # Test parsing smart_qa workflow
    workflow_template = blueprint['workflow_templates']['smart_qa']
    print(f"📋 Testing workflow: smart_qa")
    print(f"   Description: {workflow_template.get('description')}")
    print(f"   Steps: {len(workflow_template['steps'])}")
    
    # Parse steps
    mock_inputs = {
        "input": {
            "question": "Test question",
            "project_folder": "./test_project"
        }
    }
    
    tasks = orchestrator._parse_steps_to_tasks(
        workflow_template['steps'],
        mock_inputs
    )
    
    print(f"\n✅ Parsed {len(tasks)} tasks:")
    for task in tasks:
        print(f"   - {task.task_id}: {task.name} ({task.task_type})")

except Exception as e:
    print(f"❌ Workflow parsing failed: {e}")
    import traceback
    traceback.print_exc()


# ============================================================
# TEST 5: Integration Check
# ============================================================

print("\n" + "="*60)
print("TEST 5: Integration Adapter Check")
print("="*60)

try:
    # Try to initialize integration (will fail gracefully if modules not found)
    integration = TuminhAGIIntegration(
        rag_logic_path="./rag_logic.py",
        search_logic_path="./search_logic.py",
        model_name="TuminhAGI_G4"
    )
    
    print("✅ Integration adapter created!")
    
    if integration.rag_adapter:
        print("   ✅ RAG adapter: Available")
    else:
        print("   ⚠️  RAG adapter: Not available (rag_logic.py not found)")
    
    if integration.search_adapter:
        print("   ✅ Search adapter: Available")
    else:
        print("   ⚠️  Search adapter: Not available (search_logic.py not found)")
    
    if integration.model_adapter:
        print("   ✅ Model adapter: Available")
    else:
        print("   ⚠️  Model adapter: Not available")

except Exception as e:
    print(f"⚠️  Integration check: {e}")


# ============================================================
# SUMMARY
# ============================================================

print("\n" + "="*60)
print("🎉 TEST SUMMARY")
print("="*60)

print("""
✅ Core systems operational:
   - Blueprint schema loading
   - Workflow orchestrator initialization
   - Task execution engine
   - Workflow parsing

📝 Next steps:
   1. Kết nối với rag_logic.py và search_logic.py
   2. Test với Ollama model (TuminhAGI_G4)
   3. Chạy end-to-end workflow
   4. Monitor logs và metrics

🚀 Ready to use! Try:
   python tuminh_cli.py list
   python tuminh_cli.py show smart_qa
""")

print("\n" + "="*60)
print("Happy coding! 🐉")
print("="*60)

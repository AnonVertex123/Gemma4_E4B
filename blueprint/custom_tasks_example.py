"""
============================================================
TỰ MINH AGI - CUSTOM TASK EXECUTOR EXAMPLE
Ví dụ về cách tạo custom task executor
============================================================

Custom task cho phép extend Blueprint System với các chức năng riêng
mà không cần modify core code.
"""

import asyncio
from typing import Dict, Any, List
import json
from pathlib import Path


# ============================================================
# EXAMPLE 1: Database Query Task
# ============================================================

async def execute_database_query(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Custom task: Query database
    
    Inputs:
        - query: SQL query string
        - database: Database name
        
    Outputs:
        - results: Query results
        - row_count: Number of rows
    """
    query = inputs["query"]
    database = inputs.get("database", "default")
    
    print(f"🗄️  Executing query on {database}: {query}")
    
    # Simulate database query
    await asyncio.sleep(0.5)
    
    # Mock results
    results = [
        {"id": 1, "name": "Item 1", "value": 100},
        {"id": 2, "name": "Item 2", "value": 200}
    ]
    
    return {
        "results": results,
        "row_count": len(results),
        "database": database
    }


# ============================================================
# EXAMPLE 2: Data Transformation Task
# ============================================================

async def execute_data_transform(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Custom task: Transform data
    
    Inputs:
        - data: Input data (list or dict)
        - transformation: Type of transformation
            - "normalize", "aggregate", "filter", "sort"
        - params: Transformation parameters
        
    Outputs:
        - transformed_data: Result data
        - stats: Transformation statistics
    """
    data = inputs["data"]
    transformation = inputs["transformation"]
    params = inputs.get("params", {})
    
    print(f"🔄 Transforming data: {transformation}")
    
    # Simulate transformation
    await asyncio.sleep(0.3)
    
    transformed_data = data  # Placeholder
    stats = {
        "input_size": len(data) if isinstance(data, list) else 1,
        "output_size": len(data) if isinstance(data, list) else 1,
        "transformation": transformation
    }
    
    if transformation == "normalize":
        # Normalize logic
        pass
    elif transformation == "aggregate":
        # Aggregate logic
        pass
    
    return {
        "transformed_data": transformed_data,
        "stats": stats
    }


# ============================================================
# EXAMPLE 3: File Processing Task
# ============================================================

async def execute_file_batch_process(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Custom task: Batch process files
    
    Inputs:
        - file_paths: List of file paths
        - operation: Operation to perform
            - "compress", "convert", "analyze"
        - output_dir: Output directory
        
    Outputs:
        - processed_files: List of processed file paths
        - errors: List of errors (if any)
    """
    file_paths = inputs["file_paths"]
    operation = inputs["operation"]
    output_dir = inputs.get("output_dir", "./output")
    
    print(f"📁 Batch processing {len(file_paths)} files: {operation}")
    
    processed_files = []
    errors = []
    
    for file_path in file_paths:
        try:
            # Simulate processing
            await asyncio.sleep(0.1)
            
            output_path = Path(output_dir) / Path(file_path).name
            processed_files.append(str(output_path))
            
        except Exception as e:
            errors.append({
                "file": file_path,
                "error": str(e)
            })
    
    return {
        "processed_files": processed_files,
        "errors": errors,
        "success_count": len(processed_files),
        "error_count": len(errors)
    }


# ============================================================
# EXAMPLE 4: ML Model Inference Task
# ============================================================

async def execute_ml_inference(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Custom task: ML model inference
    
    Inputs:
        - model_path: Path to model file
        - input_data: Data for inference
        - batch_size: Batch size (optional)
        
    Outputs:
        - predictions: Model predictions
        - confidence_scores: Confidence for each prediction
    """
    model_path = inputs["model_path"]
    input_data = inputs["input_data"]
    batch_size = inputs.get("batch_size", 32)
    
    print(f"🤖 Running inference with model: {model_path}")
    
    # Simulate model loading and inference
    await asyncio.sleep(1.0)
    
    # Mock predictions
    predictions = [0.85, 0.92, 0.78]  # Confidence scores
    
    return {
        "predictions": predictions,
        "confidence_scores": predictions,
        "model": model_path,
        "batch_size": batch_size
    }


# ============================================================
# EXAMPLE 5: API Integration Task
# ============================================================

async def execute_api_call(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Custom task: Call external API
    
    Inputs:
        - api_url: API endpoint URL
        - method: HTTP method (GET, POST, etc.)
        - headers: Request headers
        - body: Request body (for POST/PUT)
        
    Outputs:
        - response_data: API response
        - status_code: HTTP status code
    """
    api_url = inputs["api_url"]
    method = inputs.get("method", "GET")
    headers = inputs.get("headers", {})
    body = inputs.get("body")
    
    print(f"🌐 Calling API: {method} {api_url}")
    
    # Simulate API call
    await asyncio.sleep(0.5)
    
    # Mock response
    response_data = {
        "success": True,
        "data": {"result": "mock data"}
    }
    
    return {
        "response_data": response_data,
        "status_code": 200,
        "url": api_url
    }


# ============================================================
# REGISTRATION HELPER
# ============================================================

def register_custom_tasks(orchestrator):
    """
    Đăng ký tất cả custom tasks vào orchestrator
    
    Usage:
        from custom_tasks import register_custom_tasks
        orchestrator = WorkflowOrchestrator()
        register_custom_tasks(orchestrator)
    """
    
    custom_tasks = {
        "database_query": execute_database_query,
        "data_transform": execute_data_transform,
        "file_batch_process": execute_file_batch_process,
        "ml_inference": execute_ml_inference,
        "api_call": execute_api_call
    }
    
    for task_type, executor in custom_tasks.items():
        orchestrator.register_executor(task_type, executor)
        print(f"✅ Registered custom task: {task_type}")
    
    return orchestrator


# ============================================================
# EXAMPLE WORKFLOW WITH CUSTOM TASKS
# ============================================================

CUSTOM_WORKFLOW_EXAMPLE = """
# Add to task_schema.yaml:

workflow_templates:
  
  data_pipeline_example:
    name: "Data Pipeline with Custom Tasks"
    description: "ETL pipeline using custom tasks"
    steps:
      - step_1:
          task_type: "database_query"
          name: "Extract data from DB"
          inputs:
            query: "SELECT * FROM users"
            database: "production"
          next: "step_2"
      
      - step_2:
          task_type: "data_transform"
          name: "Transform data"
          inputs:
            data: "${step_1.results}"
            transformation: "normalize"
          next: "step_3"
      
      - step_3:
          task_type: "ml_inference"
          name: "Run ML model"
          inputs:
            model_path: "./models/user_classifier.pkl"
            input_data: "${step_2.transformed_data}"
          next: "final"
      
      - final:
          task_type: "api_call"
          name: "Send results to API"
          inputs:
            api_url: "https://api.example.com/results"
            method: "POST"
            body: "${step_3.predictions}"
"""

# ============================================================
# TESTING
# ============================================================

async def test_custom_tasks():
    """Test các custom tasks"""
    
    print("🧪 Testing Custom Tasks\n")
    
    # Test 1: Database query
    print("Test 1: Database Query")
    result1 = await execute_database_query({
        "query": "SELECT * FROM users",
        "database": "test_db"
    })
    print(f"Result: {result1}\n")
    
    # Test 2: Data transform
    print("Test 2: Data Transform")
    result2 = await execute_data_transform({
        "data": [1, 2, 3, 4, 5],
        "transformation": "normalize"
    })
    print(f"Result: {result2}\n")
    
    # Test 3: File batch process
    print("Test 3: File Batch Process")
    result3 = await execute_file_batch_process({
        "file_paths": ["file1.txt", "file2.txt", "file3.txt"],
        "operation": "compress",
        "output_dir": "./output"
    })
    print(f"Result: {result3}\n")
    
    # Test 4: ML inference
    print("Test 4: ML Inference")
    result4 = await execute_ml_inference({
        "model_path": "./models/test_model.pkl",
        "input_data": [[1, 2, 3], [4, 5, 6]]
    })
    print(f"Result: {result4}\n")
    
    # Test 5: API call
    print("Test 5: API Call")
    result5 = await execute_api_call({
        "api_url": "https://api.example.com/test",
        "method": "POST"
    })
    print(f"Result: {result5}\n")
    
    print("✅ All tests completed!")


if __name__ == "__main__":
    # Run tests
    asyncio.run(test_custom_tasks())
    
    # Print workflow example
    print("\n" + "="*60)
    print("EXAMPLE WORKFLOW YAML:")
    print("="*60)
    print(CUSTOM_WORKFLOW_EXAMPLE)

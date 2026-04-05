"""
============================================================
TỰ MINH AGI - INTEGRATION ADAPTER (FIXED FOR MODULAR STRUCTURE)
============================================================
"""
import sys
import os
import asyncio
import importlib.util
from pathlib import Path
from typing import Dict, List, Any, Optional

class RAGAdapter:
    def __init__(self, rag_logic_module):
        self.rag = rag_logic_module
    
    def query(self, query: str, project_folder: Optional[str] = None) -> Dict:
        try:
            res_dict = self.rag.query_rag(query)
            return {
                "chunks": [res_dict.get("content", "")] if res_dict.get("content") else [],
                "sources": res_dict.get("sources", []),
                "raw_content": res_dict.get("content", ""),
                "status": "success" if res_dict.get("content") else "no_results"
            }
        except Exception as e:
            return {"chunks": [], "sources": [], "error": str(e), "status": "error"}

class SearchAdapter:
    def __init__(self, search_logic_module):
        self.module = search_logic_module
    
    def search(self, query: str, **kwargs) -> List[Dict]:
        try:
            result_str = self.module.get_web_context(query)
            return [{"title": "Kết quả Thiên Lý Nhãn", "content": result_str}]
        except Exception as e:
            return [{"error": str(e), "query": query}]

class ModelAdapter:
    def __init__(self, model_name: str = "TuminhAGI_G4"):
        self.model_name = model_name
        import ollama
        self.client = ollama
    
    def generate(self, prompt: str) -> Dict:
        try:
            response = self.client.chat(model=self.model_name, messages=[{"role": "user", "content": prompt}])
            return {"response": response["message"]["content"]}
        except Exception as e:
            return {"response": "", "error": str(e)}

class TuminhAGIIntegration:
    def __init__(
        self,
        rag_logic_path: str = "i:/Gemma4_E4B/functions/rag_logic.py",
        search_logic_path: str = "i:/Gemma4_E4B/functions/search_logic.py",
        model_name: str = "TuminhAGI_G4"
    ):
        self._load_modules(rag_logic_path, search_logic_path, model_name)
    
    def _load_modules(self, rag_path: str, search_path: str, model_name: str):
        spec_rag = importlib.util.spec_from_file_location("rag_logic_ext", rag_path)
        rag_module = importlib.util.module_from_spec(spec_rag)
        spec_rag.loader.exec_module(rag_module)
        self.rag_adapter = RAGAdapter(rag_module)
        
        spec_search = importlib.util.spec_from_file_location("search_logic_ext", search_path)
        search_module = importlib.util.module_from_spec(spec_search)
        spec_search.loader.exec_module(search_module)
        self.search_adapter = SearchAdapter(search_module)
        
        self.model_adapter = ModelAdapter(model_name)
    
    def create_orchestrator(self, blueprint_path: str = "i:/Gemma4_E4B/blueprint/task_schema.yaml"):
        from blueprint.workflow_orchestrator import WorkflowOrchestrator
        return WorkflowOrchestrator(
            blueprint_path=blueprint_path,
            rag_module=self.rag_adapter,
            search_module=self.search_adapter,
            model_module=self.model_adapter
        )

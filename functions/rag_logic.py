# VERSION: 2.1 - CORE RAG ENGINE (MODULARIZED)
import os
import shutil
import threading
import json
import time
import hashlib
from langchain_community.document_loaders import PyPDFLoader
from langchain_ollama import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document

# Thư mục gốc chứa mọi tri thức dự án
KNOWLEDGE_ROOT = "i:/Gemma4_E4B/knowledge_base"
METADATA_PATH = "i:/Gemma4_E4B/rag_metadata.json"
HISTORY_PATH = "i:/Gemma4_E4B/chat_history.json"

# Đảm bảo thư mục gốc tồn tại
if not os.path.exists(KNOWLEDGE_ROOT):
    os.makedirs(KNOWLEDGE_ROOT, exist_ok=True)

# Trạng thái toàn cục
is_indexing = False
stop_indexing = False
indexing_paused = False
indexing_progress = 0
last_status = "🟢 Trạng thái: Sẵn sàng."
active_project_path = None 

def save_chat_history(history):
    try:
        with open(HISTORY_PATH, 'w', encoding='utf-8') as f:
            json.dump(history, f, ensure_ascii=False, indent=4)
    except: pass

def load_chat_history():
    if os.path.exists(HISTORY_PATH):
        try:
            with open(HISTORY_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        except: pass
    return []

def get_embedding_function():
    return OllamaEmbeddings(model="nomic-embed-text")

def get_project_id(directory_path):
    return hashlib.md5(directory_path.encode()).hexdigest()[:12]

def get_project_db_path(directory_path):
    pid = get_project_id(directory_path)
    return os.path.join(KNOWLEDGE_ROOT, f"proj_{pid}")

def load_metadata():
    if os.path.exists(METADATA_PATH):
        try:
            with open(METADATA_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if "projects" not in data:
                    return {"projects": {}, "last_folder": ""}
                return data
        except: pass
    return {"projects": {}, "last_folder": ""}

def save_metadata(projects_dict, last_folder):
    try:
        with open(METADATA_PATH, 'w', encoding='utf-8') as f:
            json.dump({"projects": projects_dict, "last_folder": last_folder}, f, ensure_ascii=False, indent=4)
    except: pass

def is_priority_file(filename):
    keywords = ['readme', 'blueprint', 'instruction', 'plan', 'guide', 'main', 'app', 'core', 'config', 'index']
    return any(kw in filename.lower() for kw in keywords)

def background_indexer(chunks, total_chunks, start_index, batch_size, all_file_paths, folder_path, chroma_path):
    global is_indexing, stop_indexing, indexing_paused, indexing_progress, last_status
    is_indexing = True
    try:
        db = Chroma(persist_directory=chroma_path, embedding_function=get_embedding_function())
        for i in range(start_index, total_chunks, batch_size):
            while indexing_paused and not stop_indexing:
                time.sleep(1)
            if stop_indexing:
                break
            batch = chunks[i:i + batch_size]
            db.add_documents(batch)
            indexing_progress = min(100, int((i + batch_size) / total_chunks * 100))
            last_status = f"⚡ Đang nạp: {indexing_progress}%..."
            metadata = load_metadata()
            metadata["projects"][folder_path] = {
                "id": get_project_id(folder_path),
                "indexed_files": all_file_paths,
                "progress": indexing_progress
            }
            save_metadata(metadata["projects"], folder_path)
    except Exception as e:
        last_status = f"❌ Lỗi: {str(e)}"
    finally:
        is_indexing = False
        last_status = "✅ Đã học xong!" if not stop_indexing else "🛑 Đã hủy nạp."
        stop_indexing = False

def scan_directory(directory_path, force_reindex=False):
    global stop_indexing, indexing_progress, last_status, indexing_paused, active_project_path
    stop_indexing = False
    indexing_paused = False
    directory_path = directory_path.strip().replace('"', '')
    if not os.path.exists(directory_path):
        return f"⚠️ Thư mục '{directory_path}' không tồn tại!"
    active_project_path = directory_path
    chroma_path = get_project_db_path(directory_path)
    metadata = load_metadata()
    project_info = metadata["projects"].get(directory_path, {"indexed_files": [], "progress": 0})
    if force_reindex and os.path.exists(chroma_path):
        shutil.rmtree(chroma_path, ignore_errors=True)
    priority_docs, other_docs, all_file_paths = [], [], []
    ignored_folders = ['venv', '.venv', 'env', 'site-packages', '.git', '__pycache__', 'node_modules', 'dist', 'build']
    supported_extensions = ['.py', '.js', '.md', '.txt', '.html', '.css', '.json']
    save_metadata(metadata["projects"], directory_path)
    for root, dirs, files in os.walk(directory_path):
        dirs[:] = [d for d in dirs if d.lower() not in ignored_folders]
        for file in files:
            file_path = os.path.join(root, file)
            try:
                if os.path.getsize(file_path) > 500 * 1024: continue
            except: continue
            all_file_paths.append(file_path)
            if not force_reindex and file_path in project_info["indexed_files"]: continue
            ext = os.path.splitext(file)[1].lower()
            if ext in supported_extensions or ext == '.pdf':
                try:
                    if ext == '.pdf':
                        priority_docs.extend(PyPDFLoader(file_path).load())
                    else:
                        content = ""
                        for enc in ['utf-8', 'latin-1', 'cp1252']:
                            try:
                                with open(file_path, 'r', encoding=enc) as f: content = f.read(); break
                            except: continue
                        if not content: continue
                        doc = Document(page_content=content, metadata={"source": file_path})
                        if is_priority_file(file): priority_docs.append(doc)
                        else: other_docs.append(doc)
                except: continue
    if not priority_docs and not other_docs:
        indexing_progress = project_info.get("progress", 100)
        return "✅ Tự Minh đã nhớ xong dự án này!"
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    priority_chunks = text_splitter.split_documents(priority_docs)
    other_chunks = text_splitter.split_documents(other_docs)
    all_chunks = priority_chunks + other_chunks
    try:
        if priority_chunks:
            db = Chroma.from_documents(priority_chunks, get_embedding_function(), persist_directory=chroma_path)
        elif not os.path.exists(chroma_path):
            db = Chroma(persist_directory=chroma_path, embedding_function=get_embedding_function())
        if other_chunks:
            thread = threading.Thread(target=background_indexer, args=(all_chunks, len(all_chunks), len(priority_chunks), 50, all_file_paths, directory_path, chroma_path))
            thread.daemon = True
            thread.start()
            return f"✅ Đang học tiếp dự án..."
        metadata["projects"][directory_path] = {"id": get_project_id(directory_path), "indexed_files": all_file_paths, "progress": 100}
        save_metadata(metadata["projects"], directory_path)
        indexing_progress = 100
        return "✅ Hoàn tất nạp trí nhớ dự án."
    except Exception as e:
        return f"❌ Lỗi: {str(e)}"

def toggle_rag_pause():
    global indexing_paused
    indexing_paused = not indexing_paused
    return "⏸️ Tạm dừng" if indexing_paused else "▶️ Đang học tiếp"

def get_indexing_status():
    global last_status, indexing_progress
    return last_status, indexing_progress

def stop_rag_loading():
    global stop_indexing
    stop_indexing = True
    return "🛑 Đã hủy nạp."

def query_rag(query_text):
    global active_project_path
    if not active_project_path:
        meta = load_metadata(); active_project_path = meta["last_folder"]
    if not active_project_path: return {"content": "", "sources": []}
    chroma_path = get_project_db_path(active_project_path)
    if not os.path.exists(chroma_path): return {"content": "", "sources": []}
    try:
        db = Chroma(persist_directory=chroma_path, embedding_function=get_embedding_function())
        results = db.similarity_search_with_relevance_scores(query_text, k=6)
        relevant = [doc.page_content for doc, score in results if score > 0.15]
        sources = list(set([doc.metadata.get("source") for doc, score in results if score > 0.15]))
        if not relevant: return {"content": "", "sources": []}
        full_text = "\n\n---\n\n".join(relevant)
        if len(full_text) > 10000: full_text = full_text[:10000] + "\n\n...[Dữ liệu quá dài]..."
        return {"content": "\n\n-----[ KIẾN THỨC DỰ ÁN ]-----\n\n" + full_text, "sources": sources}
    except: return {"content": "", "sources": []}

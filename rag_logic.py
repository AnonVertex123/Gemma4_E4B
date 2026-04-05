# BRIDGE FILE - DO NOT ADD LOGIC HERE
# SEE functions/rag_logic.py FOR THE ACTUAL ENGINE
from functions.rag_logic import (
    scan_directory, query_rag, stop_rag_loading, 
    get_indexing_status, toggle_rag_pause, load_metadata,
    load_chat_history, save_chat_history, HISTORY_PATH
)

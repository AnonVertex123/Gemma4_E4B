from duckduckgo_search import DDGS
import datetime
import re
import time

def clean_text(text):
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def optimize_query(query):
    q = query.lower()
    noise_words = [
        r'cho tôi biết', r'hãy tìm', r'giúp tôi', r'tìm cho tôi', r'cho biết', 
        r'xem giùm', r'đọc tin', r'tổng hợp', r'về việc', r'thực tế tại',
        r'ở đâu', r'thế nào', r'có không', r'là gì', r'lúc này', r'hiện tại'
    ]
    for word in noise_words:
        q = re.sub(word, ' ', q)
    return clean_text(q).strip()

def calculate_relevance(query, snippet):
    keywords = query.lower().split()
    score = 0
    snippet_lower = snippet.lower()
    for kw in keywords:
        if len(kw) > 2 and kw in snippet_lower:
            score += 1
    return score

def get_web_context(original_query, max_output=8):
    """
    Hàm 'Thiên Lý Nhãn' 5.2: Multi-Source Deep Core.
    """
    try:
        clean_query = optimize_query(original_query)
        all_results = []
        with DDGS() as ddgs:
            # News
            try:
                raw_news = ddgs.news(clean_query, region='vi-vn', timelimit='d', max_results=8)
                for r in raw_news:
                    all_results.append({
                        'score': calculate_relevance(clean_query, r.get('title', '') + r.get('body', '')),
                        'source': f"🇻🇳 {r.get('source')}",
                        'content': f"📰 [{r.get('source')}] {r.get('title')}\n📄 {clean_text(r.get('body', ''))}\n🔗 {r.get('url', '#')}\n"
                    })
            except: pass
            # Global
            if len(all_results) < 5:
                try:
                    raw_global = ddgs.text(clean_query, region='wt-wt', timelimit='w', max_results=8)
                    for r in raw_global:
                        all_results.append({
                            'score': calculate_relevance(clean_query, r.get('title', '')),
                            'source': "🌍 Global Web",
                            'content': f"📡 [QUỐC TẾ] {r.get('title')}\n📄 {clean_text(r.get('body', ''))}\n"
                        })
                except: pass
        all_results.sort(key=lambda x: x['score'], reverse=True)
        unique_results = []
        seen_titles = set()
        for item in all_results:
            title_marker = item['content'].split('\n')[0][:50]
            if title_marker not in seen_titles:
                unique_results.append(item); seen_titles.add(title_marker)
        best_results = unique_results[:max_output]
        if not best_results:
            return f"🏮 [Thiên Lý Nhãn]: Không tìm thấy nguồn tin mới về '{clean_query}'."
        final_web_context = f"\n--- 🌐 TRI THỨC ĐA VỆ TINH 5.2 (Từ khóa: '{clean_query}') ---\n"
        for i, item in enumerate(best_results, 1):
            final_web_context += f"[{i}] {item['content']}\n"
        return final_web_context
    except Exception as e:
        return f"⚠️ [Thiên Lý Nhãn] Lỗi: {str(e)}"

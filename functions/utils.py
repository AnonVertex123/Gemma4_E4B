def sanitize_content(content):
    """
    Chuẩn hóa nội dung hiển thị trong Chat.
    """
    if isinstance(content, str): return content
    if isinstance(content, dict): return content.get("text", str(content))
    if isinstance(content, list):
        if len(content) > 0 and isinstance(content[0], dict):
            return content[0].get("text", str(content[0]))
        return " ".join([str(i) for i in content])
    return str(content)

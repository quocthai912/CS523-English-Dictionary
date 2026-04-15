"""
dependencies.py
===============
Module quản lý Dependency Injection cho toàn bộ ứng dụng FastAPI.
Đã hỗ trợ Multi-tenant (Session Isolation).
"""

from fastapi import Header
from typing import Dict
from app.repositories.dictionary_repository import DictionaryRepository
from app.services.dictionary_service import DictionaryService

# Kho lưu trữ các session in-memory: { "sess_123": DictionaryService_1, ... }
_sessions_data: Dict[str, DictionaryService] = {}


def get_dictionary_service(
    x_session_id: str = Header(default="default-session"),
) -> DictionaryService:
    """
    Hàm provider cho FastAPI Dependency Injection.
    FastAPI sẽ tự động lấy 'X-Session-ID' từ request Header.
    """
    # Nếu người dùng (session) này chưa có dữ liệu, tạo cho họ một bộ mới tinh
    if x_session_id not in _sessions_data:
        new_repo = DictionaryRepository()
        new_service = DictionaryService(repository=new_repo)
        _sessions_data[x_session_id] = new_service

    # Trả về đúng Service chứa cây Trie của người đó
    return _sessions_data[x_session_id]

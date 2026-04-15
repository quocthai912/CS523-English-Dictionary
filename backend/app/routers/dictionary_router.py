"""
dictionary_router.py
====================
FastAPI Router định nghĩa toàn bộ các HTTP endpoint cho module từ điển.

Vai trò
-------
- Nhận HTTP request từ client (Frontend React).
- Uỷ thác xử lý hoàn toàn cho DictionaryService.
- Trả HTTP response với Pydantic schema đã định nghĩa.

Nguyên tắc áp dụng
-------------------
- SRP : Router chỉ lo việc định tuyến HTTP, không chứa logic nghiệp vụ.
- DIP : Service được inject qua FastAPI Depends(), Router không tự
        khởi tạo bất kỳ dependency nào.

Danh sách endpoint
------------------
POST   /api/dictionary/         — Thêm hoặc cập nhật một mục từ.
DELETE /api/dictionary/{word}   — Xóa một mục từ.
GET    /api/dictionary/{word}   — Tìm kiếm một từ cụ thể.
GET    /api/dictionary/         — Lấy toàn bộ danh sách mục từ.
GET    /api/dictionary/trie     — Lấy snapshot cấu trúc cây Radix-Trie.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_dictionary_service
from app.schemas.dictionary_schema import (
    AllEntriesResponse,
    DictionaryEntryCreateRequest,
    OperationResponse,
    TrieSnapshotResponse,
)
from app.services.dictionary_service import DictionaryService

# Khởi tạo router với prefix và tag để tổ chức tài liệu Swagger UI.
router = APIRouter(
    prefix="/api/dictionary",
    tags=["Từ điển"],
)


@router.post(
    "/",
    response_model=OperationResponse,
    status_code=status.HTTP_200_OK,
    summary="Thêm hoặc cập nhật mục từ",
    description="Thêm một từ mới vào từ điển. Nếu từ đã tồn tại, nghĩa sẽ được cập nhật.",
)
def add_entry(
    request: DictionaryEntryCreateRequest,
    service: DictionaryService = Depends(get_dictionary_service),
) -> OperationResponse:
    """
    Endpoint thêm mới hoặc cập nhật một mục từ trong từ điển.

    Parameters
    ----------
    request : DictionaryEntryCreateRequest
        Body của request chứa thông tin mục từ cần thêm.
    service : DictionaryService
        Service được inject tự động bởi FastAPI.

    Returns
    -------
    OperationResponse
        Kết quả thao tác kèm snapshot cây Trie sau khi thêm.
    """
    try:
        return service.add_entry(request)
    except ValueError as e:
        # Lỗi validation từ core layer (ví dụ: từ rỗng).
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )


@router.delete(
    "/{word}",
    response_model=OperationResponse,
    status_code=status.HTTP_200_OK,
    summary="Xóa một mục từ",
    description="Xóa một từ khỏi từ điển. Trả về thông báo lỗi nếu từ không tồn tại.",
)
def delete_entry(
    word: str,
    service: DictionaryService = Depends(get_dictionary_service),
) -> OperationResponse:
    """
    Endpoint xóa một mục từ khỏi từ điển.

    Parameters
    ----------
    word : str
        Từ cần xóa, lấy từ URL path parameter.
    service : DictionaryService
        Service được inject tự động bởi FastAPI.

    Returns
    -------
    OperationResponse
        Kết quả thao tác kèm snapshot cây Trie sau khi xóa.
    """
    try:
        return service.delete_entry(word)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi hệ thống khi xóa từ: {str(e)}",
        )


@router.get(
    "/trie",
    response_model=TrieSnapshotResponse,
    status_code=status.HTTP_200_OK,
    summary="Lấy snapshot cây Radix-Trie",
    description="Trả về toàn bộ cấu trúc cây Radix-Trie dạng JSON để frontend render visualiser.",
)
def get_trie_snapshot(
    service: DictionaryService = Depends(get_dictionary_service),
) -> TrieSnapshotResponse:
    """
    Endpoint lấy snapshot toàn bộ cấu trúc cây Radix-Trie.

    Parameters
    ----------
    service : DictionaryService
        Service được inject tự động bởi FastAPI.

    Returns
    -------
    TrieSnapshotResponse
        Cấu trúc cây lồng nhau kèm tổng số từ.
    """
    try:
        return service.get_trie_snapshot()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi hệ thống khi lấy snapshot cây: {str(e)}",
        )


@router.get(
    "/search/{word}",
    response_model=OperationResponse,
    status_code=status.HTTP_200_OK,
    summary="Tìm kiếm một từ",
    description="Tìm kiếm chính xác một từ trong từ điển và trả về thông tin của từ đó.",
)
def search_entry(
    word: str,
    service: DictionaryService = Depends(get_dictionary_service),
) -> OperationResponse:
    """
    Endpoint tìm kiếm chính xác một từ trong từ điển.

    Parameters
    ----------
    word : str
        Từ cần tìm, lấy từ URL path parameter.
    service : DictionaryService
        Service được inject tự động bởi FastAPI.

    Returns
    -------
    OperationResponse
        Kết quả tìm kiếm kèm thông tin mục từ nếu tìm thấy.
    """
    try:
        return service.search_entry(word)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi hệ thống khi tìm kiếm từ: {str(e)}",
        )


@router.get(
    "/",
    response_model=AllEntriesResponse,
    status_code=status.HTTP_200_OK,
    summary="Lấy toàn bộ danh sách từ",
    description="Trả về toàn bộ danh sách mục từ trong từ điển theo thứ tự từ điển.",
)
def get_all_entries(
    service: DictionaryService = Depends(get_dictionary_service),
) -> AllEntriesResponse:
    """
    Endpoint lấy toàn bộ danh sách mục từ.

    Parameters
    ----------
    service : DictionaryService
        Service được inject tự động bởi FastAPI.

    Returns
    -------
    AllEntriesResponse
        Danh sách đầy đủ các mục từ kèm tổng số lượng.
    """
    try:
        return service.get_all_entries()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi hệ thống khi lấy danh sách từ: {str(e)}",
        )

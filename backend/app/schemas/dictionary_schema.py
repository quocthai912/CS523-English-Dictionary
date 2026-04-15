"""
dictionary_schema.py
====================
Định nghĩa các Pydantic model dùng để validate dữ liệu
đầu vào (Request) và định dạng dữ liệu đầu ra (Response) cho API.

Nguyên tắc áp dụng
-------------------
- ISP (Interface Segregation Principle): Tách riêng schema cho từng
  mục đích (tạo mới, phản hồi, snapshot cây) thay vì dùng một model
  chung cho tất cả.
- SRP (Single Responsibility Principle): Module này chỉ lo việc
  mô tả hình dạng dữ liệu, không chứa logic nghiệp vụ.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class DictionaryEntryCreateRequest(BaseModel):
    """
    Schema cho request thêm mới hoặc cập nhật một mục từ.

    Attributes
    ----------
    word : str
        Từ tiếng Anh cần thêm vào từ điển.
    meaning : str
        Nghĩa tiếng Việt hoặc tiếng Anh của từ.
    pronunciation : str, optional
        Phiên âm IPA hoặc không chính thức, ví dụ: /ˈæp.əl/.
    part_of_speech : str, optional
        Loại từ: noun, verb, adjective, ...
    """

    word: str = Field(..., min_length=1, description="Từ tiếng Anh")
    meaning: str = Field(..., min_length=1, description="Nghĩa của từ")
    pronunciation: str = Field(default="", description="Phiên âm")
    part_of_speech: str = Field(default="", description="Loại từ")

    @field_validator("word", "meaning")
    @classmethod
    def strip_whitespace(cls, value: str) -> str:
        """Loại bỏ khoảng trắng thừa ở đầu và cuối chuỗi."""
        stripped = value.strip()
        if not stripped:
            raise ValueError(
                "Trường này không được để trống hoặc chỉ chứa khoảng trắng."
            )
        return stripped


class DictionaryEntryResponse(BaseModel):
    """
    Schema cho response trả về thông tin một mục từ.

    Attributes
    ----------
    word : str
        Từ tiếng Anh.
    meaning : str
        Nghĩa của từ.
    pronunciation : str
        Phiên âm.
    part_of_speech : str
        Loại từ.
    """

    word: str
    meaning: str
    pronunciation: str
    part_of_speech: str


class TrieSnapshotResponse(BaseModel):
    """
    Schema cho response trả về snapshot toàn bộ cấu trúc cây Radix-Trie.
    Dữ liệu này được frontend dùng để vẽ cây trực quan.

    Attributes
    ----------
    total_words : int
        Tổng số từ đang lưu trong cây.
    tree : dict
        Cấu trúc cây dạng JSON lồng nhau.
    """

    total_words: int
    tree: Dict[str, Any]


class OperationResponse(BaseModel):
    """
    Schema cho response xác nhận kết quả của một thao tác (thêm/xóa).

    Attributes
    ----------
    success : bool
        True nếu thao tác thành công.
    message : str
        Thông báo mô tả kết quả.
    entry : DictionaryEntryResponse, optional
        Mục từ vừa được tạo/xóa (nếu có).
    trie_snapshot : TrieSnapshotResponse, optional
        Trạng thái mới nhất của cây sau thao tác.
    """

    success: bool
    message: str
    entry: Optional[DictionaryEntryResponse] = None
    trie_snapshot: Optional[TrieSnapshotResponse] = None


class AllEntriesResponse(BaseModel):
    """
    Schema cho response trả về toàn bộ danh sách mục từ trong từ điển.

    Attributes
    ----------
    total : int
        Tổng số mục từ.
    entries : List[DictionaryEntryResponse]
        Danh sách các mục từ theo thứ tự từ điển.
    """

    total: int
    entries: List[DictionaryEntryResponse]

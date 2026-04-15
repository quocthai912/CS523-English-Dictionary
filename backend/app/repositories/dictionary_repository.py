"""
dictionary_repository.py
========================
Lớp Repository — lớp DUY NHẤT trong toàn bộ ứng dụng
được phép tương tác trực tiếp với RadixTrie.

Vai trò
-------
Đóng gói mọi thao tác đọc/ghi lên cấu trúc dữ liệu Radix-Trie,
cung cấp interface rõ ràng cho Service Layer bên trên.

Nguyên tắc áp dụng
-------------------
- DIP (Dependency Inversion Principle): Service Layer chỉ phụ thuộc
  vào interface của Repository, không biết gì về RadixTrie bên trong.
- SRP (Single Responsibility Principle): Repository chỉ lo một việc
  duy nhất là quản lý vòng đời dữ liệu trong cây Trie.
- OCP (Open/Closed Principle): Nếu sau này muốn thay RadixTrie bằng
  cấu trúc dữ liệu khác, chỉ cần sửa file này, không ảnh hưởng layer nào.
"""

from typing import Any, Dict, List, Optional

from app.core.radix_trie import DictionaryEntry, RadixTrie


class DictionaryRepository:
    """
    Repository quản lý toàn bộ thao tác CRUD lên Radix-Trie.

    Instance duy nhất của class này được tạo một lần khi ứng dụng
    khởi động và tồn tại trong suốt vòng đời của server (in-memory store).

    Attributes
    ----------
    _trie : RadixTrie
        Cấu trúc dữ liệu Radix-Trie lưu trữ toàn bộ mục từ.
    """

    def __init__(self) -> None:
        """Khởi tạo repository với một cây Radix-Trie rỗng."""
        # Cây Trie là nguồn dữ liệu duy nhất (single source of truth).
        self._trie: RadixTrie = RadixTrie()

    # ------------------------------------------------------------------
    # Thao tác ghi
    # ------------------------------------------------------------------

    def add(self, entry: DictionaryEntry) -> None:
        """
        Thêm hoặc cập nhật một mục từ vào cây Trie.

        Nếu từ đã tồn tại, nghĩa sẽ được ghi đè (upsert).

        Parameters
        ----------
        entry : DictionaryEntry
            Mục từ cần thêm vào từ điển.
        """
        self._trie.insert(entry.word, entry)

    def remove(self, word: str) -> bool:
        """
        Xóa một từ khỏi cây Trie.

        Parameters
        ----------
        word : str
            Từ cần xóa (không phân biệt hoa/thường).

        Returns
        -------
        bool
            True nếu từ tồn tại và đã xóa thành công, False nếu không tìm thấy.
        """
        return self._trie.delete(word)

    # ------------------------------------------------------------------
    # Thao tác đọc
    # ------------------------------------------------------------------

    def find(self, word: str) -> Optional[DictionaryEntry]:
        """
        Tìm kiếm chính xác một từ trong cây Trie.

        Parameters
        ----------
        word : str
            Từ cần tìm (không phân biệt hoa/thường).

        Returns
        -------
        DictionaryEntry hoặc None
            Mục từ nếu tìm thấy, None nếu không tồn tại.
        """
        return self._trie.search(word)

    def get_all(self) -> List[DictionaryEntry]:
        """
        Lấy toàn bộ danh sách mục từ theo thứ tự từ điển.

        Returns
        -------
        List[DictionaryEntry]
            Danh sách tất cả mục từ đang lưu trong cây.
        """
        return self._trie.get_all_entries()

    def get_snapshot(self) -> Dict[str, Any]:
        """
        Lấy snapshot toàn bộ cấu trúc cây Trie dạng JSON.

        Dữ liệu này được gửi xuống frontend để vẽ cây trực quan.

        Returns
        -------
        dict
            Cấu trúc cây lồng nhau, sẵn sàng để JSON serialise.
        """
        return self._trie.get_trie_snapshot()

    def get_total_words(self) -> int:
        """
        Trả về tổng số từ hiện đang lưu trong cây.

        Returns
        -------
        int
            Số lượng từ trong từ điển.
        """
        return self._trie.size

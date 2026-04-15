"""
dictionary_service.py
=====================
Lớp Service — chứa toàn bộ business logic của ứng dụng từ điển.

Vai trò
-------
- Validate và chuẩn hoá dữ liệu đầu vào trước khi gọi Repository.
- Xử lý các ngoại lệ nghiệp vụ (từ đã tồn tại, không tìm thấy, ...).
- Tổng hợp dữ liệu từ Repository rồi map sang Pydantic schema để
  trả về cho Router.

Nguyên tắc áp dụng
-------------------
- SRP : Service chỉ lo business logic, không biết gì về HTTP hay Trie.
- OCP : Thêm tính năng mới (autocomplete, import file, ...) chỉ cần
        thêm method mới, không sửa code hiện có.
- DIP : Service nhận Repository qua constructor injection, không tự
        khởi tạo — dễ mock khi viết unit test.
"""

from app.core.radix_trie import DictionaryEntry
from app.repositories.dictionary_repository import DictionaryRepository
from app.schemas.dictionary_schema import (
    AllEntriesResponse,
    DictionaryEntryCreateRequest,
    DictionaryEntryResponse,
    OperationResponse,
    TrieSnapshotResponse,
)


class DictionaryService:
    """
    Service xử lý nghiệp vụ cho module từ điển.

    Parameters
    ----------
    repository : DictionaryRepository
        Repository được inject từ bên ngoài (Dependency Injection).
    """

    def __init__(self, repository: DictionaryRepository) -> None:
        """
        Khởi tạo service với repository được inject.

        Parameters
        ----------
        repository : DictionaryRepository
            Nguồn dữ liệu duy nhất mà service này được phép sử dụng.
        """
        # Lưu trữ repository để tái sử dụng trong tất cả các method.
        self._repo = repository

    # ------------------------------------------------------------------
    # Nghiệp vụ thêm mục từ
    # ------------------------------------------------------------------

    def add_entry(self, request: DictionaryEntryCreateRequest) -> OperationResponse:
        """
        Xử lý nghiệp vụ thêm mới hoặc cập nhật một mục từ.

        Quy trình
        ---------
        1. Kiểm tra từ đã tồn tại chưa để xác định thông báo phù hợp.
        2. Tạo DictionaryEntry từ request đã được validate bởi Pydantic.
        3. Gọi repository để lưu vào cây Trie.
        4. Lấy snapshot cây mới nhất và trả về response.

        Parameters
        ----------
        request : DictionaryEntryCreateRequest
            Dữ liệu mục từ đã được Pydantic validate.

        Returns
        -------
        OperationResponse
            Kết quả thao tác kèm snapshot cây sau khi thêm.
        """
        # Kiểm tra từ đã tồn tại để xác định đây là thêm mới hay cập nhật.
        is_update = self._repo.find(request.word) is not None

        # Tạo domain object từ dữ liệu request.
        entry = DictionaryEntry(
            word=request.word,
            meaning=request.meaning,
            pronunciation=request.pronunciation,
            part_of_speech=request.part_of_speech,
        )

        # Lưu vào cây Trie thông qua repository.
        self._repo.add(entry)

        # Xây dựng thông báo phù hợp với loại thao tác.
        action = "cập nhật" if is_update else "thêm mới"
        message = f"Đã {action} từ '{request.word}' thành công."

        return OperationResponse(
            success=True,
            message=message,
            entry=self._to_entry_response(entry),
            trie_snapshot=self._build_snapshot(),
        )

    # ------------------------------------------------------------------
    # Nghiệp vụ xóa mục từ
    # ------------------------------------------------------------------

    def delete_entry(self, word: str) -> OperationResponse:
        """
        Xử lý nghiệp vụ xóa một mục từ khỏi từ điển.

        Parameters
        ----------
        word : str
            Từ cần xóa.

        Returns
        -------
        OperationResponse
            Kết quả thao tác kèm snapshot cây sau khi xóa.
        """
        # Lấy thông tin từ trước khi xóa để đưa vào response.
        existing_entry = self._repo.find(word)

        if existing_entry is None:
            # Từ không tồn tại — trả về thất bại kèm snapshot hiện tại.
            return OperationResponse(
                success=False,
                message=f"Không tìm thấy từ '{word}' trong từ điển.",
                trie_snapshot=self._build_snapshot(),
            )

        # Thực hiện xóa trên cây Trie.
        self._repo.remove(word)

        return OperationResponse(
            success=True,
            message=f"Đã xóa từ '{word}' thành công.",
            entry=self._to_entry_response(existing_entry),
            trie_snapshot=self._build_snapshot(),
        )

    # ------------------------------------------------------------------
    # Nghiệp vụ tìm kiếm
    # ------------------------------------------------------------------

    def search_entry(self, word: str) -> OperationResponse:
        """
        Tìm kiếm chính xác một từ và trả về thông tin của từ đó.

        Parameters
        ----------
        word : str
            Từ cần tra cứu.

        Returns
        -------
        OperationResponse
            Kết quả tìm kiếm kèm thông tin mục từ nếu tìm thấy.
        """
        entry = self._repo.find(word)

        if entry is None:
            return OperationResponse(
                success=False,
                message=f"Không tìm thấy từ '{word}' trong từ điển.",
                trie_snapshot=self._build_snapshot(),
            )

        return OperationResponse(
            success=True,
            message=f"Tìm thấy từ '{word}'.",
            entry=self._to_entry_response(entry),
            trie_snapshot=self._build_snapshot(),
        )

    # ------------------------------------------------------------------
    # Nghiệp vụ lấy toàn bộ danh sách
    # ------------------------------------------------------------------

    def get_all_entries(self) -> AllEntriesResponse:
        """
        Lấy toàn bộ mục từ trong từ điển theo thứ tự từ điển.

        Returns
        -------
        AllEntriesResponse
            Danh sách đầy đủ các mục từ kèm tổng số lượng.
        """
        entries = self._repo.get_all()

        return AllEntriesResponse(
            total=len(entries),
            entries=[self._to_entry_response(e) for e in entries],
        )

    # ------------------------------------------------------------------
    # Nghiệp vụ lấy snapshot cây
    # ------------------------------------------------------------------

    def get_trie_snapshot(self) -> TrieSnapshotResponse:
        """
        Lấy snapshot toàn bộ cấu trúc cây Radix-Trie.

        Returns
        -------
        TrieSnapshotResponse
            Cấu trúc cây kèm tổng số từ, dùng để render visualiser.
        """
        return self._build_snapshot()

    # ------------------------------------------------------------------
    # Các hàm nội bộ (private helpers)
    # ------------------------------------------------------------------

    def _to_entry_response(self, entry: DictionaryEntry) -> DictionaryEntryResponse:
        """
        Chuyển đổi DictionaryEntry (domain object) sang DictionaryEntryResponse (schema).

        Parameters
        ----------
        entry : DictionaryEntry
            Domain object từ core layer.

        Returns
        -------
        DictionaryEntryResponse
            Schema object sẵn sàng để serialise thành JSON.
        """
        return DictionaryEntryResponse(
            word=entry.word,
            meaning=entry.meaning,
            pronunciation=entry.pronunciation,
            part_of_speech=entry.part_of_speech,
        )

    def _build_snapshot(self) -> TrieSnapshotResponse:
        """
        Tạo TrieSnapshotResponse từ trạng thái hiện tại của cây.

        Returns
        -------
        TrieSnapshotResponse
            Snapshot cây kèm tổng số từ.
        """
        return TrieSnapshotResponse(
            total_words=self._repo.get_total_words(),
            tree=self._repo.get_snapshot(),
        )

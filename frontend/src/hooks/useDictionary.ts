/**
 * useDictionary.ts
 * ================
 * Custom React Hook quản lý toàn bộ state và side effects
 * cho module từ điển.
 *
 * Vai trò
 * -------
 * - Tập trung toàn bộ state management vào một nơi duy nhất.
 * - Cung cấp interface đơn giản cho các component UI sử dụng.
 * - Các component chỉ cần gọi hook này, không cần biết gì về API.
 *
 * Nguyên tắc áp dụng
 * -------------------
 * - SRP : Hook chỉ lo state và API calls, không quan tâm đến render.
 * - DIP : Component phụ thuộc vào hook interface, không phụ thuộc
 *         trực tiếp vào API client.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import * as api from "../api/dictionaryApi";
import type {
  DictionaryEntry,
  LoadingState,
  ToastMessage,
  TrieSnapshot,
} from "../types/dictionary";

// ---------------------------------------------------------------------------
// Hook interface
// ---------------------------------------------------------------------------

export interface UseDictionaryReturn {
  /** Danh sách tất cả mục từ hiện có. */
  entries: DictionaryEntry[];
  /** Snapshot cây Radix-Trie mới nhất. */
  trieSnapshot: TrieSnapshot | null;
  /** Từ đang được highlight sau thao tác tìm kiếm. */
  highlightedWord: string | null;
  /** Kết quả tìm kiếm gần nhất. */
  searchResult: DictionaryEntry | null;
  /** Trạng thái loading cho từng thao tác. */
  loading: LoadingState;
  /** Danh sách thông báo toast hiện tại. */
  toasts: ToastMessage[];
  /** Thêm hoặc cập nhật một mục từ. */
  addEntry: (
    word: string,
    meaning: string,
    pronunciation: string,
    partOfSpeech: string,
  ) => Promise<void>;
  /** Xóa một mục từ. */
  deleteEntry: (word: string) => Promise<void>;
  /** Tìm kiếm một từ. */
  searchEntry: (word: string) => Promise<void>;
  /** Xóa một toast theo id. */
  removeToast: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Hook implementation
// ---------------------------------------------------------------------------

/**
 * Hook quản lý toàn bộ state và nghiệp vụ cho module từ điển.
 *
 * @returns Các state và action để component UI sử dụng.
 */
export const useDictionary = (): UseDictionaryReturn => {
  // --- State ---
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [trieSnapshot, setTrieSnapshot] = useState<TrieSnapshot | null>(null);
  const [highlightedWord, setHighlightedWord] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<DictionaryEntry | null>(
    null,
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    adding: false,
    deleting: false,
    searching: false,
    fetching: false,
  });

  // Dùng ref để tránh stale closure trong auto-dismiss toast.
  const toastTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  // ---------------------------------------------------------------------------
  // Toast helpers
  // ---------------------------------------------------------------------------

  /** Hiển thị một toast mới và tự động xóa sau 3 giây. */
  const showToast = useCallback(
    (type: ToastMessage["type"], message: string) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, message }]);

      // Tự động xóa toast sau 3 giây.
      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        toastTimers.current.delete(id);
      }, 3000);

      toastTimers.current.set(id, timer);
    },
    [],
  );

  /** Xóa một toast theo id (khi người dùng bấm đóng). */
  const removeToast = useCallback((id: string) => {
    // Huỷ timer nếu người dùng đóng toast trước 3 giây.
    const timer = toastTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ---------------------------------------------------------------------------
  // Refresh helpers
  // ---------------------------------------------------------------------------

  /** Tải lại danh sách từ và snapshot cây sau mỗi thao tác. */
  const refreshData = useCallback(async (snapshot?: TrieSnapshot | null) => {
    try {
      // Lấy danh sách từ mới nhất.
      const allEntries = await api.getAllEntries();
      setEntries(allEntries.entries);

      // Dùng snapshot từ response thao tác nếu có, không thì fetch riêng.
      if (snapshot !== undefined) {
        setTrieSnapshot(snapshot);
      } else {
        const trie = await api.getTrieSnapshot();
        setTrieSnapshot(trie);
      }
    } catch {
      // Lỗi fetch danh sách không ảnh hưởng thao tác chính.
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Lấy dữ liệu ban đầu khi component mount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading((prev) => ({ ...prev, fetching: true }));
      try {
        await refreshData();
      } catch {
        showToast(
          "error",
          "Không thể kết nối đến server. Vui lòng kiểm tra Backend.",
        );
      } finally {
        setLoading((prev) => ({ ...prev, fetching: false }));
      }
    };

    fetchInitial();
  }, [refreshData, showToast]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  /** Thêm hoặc cập nhật một mục từ. */
  const addEntry = useCallback(
    async (
      word: string,
      meaning: string,
      pronunciation: string,
      partOfSpeech: string,
    ) => {
      setLoading((prev) => ({ ...prev, adding: true }));
      try {
        const result = await api.addEntry({
          word,
          meaning,
          pronunciation,
          part_of_speech: partOfSpeech,
        });

        // Cập nhật snapshot cây từ response.
        await refreshData(result.trie_snapshot);

        // Highlight từ vừa thêm trên cây.
        setHighlightedWord(word.toLowerCase());
        setTimeout(() => setHighlightedWord(null), 3000);

        showToast("success", result.message);
      } catch (error) {
        showToast("error", (error as Error).message);
      } finally {
        setLoading((prev) => ({ ...prev, adding: false }));
      }
    },
    [refreshData, showToast],
  );

  /** Xóa một mục từ. */
  const deleteEntry = useCallback(
    async (word: string) => {
      setLoading((prev) => ({ ...prev, deleting: true }));
      try {
        const result = await api.deleteEntry(word);

        if (result.success) {
          await refreshData(result.trie_snapshot);
          // Xóa highlight và search result nếu từ bị xóa đang được chọn.
          if (highlightedWord === word.toLowerCase()) {
            setHighlightedWord(null);
            setSearchResult(null);
          }
          showToast("success", result.message);
        } else {
          showToast("error", result.message);
        }
      } catch (error) {
        showToast("error", (error as Error).message);
      } finally {
        setLoading((prev) => ({ ...prev, deleting: false }));
      }
    },
    [highlightedWord, refreshData, showToast],
  );

  /** Tìm kiếm chính xác một từ. */
  const searchEntry = useCallback(
    async (word: string) => {
      setLoading((prev) => ({ ...prev, searching: true }));
      setSearchResult(null);
      try {
        const result = await api.searchEntry(word);

        if (result.success && result.entry) {
          setSearchResult(result.entry);
          setHighlightedWord(word.toLowerCase());
          setTimeout(() => setHighlightedWord(null), 3000);
          showToast("success", result.message);
        } else {
          showToast("info", result.message);
        }
        // Cập nhật snapshot sau tìm kiếm.
        await refreshData(result.trie_snapshot);
      } catch (error) {
        showToast("error", (error as Error).message);
      } finally {
        setLoading((prev) => ({ ...prev, searching: false }));
      }
    },
    [refreshData, showToast],
  );

  return {
    entries,
    trieSnapshot,
    highlightedWord,
    searchResult,
    loading,
    toasts,
    addEntry,
    deleteEntry,
    searchEntry,
    removeToast,
  };
};

/**
 * useDictionary.ts
 * ================
 * Custom hook quản lý state từ điển + persistence qua localStorage.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import * as api from "../api/dictionaryApi";
import type {
  DictionaryEntry,
  LoadingState,
  ToastMessage,
  TrieSnapshot,
} from "../types/dictionary";

// Key lưu danh sách từ trong localStorage
const STORAGE_KEY = "radix_trie_dictionary_entries";

export interface UseDictionaryReturn {
  entries: DictionaryEntry[];
  trieSnapshot: TrieSnapshot | null;
  highlightedWord: string | null;
  searchResult: DictionaryEntry | null;
  loading: LoadingState;
  toasts: ToastMessage[];
  addEntry: (
    word: string,
    meaning: string,
    pronunciation: string,
    partOfSpeech: string,
  ) => Promise<void>;
  deleteEntry: (word: string) => Promise<void>;
  searchEntry: (word: string) => Promise<void>;
  removeToast: (id: string) => void;
}

export const useDictionary = (): UseDictionaryReturn => {
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

  const toastTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  // ------------------------------------------------------------------
  // Lưu danh sách từ vào localStorage sau mỗi thay đổi
  // ------------------------------------------------------------------
  const saveToStorage = useCallback((data: DictionaryEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // localStorage đầy hoặc bị block — bỏ qua
    }
  }, []);

  /** Đọc danh sách từ đã lưu từ localStorage. */
  const loadFromStorage = useCallback((): DictionaryEntry[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as DictionaryEntry[]) : [];
    } catch {
      return [];
    }
  }, []);

  // ------------------------------------------------------------------
  // Toast helpers
  // ------------------------------------------------------------------
  const showToast = useCallback(
    (type: ToastMessage["type"], message: string) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        toastTimers.current.delete(id);
      }, 3000);
      toastTimers.current.set(id, timer);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    const timer = toastTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ------------------------------------------------------------------
  // Refresh state từ Backend
  // ------------------------------------------------------------------
  const refreshData = useCallback(
    async (snapshot?: TrieSnapshot | null) => {
      try {
        const allEntries = await api.getAllEntries();
        setEntries(allEntries.entries);
        // Lưu vào localStorage mỗi khi có thay đổi
        saveToStorage(allEntries.entries);

        if (snapshot !== undefined) {
          setTrieSnapshot(snapshot);
        } else {
          const trie = await api.getTrieSnapshot();
          setTrieSnapshot(trie);
        }
      } catch {
        // Lỗi fetch không ảnh hưởng thao tác chính
      }
    },
    [saveToStorage],
  );

  // ------------------------------------------------------------------
  // Khởi động: restore dữ liệu từ localStorage vào Backend mới
  // ------------------------------------------------------------------
  useEffect(() => {
    const restoreData = async () => {
      setLoading((prev) => ({ ...prev, fetching: true }));
      try {
        // Bước 1: Kiểm tra Backend có dữ liệu chưa
        const currentEntries = await api.getAllEntries();

        if (currentEntries.entries.length > 0) {
          // Backend đã có data (session còn sống) — dùng luôn
          await refreshData();
          return;
        }

        // Bước 2: Backend rỗng — thử restore từ localStorage
        const savedEntries = loadFromStorage();
        if (savedEntries.length === 0) {
          // Lần đầu dùng, không có gì để restore
          await refreshData();
          return;
        }

        // Bước 3: Re-insert từng từ vào Backend mới
        showToast("info", `Đang khôi phục ${savedEntries.length} từ...`);

        for (const entry of savedEntries) {
          await api.addEntry({
            word: entry.word,
            meaning: entry.meaning,
            pronunciation: entry.pronunciation,
            part_of_speech: entry.part_of_speech,
          });
        }

        // Bước 4: Refresh lại state sau khi restore xong
        await refreshData();
        showToast(
          "success",
          `Đã khôi phục ${savedEntries.length} từ thành công!`,
        );
      } catch {
        showToast("error", "Không thể kết nối đến server.");
      } finally {
        setLoading((prev) => ({ ...prev, fetching: false }));
      }
    };

    restoreData();
  }, [refreshData, loadFromStorage, showToast]);

  // ------------------------------------------------------------------
  // Actions
  // ------------------------------------------------------------------
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
        await refreshData(result.trie_snapshot);
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

  const deleteEntry = useCallback(
    async (word: string) => {
      setLoading((prev) => ({ ...prev, deleting: true }));
      try {
        const result = await api.deleteEntry(word);
        if (result.success) {
          await refreshData(result.trie_snapshot);
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

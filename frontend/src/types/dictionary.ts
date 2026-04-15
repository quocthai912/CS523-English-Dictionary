/**
 * dictionary.ts
 * =============
 * Định nghĩa toàn bộ TypeScript types/interfaces cho module từ điển.
 *
 * Nguyên tắc áp dụng
 * -------------------
 * - ISP: Tách riêng interface cho từng mục đích sử dụng, không dùng
 *   một type chung cho tất cả.
 * - SRP: Module này chỉ lo việc định nghĩa kiểu dữ liệu.
 */

// ---------------------------------------------------------------------------
// Domain types — ánh xạ trực tiếp từ Backend schemas
// ---------------------------------------------------------------------------

/** Thông tin một mục từ trong từ điển. */
export interface DictionaryEntry {
  /** Từ tiếng Anh. */
  word: string;
  /** Nghĩa tiếng Việt hoặc tiếng Anh. */
  meaning: string;
  /** Phiên âm IPA, ví dụ: /ˈæp.əl/. */
  pronunciation: string;
  /** Loại từ: noun, verb, adjective, ... */
  part_of_speech: string;
}

/** Một node trong cây Radix-Trie (dùng để visualise). */
export interface TrieNode {
  /** Nhãn cạnh từ node cha đến node này. */
  edge_label: string;
  /** True nếu node này đánh dấu kết thúc một từ hoàn chỉnh. */
  is_end_of_word: boolean;
  /** Thông tin mục từ nếu đây là node kết thúc. */
  entry: DictionaryEntry | null;
  /** Danh sách các node con. */
  children: TrieNode[];
}

/** Snapshot toàn bộ cấu trúc cây Radix-Trie. */
export interface TrieSnapshot {
  /** Tổng số từ đang lưu trong cây. */
  total_words: number;
  /** Cấu trúc cây lồng nhau gốc (ROOT node). */
  tree: TrieNode;
}

// ---------------------------------------------------------------------------
// Request types — dữ liệu gửi lên Backend
// ---------------------------------------------------------------------------

/** Dữ liệu để thêm hoặc cập nhật một mục từ. */
export interface AddEntryRequest {
  word: string;
  meaning: string;
  pronunciation?: string;
  part_of_speech?: string;
}

// ---------------------------------------------------------------------------
// Response types — dữ liệu nhận từ Backend
// ---------------------------------------------------------------------------

/** Kết quả của một thao tác (thêm/xóa/tìm). */
export interface OperationResponse {
  /** True nếu thao tác thành công. */
  success: boolean;
  /** Thông báo mô tả kết quả. */
  message: string;
  /** Mục từ liên quan đến thao tác (nếu có). */
  entry: DictionaryEntry | null;
  /** Snapshot cây Trie sau thao tác. */
  trie_snapshot: TrieSnapshot | null;
}

/** Kết quả lấy toàn bộ danh sách từ. */
export interface AllEntriesResponse {
  /** Tổng số mục từ. */
  total: number;
  /** Danh sách các mục từ. */
  entries: DictionaryEntry[];
}

// ---------------------------------------------------------------------------
// UI State types
// ---------------------------------------------------------------------------

/** Trạng thái loading cho từng thao tác. */
export interface LoadingState {
  adding: boolean;
  deleting: boolean;
  searching: boolean;
  fetching: boolean;
}

/** Thông báo toast hiển thị cho người dùng. */
export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

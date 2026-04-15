/**
 * dictionaryApi.ts
 * ================
 * Axios API client — lớp duy nhất trong Frontend được phép
 * gọi trực tiếp đến Backend API.
 *
 * Nguyên tắc áp dụng
 * -------------------
 * - SRP : Module này chỉ lo việc giao tiếp HTTP với Backend.
 * - OCP : Thêm endpoint mới chỉ cần thêm function, không sửa code cũ.
 * - DIP : Các component/hook chỉ import từ file này, không dùng axios
 *         trực tiếp — dễ thay thế axios bằng fetch hoặc thư viện khác.
 */

import axios from "axios";
import type {
  AddEntryRequest,
  AllEntriesResponse,
  OperationResponse,
  TrieSnapshot,
} from "../types/dictionary";

// ---------------------------------------------------------------------------
// Cấu hình Axios instance
// ---------------------------------------------------------------------------

/** Base URL của Backend API. Đọc từ env hoặc dùng giá trị mặc định. */
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

/** Axios instance dùng chung cho toàn bộ ứng dụng. */
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Timeout 10 giây để tránh chờ đợi vô hạn.
  timeout: 10000,
});

// Tạo ID ngẫu nhiên nếu chưa có (lưu vào sessionStorage để F5 không mất, đóng tab mới mất)
let sessionId = sessionStorage.getItem("trie_session_id");
if (!sessionId) {
  sessionId = "sess_" + Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem("trie_session_id", sessionId);
}

// Bơm Header vào mọi request gửi đi
apiClient.interceptors.request.use((config) => {
  config.headers["X-Session-ID"] = sessionId;
  return config;
});

// ---------------------------------------------------------------------------
// Interceptor — xử lý lỗi tập trung
// ---------------------------------------------------------------------------

apiClient.interceptors.response.use(
  // Trả về response bình thường nếu thành công.
  (response) => response,
  // Xử lý lỗi: trích xuất message từ Backend hoặc dùng message mặc định.
  (error) => {
    const message =
      error.response?.data?.detail ??
      error.message ??
      "Đã xảy ra lỗi không xác định.";
    return Promise.reject(new Error(message));
  },
);

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/**
 * Thêm hoặc cập nhật một mục từ trong từ điển.
 *
 * @param request - Dữ liệu mục từ cần thêm.
 * @returns Kết quả thao tác kèm snapshot cây Trie.
 */
export const addEntry = async (
  request: AddEntryRequest,
): Promise<OperationResponse> => {
  const response = await apiClient.post<OperationResponse>(
    "/api/dictionary/",
    request,
  );
  return response.data;
};

/**
 * Xóa một từ khỏi từ điển.
 *
 * @param word - Từ cần xóa.
 * @returns Kết quả thao tác kèm snapshot cây Trie.
 */
export const deleteEntry = async (word: string): Promise<OperationResponse> => {
  const response = await apiClient.delete<OperationResponse>(
    `/api/dictionary/${encodeURIComponent(word)}`,
  );
  return response.data;
};

/**
 * Tìm kiếm chính xác một từ trong từ điển.
 *
 * @param word - Từ cần tìm.
 * @returns Kết quả tìm kiếm kèm thông tin mục từ.
 */
export const searchEntry = async (word: string): Promise<OperationResponse> => {
  const response = await apiClient.get<OperationResponse>(
    `/api/dictionary/search/${encodeURIComponent(word)}`,
  );
  return response.data;
};

/**
 * Lấy toàn bộ danh sách mục từ trong từ điển.
 *
 * @returns Danh sách đầy đủ các mục từ.
 */
export const getAllEntries = async (): Promise<AllEntriesResponse> => {
  const response = await apiClient.get<AllEntriesResponse>("/api/dictionary/");
  return response.data;
};

/**
 * Lấy snapshot toàn bộ cấu trúc cây Radix-Trie.
 *
 * @returns Cấu trúc cây kèm tổng số từ.
 */
export const getTrieSnapshot = async (): Promise<TrieSnapshot> => {
  const response = await apiClient.get<TrieSnapshot>("/api/dictionary/trie");
  return response.data;
};

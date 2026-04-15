/**
 * trieMetrics.ts
 * ==============
 * Các hàm tính toán số liệu thống kê từ cấu trúc cây Radix-Trie.
 * Dùng để hiển thị phần Metrics trên giao diện.
 */

import type { TrieNode } from "../types/dictionary";

/**
 * Đếm tổng số node trong cây (không tính ROOT).
 *
 * @param node - Node gốc của cây.
 * @returns Tổng số node.
 */
export const countNodes = (node: TrieNode | null): number => {
  if (!node) return 0;
  // Đếm node hiện tại (trừ ROOT) cộng với tất cả node con.
  let count = node.edge_label === "ROOT" ? 0 : 1;
  for (const child of node.children) {
    count += countNodes(child);
  }
  return count;
};

/**
 * Tính chiều cao của cây (số cạnh từ ROOT đến node sâu nhất).
 *
 * @param node - Node gốc của cây.
 * @returns Chiều cao của cây.
 */
export const calcTreeHeight = (node: TrieNode | null): number => {
  if (!node || node.children.length === 0) return 0;
  return 1 + Math.max(...node.children.map(calcTreeHeight));
};

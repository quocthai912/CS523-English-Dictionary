/**
 * Toast.tsx
 * =========
 * Component hiển thị thông báo toast ở góc màn hình.
 */

import { AnimatePresence, motion } from "framer-motion";
import type { ToastMessage } from "../../types/dictionary";

interface ToastContainerProps {
  /** Danh sách toast cần hiển thị. */
  toasts: ToastMessage[];
  /** Hàm xóa toast khi người dùng bấm đóng. */
  onRemove: (id: string) => void;
}

/**
 * Lấy class màu nền tương ứng với loại toast.
 */
const getToastBg = (type: ToastMessage["type"]): string => {
  if (type === "success") return "bg-green-500";
  if (type === "error") return "bg-red-500";
  return "bg-blue-500";
};

/**
 * Lấy ký hiệu icon tương ứng với loại toast.
 */
const getToastIcon = (type: ToastMessage["type"]): string => {
  if (type === "success") return "✓";
  if (type === "error") return "✕";
  return "i";
};

/**
 * Container hiển thị danh sách toast với animation vào/ra.
 */
export const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className={`
              pointer-events-auto flex items-center gap-3
              ${getToastBg(toast.type)} text-white
              px-4 py-3 rounded-xl shadow-lg
              min-w-64 max-w-sm
            `}
          >
            {/* Icon */}
            <span className="text-lg font-bold">
              {getToastIcon(toast.type)}
            </span>

            {/* Nội dung thông báo */}
            <p className="flex-1 text-sm">{toast.message}</p>

            {/* Nút đóng */}
            <button
              onClick={() => onRemove(toast.id)}
              className="text-white/70 hover:text-white text-lg leading-none cursor-pointer"
            >
              x
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

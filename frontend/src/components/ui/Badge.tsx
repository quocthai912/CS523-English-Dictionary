/**
 * Badge.tsx
 * =========
 * Component Badge hiển thị loại từ (noun, verb, ...).
 */

interface BadgeProps {
  /** Nội dung hiển thị trong badge. */
  text: string;
}

/** Bảng màu cho từng loại từ. */
const BADGE_COLORS: Record<string, string> = {
  noun: "bg-blue-100 text-blue-700",
  verb: "bg-green-100 text-green-700",
  adjective: "bg-purple-100 text-purple-700",
  adverb: "bg-yellow-100 text-yellow-700",
  preposition: "bg-orange-100 text-orange-700",
  conjunction: "bg-pink-100 text-pink-700",
  pronoun: "bg-teal-100 text-teal-700",
  interjection: "bg-red-100 text-red-700",
};

/**
 * Badge hiển thị loại từ với màu sắc tương ứng.
 */
export const Badge = ({ text }: BadgeProps) => {
  if (!text) return null;

  const colorClass =
    BADGE_COLORS[text.toLowerCase()] ?? "bg-gray-100 text-gray-600";

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
    >
      {text}
    </span>
  );
};

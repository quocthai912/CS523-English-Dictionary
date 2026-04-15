/**
 * ==================
 * DictionaryTab.tsx
 * ==================
 * Hiển thị danh sách toàn bộ từ vựng hiện có trong từ điển.
 * Áp dụng Local Search để lọc từ nhanh chóng mà không cần gọi API.
 */

import { Search, BookA } from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DictionaryEntry } from "../../types/dictionary";

interface DictionaryTabProps {
  entries: DictionaryEntry[];
}

export const DictionaryTab = ({ entries }: DictionaryTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Tự động lọc danh sách mỗi khi người dùng gõ phím
  const filteredEntries = useMemo(() => {
    const lowerQuery = searchTerm.toLowerCase().trim();
    if (!lowerQuery) return entries;
    return entries.filter(
      (entry) =>
        entry.word.toLowerCase().includes(lowerQuery) ||
        entry.meaning.toLowerCase().includes(lowerQuery),
    );
  }, [entries, searchTerm]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "var(--background)",
      }}
    >
      {/* 1. THANH TÌM KIẾM CỤC BỘ (STICKY HEADER) */}
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid var(--border)",
          backgroundColor: "var(--card)",
          zIndex: 10,
        }}
      >
        <div
          style={{ position: "relative", maxWidth: "600px", margin: "0 auto" }}
        >
          <Search
            size={18}
            color="var(--muted-foreground)"
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <input
            type="text"
            placeholder="Search by word or meaning... (e.g., apple)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 16px 10px 40px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              backgroundColor: "var(--background)",
              color: "var(--foreground)",
              fontSize: "14px",
              outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--primary)";
              e.target.style.boxShadow =
                "0 0 0 3px color-mix(in srgb, var(--primary) 20%, transparent)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
      </div>

      {/* 2. DANH SÁCH TỪ VỰNG (SCROLLABLE AREA) */}
      <div
        className="custom-scrollbar"
        style={{ flex: 1, overflowY: "auto", padding: "24px" }}
      >
        {filteredEntries.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "var(--muted-foreground)",
            }}
          >
            <BookA size={48} style={{ opacity: 0.3, marginBottom: "16px" }} />
            <p style={{ margin: 0, fontWeight: 500 }}>
              No matching words found.
            </p>
          </div>
        ) : (
          <motion.div
            layout
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px",
              maxWidth: "1200px",
              margin: "0 auto",
            }}
          >
            <AnimatePresence>
              {filteredEntries.map((entry) => (
                <motion.div
                  key={entry.word}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{
                    y: -4,
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                  }}
                  style={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "18px",
                          fontWeight: 700,
                          color: "var(--primary)",
                        }}
                      >
                        {entry.word}
                      </h3>
                      {entry.pronunciation && (
                        <span
                          style={{
                            fontSize: "13px",
                            color: "var(--muted-foreground)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {entry.pronunciation}
                        </span>
                      )}
                    </div>
                    {/* Badge hiển thị loại từ */}
                    {entry.part_of_speech && (
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: 600,
                          backgroundColor: "var(--accent)",
                          color: "var(--foreground)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {entry.part_of_speech}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      height: "1px",
                      backgroundColor: "var(--border)",
                      margin: "4px 0",
                    }}
                  />

                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      color: "var(--foreground)",
                      lineHeight: 1.5,
                    }}
                  >
                    {entry.meaning}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

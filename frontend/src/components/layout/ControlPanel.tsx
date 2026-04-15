/**
 * ControlPanel.tsx
 * ================
 * Panel trái 380px — Dictionary Operations, Algorithm Controls, Metrics.
 * Toàn bộ màu sắc dùng CSS custom properties từ theme.css.
 */

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Plus,
  Search,
  SkipForward,
  SkipBack,
  Trash2,
  ChevronDown,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { DictionaryEntry } from "../../types/dictionary";

const PARTS_OF_SPEECH = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "preposition",
  "conjunction",
  "pronoun",
  "interjection",
];

interface ControlPanelProps {
  word: string;
  meaning: string;
  phonetic: string;
  partOfSpeech: string;
  onWordChange: (v: string) => void;
  onMeaningChange: (v: string) => void;
  onPhoneticChange: (v: string) => void;
  onPartOfSpeechChange: (v: string) => void;
  onInsert: () => void;
  onSearch: () => void;
  onDelete: () => void;
  isAdding: boolean;
  isSearching: boolean;
  isDeleting: boolean;
  showEdgeLabels: boolean;
  showPayload: boolean;
  compactMode: boolean;
  animSpeed: number;
  onShowEdgeLabels: (v: boolean) => void;
  onShowPayload: (v: boolean) => void;
  onCompactMode: (v: boolean) => void;
  onAnimSpeed: (v: number) => void;
  totalWords: number;
  totalNodes: number;
  treeHeight: number;
  lastLog: string;
  searchResult: DictionaryEntry | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStep: () => void;
  onStepBack: () => void;
}

/** CSS cho input — theo spec: h-9, rounded-md, border var(--border) */
const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "36px",
  padding: "4px 12px",
  backgroundColor: "var(--input-background)",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  fontSize: "14px",
  color: "var(--foreground)",
  fontFamily: "var(--font-sans)",
  outline: "none",
  transition: "box-shadow 150ms, border-color 150ms",
};

/** CSS cho card container. */
const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  display: "flex",
  flexDirection: "column",
};

/** Badge secondary component. */
const BadgeSec = ({ value }: { value: string | number }) => (
  <span
    style={{
      backgroundColor: "var(--secondary)",
      color: "var(--secondary-foreground)",
      padding: "2px 8px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: 500,
    }}
  >
    {value}
  </span>
);

/** ===== COMPONENT CUSTOM SELECT ===== */
const CustomSelect = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false); // State quản lý focus
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          // Chỉ tắt focus nếu chuột trượt hẳn ra khỏi khu vực dropdown
          if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
            setIsFocused(false);
          }
        }}
        style={{
          ...inputStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          backgroundColor: isOpen ? "var(--accent)" : "var(--input-background)",
          // Dùng biến React State để chuyển màu, giúp màu nhả ra ngay lập tức
          borderColor: isFocused || isOpen ? "var(--ring)" : "var(--border)",
          boxShadow:
            isFocused || isOpen ? "0 0 0 3px rgba(79,70,229,0.2)" : "none",
        }}
      >
        <span>{value.charAt(0).toUpperCase() + value.slice(1)}</span>
        <ChevronDown
          size={16}
          style={{
            color: "var(--muted-foreground)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: "6px",
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "4px",
              boxShadow:
                "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
              zIndex: 50,
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            {options.map((opt, idx) => (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                  setIsFocused(false); // Ép tắt highlight ngay khi chọn xong
                }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: value === opt ? 600 : 400,
                  color: value === opt ? "var(--primary)" : "var(--foreground)",
                  backgroundColor:
                    hoveredIndex === idx
                      ? "color-mix(in srgb, var(--primary) 15%, transparent)"
                      : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "background-color 150ms",
                }}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                {value === opt && <Check size={16} color="var(--primary)" />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ControlPanel = ({
  word,
  meaning,
  phonetic,
  partOfSpeech,
  onWordChange,
  onMeaningChange,
  onPhoneticChange,
  onPartOfSpeechChange,
  onInsert,
  onSearch,
  onDelete,
  isAdding,
  isSearching,
  isDeleting,
  showEdgeLabels,
  showPayload,
  compactMode,
  animSpeed,
  onShowEdgeLabels,
  onShowPayload,
  onCompactMode,
  onAnimSpeed,
  totalWords,
  totalNodes,
  treeHeight,
  lastLog,
  searchResult,
  isPlaying,
  onTogglePlay,
  onStep,
  onStepBack,
}: ControlPanelProps) => (
  <aside
    style={{
      width: "380px",
      height: "100%",
      overflowY: "auto",
      borderRight: "1px solid var(--border)",
      backgroundColor: "var(--card)",
      flexShrink: 0,
    }}
  >
    <div
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      {/* ===== Card A: Dictionary Operations ===== */}
      <div style={cardStyle}>
        {/* CardHeader */}
        <div style={{ padding: "24px 24px 0" }}>
          <h3
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 500,
              color: "var(--foreground)",
            }}
          >
            Dictionary Operations
          </h3>
        </div>

        {/* CardContent */}
        <div
          style={{
            padding: "16px 24px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Word */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--foreground)",
              }}
            >
              Word <span style={{ color: "var(--destructive)" }}>*</span>
            </label>
            <input
              value={word}
              onChange={(e) => onWordChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onInsert()}
              placeholder="e.g., algorithm"
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--ring)";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(79,70,229,0.2)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Meaning */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--foreground)",
              }}
            >
              Meaning <span style={{ color: "var(--destructive)" }}>*</span>
            </label>
            <input
              value={meaning}
              onChange={(e) => onMeaningChange(e.target.value)}
              placeholder="Step-by-step procedure...."
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--ring)";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(79,70,229,0.2)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Phonetic */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--foreground)",
              }}
            >
              Phonetic
            </label>
            <input
              value={phonetic}
              onChange={(e) => onPhoneticChange(e.target.value)}
              placeholder="/'ælgərɪðəm/"
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--ring)";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(79,70,229,0.2)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Part of Speech */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--foreground)",
              }}
            >
              Part of Speech
            </label>
            <CustomSelect
              value={partOfSpeech}
              onChange={onPartOfSpeechChange}
              options={PARTS_OF_SPEECH}
            />
          </div>

          {/* 3-col button grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: "8px",
              paddingTop: "8px",
            }}
          >
            {/* Insert */}
            <button
              onClick={onInsert}
              disabled={isAdding || !word.trim() || !meaning.trim()}
              style={{
                height: "32px",
                padding: "0 12px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: 500,
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "background 120ms",
                opacity: isAdding || !word.trim() || !meaning.trim() ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isAdding)
                  e.currentTarget.style.backgroundColor =
                    "var(--primary-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--primary)";
              }}
            >
              <Plus size={14} /> Insert
            </button>

            {/* Search */}
            <button
              onClick={onSearch}
              disabled={isSearching || !word.trim()}
              style={{
                height: "32px",
                padding: "0 12px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: 500,
                backgroundColor: "var(--secondary)",
                color: "var(--secondary-foreground)",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "background 120ms",
                opacity: isSearching || !word.trim() ? 0.5 : 1,
              }}
            >
              <Search size={14} /> Search
            </button>

            {/* Delete */}
            <button
              onClick={onDelete}
              disabled={isDeleting || !word.trim()}
              style={{
                height: "32px",
                padding: "0 12px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: 500,
                backgroundColor: "var(--destructive)",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "background 120ms",
                opacity: isDeleting || !word.trim() ? 0.5 : 1,
              }}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* ===== Card B: Algorithm Controls ===== */}
      <div style={cardStyle}>
        {/* CSS Inline để xử lý Slider và hiệu ứng Hover */}
        <style>{`
          input[type=range].custom-slider {
            -webkit-appearance: none;
            background: transparent;
          }
          /* FIX: Dùng color-mix để tạo màu xám đậm hơn ở Light Mode và sáng vừa đủ ở Dark Mode */
          input[type=range].custom-slider::-webkit-slider-runnable-track {
            height: 6px;
            border-radius: 3px;
            background: linear-gradient(to right, var(--primary) var(--val), color-mix(in srgb, var(--foreground) 15%, transparent) var(--val));
          }
          input[type=range].custom-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 16px; width: 16px;
            border-radius: 50%;
            background: #ffffff;
            border: 2px solid var(--primary);
            margin-top: -5px;
            transition: box-shadow 150ms;
            cursor: pointer;
          }
          input[type=range].custom-slider:hover::-webkit-slider-thumb {
            box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.2); 
          }
          .action-btn {
            transition: all 150ms;
          }
          .action-btn:hover {
            background-color: var(--accent) !important;
            color: var(--primary) !important;
          }
        `}</style>

        <div style={{ padding: "24px 24px 0" }}>
          <h3
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 500,
              color: "var(--foreground)",
            }}
          >
            Algorithm Controls
          </h3>
        </div>

        <div
          style={{
            padding: "20px 24px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* 1. Switch Toggles (×3) */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {[
              {
                label: "Show edge labels",
                checked: showEdgeLabels,
                onChange: onShowEdgeLabels,
              },
              {
                label: "Show payload",
                checked: showPayload,
                onChange: onShowPayload,
              },
              {
                label: "Compact mode",
                checked: compactMode,
                onChange: onCompactMode,
              },
            ].map((sw) => (
              <div
                key={sw.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--foreground)",
                  }}
                >
                  {sw.label}
                </span>
                <button
                  onClick={() => sw.onChange(!sw.checked)}
                  style={{
                    width: "36px",
                    height: "20px",
                    borderRadius: "9999px",
                    border: "none",
                    cursor: "pointer",
                    padding: "2px",
                    /* Thay var(--muted) bằng color-mix để màu xám đậm đà, dễ nhìn hơn */
                    backgroundColor: sw.checked
                      ? "var(--primary)"
                      : "color-mix(in srgb, var(--foreground) 15%, transparent)",
                    transition: "background 150ms",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      backgroundColor: "white",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      transition: "transform 150ms",
                      transform: sw.checked
                        ? "translateX(16px)"
                        : "translateX(0)",
                    }}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* 2. Slider — Animation Speed */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--foreground)",
                }}
              >
                Animation Speed
              </span>
              {/* Đổi màu tím (var(--primary)) thành màu chữ chuẩn (var(--foreground)) */}
              <span
                style={{
                  fontSize: "13px",
                  color: "var(--foreground)",
                  fontWeight: 600,
                }}
              >
                {animSpeed}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={10}
              value={animSpeed}
              className="custom-slider"
              onChange={(e) => onAnimSpeed(Number(e.target.value))}
              style={{ width: "100%", ["--val" as string]: `${animSpeed}%` }}
            />
          </div>

          {/* 3. Button Back / Auto-play / Step */}
          <div style={{ display: "flex", gap: "8px", paddingTop: "4px" }}>
            <button
              className="action-btn"
              disabled={isPlaying || isAdding || isDeleting}
              onClick={onStepBack}
              style={{
                width: "48px",
                height: "36px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                backgroundColor: "transparent",
                color: "var(--foreground)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: isPlaying || isAdding || isDeleting ? 0.5 : 1,
                pointerEvents:
                  isPlaying || isAdding || isDeleting ? "none" : "auto",
              }}
              title="Step Back"
            >
              <SkipBack size={16} />
            </button>

            <button
              className="action-btn"
              onClick={onTogglePlay}
              disabled={isAdding || isDeleting}
              style={{
                flex: 1,
                height: "36px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: 500,
                border: "1px solid var(--border)",
                backgroundColor: "transparent",
                color: isPlaying ? "var(--primary)" : "var(--foreground)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                opacity: isAdding || isDeleting ? 0.5 : 1,
                pointerEvents: isAdding || isDeleting ? "none" : "auto",
              }}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span>{isPlaying ? "Pause" : "Auto-play"}</span>
            </button>

            <button
              className="action-btn"
              disabled={isPlaying || isAdding || isDeleting}
              onClick={onStep}
              style={{
                width: "48px",
                height: "36px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                backgroundColor: "transparent",
                color: "var(--foreground)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: isPlaying || isAdding || isDeleting ? 0.5 : 1,
                pointerEvents:
                  isPlaying || isAdding || isDeleting ? "none" : "auto",
              }}
              title="Step Forward"
            >
              <SkipForward size={16} />
            </button>
          </div>
        </div>
      </div>
      {/* ===== Card C: Metrics ===== */}
      <div style={cardStyle}>
        <div style={{ padding: "24px 24px 0" }}>
          <h3
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 500,
              color: "var(--foreground)",
            }}
          >
            Metrics
          </h3>
        </div>
        <div
          style={{
            padding: "16px 24px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {[
            { label: "Total words", value: totalWords },
            { label: "Total nodes", value: totalNodes },
            { label: "Tree height", value: treeHeight },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{ fontSize: "14px", color: "var(--muted-foreground)" }}
              >
                {label}
              </span>
              <BadgeSec value={value} />
            </div>
          ))}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "4px",
            }}
          >
            <span
              style={{ fontSize: "14px", color: "var(--muted-foreground)" }}
            >
              Last operation
            </span>
            <div
              style={{
                fontSize: "13px",
                fontFamily: "var(--font-mono)",
                textAlign: "right",
                fontWeight: 700,
                display: "flex",
                gap: "6px",
                alignItems: "center",
              }}
            >
              {/* Chỉ lấy [Giờ] */}
              <span style={{ color: "var(--foreground)", fontWeight: 400 }}>
                {lastLog.match(/\[(.*?)\]/)?.[0] || ""}
              </span>

              {/* Chỉ lấy Tên thao tác và gán màu */}
              <span
                style={{
                  color: lastLog.includes("INSERT")
                    ? "#22c55e"
                    : lastLog.includes("DELETE")
                      ? "#ef4444"
                      : lastLog.includes("SEARCH")
                        ? "#a855f7"
                        : "var(--foreground)",
                }}
              >
                {lastLog.includes("INSERT")
                  ? "INSERT"
                  : lastLog.includes("DELETE")
                    ? "DELETE"
                    : lastLog.includes("SEARCH")
                      ? "SEARCH"
                      : "NONE"}
              </span>
            </div>
          </div>
          {/* Search result */}
          {searchResult && (
            <div
              style={{
                marginTop: "8px",
                padding: "12px",
                backgroundColor: "var(--accent)",
                borderRadius: "8px",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "4px",
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "var(--accent-foreground)",
                  }}
                >
                  {searchResult.word}
                </span>
                {searchResult.part_of_speech && (
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "1px 6px",
                      borderRadius: "4px",
                      backgroundColor: "var(--primary)",
                      color: "var(--primary-foreground)",
                    }}
                  >
                    {searchResult.part_of_speech}
                  </span>
                )}
              </div>
              {searchResult.pronunciation && (
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: "12px",
                    color: "var(--muted-foreground)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {searchResult.pronunciation}
                </p>
              )}
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "var(--foreground)",
                }}
              >
                {searchResult.meaning}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  </aside>
);

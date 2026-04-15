/**
 * Header.tsx
 * ==========
 * Top bar 64px — Logo, Online badge, Theme toggle, Demo Dataset.
 */

import { Database, Moon, Sun } from "lucide-react";

interface HeaderProps {
  darkMode: boolean;
  onToggleDark: () => void;
  onDemoDataset: () => void;
  isLoading: boolean;
  isOnline: boolean;
}

export const Header = ({
  darkMode,
  onToggleDark,
  onDemoDataset,
  isLoading,
  isOnline, // Thêm isOnline vào đây để nhận props
}: HeaderProps) => (
  <header
    style={{
      height: "64px",
      padding: "0 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid var(--border)",
      backgroundColor: "var(--card)",
      flexShrink: 0,
    }}
  >
    {/* Logo block */}
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          backgroundColor: "var(--primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 6px -1px rgba(79,70,229,0.3)",
        }}
      >
        <Database size={22} color="white" />
      </div>
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: 600,
            color: "var(--foreground)",
            lineHeight: 1.5,
          }}
        >
          English Dictionary
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            color: "var(--muted-foreground)",
          }}
        >
          Radix-Trie Visualizer
        </p>
      </div>
    </div>

    {/* Actions */}
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      {/* Online/Offline badge */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "2px 8px",
          borderRadius: "6px",
          border: "1px solid var(--border)",
          fontSize: "12px",
          fontWeight: 500,
          color: "var(--foreground)",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "9999px",
            backgroundColor: isOnline
              ? "var(--success)"
              : "var(--muted-foreground)",
            display: "inline-block",
            animation: isOnline
              ? "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite"
              : "none",
          }}
        />
        {isOnline ? "Online" : "Offline"}
      </span>

      {/* Theme toggle */}
      <button
        onClick={onToggleDark}
        style={{
          height: "32px",
          padding: "0 10px",
          borderRadius: "6px",
          border: "1px solid var(--border)",
          backgroundColor: "transparent",
          color: "var(--foreground)",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 120ms",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Demo Dataset */}
      <button
        onClick={onDemoDataset}
        disabled={isLoading}
        style={{
          height: "32px",
          padding: "0 12px",
          borderRadius: "6px",
          border: "1px solid var(--border)",
          backgroundColor: "transparent",
          color: "var(--foreground)",
          cursor: isLoading ? "not-allowed" : "pointer",
          fontSize: "14px",
          fontWeight: 500,
          display: "inline-flex",
          alignItems: "center",
          opacity: isLoading ? 0.5 : 1,
          transition: "background 120ms",
        }}
        onMouseEnter={(e) => {
          if (!isLoading)
            e.currentTarget.style.backgroundColor = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        Demo Dataset
      </button>
    </div>
  </header>
);

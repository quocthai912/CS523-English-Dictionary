/**
 * BottomPanel.tsx
 * ===============
 * Collapsible bottom panel 40px → 320px.
 * Tabs: JSON Inspector | API Logs | Errors.
 */

import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Code2,
  Terminal,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { TrieSnapshot } from "../../types/dictionary";

interface BottomPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  logs: string[];
  trieSnapshot: TrieSnapshot | null;
}

type BottomTab = "json" | "logs" | "errors";

export const BottomPanel = ({
  isOpen,
  onToggle,
  logs,
  trieSnapshot,
}: BottomPanelProps) => {
  const [activeTab, setActiveTab] = useState<BottomTab>("json");

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 500,
    border: "none",
    cursor: "pointer",
    backgroundColor: active ? "var(--card)" : "transparent",
    color: active ? "var(--foreground)" : "var(--muted-foreground)",
    transition: "background 120ms",
  });

  return (
    <div
      style={{
        flexShrink: 0,
        borderTop: "1px solid var(--border)",
        backgroundColor: "var(--card)",
      }}
    >
      {/* Toggle bar — 40px */}
      <div
        style={{
          height: "40px",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={onToggle}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--foreground)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 6px",
              borderRadius: "6px",
            }}
          >
            {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            {isOpen ? "Hide Panel" : "Show Logs & Data"}
          </button>

          {/* Vertical divider */}
          <div
            style={{
              height: "16px",
              width: "1px",
              backgroundColor: "var(--border)",
            }}
          />

          <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
            {logs.length} logs
          </span>
        </div>
      </div>

      {/* Expandable panel — AnimatePresence */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 280 }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden", borderTop: "1px solid var(--border)" }}
          >
            <div
              style={{
                height: "280px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Inner tabs */}
              <div
                style={{
                  padding: "12px 24px 0",
                  display: "flex",
                  gap: "4px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {(
                  [
                    {
                      id: "json",
                      icon: <Code2 size={14} />,
                      label: "JSON Inspector",
                    },
                    {
                      id: "logs",
                      icon: <Terminal size={14} />,
                      label: "API Logs",
                    },
                    {
                      id: "errors",
                      icon: <AlertTriangle size={14} />,
                      label: "Errors",
                    },
                  ] as { id: BottomTab; icon: React.ReactNode; label: string }[]
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={tabBtnStyle(activeTab === tab.id)}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div
                style={{ flex: 1, overflow: "auto", padding: "0 24px 16px" }}
              >
                {/* JSON Inspector */}
                {activeTab === "json" && (
                  <pre
                    style={{
                      margin: "12px 0 0",
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                      color: "var(--foreground)",
                      backgroundColor:
                        "color-mix(in srgb, var(--muted) 50%, transparent)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "16px",
                      overflow: "auto",
                      maxHeight: "180px",
                    }}
                  >
                    {JSON.stringify(trieSnapshot, null, 2) ?? "null"}
                  </pre>
                )}

                {/* API Logs */}
                {activeTab === "logs" && (
                  <div
                    style={{
                      marginTop: "12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    {logs.map((log, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          fontFamily: "var(--font-mono)",
                          fontSize: "12px",
                          padding: "8px",
                          backgroundColor:
                            "color-mix(in srgb, var(--muted) 50%, transparent)",
                          border: "1px solid var(--border)",
                          borderRadius: "4px",
                        }}
                      >
                        <span
                          style={{
                            color: "var(--muted-foreground)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {log.match(/\[.*?\]/)?.[0] ?? ""}
                        </span>
                        <span
                          style={{ color: "var(--success)", fontWeight: 600 }}
                        >
                          INFO
                        </span>
                        <span style={{ color: "var(--foreground)", flex: 1 }}>
                          {log.replace(/\[.*?\]\s*/, "")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Errors */}
                {activeTab === "errors" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "160px",
                      gap: "8px",
                    }}
                  >
                    <AlertTriangle size={32} color="var(--muted-foreground)" />
                    <span
                      style={{
                        fontSize: "14px",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      No errors
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

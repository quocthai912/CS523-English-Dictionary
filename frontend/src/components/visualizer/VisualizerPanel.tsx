/**
 * ==================
 * VisualizerPanel.tsx
 * ===================
 * Panel phải — TabsList (grid 4 cols) + TabsContent.
 */

import { Clock, GitCompare, Network, BookOpen } from "lucide-react";
import { useState } from "react";
import type { TabId } from "../../types/ui";
import type { TrieSnapshot, DictionaryEntry } from "../../types/dictionary";
import { GraphTab } from "./GraphTab";
import { BeforeAfterTab } from "./BeforeAfterTab";
import { TimelineTab } from "./TimelineTab";
import { DictionaryTab } from "./DictionaryTab";

// Đã bổ sung entries vào Interface
interface VisualizerPanelProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  snapshot: TrieSnapshot | null;
  lastLog?: string;
  logs?: string[];
  showEdgeLabels: boolean;
  showPayload: boolean;
  compactMode: boolean;
  entries: DictionaryEntry[];
  animSpeed?: number;
  isPlaying?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  stepTrigger?: number;
  stepBackTrigger?: number;
}

// Bổ sung Tab mới vào mảng
const TABS: { id: TabId; icon: React.ReactNode; label: string }[] = [
  { id: "graph", icon: <Network size={15} />, label: "Radix-Trie Graph" },
  { id: "dictionary", icon: <BookOpen size={15} />, label: "Dictionary List" }, // MỚI THÊM
  {
    id: "before-after",
    icon: <GitCompare size={15} />,
    label: "Before vs After",
  },
  { id: "timeline", icon: <Clock size={15} />, label: "Timeline" },
];

export const VisualizerPanel = ({
  activeTab,
  onTabChange,
  snapshot,
  lastLog = "",
  logs = [],
  showEdgeLabels,
  showPayload,
  compactMode,
  entries,
  animSpeed,
  isPlaying,
  onPlayingChange,
  stepTrigger,
  stepBackTrigger, // Hứng entries truyền từ App.tsx xuống
}: VisualizerPanelProps) => {
  // 1. TẠO BỘ NHỚ LỊCH SỬ (HISTORY)
  const [history, setHistory] = useState<TrieSnapshot[]>([]);
  const [prevSnapshot, setPrevSnapshot] = useState<TrieSnapshot | null>(null);

  // 2. LƯU SNAPSHOT MỚI VÀO LỊCH SỬ MỖI KHI CÂY THAY ĐỔI
  if (snapshot !== prevSnapshot) {
    setPrevSnapshot(snapshot);
    if (snapshot) {
      setHistory([...history, snapshot]);
    }
  }

  // 3. TÁCH LẤY BẢN SAO TRƯỚC (BEFORE) VÀ HIỆN TẠI (AFTER)
  const afterSnapshot = history.length > 0 ? history[history.length - 1] : null;
  const beforeSnapshot =
    history.length > 1 ? history[history.length - 2] : null;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--background)",
        overflow: "hidden",
      }}
    >
      {/* Tabs header bar */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "16px 24px 0",
          flexShrink: 0,
        }}
      >
        {/* Tăng gridTemplateColumns lên 4, nới rộng maxWidth để chứa 4 tab */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            maxWidth: "600px",
            height: "36px",
            backgroundColor: "var(--muted)",
            borderRadius: "12px",
            padding: "3px",
            gap: "2px",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "4px 8px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 500,
                border: "1px solid transparent",
                cursor: "pointer",
                transition: "color 150ms, box-shadow 150ms",
                backgroundColor:
                  activeTab === tab.id ? "var(--card)" : "transparent",
                color:
                  activeTab === tab.id
                    ? "var(--foreground)"
                    : "var(--muted-foreground)",
                whiteSpace: "nowrap",
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {activeTab === "graph" && (
          <GraphTab
            snapshot={snapshot}
            lastLog={lastLog}
            showEdgeLabels={showEdgeLabels}
            showPayload={showPayload}
            compactMode={compactMode}
            animSpeed={animSpeed}
            isPlaying={isPlaying}
            onPlayingChange={onPlayingChange}
            stepTrigger={stepTrigger}
            stepBackTrigger={stepBackTrigger}
          />
        )}

        {/* MỚI THÊM: Tab Hiển thị Danh sách từ vựng */}
        {activeTab === "dictionary" && <DictionaryTab entries={entries} />}

        {activeTab === "before-after" && (
          <BeforeAfterTab
            beforeSnapshot={beforeSnapshot}
            afterSnapshot={afterSnapshot}
            lastLog={lastLog}
          />
        )}

        {activeTab === "timeline" && <TimelineTab logs={logs} />}
      </div>
    </div>
  );
};

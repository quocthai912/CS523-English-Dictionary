/**
 * ==================
 * GraphTab.tsx
 * ==================
 */

import { Network, Info } from "lucide-react";
import { motion } from "framer-motion";
import { hierarchy, tree, type HierarchyPointNode } from "d3-hierarchy";
import { useState, useEffect, useMemo } from "react";
import type { TrieSnapshot, TrieNode } from "../../types/dictionary";

const STYLE_CONFIG = {
  default: {
    fill: "var(--card)",
    border: "var(--border)",
    text: "var(--foreground)",
    borderWidth: 1.5,
    shadow: "none",
  },
  endOfWord: {
    fill: "color-mix(in srgb, var(--primary) 10%, var(--card))",
    border: "var(--primary)",
    text: "var(--primary)",
    borderWidth: 2.5,
    shadow: "none",
  },
  highlighted: {
    fill: "color-mix(in srgb, #3b82f6 15%, var(--card))",
    border: "#3b82f6",
    text: "#3b82f6",
    borderWidth: 3,
    shadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
  },
  new: {
    fill: "color-mix(in srgb, #22c55e 15%, var(--card))",
    border: "#22c55e",
    text: "#22c55e",
    borderWidth: 3,
    shadow: "0 4px 15px rgba(34, 197, 94, 0.3)",
  },
  deleted: {
    fill: "color-mix(in srgb, #ef4444 15%, var(--card))",
    border: "#ef4444",
    text: "#ef4444",
    borderWidth: 3,
    shadow: "0 4px 15px rgba(239, 68, 68, 0.3)",
  },
};

const LEGEND_ITEMS = [
  { label: "Default Node", style: STYLE_CONFIG.default },
  { label: "End of Word", style: STYLE_CONFIG.endOfWord },
  { label: "Searched Path", style: STYLE_CONFIG.highlighted },
  { label: "Inserted Path", style: STYLE_CONFIG.new },
  { label: "Deleted Path", style: STYLE_CONFIG.deleted },
];

interface TrieGraphProps {
  snapshot: TrieSnapshot | null;
  lastLog?: string;
  scale?: number;
  showEdgeLabels?: boolean;
  showPayload?: boolean;
  compactMode?: boolean;
  animSpeed?: number;
  isPlaying?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  stepTrigger?: number;
  stepBackTrigger?: number;
}

export const TrieGraph = ({
  snapshot,
  lastLog = "",
  scale = 1,
  showEdgeLabels = true,
  showPayload = true,
  compactMode = false,
  animSpeed = 50,
  isPlaying = false,
  onPlayingChange,
  stepTrigger = 0,
  stepBackTrigger = 0,
}: TrieGraphProps) => {
  // 1. KHAI BÁO TOÀN BỘ HOOKS ĐẦU TIÊN ĐỂ TRÁNH LỖI "RULES OF HOOKS"
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [prevLog, setPrevLog] = useState<string>(lastLog);
  const [prevStepTrigger, setPrevStepTrigger] = useState<number>(stepTrigger);
  const [prevStepBackTrigger, setPrevStepBackTrigger] =
    useState<number>(stepBackTrigger);

  const { action, word } = useMemo(() => {
    if (!lastLog) return { action: "NONE", word: "" };
    const match = lastLog.match(/"([^"]+)"/);
    const w = match ? match[1].toLowerCase().trim() : "";
    let a = "NONE";
    if (lastLog.includes("INSERT")) a = "INSERT";
    if (lastLog.includes("SEARCH")) a = "SEARCH";
    if (lastLog.includes("DELETE")) a = "DELETE";
    return { action: a, word: w };
  }, [lastLog]);

  const targetNodesSequence = useMemo(() => {
    const sequence: TrieNode[] = [];
    if (!word || !snapshot || !snapshot.tree) return sequence;

    let current = snapshot.tree;
    let remaining = word;

    while (remaining.length > 0 && current.children) {
      let found = false;
      for (const child of current.children) {
        const label = (child.edge_label || "").toLowerCase();

        if (remaining.startsWith(label)) {
          sequence.push(child);
          remaining = remaining.slice(label.length);
          current = child;
          found = true;
          break;
        } else if (label.startsWith(remaining)) {
          sequence.push(child);
          remaining = "";
          found = true;
          break;
        } else {
          let commonLen = 0;
          while (
            commonLen < remaining.length &&
            commonLen < label.length &&
            remaining[commonLen] === label[commonLen]
          ) {
            commonLen++;
          }
          if (commonLen > 0) {
            sequence.push(child);
            remaining = "";
            found = true;
            break;
          }
        }
      }
      if (!found) break;
    }
    return sequence;
  }, [word, snapshot]);

  const maxStep = targetNodesSequence.length;

  // 2. LOGIC CẬP NHẬT TRẠNG THÁI CHUẨN REACT (Derived State)
  if (lastLog !== prevLog) {
    setPrevLog(lastLog);
    setCurrentStep(0);
  } else if (stepTrigger !== prevStepTrigger) {
    setPrevStepTrigger(stepTrigger);
    if (currentStep < maxStep && !isPlaying) {
      setCurrentStep(currentStep + 1);
    }
  } else if (stepBackTrigger !== prevStepBackTrigger) {
    setPrevStepBackTrigger(stepBackTrigger);
    if (currentStep > 0 && !isPlaying) {
      setCurrentStep(currentStep - 1);
    }
  }

  // 3. EFFECT CHẠY AUTO-PLAY THEO TỐC ĐỘ (ANIM SPEED)
  useEffect(() => {
    let timer: number;
    if (isPlaying && currentStep < maxStep) {
      const delay = 2000 - (animSpeed / 100) * 1800; // Nội suy: 0% = 2s, 100% = 0.2s
      timer = window.setTimeout(() => setCurrentStep((s) => s + 1), delay);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStep, maxStep, animSpeed]);

  useEffect(() => {
    if (isPlaying && maxStep > 0 && currentStep >= maxStep) {
      onPlayingChange?.(false);
    }
  }, [isPlaying, currentStep, maxStep, onPlayingChange]);

  // 4. LẤY DANH SÁCH NODE TỚI BƯỚC HIỆN TẠI ĐỂ TÔ MÀU
  const targetNodesSet = useMemo(() => {
    return new Set(targetNodesSequence.slice(0, currentStep));
  }, [targetNodesSequence, currentStep]);

  // ==========================================
  // RENDER D3 & SVG BÊN DƯỚI NÀY
  // ==========================================

  // RETURN SỚM PHẢI ĐẶT SAU TẤT CẢ CÁC HOOKS Ở TRÊN!
  if (!snapshot || !snapshot.tree) return null;

  const root = hierarchy<TrieNode>(snapshot.tree, (d) => d.children);

  const nodeYSpacing = compactMode ? 85 : 125;

  const treeLayout = tree<TrieNode>()
    .nodeSize([1, nodeYSpacing])
    .separation((a, b) => {
      const getWidth = (node: HierarchyPointNode<TrieNode>) => {
        const label = node.depth === 0 ? "ROOT" : node.data.edge_label || "";
        return Math.max(64, label.length * 9.5 + 24);
      };

      const widthA = getWidth(a);
      const widthB = getWidth(b);

      const baseGap =
        a.parent === b.parent ? (compactMode ? 24 : 36) : compactMode ? 40 : 60;

      const lenA = a.data.edge_label?.length || 0;
      const lenB = b.data.edge_label?.length || 0;
      const dynamicExtraGap = (lenA + lenB) * 3.5;

      const leavesA = a.leaves().length;
      const leavesB = b.leaves().length;
      const imbalance = Math.abs(leavesA - leavesB);
      const imbalanceBuffer = imbalance * (compactMode ? 25 : 40);

      return (
        (widthA + widthB) / 2 + baseGap + dynamicExtraGap + imbalanceBuffer
      );
    });

  const rootNode = treeLayout(root) as HierarchyPointNode<TrieNode>;

  let x0 = Infinity,
    x1 = -Infinity,
    y0 = Infinity,
    y1 = -Infinity;
  rootNode.each((d) => {
    if (d.x > x1) x1 = d.x;
    if (d.x < x0) x0 = d.x;
    if (d.y > y1) y1 = d.y;
    if (d.y < y0) y0 = d.y;
  });

  if (x1 === -Infinity) {
    x0 = 0;
    x1 = 0;
    y0 = 0;
    y1 = 0;
  }

  const paddingX = 60;
  const paddingY = 80;
  const svgWidth = (x1 - x0 + paddingX * 2) * scale;
  const svgHeight = (y1 - y0 + paddingY * 2) * scale;
  const offsetX = -x0 + paddingX;
  const offsetY = -y0 + paddingY;

  return (
    <div
      className="custom-scrollbar"
      style={{ width: "100%", height: "100%", overflow: "auto" }}
    >
      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: color-mix(in srgb, var(--muted-foreground) 40%, transparent) transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 14px;
          width: 14px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: color-mix(in srgb, var(--muted-foreground) 30%, transparent);
          border-radius: 10px;
          border: 4px solid var(--background); 
          background-clip: padding-box;
          transition: background-color 0.2s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: color-mix(in srgb, var(--primary) 60%, transparent);
          border: 4px solid var(--background); 
          background-clip: padding-box;
        }
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>

      <div
        style={{
          minWidth: "100%",
          minHeight: "100%",
          width: "max-content",
          height: "max-content",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "16px 32px 32px 32px",
        }}
      >
        <svg
          width={svgWidth}
          height={svgHeight}
          style={{ flexShrink: 0, overflow: "visible" }}
        >
          <g transform={`scale(${scale}) translate(${offsetX}, ${offsetY})`}>
            {rootNode.links().map((link, i) => {
              const label = link.target.data.edge_label;
              const isTargetActive = targetNodesSet.has(link.target.data);

              let strokeColor = "var(--border)";
              if (isTargetActive) {
                if (action === "SEARCH") strokeColor = "#3b82f6";
                else if (action === "INSERT") strokeColor = "#22c55e";
                else if (action === "DELETE") strokeColor = "#ef4444";
              }

              const midX = (link.source.x + link.target.x) / 2;
              const midY = (link.source.y + link.target.y) / 2;
              const badgeWidth = Math.max(24, label.length * 8 + 12);
              const badgeHeight = 20;

              return (
                <g key={`edge-group-${i}`}>
                  <motion.path
                    d={`M${link.source.x},${link.source.y} L${link.target.x},${link.target.y}`}
                    stroke={strokeColor}
                    strokeWidth={isTargetActive ? 2.5 : 1.5}
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />

                  {showEdgeLabels && (
                    <motion.g
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <rect
                        x={midX - badgeWidth / 2}
                        y={midY - badgeHeight / 2}
                        width={badgeWidth}
                        height={badgeHeight}
                        rx={badgeHeight / 2}
                        fill="var(--background)"
                        stroke={strokeColor}
                        strokeWidth={1}
                        style={{ pointerEvents: "none" }}
                      />
                      <text
                        x={midX}
                        y={midY}
                        dominantBaseline="central"
                        textAnchor="middle"
                        fill="var(--muted-foreground)"
                        fontSize={11}
                        fontWeight={600}
                        fontFamily="var(--font-mono)"
                        style={{ pointerEvents: "none" }}
                      >
                        {label}
                      </text>
                    </motion.g>
                  )}
                </g>
              );
            })}

            {rootNode.descendants().map((node, i) => {
              const isRoot = node.depth === 0;
              const label = isRoot ? "ROOT" : node.data.edge_label || "";
              const isWord = node.data.is_end_of_word;

              let s = isWord ? STYLE_CONFIG.endOfWord : STYLE_CONFIG.default;
              const isNodeActive = targetNodesSet.has(node.data);

              if (isNodeActive) {
                if (action === "DELETE") s = STYLE_CONFIG.deleted;
                else if (action === "INSERT") s = STYLE_CONFIG.new;
                else if (action === "SEARCH") s = STYLE_CONFIG.highlighted;
              }

              const boxWidth = Math.max(64, label.length * 9.5 + 24);
              const boxHeight = 36;

              return (
                <motion.g
                  key={`node-${label}-${i}`}
                  initial={{
                    scale: 0,
                    x: node.parent?.x ?? node.x,
                    y: node.parent?.y ?? node.y,
                  }}
                  animate={{ scale: 1, x: node.x, y: node.y }}
                  transition={{ type: "spring", stiffness: 220, damping: 20 }}
                >
                  {s.shadow !== "none" && (
                    <defs>
                      <filter
                        id={`shadow-${label}-${i}`}
                        x="-20%"
                        y="-20%"
                        width="140%"
                        height="140%"
                      >
                        <feDropShadow
                          dx="0"
                          dy="2"
                          stdDeviation="4"
                          floodColor={s.border}
                          floodOpacity="0.3"
                        />
                      </filter>
                    </defs>
                  )}
                  <rect
                    x={-boxWidth / 2}
                    y={-boxHeight / 2}
                    width={boxWidth}
                    height={boxHeight}
                    rx={boxHeight / 2}
                    fill={s.fill}
                    stroke={s.border}
                    strokeWidth={s.borderWidth}
                    filter={
                      s.shadow !== "none"
                        ? `url(#shadow-${label}-${i})`
                        : "none"
                    }
                    style={{ transition: "all 0.3s ease" }}
                  />

                  <text
                    dominantBaseline="central"
                    textAnchor="middle"
                    fill={s.text}
                    fontSize={14}
                    fontWeight={
                      isWord || s !== STYLE_CONFIG.default ? 700 : 500
                    }
                    fontFamily="var(--font-mono)"
                    style={{
                      pointerEvents: "none",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {label}
                  </text>

                  {showPayload && isWord && node.data.entry && (
                    <g transform={`translate(0, ${boxHeight / 2 + 16})`}>
                      <rect
                        x={
                          -Math.max(
                            60,
                            node.data.entry.meaning.length * 5.5 + 24,
                          ) / 2
                        }
                        y={-10}
                        width={Math.max(
                          60,
                          node.data.entry.meaning.length * 5.5 + 24,
                        )}
                        height={20}
                        rx={4}
                        fill="var(--accent)"
                        stroke="var(--border)"
                        strokeWidth={1}
                      />
                      <text
                        dominantBaseline="central"
                        textAnchor="middle"
                        fontSize={10}
                        fill="var(--foreground)"
                        fontWeight={500}
                        style={{ pointerEvents: "none" }}
                      >
                        {node.data.entry.meaning}
                      </text>
                    </g>
                  )}
                </motion.g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};

export const GraphTab = (props: TrieGraphProps) => {
  const hasData = (props.snapshot?.total_words ?? 0) > 0;
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: "var(--background)",
      }}
    >
      {!hasData ? (
        <div
          style={{
            position: "absolute",
            top: "45%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            color: "var(--muted-foreground)",
          }}
        >
          <Network size={48} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 500 }}>
            The tree is empty.
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "13px" }}>
            Insert a word to visualize the Radix-Trie.
          </p>
        </div>
      ) : (
        <>
          <TrieGraph {...props} />

          <div
            style={{
              position: "absolute",
              bottom: "24px",
              right: "24px",
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
              zIndex: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <Info size={16} color="var(--primary)" />
              <h4
                style={{
                  margin: 0,
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--foreground)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Visual Legend
              </h4>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {LEGEND_ITEMS.map((item) => (
                <div
                  key={item.label}
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "16px",
                      borderRadius: "8px",
                      backgroundColor: item.style.fill,
                      border: `${item.style.borderWidth}px solid ${item.style.border}`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--foreground)",
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

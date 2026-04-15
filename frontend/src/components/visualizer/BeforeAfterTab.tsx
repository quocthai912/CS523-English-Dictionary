/**
 * ==================
 * BeforeAfterTab.tsx
 * ==================
 */

import { AlertCircle, ArrowRight, Info } from "lucide-react";
import { motion } from "framer-motion";
import type { TrieSnapshot } from "../../types/dictionary";
import { TrieGraph } from "./GraphTab";

interface BeforeAfterTabProps {
  beforeSnapshot: TrieSnapshot | null;
  afterSnapshot: TrieSnapshot | null;
  lastLog?: string;
}

export const BeforeAfterTab = ({
  beforeSnapshot,
  afterSnapshot,
  lastLog = "",
}: BeforeAfterTabProps) => {
  if (!beforeSnapshot || !afterSnapshot) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "16px",
          backgroundColor: "var(--background)",
        }}
      >
        <AlertCircle
          size={48}
          color="var(--muted-foreground)"
          style={{ opacity: 0.5 }}
        />
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: "15px",
              color: "var(--muted-foreground)",
              fontWeight: 600,
            }}
          >
            Insufficient Data
          </p>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "13px",
              color: "var(--muted-foreground)",
            }}
          >
            Perform at least one operation to see the comparison.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "var(--background)",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          padding: "16px 20px",
          backgroundColor: "var(--card)",
          borderRadius: "12px",
          border: "1px solid var(--border)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
          flexShrink: 0,
        }}
      >
        <Info size={20} color="var(--primary)" style={{ marginTop: "2px" }} />
        <div>
          <p
            style={{
              margin: "0 0 4px",
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--foreground)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Evolution Details
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "var(--muted-foreground)",
              lineHeight: 1.5,
            }}
          >
            The{" "}
            <span style={{ color: "var(--primary)", fontWeight: 600 }}>
              After
            </span>{" "}
            panel highlights the path affected by your last operation. Compare
            it with the <span style={{ fontWeight: 600 }}>Before</span> state to
            see how the Radix-Trie compresses or splits nodes.
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          gap: "24px",
          position: "relative",
          minHeight: 0,
        }}
      >
        {/* PANEL TRÁI: BEFORE */}
        <div
          style={{
            flex: 1,
            border: "1px solid var(--border)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            backgroundColor: "var(--background)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              padding: "12px 20px",
              backgroundColor: "var(--muted)",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--muted-foreground)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Before
            </span>
            <span
              style={{
                fontSize: "12px",
                color: "var(--muted-foreground)",
                fontWeight: 500,
                backgroundColor:
                  "color-mix(in srgb, var(--muted-foreground) 10%, transparent)",
                padding: "2px 8px",
                borderRadius: "12px",
              }}
            >
              {beforeSnapshot.total_words} words
            </span>
          </div>
          {/* Thêm minWidth: 0, minHeight: 0 để ép Flexbox giữ thanh cuộn */}
          <div
            style={{ flex: 1, position: "relative", minWidth: 0, minHeight: 0 }}
          >
            <TrieGraph
              snapshot={beforeSnapshot}
              lastLog=""
              scale={0.85}
              showEdgeLabels={true}
              showPayload={true}
              compactMode={true}
            />
          </div>
        </div>

        {/* PANEL PHẢI: AFTER */}
        <div
          style={{
            flex: 1,
            border:
              "1px solid color-mix(in srgb, var(--primary) 40%, var(--border))",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            backgroundColor: "var(--background)",
            boxShadow:
              "0 8px 30px -5px color-mix(in srgb, var(--primary) 15%, transparent)",
          }}
        >
          <div
            style={{
              padding: "12px 20px",
              backgroundColor:
                "color-mix(in srgb, var(--primary) 8%, transparent)",
              borderBottom:
                "1px solid color-mix(in srgb, var(--primary) 20%, transparent)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--primary)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              After
            </span>
            <span
              style={{
                fontSize: "12px",
                color: "var(--primary)",
                fontWeight: 600,
                backgroundColor:
                  "color-mix(in srgb, var(--primary) 15%, transparent)",
                padding: "2px 8px",
                borderRadius: "12px",
              }}
            >
              {afterSnapshot.total_words} words
            </span>
          </div>
          {/* Thêm minWidth: 0, minHeight: 0 để ép Flexbox giữ thanh cuộn */}
          <div
            style={{ flex: 1, position: "relative", minWidth: 0, minHeight: 0 }}
          >
            <TrieGraph
              snapshot={afterSnapshot}
              lastLog={lastLog}
              scale={0.85}
              showEdgeLabels={true}
              showPayload={true}
              compactMode={true}
            />
          </div>
        </div>

        {/* MŨI TÊN TRUNG TÂM */}
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.1,
            }}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "24px",
              backgroundColor: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 15px rgba(79,70,229,0.3)",
              border: "1px solid var(--border)",
              color: "#ffffff",
            }}
          >
            <ArrowRight size={20} strokeWidth={2.5} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

/**
 * TimelineTab.tsx
 * ===============
 * Tab "Timeline" — Hiển thị lịch sử thao tác theo dạng trục thời gian chuẩn xác.
 */

import { Clock, Plus, Trash2, Search, Info } from "lucide-react";
import { motion } from "framer-motion";
export const TimelineTab = ({ logs = [] }: { logs?: string[] }) => {
  // Bỏ qua log "App initialized successfully." để timeline tập trung vào thao tác thật
  const actionLogs = logs.filter(
    (log) =>
      log.includes("INSERT") ||
      log.includes("DELETE") ||
      log.includes("SEARCH"),
  );

  const parseLog = (log: string) => {
    const timeMatch = log.match(/\[(.*?)\]/);
    const time = timeMatch ? timeMatch[1] : "";

    let action = "INFO";
    let word = "";

    if (log.includes("INSERT")) action = "INSERT";
    else if (log.includes("DELETE")) action = "DELETE";
    else if (log.includes("SEARCH")) action = "SEARCH";

    const wordMatch = log.match(/"([^"]+)"/);
    if (wordMatch) word = wordMatch[1];

    return { time, action, word };
  };

  if (actionLogs.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "var(--background)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            maxWidth: "320px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              backgroundColor:
                "color-mix(in srgb, var(--primary) 10%, transparent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Clock size={32} color="var(--primary)" />
          </div>
          <div>
            <h3
              style={{
                margin: "0 0 8px",
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--foreground)",
              }}
            >
              No Operations Yet
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "var(--muted-foreground)",
                lineHeight: 1.5,
              }}
            >
              Your operation history will appear here. Insert, search, or delete
              words to build the timeline.
            </p>
          </div>
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
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--foreground)",
            }}
          >
            Operation History
          </h3>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "13px",
              color: "var(--muted-foreground)",
            }}
          >
            Total actions performed: {actionLogs.length}
          </p>
        </div>
      </div>

      {/* Timeline List */}
      <div
        className="custom-scrollbar"
        style={{ flex: 1, overflowY: "auto", padding: "32px 40px" }}
      >
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
        `}</style>

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* Trục dọc (Vertical Line) */}
          <div
            style={{
              position: "absolute",
              left: "15px",
              top: "16px",
              bottom: "16px",
              width: "2px",
              backgroundColor: "var(--border)",
              zIndex: 0,
            }}
          />

          {/* Render từng Log */}
          {actionLogs.map((log, index) => {
            const { time, action, word } = parseLog(log);
            const isLast = index === actionLogs.length - 1;

            let Icon = Info;
            let iconBg = "var(--muted)";
            let iconColor = "var(--muted-foreground)";

            if (action === "INSERT") {
              Icon = Plus;
              iconBg = "color-mix(in srgb, #22c55e 15%, transparent)";
              iconColor = "#22c55e";
            }
            if (action === "DELETE") {
              Icon = Trash2;
              iconBg = "color-mix(in srgb, #ef4444 15%, transparent)";
              iconColor = "#ef4444";
            }
            if (action === "SEARCH") {
              Icon = Search;
              iconBg = "color-mix(in srgb, #3b82f6 15%, transparent)";
              iconColor = "#3b82f6";
            }

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  display: "flex",
                  gap: "24px",
                  position: "relative",
                  zIndex: 1,
                  opacity: isLast ? 1 : 0.7,
                }}
              >
                {/* Icon Node */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "16px",
                    backgroundColor: iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    border: `2px solid var(--background)`,
                  }}
                >
                  <Icon size={16} color={iconColor} strokeWidth={2.5} />
                </div>

                {/* Content Card */}
                <div
                  style={{
                    flex: 1,
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "16px",
                    boxShadow: isLast ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: iconColor,
                      }}
                    >
                      {action}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--muted-foreground)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {time}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      color: "var(--foreground)",
                    }}
                  >
                    Target node:{" "}
                    <strong
                      style={{
                        fontFamily: "var(--font-mono)",
                        padding: "2px 6px",
                        backgroundColor: "var(--muted)",
                        borderRadius: "6px",
                      }}
                    >
                      {word}
                    </strong>
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

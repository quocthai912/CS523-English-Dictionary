/**
 * =======
 * App.tsx
 * =======
 * Root shell
 */

import { useEffect, useState, useCallback } from "react";
import { useDictionary } from "./hooks/useDictionary";
import { Header } from "./components/layout/Header";
import { ControlPanel } from "./components/layout/ControlPanel";
import { VisualizerPanel } from "./components/visualizer/VisualizerPanel";
import { ToastContainer } from "./components/ui/Toast";
import { countNodes, calcTreeHeight } from "./utils/trieMetrics";
import type { TabId } from "./types/ui";

// Định nghĩa URL backend
const BACKEND_URL = "http://localhost:8000";

const DEMO_WORDS = [
  {
    word: "algorithm",
    meaning: "thuật toán",
    pronunciation: "/ˈælɡərɪðəm/",
    part_of_speech: "noun",
  },
  {
    word: "apply",
    meaning: "áp dụng",
    pronunciation: "/əˈplaɪ/",
    part_of_speech: "verb",
  },
  {
    word: "apple",
    meaning: "quả táo",
    pronunciation: "/ˈæpəl/",
    part_of_speech: "noun",
  },
  {
    word: "application",
    meaning: "ứng dụng",
    pronunciation: "/ˌæplɪˈkeɪʃən/",
    part_of_speech: "noun",
  },
  {
    word: "apt",
    meaning: "phù hợp",
    pronunciation: "/æpt/",
    part_of_speech: "adjective",
  },
  {
    word: "tree",
    meaning: "cây",
    pronunciation: "/triː/",
    part_of_speech: "noun",
  },
  {
    word: "trie",
    meaning: "cây tiền tố",
    pronunciation: "/traɪ/",
    part_of_speech: "noun",
  },
];

function App() {
  const {
    entries, // Đã lấy thêm `entries` từ hook
    trieSnapshot,
    searchResult,
    loading,
    toasts,
    addEntry,
    deleteEntry,
    searchEntry,
    removeToast,
  } = useDictionary();

  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("graph");
  const [logs, setLogs] = useState<string[]>(["App initialized successfully."]);

  // --- State mới cho Health Check ---
  const [isOnline, setIsOnline] = useState(false);

  /* Logic kiểm tra trạng thái Backend */
  const checkBackendHealth = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/health-check`);
      if (response.ok) {
        setIsOnline(true);
      } else {
        setIsOnline(false);
      }
    } catch {
      setIsOnline(false);
    }
  }, []);

  /* Khởi chạy Health Check mỗi 5 giây */
  useEffect(() => {
    // Sử dụng setTimeout 0 để đẩy việc kiểm tra ra sau khi render hoàn tất
    const initialCheck = setTimeout(() => {
      checkBackendHealth();
    }, 0);

    const interval = setInterval(checkBackendHealth, 5000);

    return () => {
      clearTimeout(initialCheck); // Dọn dẹp timeout
      clearInterval(interval);
    };
  }, [checkBackendHealth]);

  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [darkMode]);

  /* Form state */
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("noun");

  /* Algorithm controls state */
  const [showEdgeLabels, setShowEdgeLabels] = useState(true);
  const [showPayload, setShowPayload] = useState(true);
  const [compactMode, setCompactMode] = useState(true);
  const [animSpeed, setAnimSpeed] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepTrigger, setStepTrigger] = useState(0);
  const [stepBackTrigger, setStepBackTrigger] = useState(0);

  /* Derived metrics */
  const totalWords = trieSnapshot?.total_words ?? 0;
  const totalNodes = trieSnapshot ? countNodes(trieSnapshot.tree) : 0;
  const treeHeight = trieSnapshot ? calcTreeHeight(trieSnapshot.tree) : 0;

  const pushLog = (msg: string) => {
    const t = new Date().toLocaleTimeString("en-GB");
    setLogs((prev) => [...prev, `[${t}] ${msg}`]);
  };

  const handleInsert = async () => {
    if (!word.trim() || !meaning.trim()) return;
    await addEntry(word, meaning, phonetic, partOfSpeech);
    pushLog(`INSERT  "${word.toLowerCase()}"`);
    setWord("");
    setMeaning("");
    setPhonetic("");
    setIsPlaying(true);
  };

  const handleSearch = async () => {
    if (!word.trim()) return;
    await searchEntry(word);
    pushLog(`SEARCH  "${word.toLowerCase()}"`);
    setIsPlaying(true);
  };

  const handleDelete = async () => {
    if (!word.trim()) return;
    await deleteEntry(word);
    pushLog(`DELETE  "${word.toLowerCase()}"`);
    setWord("");
    setIsPlaying(true);
  };

  const handleDemoDataset = async () => {
    for (const item of DEMO_WORDS) {
      await addEntry(
        item.word,
        item.meaning,
        item.pronunciation,
        item.part_of_speech,
      );
    }
    pushLog("Demo Dataset loaded — 7 words inserted.");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Header */}
      <Header
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((v) => !v)}
        onDemoDataset={handleDemoDataset}
        isLoading={loading.adding}
        isOnline={isOnline}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <ControlPanel
          key={darkMode ? "dark" : "light"}
          word={word}
          meaning={meaning}
          phonetic={phonetic}
          partOfSpeech={partOfSpeech}
          onWordChange={setWord}
          onMeaningChange={setMeaning}
          onPhoneticChange={setPhonetic}
          onPartOfSpeechChange={setPartOfSpeech}
          onInsert={handleInsert}
          onSearch={handleSearch}
          onDelete={handleDelete}
          isAdding={loading.adding}
          isSearching={loading.searching}
          isDeleting={loading.deleting}
          showEdgeLabels={showEdgeLabels}
          showPayload={showPayload}
          compactMode={compactMode}
          animSpeed={animSpeed}
          onShowEdgeLabels={setShowEdgeLabels}
          onShowPayload={setShowPayload}
          onCompactMode={setCompactMode}
          onAnimSpeed={setAnimSpeed}
          totalWords={totalWords}
          totalNodes={totalNodes}
          treeHeight={treeHeight}
          lastLog={logs.length > 1 ? logs[logs.length - 1] : "N/A"}
          searchResult={searchResult}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onStep={() => {
            setIsPlaying(false);
            setStepTrigger((prev) => prev + 1);
          }}
          onStepBack={() => {
            setIsPlaying(false);
            setStepBackTrigger((prev) => prev + 1);
          }}
        />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <VisualizerPanel
            activeTab={activeTab}
            onTabChange={setActiveTab}
            snapshot={trieSnapshot}
            lastLog={logs.length > 1 ? logs[logs.length - 1] : ""}
            logs={logs}
            showEdgeLabels={showEdgeLabels}
            showPayload={showPayload}
            compactMode={compactMode}
            entries={entries} // ĐÃ CHUYỀN XUỐNG ĐÂY CHO TABS SỬ DỤNG
            animSpeed={animSpeed}
            isPlaying={isPlaying}
            onPlayingChange={setIsPlaying}
            stepTrigger={stepTrigger}
            stepBackTrigger={stepBackTrigger}
          />
        </div>
      </div>

      <footer
        style={{
          flexShrink: 0,
          width: "100%",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          borderTop: "1px solid var(--border)",
          backgroundColor: "var(--card)",
          fontSize: "13px",
          color: "var(--muted-foreground)",
          fontWeight: 500,
        }}
      >
        To Quoc Thai - CS523.Q21 - University of Information Technology
      </footer>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;

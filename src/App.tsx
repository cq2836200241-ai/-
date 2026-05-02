/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { wordsList, WordItem } from "./data/words";
import WordDetailModal from "./components/WordDetailModal";
import ApiConfigModal from "./components/ApiConfigModal";
import { ApiConfig } from "./lib/gemini";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Volume2,
  MoreHorizontal,
  Check,
  Plus,
  Search,
  X,
  Upload,
  Moon,
  Sun,
  Shuffle,
  ArrowDownAZ,
  WifiOff,
  Wifi,
  Settings,
  User,
  UserRound,
  Gem,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import phoneticsData from "./data/phonetics.json";

import { speakText, cancelSpeech } from "./lib/speech";

const WORDS_PER_PAGE = 100;

function WordCard({
  item,
  phonetic,
  isSelected,
  isMastered,
  viewMode,
  appMode,
  voiceGender,
  onToggleMastered,
  onOpenDetail,
}: {
  item: WordItem;
  phonetic: string;
  isSelected: boolean;
  isMastered: boolean;
  viewMode: string;
  appMode: "offline" | "api";
  voiceGender: "female" | "male";
  onToggleMastered: () => void;
  onOpenDetail: (rect: DOMRect) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddedMsg, setShowAddedMsg] = useState(false);
  const [shouldBlur, setShouldBlur] = useState(
    () => isMastered && viewMode !== "mastered",
  );
  const prevMasteredRef = useRef(isMastered);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const cleanWord = item.word.split(" (")[0].trim();
  const flipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    if (!prevMasteredRef.current && isMastered && viewMode !== "mastered") {
      setShouldBlur(false);
      setShowAddedMsg(true);
      const timer1 = setTimeout(() => {
        setShowAddedMsg(false);
        const timer2 = setTimeout(() => {
          setShouldBlur(true);
        }, 500);
        timeoutsRef.current.push(timer2);
      }, 700);
      timeoutsRef.current.push(timer1);
    } else if (isMastered) {
      setShouldBlur(viewMode !== "mastered");
      setShowAddedMsg(false);
    } else {
      setShouldBlur(false);
      setShowAddedMsg(false);
    }

    prevMasteredRef.current = isMastered;

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, [isMastered, viewMode]);

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveringRef = useRef(false);

  useEffect(() => {
    return () => {
      if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      isHoveringRef.current = false;
    };
  }, []);

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (clickTimeoutRef.current) {
      // Double click
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      if (cardRef.current) {
        onOpenDetail(cardRef.current.getBoundingClientRect());
      }
      playPronunciation();
    } else {
      // Single click
      clickTimeoutRef.current = setTimeout(() => {
        if (!isFlipped) {
          setIsFlipped(true);
          if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
          flipTimeoutRef.current = setTimeout(() => {
            setIsFlipped(false);
          }, 3000);
        } else {
          setIsFlipped(false);
          if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
        }
        clickTimeoutRef.current = null;
      }, 250); // 250ms delay for double click logic
    }
  };

  const playPronunciation = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    cancelSpeech();

    const cleanBrief = item.brief.replace(/[a-zA-Z.&;\s]+/g, '，').replace(/，+/g, '，').replace(/^，+|，+$/g, '');
    
    speakText(cleanWord, "en-US", voiceGender, () => {
      speakText(cleanBrief, "zh-CN", voiceGender, () => {
        if (isHoveringRef.current) {
          playPronunciation();
        }
      });
    });
  };

  const handleMouseEnterButton = () => {
    isHoveringRef.current = true;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      playPronunciation();
    }, 600);
  };

  const handleMouseLeaveButton = () => {
    isHoveringRef.current = false;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative w-full h-32 sm:h-36 cursor-pointer group ${isSelected ? "z-[60]" : ""}`}
      style={{ perspective: "1000px" }}
      onClick={handleCardClick}
    >
      <motion.div
        className={`w-full h-full relative duration-500 transition-all ${shouldBlur ? "opacity-50 blur-[1.5px] grayscale hover:blur-none hover:opacity-100 hover:grayscale-0" : ""}`}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.5,
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front Face */}
        <div
          className={`absolute inset-0 w-full h-full p-3 sm:p-4 rounded-xl flex flex-col transition-all duration-200 shadow-sm hover:shadow-md brutal:rounded-none brutal:border-[3px] brutal:border-black brutal:shadow-[4px_4px_0_0_#000] brutal:hover:translate-x-[2px] brutal:hover:translate-y-[2px] brutal:hover:shadow-[2px_2px_0_0_#000] elegant:rounded-sm elegant:border elegant:shadow-[0_4px_20px_rgba(0,0,0,0.5)] elegant:hover:-translate-y-1 elegant:hover:shadow-[0_8px_30px_rgba(212,175,55,0.15)] ${
            isMastered
              ? "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 brutal:bg-gray-300 elegant:bg-[#0c0d10] elegant:border-[#d4af37]/20"
              : isSelected
                ? "bg-blue-50 dark:bg-blue-900/40 border-2 border-blue-500 ring-2 ring-blue-200 dark:ring-blue-500/50 ring-offset-1 dark:ring-offset-slate-900 brutal:bg-[#ff3366] brutal:ring-0 brutal:border-[3px] elegant:bg-[#1a1c23] elegant:border-[#d4af37] elegant:ring-0"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 brutal:bg-white brutal:hover:bg-[#ffeb3b] brutal:hover:border-black elegant:bg-[#111318] elegant:border-[#d4af37]/20 elegant:hover:border-[#d4af37]/60"
          }`}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {/* Main content: Word and Phonetic on left, Sound button on right center */}
          <div className="flex items-center justify-between flex-1 min-h-0 min-w-0">
            <div className="flex flex-col justify-center min-w-0 flex-1 pr-2 overflow-hidden">
              <p
                className={`${item.word.length > 14 ? "text-xs sm:text-sm tracking-tighter" : item.word.length > 11 ? "text-sm sm:text-base tracking-tight" : item.word.length > 8 ? "text-base sm:text-lg tracking-tight" : "text-lg sm:text-xl"} font-black leading-tight w-full whitespace-nowrap overflow-hidden text-ellipsis pb-1 ${isSelected ? "text-amber-600 dark:text-amber-400 brutal:text-white elegant:text-[#f4f1ea]" : "text-slate-800 dark:text-slate-100 brutal:text-black elegant:text-[#d4af37]"} elegant:font-serif elegant:font-normal elegant:tracking-wide`}
                title={item.word}
              >
                {item.word}
              </p>
              <p
                className="text-[9px] sm:text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-400 brutal:text-slate-600 brutal:dark:text-black w-full whitespace-nowrap overflow-hidden text-ellipsis mt-0.5 pb-1 elegant:text-[#a39b8b]"
                title={phonetic}
              >
                {phonetic}
              </p>
            </div>

            <button
              onClick={playPronunciation}
              onMouseEnter={handleMouseEnterButton}
              onMouseLeave={handleMouseLeaveButton}
              className={`p-2 sm:p-2.5 z-10 transition-all flex-shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md active:scale-95 rounded-full brutal:rounded-none brutal:border-2 brutal:border-black brutal:bg-[#00e676] brutal:hover:bg-[#ffd803] brutal:hover:text-black brutal:shadow-[2px_2px_0_0_#000] brutal:active:shadow-[0_0_0_0_#000] brutal:active:translate-x-[2px] brutal:active:translate-y-[2px] elegant:bg-transparent elegant:text-[#d4af37] elegant:border elegant:border-[#d4af37]/30 elegant:hover:bg-[#d4af37] elegant:hover:text-[#0c0d10] elegant:shadow-[0_0_15px_rgba(212,175,55,0.1)] elegant:hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]`}
              aria-label={`Pronounce ${item.word}`}
            >
              <Volume2 size={22} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex items-end justify-end mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50 brutal:border-black elegant:border-[#d4af37]/20 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleMastered();
              }}
              className={`h-8 overflow-hidden flex items-center justify-center transition-all duration-300 shadow-sm active:scale-95 z-10 brutal:border-2 brutal:border-black brutal:shadow-[2px_2px_0_0_#000] brutal:active:shadow-[0_0_0_0_#000] brutal:active:translate-x-[2px] brutal:active:translate-y-[2px] elegant:shadow-none elegant:border elegant:border-[#d4af37]/30 elegant:hover:bg-[#d4af37]/10 ${
                showAddedMsg ? "px-3 rounded-full brutal:rounded-none elegant:rounded-full" : "w-8 rounded-full brutal:rounded-none elegant:rounded-full"
              } ${
                isMastered
                  ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900 border border-emerald-200/50 dark:border-emerald-800/50 brutal:bg-[#00e676] brutal:text-black brutal:border-black elegant:bg-[#d4af37] elegant:text-[#0c0d10]"
                  : isSelected
                    ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900 border border-amber-200/50 dark:border-amber-800/50 brutal:bg-white brutal:text-black brutal:border-black elegant:bg-transparent elegant:text-[#d4af37]"
                    : "bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 brutal:bg-[#ffd803] brutal:text-black brutal:hover:bg-white brutal:border-black elegant:bg-transparent elegant:text-[#a39b8b]"
              }`}
              title={isMastered ? "点击取消掌握" : "标记为已掌握"}
            >
              <AnimatePresence mode="wait" initial={false}>
                {showAddedMsg ? (
                  <motion.div
                    key="msg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-xs font-bold whitespace-nowrap"
                  >
                    已掌握
                  </motion.div>
                ) : isMastered ? (
                  <motion.div
                    key="check"
                    initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex flex-shrink-0"
                  >
                    <Check size={18} strokeWidth={3} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="plus"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-shrink-0"
                  >
                    <Plus size={18} strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Back Face */}
        <div
          className="absolute inset-0 w-full h-full p-2 sm:p-3 rounded-xl flex flex-col justify-between shadow-md bg-emerald-50 dark:bg-slate-800 border-2 border-emerald-300 dark:border-emerald-700"
          style={{
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <div
            className="flex-1 flex flex-col items-center justify-center text-center overflow-auto px-1 w-full"
            style={{ scrollbarWidth: "none" }}
          >
            <p className="text-base sm:text-lg font-black text-emerald-800 dark:text-emerald-400 leading-snug break-words">
              {item.brief}
            </p>
          </div>
          <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
            <span className="text-[10px] sm:text-xs text-emerald-600/80 dark:text-emerald-500/80 font-bold whitespace-nowrap overflow-hidden text-ellipsis pr-2">
              {cleanWord}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (cardRef.current) {
                  onOpenDetail(cardRef.current.getBoundingClientRect());
                }
              }}
              className="px-3 py-1.5 bg-emerald-600 dark:bg-emerald-700 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-md hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors shadow-sm whitespace-nowrap"
            >
              Details
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export interface CustomLibrary {
  id: string;
  name: string;
  words: WordItem[];
}

export default function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWord, setSelectedWord] = useState<{
    word: WordItem;
    rect: DOMRect;
  } | null>(null);
  const [masteredWords, setMasteredWords] = useState<Record<number, boolean>>(
    {},
  );
  const [viewMode, setViewMode] = useState<"all" | "mastered">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [customLibraries, setCustomLibraries] = useState<CustomLibrary[]>([]);
  const [activeLibraryId, setActiveLibraryId] = useState<string>("default");
  const [sortMode, setSortMode] = useState<"alpha" | "random">("alpha");
  const [theme, setTheme] = useState<"light" | "dark" | "brutal" | "elegant">("light");
  const [randomSeed, setRandomSeed] = useState(0);
  const [appMode, setAppMode] = useState<"offline" | "api">("offline");
  const [voiceGender, setVoiceGender] = useState<"female" | "male">("female");
  const [apiConfig, setApiConfig] = useState<ApiConfig>({ baseUrl: "", apiKey: "", model: "" });
  const [isApiConfigOpen, setIsApiConfigOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark" || storedTheme === "brutal" || storedTheme === "elegant") {
      setTheme(storedTheme as "dark" | "brutal" | "elegant");
      document.documentElement.classList.add(storedTheme);
    } else if (storedTheme === "light") {
      setTheme("light");
    } else {
      const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        setTheme("dark");
        document.documentElement.classList.add("dark");
      }
    }
    
    const storedSort = localStorage.getItem("sortMode");
    if (storedSort === "alpha" || storedSort === "random") setSortMode(storedSort);
    
    const storedAppMode = localStorage.getItem("appMode");
    if (storedAppMode === "api") setAppMode("api");

    const storedVoiceGender = localStorage.getItem("voiceGender");
    if (storedVoiceGender === "male") setVoiceGender("male");

    const storedApiConfig = localStorage.getItem("apiConfig");
    if (storedApiConfig) {
      try {
        setApiConfig(JSON.parse(storedApiConfig));
      } catch (e) {}
    }

    const storedLibs = localStorage.getItem("customLibraries");
    if (storedLibs) {
      try {
        setCustomLibraries(JSON.parse(storedLibs));
      } catch (e) {}
    }
    const storedActiveId = localStorage.getItem("activeLibraryId");
    if (storedActiveId) {
      setActiveLibraryId(storedActiveId);
    }
  }, []);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const newWords = parsed
          .map((item: any, i: number) => ({
            id: Date.now() + i, // Use unique ID to avoid collision with other lists
            word: item.word || item.name,
            brief:
              item.brief ||
              item.translate ||
              item.meaning ||
              item.definition ||
              "",
          }))
          .filter((w: WordItem) => w.word && w.brief);

        if (newWords.length === 0) {
          alert(
            "未发现有效单词数据。请确保上传的是包含 word 和 brief 字段的JSON数组。",
          );
          return;
        }

        const newId = "lib_" + Date.now();
        const newLib = {
          id: newId,
          name: file.name.replace(/\.[^/.]+$/, ""),
          words: newWords,
        };
        const updatedLibs = [...customLibraries, newLib];
        setCustomLibraries(updatedLibs);
        localStorage.setItem("customLibraries", JSON.stringify(updatedLibs));
        setActiveLibraryId(newId);
        localStorage.setItem("activeLibraryId", newId);
        setCurrentPage(1);
        alert(`成功导入 ${newWords.length} 个单词！`);
      } catch (err) {
        alert("导入失败：请确保上传的是合法的JSON格式文件");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const activeWordsList =
    activeLibraryId === "default"
      ? wordsList
      : customLibraries.find((lib) => lib.id === activeLibraryId)?.words ||
        wordsList;

  useEffect(() => {
    const stored = localStorage.getItem("masteredWords");
    if (stored) {
      try {
        setMasteredWords(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const toggleMastered = (id: number) => {
    setMasteredWords((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      localStorage.setItem("masteredWords", JSON.stringify(next));
      return next;
    });
  };

  const displayWordsList = useMemo(() => {
    let list = [...activeWordsList];
    if (sortMode === "alpha") {
      list.sort((a, b) => a.word.toLowerCase().localeCompare(b.word.toLowerCase()));
    } else if (sortMode === "random") {
      list.sort(() => Math.random() - 0.5);
    }
    return list;
  }, [activeWordsList, sortMode, randomSeed]);

  const filteredWords = displayWordsList.filter((w) => {
    if (viewMode === "mastered" && !masteredWords[w.id]) return false;
    if (searchQuery.trim() !== "") {
      const query = searchQuery.trim().toLowerCase();
      if (!w.word.toLowerCase().includes(query)) return false;
    }
    return true;
  });

  const cycleTheme = () => {
    setTheme((prev) => {
      let next: "light" | "dark" | "brutal" | "elegant" = "light";
      if (prev === "light") next = "dark";
      else if (prev === "dark") next = "brutal";
      else if (prev === "brutal") next = "elegant";
      else next = "light";

      document.documentElement.classList.remove("dark", "brutal", "elegant");
      if (next !== "light") {
        document.documentElement.classList.add(next);
      }
      localStorage.setItem("theme", next);
      return next;
    });
  };

  const toggleAppMode = () => {
    const nextMode = appMode === "offline" ? "api" : "offline";
    setAppMode(nextMode);
    localStorage.setItem("appMode", nextMode);
  };

  const toggleVoiceGender = () => {
    const nextGender = voiceGender === "female" ? "male" : "female";
    setVoiceGender(nextGender);
    localStorage.setItem("voiceGender", nextGender);
  };

  const handleSaveApiConfig = (config: ApiConfig) => {
    setApiConfig(config);
    localStorage.setItem("apiConfig", JSON.stringify(config));
  };

  const toggleSortMode = () => {
    const nextMode = sortMode === "alpha" ? "random" : "alpha";
    setSortMode(nextMode);
    localStorage.setItem("sortMode", nextMode);
    if (nextMode === "random") {
      setRandomSeed((s) => s + 1);
    }
    setCurrentPage(1);
  };

  const totalPages = Math.max(
    1,
    Math.ceil(filteredWords.length / WORDS_PER_PAGE),
  );
  const activePage = Math.min(currentPage, totalPages);

  const [pageInputValue, setPageInputValue] = useState(activePage.toString());

  useEffect(() => {
    setPageInputValue(activePage.toString());
  }, [activePage]);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(e.target.value);
  };

  const handlePageInputSubmit = () => {
    let newPage = parseInt(pageInputValue, 10);
    if (isNaN(newPage) || newPage < 1) {
      newPage = activePage;
    } else if (newPage > totalPages) {
      newPage = totalPages;
    }
    setCurrentPage(newPage);
    setPageInputValue(newPage.toString());
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handlePageInputSubmit();
      e.currentTarget.blur();
    }
  };

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const startIndex = (activePage - 1) * WORDS_PER_PAGE;
  const currentWords = filteredWords.slice(
    startIndex,
    startIndex + WORDS_PER_PAGE,
  );

  const handleNextPage = () => {
    if (activePage < totalPages) setCurrentPage(activePage + 1);
  };

  const handlePrevPage = () => {
    if (activePage > 1) setCurrentPage(activePage - 1);
  };

  return (
    <div className="h-screen w-full bg-study-pattern text-slate-900 dark:text-slate-100 brutal:text-black elegant:text-[#f4f1ea] font-sans flex flex-col overflow-hidden relative transition-colors duration-300">
      {/* Header Section */}
      <header className="bg-white/90 dark:bg-slate-900/90 brutal:bg-[#ffd803]/90 elegant:bg-[#0c0d10]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 brutal:border-black brutal:border-b-[4px] elegant:border-[#d4af37]/30 flex flex-col md:flex-row flex-wrap items-center justify-between px-2 py-3 sm:px-4 md:px-8 min-h-[4rem] shrink-0 shadow-sm elegant:shadow-[0_4px_30px_rgba(0,0,0,0.8)] relative z-20 gap-3 transition-colors duration-300">
        
        {/* Logo & Library Section */}
        <div className="flex items-center justify-between w-full md:w-auto gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 brutal:bg-black brutal:text-[#ffd803] elegant:bg-[#d4af37] elegant:text-[#0c0d10] flex items-center justify-center text-white font-bold rounded-sm shrink-0">
              <BookOpen size={16} />
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 brutal:text-black elegant:text-[#d4af37] elegant:font-serif elegant:tracking-widest hidden sm:block whitespace-nowrap">
              LEXI<span className="text-blue-600 dark:text-blue-400 brutal:text-[#ff3366] elegant:text-[#f4f1ea]">3000</span>
            </h1>

            <div className="flex items-center gap-1 sm:gap-2 sm:ml-2 sm:pl-2 sm:border-l border-slate-200 dark:border-slate-700 brutal:border-black elegant:border-[#d4af37]/30">
              <select
                className="text-xs sm:text-sm border-none bg-transparent font-bold cursor-pointer text-slate-700 dark:text-slate-200 brutal:text-black brutal:dark:text-black elegant:text-[#d4af37] elegant:dark:text-[#d4af37] hover:text-blue-600 dark:hover:text-blue-400 brutal:hover:text-[#ff3366] elegant:hover:text-[#f1df87] dark:bg-slate-800 brutal:dark:bg-transparent elegant:dark:bg-[#0c0d10] transition-colors focus:ring-0 max-w-[100px] sm:max-w-xs truncate"
                value={activeLibraryId}
                onChange={(e) => {
                  setActiveLibraryId(e.target.value);
                  localStorage.setItem("activeLibraryId", e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="default">默认 CET4 (3000词)</option>
                {customLibraries.map((lib) => (
                  <option key={lib.id} value={lib.id}>
                    {lib.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 brutal:text-black brutal:shadow-[2px_2px_0_0_#000] brutal:border brutal:border-black brutal:hover:bg-white brutal:active:shadow-[0_0_0_0_#000] brutal:active:translate-y-[2px] brutal:active:translate-x-[2px] elegant:text-[#d4af37] elegant:border elegant:border-[#d4af37]/30 elegant:hover:bg-[#d4af37]/10 elegant:rounded-full hover:bg-blue-50 dark:hover:bg-slate-800 rounded-md brutal:rounded-none transition-colors"
                title="导入词库 JSON 文件"
              >
                <Upload size={14} className="sm:w-4 sm:h-4" />
              </button>
              <input
                type="file"
                accept=".json"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImport}
              />
            </div>
          </div>
          
          {/* Mobile Progress (Hidden on Desktop) */}
          <div className="md:hidden flex flex-col items-end shrink-0">
            <span className="text-[9px] uppercase tracking-widest text-slate-400 brutal:text-black font-bold">
              Pg {activePage}/{totalPages}
            </span>
            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 brutal:bg-white rounded-full mt-1 overflow-hidden border border-slate-200/50 brutal:border-2 brutal:border-black brutal:rounded-none">
              <div
                className="h-full bg-blue-600 brutal:bg-[#ff3366] transition-all duration-500"
                style={{ width: `${(activePage / totalPages) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:flex-1 md:max-w-[200px] lg:max-w-xs mx-0 md:mx-4 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-slate-400 sm:w-4 sm:h-4" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-9 py-2 border border-slate-200 dark:border-slate-700 brutal:border-black brutal:border-[3px] elegant:border-[#d4af37]/40 rounded-lg brutal:rounded-none elegant:rounded-[4px] bg-slate-50 dark:bg-slate-800 brutal:bg-white elegant:bg-[#1a1c23] text-xs sm:text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 brutal:focus:ring-0 elegant:focus:ring-1 elegant:focus:ring-[#d4af37] focus:border-blue-500 dark:focus:border-blue-500 brutal:focus:border-[#ff3366] elegant:focus:border-[#d4af37] brutal:shadow-[4px_4px_0_0_#000] elegant:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all shadow-sm dark:text-slate-200 brutal:text-black elegant:text-[#f4f1ea] placeholder:text-gray-400 brutal:placeholder:text-gray-600 elegant:placeholder:text-[#d4af37]/50"
            placeholder="搜索单词..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
            >
              <X size={14} className="sm:w-4 sm:h-4" />
            </button>
          )}
        </div>

        {/* Actions & Toggles Container */}
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between sm:justify-start w-full md:w-auto gap-2 lg:gap-3 shrink-0">
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* App Mode Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800/50 brutal:bg-white elegant:bg-transparent brutal:border-2 elegant:border-none brutal:border-black brutal:rounded-none elegant:rounded-none brutal:p-0 elegant:p-0 brutal:shadow-[2px_2px_0_0_#000] elegant:shadow-none elegant:gap-2 p-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50 flex-shrink-0">
              <button
                onClick={toggleAppMode}
                className={`px-2 py-1.5 rounded-md brutal:rounded-none elegant:rounded-full elegant:border elegant:border-[#d4af37]/30 flex items-center justify-center transition-colors shadow-sm elegant:shadow-none gap-1.5 ${appMode === 'offline' ? 'bg-amber-100 dark:bg-amber-900/50 elegant:bg-[#d4af37]/20 elegant:text-[#d4af37] text-amber-600 dark:text-amber-400 brutal:bg-[#ffd803] brutal:text-black' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 brutal:bg-blue-300 brutal:text-black elegant:text-[#a39b8b] elegant:bg-transparent'}`}
                title={appMode === 'offline' ? "当前: 单机模式" : "当前: API模式"}
              >
                {appMode === 'offline' ? <WifiOff size={14} /> : <Wifi size={14} />}
                <span className="text-[10px] sm:text-xs font-bold">{appMode === 'offline' ? '单机' : 'API'}</span>
              </button>
              {appMode === 'api' && (
                <button
                  onClick={() => setIsApiConfigOpen(true)}
                  className="px-2 py-1.5 rounded-md brutal:rounded-none text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 brutal:hover:bg-[#ff3366] brutal:hover:text-black brutal:text-black brutal:border-l-2 brutal:border-black transition-colors shadow-sm ml-1 brutal:ml-0 border-l border-slate-200/50 dark:border-slate-700/50"
                  title="API设置"
                >
                  <Settings size={14} />
                </button>
              )}
            </div>

            {/* General Toggles */}
            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50 flex-shrink-0 brutal:bg-white brutal:border-2 brutal:border-black brutal:rounded-none brutal:p-0 brutal:shadow-[2px_2px_0_0_#000] elegant:bg-transparent elegant:border-none elegant:shadow-none elegant:p-0 elegant:gap-2">
              <button
                onClick={toggleVoiceGender}
                className="px-2 py-1.5 rounded-md brutal:rounded-none elegant:rounded-[4px] flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 brutal:text-black brutal:hover:bg-[#ffeb3b] brutal:hover:text-black elegant:bg-[#1a1c23] elegant:border elegant:border-[#d4af37]/30 elegant:text-[#d4af37] elegant:hover:bg-[#d4af37]/10 transition-colors shadow-sm elegant:shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                title={voiceGender === "female" ? "当前女声" : "当前男声"}
              >
                {voiceGender === "female" ? <UserRound size={14} /> : <User size={14} />}
                <span className="hidden sm:inline-block text-[10px] font-bold">{voiceGender === "female" ? '女声' : '男声'}</span>
              </button>
              <button
                onClick={toggleSortMode}
                className="px-2 py-1.5 rounded-md brutal:rounded-none elegant:rounded-[4px] flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 brutal:text-black brutal:border-l-2 brutal:border-black brutal:hover:bg-[#ffeb3b] brutal:hover:text-black elegant:bg-[#1a1c23] elegant:text-[#d4af37] elegant:border elegant:border-[#d4af37]/30 elegant:hover:bg-[#d4af37]/10 transition-colors shadow-sm border-l border-slate-200/50 dark:border-slate-700/50 ml-1 brutal:ml-0 elegant:ml-0 elegant:shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                title={sortMode === "alpha" ? "按字母排序" : "随机打乱"}
              >
                {sortMode === "alpha" ? <ArrowDownAZ size={14} /> : <Shuffle size={14} />}
                <span className="hidden sm:inline-block text-[10px] font-bold">{sortMode === "alpha" ? 'A-Z' : '随机'}</span>
              </button>
              <button
                onClick={cycleTheme}
                className="px-2 py-1.5 rounded-md brutal:rounded-none elegant:rounded-[4px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 brutal:text-slate-900 brutal:hover:text-black brutal:border-l-2 brutal:border-black elegant:border-l elegant:border-[#d4af37]/30 elegant:text-[#d4af37] elegant:hover:text-[#f1df87] brutal:bg-white elegant:bg-transparent hover:bg-white dark:hover:bg-slate-700 brutal:hover:bg-[#ffeb3b] elegant:hover:bg-[#d4af37]/10 transition-colors shadow-sm border-l border-slate-200/50 dark:border-slate-700/50 ml-1 brutal:ml-0 elegant:ml-1"
                title={`切换主题 (当前: ${theme === 'light' ? '亮色' : theme === 'dark' ? '暗色' : theme === 'brutal' ? '高对比' : '奢华'})`}
              >
                {theme === "light" ? <Sun size={14} /> : theme === "dark" ? <Moon size={14} /> : theme === "brutal" ? <div className="w-3.5 h-3.5 bg-black border-2 border-white mix-blend-difference rounded-sm" /> : <Gem size={14} />}
              </button>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50 flex-shrink-0 ml-auto md:ml-0 brutal:bg-white brutal:border-2 brutal:border-black brutal:rounded-none brutal:p-0 brutal:shadow-[2px_2px_0_0_#000] elegant:bg-transparent elegant:border-none elegant:p-0 elegant:shadow-none elegant:gap-2">
            <button
               onClick={() => {
                 setViewMode("all");
                 setCurrentPage(1);
               }}
              className={`px-3 py-1 sm:py-1.5 rounded-md brutal:rounded-none text-[10px] sm:text-xs font-bold transition-colors ${viewMode === "all" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 brutal:bg-black brutal:text-[#ffd803] elegant:bg-[#d4af37]/10 elegant:text-[#d4af37] shadow-sm border border-slate-200/50 brutal:border-none elegant:border elegant:border-[#d4af37]/50 dark:border-slate-600" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 brutal:text-black elegant:text-[#a39b8b] elegant:hover:text-[#d4af37] brutal:hover:text-black brutal:hover:bg-[#ffeb3b]"}`}
            >
              全部
            </button>
            <button
              onClick={() => {
                setViewMode("mastered");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 sm:py-1.5 rounded-md brutal:rounded-none elegant:rounded-[4px] elegant:ml-2 text-[10px] sm:text-xs font-bold transition-colors flex items-center gap-1 min-w-[70px] sm:min-w-[80px] justify-center brutal:border-l-2 brutal:border-black ${viewMode === "mastered" ? "bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 brutal:bg-[#00e676] brutal:text-black elegant:bg-[#d4af37]/20 elegant:text-[#d4af37] elegant:border elegant:border-[#d4af37]/50 shadow-sm border border-emerald-200/50 brutal:border-none dark:border-emerald-800" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 brutal:hover:bg-[#ffeb3b] brutal:text-black brutal:hover:text-black elegant:text-[#a39b8b] elegant:hover:text-[#d4af37] elegant:border elegant:border-transparent"}`}
            >
              已掌握
              <span
                className={`text-[9px] px-1 py-0.5 rounded-full brutal:rounded-none brutal:border brutal:border-black ${viewMode === "mastered" ? "bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 brutal:bg-black brutal:text-[#00e676] elegant:bg-[#d4af37]/30 elegant:text-[#d4af37]" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 brutal:bg-white brutal:text-black elegant:bg-[#1a1c23] elegant:text-[#a39b8b]"}`}
              >
                {Object.keys(masteredWords).length}
              </span>
            </button>
          </div>
        </div>

        {/* Desktop Progress */}
        <div className="hidden md:flex items-center gap-3 shrink-0 ml-1">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 brutal:text-black font-bold">
              Progress (Pg {activePage}/{totalPages})
            </span>
            <div className="w-32 lg:w-48 h-1.5 bg-slate-100 dark:bg-slate-800 brutal:bg-white rounded-full mt-1 overflow-hidden border border-slate-200/50 brutal:border-[2px] brutal:border-black brutal:rounded-none">
              <div
                className="h-full bg-blue-600 brutal:bg-[#ff3366] transition-all duration-500 brutal:border-r-[2px] brutal:border-black"
                style={{ width: `${(activePage / totalPages) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 brutal:bg-black brutal:w-[2px] hidden lg:block"></div>
          <div className="items-center gap-3 hidden lg:flex">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800">Learner</p>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                Goal: 3000 Words
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300"></div>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 flex overflow-hidden min-h-0">
        {/* Word Grid Area */}
        <div className="flex-1 p-3 sm:p-6 grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 sm:gap-4 overflow-y-auto content-start pb-24">
          {currentWords.length > 0 ? (
            currentWords.map((item) => {
              const isSelected = selectedWord?.word.id === item.id;
              const cleanWord = item.word.split(" (")[0].trim().toLowerCase();
              const phonetic =
                (phoneticsData as Record<string, string>)[cleanWord] ||
                `/${cleanWord}/`;
              const isMastered = !!masteredWords[item.id];
              return (
                <WordCard
                  key={item.id}
                  item={item}
                  phonetic={phonetic}
                  isSelected={isSelected}
                  isMastered={isMastered}
                  viewMode={viewMode}
                  appMode={appMode}
                  voiceGender={voiceGender}
                  onToggleMastered={() => toggleMastered(item.id)}
                  onOpenDetail={(rect) => setSelectedWord({ word: item, rect })}
                />
              );
            })
          ) : (
            <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-400 elegant:text-[#d4af37]/50">
              <BookOpen size={48} className="text-slate-300 mb-4 elegant:text-[#d4af37]" />
              <p className="text-lg sm:text-xl font-bold text-slate-500 elegant:text-[#a39b8b]">
                {viewMode === "mastered"
                  ? "暂未掌握任何单词，快去学习吧！"
                  : "没有找到相应的单词"}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Pagination Footer */}
      <footer className="h-12 sm:h-16 bg-white/90 dark:bg-slate-900/90 brutal:bg-[#ffd803]/90 elegant:bg-[#0c0d10]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 brutal:border-black brutal:border-t-4 elegant:border-[#d4af37]/30 flex flex-wrap items-center px-4 sm:px-8 py-2 gap-4 shrink-0 sm:justify-between justify-center z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] elegant:shadow-[0_-4px_30px_rgba(0,0,0,0.8)] transition-colors duration-300">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 brutal:text-black elegant:text-[#a39b8b] uppercase tracking-widest hidden sm:inline-block">
            Pages 1-{totalPages}:
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-xs sm:text-sm font-bold rounded-md brutal:rounded-none elegant:rounded-[4px] transition-colors ${activePage === 1 ? "bg-blue-600 text-white shadow-md brutal:bg-black brutal:text-[#ffd803] elegant:bg-[#d4af37] elegant:text-[#0c0d10] elegant:shadow-[0_0_15px_rgba(212,175,55,0.3)]" : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 brutal:text-black brutal:hover:bg-white border border-slate-200 dark:border-slate-700 brutal:bg-white brutal:border-2 brutal:border-black brutal:shadow-[2px_2px_0_0_#000] elegant:bg-transparent elegant:text-[#d4af37] elegant:border elegant:border-[#d4af37]/30 elegant:hover:bg-[#d4af37]/10"}`}
            >
              1
            </button>
            <span className="text-slate-300 dark:text-slate-600 brutal:text-black mx-1 sm:mx-2 elegant:text-[#d4af37]/50">
              <MoreHorizontal size={16} />
            </span>
            <div className="flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-slate-800 border-2 border-blue-100 dark:border-slate-700 brutal:border-black brutal:border-[3px] brutal:rounded-none elegant:rounded-[4px] rounded-md shadow-sm brutal:shadow-[4px_4px_0_0_#000] focus-within:border-blue-400 dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-transparent brutal:focus-within:ring-0 brutal:focus-within:border-[#ff3366] elegant:bg-[#1a1c23] elegant:border elegant:border-[#d4af37]/30 elegant:focus-within:border-[#d4af37] elegant:focus-within:ring-1 elegant:focus-within:ring-[#d4af37] transition-all">
              <span className="text-xs sm:text-base text-slate-500 dark:text-slate-400 brutal:text-black elegant:text-[#a39b8b] font-bold tracking-widest whitespace-nowrap mr-1 sm:mr-2">
                PAGE
              </span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={pageInputValue}
                onChange={handlePageInputChange}
                onBlur={handlePageInputSubmit}
                onKeyDown={handlePageInputKeyDown}
                className="w-8 sm:w-12 text-center text-blue-600 dark:text-blue-400 brutal:text-[#ff3366] elegant:text-[#d4af37] text-lg sm:text-xl font-bold bg-transparent outline-none p-0 focus:ring-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-0"
                style={{ MozAppearance: "textfield" }}
              />
            </div>
            <span className="text-slate-300 dark:text-slate-600 brutal:text-black mx-1 sm:mx-2 elegant:text-[#d4af37]/50">
              <MoreHorizontal size={16} />
            </span>
            <button
              onClick={() => setCurrentPage(totalPages)}
              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-xs sm:text-sm font-bold rounded-md brutal:rounded-none elegant:rounded-[4px] transition-colors ${activePage === totalPages ? "bg-blue-600 text-white shadow-md brutal:bg-black brutal:text-[#ffd803] elegant:bg-[#d4af37] elegant:text-[#0c0d10] elegant:shadow-[0_0_15px_rgba(212,175,55,0.3)]" : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 brutal:text-black brutal:hover:bg-white border border-slate-200 dark:border-slate-700 brutal:bg-white brutal:border-2 brutal:border-black brutal:shadow-[2px_2px_0_0_#000] elegant:bg-transparent elegant:text-[#d4af37] elegant:border elegant:border-[#d4af37]/30 elegant:hover:bg-[#d4af37]/10"}`}
            >
              {totalPages}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 brutal:text-black font-medium italic hidden sm:inline-block elegant:text-[#a39b8b]">
            Displaying words {filteredWords.length > 0 ? startIndex + 1 : 0} -{" "}
            {Math.min(startIndex + WORDS_PER_PAGE, filteredWords.length)} of{" "}
            {filteredWords.length}
          </span>
          <div className="flex gap-3">
            <button
              onClick={handlePrevPage}
              disabled={activePage === 1}
              className="px-6 py-2.5 flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 brutal:border-[3px] brutal:border-black rounded-full brutal:rounded-none elegant:rounded-full text-slate-700 dark:text-slate-300 brutal:text-black hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md brutal:hover:shadow-[4px_4px_0_0_#000] brutal:active:shadow-[0_0_0_0_#000] brutal:active:translate-x-[2px] brutal:active:translate-y-[2px] disabled:opacity-50 disabled:hover:border-slate-200 dark:disabled:hover:border-slate-700 disabled:hover:text-slate-700 dark:disabled:hover:text-slate-300 disabled:hover:shadow-none brutal:disabled:hover:shadow-none brutal:disabled:border-black brutal:shadow-[4px_4px_0_0_#000] brutal:hover:bg-white brutal:bg-white elegant:bg-transparent elegant:border elegant:border-[#d4af37]/30 elegant:text-[#d4af37] elegant:hover:bg-[#d4af37]/10 elegant:hover:border-[#d4af37] elegant:hover:text-[#f1df87] transition-all font-bold shadow-sm text-sm"
              style={{ minWidth: "120px" }}
            >
              <ChevronLeft size={18} strokeWidth={3} />
              <span>上一页</span>
            </button>
            <button
              onClick={handleNextPage}
              disabled={activePage === totalPages}
              className="px-6 py-2.5 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 brutal:bg-none brutal:bg-[#ffeb3b] brutal:border-[3px] brutal:border-black rounded-full brutal:rounded-none elegant:rounded-full text-white brutal:text-black hover:from-blue-700 hover:to-indigo-700 brutal:hover:bg-[#ff3366] hover:shadow-lg hover:shadow-blue-500/30 brutal:hover:shadow-[4px_4px_0_0_#000] brutal:active:shadow-[0_0_0_0_#000] brutal:active:translate-y-[2px] brutal:active:translate-x-[2px] disabled:opacity-50 disabled:hover:from-blue-600 disabled:hover:to-indigo-600 disabled:hover:shadow-sm brutal:disabled:hover:bg-[#ffeb3b] brutal:shadow-[4px_4px_0_0_#000] elegant:bg-[#d4af37] elegant:text-[#0c0d10] elegant:border-none elegant:hover:bg-[#f1df87] elegant:hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all font-bold shadow-md text-sm"
              style={{ minWidth: "120px" }}
            >
              <span>下一页</span>
              <ChevronRight size={18} strokeWidth={3} />
            </button>
          </div>
        </div>
      </footer>

      {/* Overlay Backdrop */}
      {selectedWord && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/10 backdrop-blur-sm transition-all"
          onClick={() => setSelectedWord(null)}
        />
      )}

      {/* Detail Modal / Floating Window */}
      {selectedWord && (
        <WordDetailModal
          word={selectedWord.word}
          triggerRect={selectedWord.rect}
          onClose={() => setSelectedWord(null)}
          appMode={appMode}
          apiConfig={apiConfig}
          voiceGender={voiceGender}
        />
      )}

      {/* API Config Modal */}
      <ApiConfigModal
        isOpen={isApiConfigOpen}
        onClose={() => setIsApiConfigOpen(false)}
        currentConfig={apiConfig}
        onSave={handleSaveApiConfig}
      />
    </div>
  );
}

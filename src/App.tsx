/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { wordsList, WordItem } from "./data/words";
import WordDetailModal from "./components/WordDetailModal";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Volume2,
  MoreHorizontal,
  Check,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import phoneticsData from "./data/phonetics.json";

const WORDS_PER_PAGE = 100;

function WordCard({
  item,
  phonetic,
  isSelected,
  isMastered,
  viewMode,
  onToggleMastered,
  onOpenDetail,
}: {
  item: WordItem;
  phonetic: string;
  isSelected: boolean;
  isMastered: boolean;
  viewMode: string;
  onToggleMastered: () => void;
  onOpenDetail: () => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddedMsg, setShowAddedMsg] = useState(false);
  const [shouldBlur, setShouldBlur] = useState(
    () => isMastered && viewMode !== "mastered",
  );
  const prevMasteredRef = useRef(isMastered);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const cleanWord = item.word.split(" (")[0];
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

  useEffect(() => {
    return () => {
      if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    };
  }, []);

  const handleCardClick = () => {
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
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenDetail();
  };

  const playPronunciation = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanWord);
      utterance.lang = "en-US";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full h-32 sm:h-36 cursor-pointer group"
      style={{ perspective: "1000px" }}
      onClick={handleCardClick}
      onDoubleClick={handleDoubleClick}
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
          className={`absolute inset-0 w-full h-full p-3 sm:p-4 rounded-xl flex flex-col transition-all duration-200 shadow-sm hover:shadow-md ${
            isMastered
              ? "bg-slate-100 border border-slate-200"
              : isSelected
                ? "bg-blue-50 border-2 border-blue-500 ring-2 ring-blue-200 ring-offset-1"
                : "bg-white border border-slate-200 hover:border-blue-400"
          }`}
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {/* Main content: Word and Phonetic on left, Sound button on right center */}
          <div className="flex items-center justify-between flex-1 min-h-0 min-w-0">
            <div className="flex flex-col justify-center min-w-0 flex-1 pr-3 overflow-hidden">
              <p
                className={`${item.word.length > 12 ? "text-base sm:text-lg" : item.word.length > 9 ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"} font-black leading-tight tracking-tight w-full overflow-x-auto whitespace-nowrap pb-1 ${isSelected ? "text-amber-600" : "text-slate-800"}`}
                style={{ scrollbarWidth: "none" }}
                title={item.word}
              >
                {item.word}
              </p>
              <p
                className="text-sm sm:text-base font-bold font-mono text-emerald-600 overflow-x-auto w-full whitespace-nowrap mt-1 pb-1"
                style={{ scrollbarWidth: "none" }}
                title={phonetic}
              >
                {phonetic}
              </p>
            </div>

            <button
              onClick={playPronunciation}
              className={`p-2 sm:p-2.5 rounded-full z-10 transition-all flex-shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md active:scale-95`}
              aria-label={`Pronounce ${item.word}`}
            >
              <Volume2 size={22} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex items-end justify-end mt-2 pt-2 border-t border-slate-100 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleMastered();
              }}
              className={`h-8 overflow-hidden flex items-center justify-center transition-all duration-300 shadow-sm active:scale-95 z-10 ${
                showAddedMsg ? "px-3 rounded-full" : "w-8 rounded-full"
              } ${
                isMastered
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200/50"
                  : isSelected
                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200/50"
                    : "bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-700"
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
          className="absolute inset-0 w-full h-full p-2 sm:p-3 rounded-xl flex flex-col justify-between shadow-md bg-emerald-50 border-2 border-emerald-300"
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
            <p className="text-base sm:text-lg font-black text-emerald-800 leading-snug break-words">
              {item.brief}
            </p>
          </div>
          <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-emerald-200/60 shrink-0">
            <span className="text-xs text-emerald-600/80 font-bold break-words pr-2">
              {cleanWord}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail();
              }}
              className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-md hover:bg-emerald-700 transition-colors shadow-sm whitespace-nowrap"
            >
              Details
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWord, setSelectedWord] = useState<WordItem | null>(null);
  const [masteredWords, setMasteredWords] = useState<Record<number, boolean>>(
    {},
  );
  const [viewMode, setViewMode] = useState<"all" | "mastered">("all");

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

  const filteredWords =
    viewMode === "mastered"
      ? wordsList.filter((w) => masteredWords[w.id])
      : wordsList;

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
    <div className="h-screen w-full bg-study-pattern text-slate-900 font-sans flex flex-col overflow-hidden relative">
      {/* Header Section */}
      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 shadow-sm relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 flex items-center justify-center text-white font-bold rounded-sm">
            <BookOpen size={16} />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-800 hidden sm:block">
            LEXI<span className="text-blue-600">3000</span>
          </h1>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/50 flex-shrink-0 mx-2 sm:mx-6">
          <button
            onClick={() => {
              setViewMode("all");
              setCurrentPage(1);
            }}
            className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-colors ${viewMode === "all" ? "bg-white text-blue-600 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700"}`}
          >
            全部单词
          </button>
          <button
            onClick={() => {
              setViewMode("mastered");
              setCurrentPage(1);
            }}
            className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 min-w-[90px] justify-center ${viewMode === "mastered" ? "bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-200/50" : "text-slate-500 hover:text-slate-700"}`}
          >
            已掌握
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${viewMode === "mastered" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}
            >
              {Object.keys(masteredWords).length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Progress (Pg {activePage}/{totalPages})
            </span>
            <div className="w-24 sm:w-48 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${(activePage / totalPages) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-200"></div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">Learner</p>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                Goal: 3000 Words
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300"></div>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Word Grid Area */}
        <div className="flex-1 p-3 sm:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 overflow-y-auto content-start pb-24">
          {currentWords.length > 0 ? (
            currentWords.map((item) => {
              const isSelected = selectedWord?.id === item.id;
              const cleanWord = item.word.split(" (")[0];
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
                  onToggleMastered={() => toggleMastered(item.id)}
                  onOpenDetail={() => setSelectedWord(item)}
                />
              );
            })
          ) : (
            <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-400">
              <BookOpen size={48} className="text-slate-300 mb-4" />
              <p className="text-lg sm:text-xl font-bold text-slate-500">
                {viewMode === "mastered"
                  ? "暂未掌握任何单词，快去学习吧！"
                  : "没有找到相应的单词"}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Pagination Footer */}
      <footer className="h-12 sm:h-16 bg-white/90 backdrop-blur-md border-t border-slate-200 flex flex-wrap items-center px-4 sm:px-8 py-2 gap-4 shrink-0 sm:justify-between justify-center z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline-block">
            Pages 1-{totalPages}:
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-xs sm:text-sm font-bold rounded-md transition-colors ${activePage === 1 ? "bg-blue-600 text-white shadow-md" : "bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200"}`}
            >
              1
            </button>
            <span className="text-slate-300 mx-1 sm:mx-2">
              <MoreHorizontal size={16} />
            </span>
            <div className="flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white border-2 border-blue-100 rounded-md shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <span className="text-xs sm:text-base text-slate-500 font-bold tracking-widest whitespace-nowrap mr-1 sm:mr-2">
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
                className="w-8 sm:w-12 text-center text-blue-600 text-lg sm:text-xl font-bold bg-transparent outline-none p-0 focus:ring-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-0"
                style={{ MozAppearance: "textfield" }}
              />
            </div>
            <span className="text-slate-300 mx-1 sm:mx-2">
              <MoreHorizontal size={16} />
            </span>
            <button
              onClick={() => setCurrentPage(totalPages)}
              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-xs sm:text-sm font-bold rounded-md transition-colors ${activePage === totalPages ? "bg-blue-600 text-white shadow-md" : "bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200"}`}
            >
              {totalPages}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <span className="text-[10px] text-slate-400 font-medium italic hidden sm:inline-block">
            Displaying words {filteredWords.length > 0 ? startIndex + 1 : 0} -{" "}
            {Math.min(startIndex + WORDS_PER_PAGE, filteredWords.length)} of{" "}
            {filteredWords.length}
          </span>
          <div className="flex gap-3">
            <button
              onClick={handlePrevPage}
              disabled={activePage === 1}
              className="px-6 py-2.5 flex items-center justify-center gap-2 bg-white border border-slate-200 rounded-full text-slate-700 hover:border-blue-400 hover:text-blue-600 hover:shadow-md disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-700 disabled:hover:shadow-none transition-all font-bold shadow-sm text-sm"
              style={{ minWidth: "120px" }}
            >
              <ChevronLeft size={18} strokeWidth={3} />
              <span>上一页</span>
            </button>
            <button
              onClick={handleNextPage}
              disabled={activePage === totalPages}
              className="px-6 py-2.5 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:hover:from-blue-600 disabled:hover:to-indigo-600 disabled:hover:shadow-sm transition-all font-bold shadow-md text-sm"
              style={{ minWidth: "120px" }}
            >
              <span>下一页</span>
              <ChevronRight size={18} strokeWidth={3} />
            </button>
          </div>
        </div>
      </footer>

      {/* Detail Modal / Sidebar Equivalent */}
      {selectedWord && (
        <WordDetailModal
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </div>
  );
}

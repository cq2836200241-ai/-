import { useEffect, useState, useRef } from "react";
import { WordItem } from "../data/words";
import {
  fetchWordDetails,
  fetchBriefWordExplanation,
  WordDetails,
  BriefWordInfo,
} from "../lib/gemini";
import phoneticsData from "../data/phonetics.json";
import { Volume2, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const ClickableSentence = ({
  text,
  onWordClick,
}: {
  text: string;
  onWordClick: (word: string, e: React.MouseEvent) => void;
}) => {
  const parts = text.split(/(\b\w+\b)/);
  return (
    <>
      {parts.map((part, index) => {
        if (/\b\w+\b/.test(part)) {
          return (
            <span
              key={index}
              className="cursor-pointer hover:bg-blue-100 hover:text-blue-900 rounded transition-colors"
              onClick={(e) => onWordClick(part, e)}
            >
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

import { ApiConfig } from "../lib/gemini";
import { speakText, cancelSpeech } from "../lib/speech";

export default function WordDetailModal({
  word,
  triggerRect,
  onClose,
  appMode,
  apiConfig,
  voiceGender,
}: {
  word: WordItem;
  triggerRect?: DOMRect;
  onClose: () => void;
  appMode: "offline" | "api";
  apiConfig: ApiConfig;
  voiceGender: "female" | "male";
}) {
  const [details, setDetails] = useState<WordDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const cleanWord = word.word.split(" (")[0].trim();
  const latestClickedWord = useRef<string>("");

  const modalWidth = 380;
  const modalHeight = 85 + (details?.examples ? 200 : 0); // approximate
  let modalLeft = 0;
  let modalTop = 0;

  if (triggerRect) {
    if (triggerRect.right + 16 + modalWidth <= window.innerWidth) {
      modalLeft = triggerRect.right + 16;
    } else if (triggerRect.left - 16 - modalWidth >= 0) {
      modalLeft = triggerRect.left - 16 - modalWidth;
    } else {
      modalLeft = (window.innerWidth - modalWidth) / 2;
    }

    modalTop = triggerRect.top;
    if (modalTop + modalHeight > window.innerHeight) {
      modalTop = Math.max(16, window.innerHeight - modalHeight - 16);
    }
  } else {
    modalLeft = (window.innerWidth - modalWidth) / 2;
    modalTop = (window.innerHeight - modalHeight) / 2;
  }

  const [popover, setPopover] = useState<{
    visible: boolean;
    word: string;
    x: number;
    y: number;
    loading: boolean;
    data?: BriefWordInfo;
  }>({ visible: false, word: "", x: 0, y: 0, loading: false });

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        if (appMode === "offline") {
          const defaultPhonetic = (phoneticsData as Record<string, string>)[cleanWord.toLowerCase()] || `/${cleanWord.toLowerCase()}/`;
          setDetails({
            phonetic: defaultPhonetic,
            definition: word.brief,
            examples: [],
            forms: [],
            mnemonic: "单机模式仅显示基础释义"
          });
        } else {
          const data = await fetchWordDetails(cleanWord, apiConfig);
          setDetails(data);
        }
      } catch (err: any) {
        setError("Failed to load details. Click retry, or check API Config.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [cleanWord, appMode, apiConfig]);

  const handleWordClick = async (clickedWord: string, e: React.MouseEvent) => {
    e.stopPropagation();
    latestClickedWord.current = clickedWord;
    const rect = (e.target as HTMLElement).getBoundingClientRect();

    cancelSpeech();
    speakText(clickedWord, "en-US", voiceGender);

    setPopover({
      visible: true,
      word: clickedWord,
      x: rect.left,
      y: rect.top - 8,
      loading: true,
      data: undefined,
    });

    try {
      if (appMode === "offline") {
        setPopover((prev) =>
          prev.word === clickedWord ? { ...prev, loading: false } : prev,
        );
        return;
      }
      
      const data = await fetchBriefWordExplanation(clickedWord, apiConfig);
      setPopover((prev) =>
        prev.word === clickedWord ? { ...prev, loading: false, data } : prev,
      );

      // Play Chinese pronunciation if this is still the active clicked word
      if (latestClickedWord.current === clickedWord) {
        speakText(data.definition, "zh-CN", voiceGender);
      }
    } catch (err) {
      setPopover((prev) =>
        prev.word === clickedWord ? { ...prev, loading: false } : prev,
      );
    }
  };

  const playPronunciation = () => {
    cancelSpeech();
    speakText(cleanWord, "en-US", voiceGender);
  };

  const imageUrl = `https://image.pollinations.ai/prompt/cute%20cartoon%20illustration%20teaching%20the%20English%20word%20"${cleanWord}"?width=400&height=300&nologo=true`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] pointer-events-none">
        {popover.visible && (
          <div
            className="fixed inset-0 z-[80] pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              setPopover((prev) => ({ ...prev, visible: false }));
            }}
          />
        )}
        {popover.visible && (
          <div
            className="fixed z-[90] bg-white dark:bg-slate-800 brutal:bg-white text-slate-800 dark:text-slate-200 brutal:text-black p-2 sm:p-3 rounded-lg brutal:rounded-none shadow-xl brutal:shadow-[4px_4px_0_0_#000] border border-slate-200 dark:border-slate-700 brutal:border-[3px] brutal:border-black pointer-events-none transform -translate-x-0 -translate-y-full w-48 sm:w-56 transition-colors duration-300"
            style={{
              left: Math.max(10, Math.min(window.innerWidth - 200, popover.x)),
              top: popover.y,
            }}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between border-b border-slate-100 dark:border-slate-700 pb-1 mb-1">
                <span className="font-bold text-sm sm:text-base text-blue-700 dark:text-blue-400 truncate pr-2">
                  {popover.word}
                </span>
                {!popover.loading && popover.data && (
                  <span className="text-[10px] sm:text-xs font-mono text-emerald-600 dark:text-emerald-400 truncate">
                    {popover.data.phonetic}
                  </span>
                )}
              </div>
              {popover.loading ? (
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 py-1">
                  <Loader2 size={12} className="animate-spin" />
                  <span className="text-[10px] sm:text-xs">Loading...</span>
                </div>
              ) : popover.data ? (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-snug">
                  {popover.data.definition}
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-red-400 dark:text-red-500">
                  Failed to load
                </p>
              )}
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="absolute bg-white dark:bg-slate-900 brutal:bg-white elegant:bg-[#16181d] border border-slate-200 dark:border-slate-800 brutal:border-[4px] brutal:border-black elegant:border-[#d4af37]/40 shadow-2xl brutal:shadow-[8px_8px_0_0_#000] elegant:shadow-[0_20px_60px_rgba(0,0,0,0.8)] rounded-xl brutal:rounded-none elegant:rounded-[4px] overflow-hidden pointer-events-auto flex flex-col transition-colors duration-300"
          style={{
            left: modalLeft,
            top: modalTop,
            width: modalWidth,
            height: "auto",
            maxHeight: "80vh",
          }}
        >
          {/* Header Actions */}
          <div className="absolute top-3 right-3 z-20">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-sm brutal:rounded-none bg-white dark:bg-slate-800 brutal:bg-[#ff3366] elegant:bg-transparent border border-slate-200 dark:border-slate-700 brutal:border-2 brutal:border-black elegant:border-none flex items-center justify-center text-slate-500 dark:text-slate-400 brutal:text-black elegant:text-[#d4af37] hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200 brutal:hover:bg-white elegant:hover:bg-[#d4af37]/10 shadow-sm brutal:shadow-[2px_2px_0_0_#000] elegant:shadow-none brutal:active:shadow-[0_0_0_0_#000] brutal:active:translate-x-[2px] brutal:active:translate-y-[2px] transition-all"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-6 sm:px-8 sm:py-8 flex flex-col gap-6 overflow-y-auto flex-1">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-500 elegant:text-[#a39b8b] mb-1 block">
                Selected Word
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-emerald-700 dark:text-emerald-400 elegant:text-[#d4af37] elegant:font-serif elegant:tracking-wide tracking-tight">
                {cleanWord}
              </h2>
              <div className="flex items-center gap-3 mt-4">
                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/50 brutal:bg-white brutal:border-2 brutal:border-black brutal:shadow-[2px_2px_0_0_#000] brutal:rounded-none elegant:bg-[#0c0d10] elegant:border-[#d4af37]/30 text-[13px] font-bold rounded-md border border-emerald-100 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 brutal:text-black elegant:text-[#d4af37] font-mono tracking-wide shadow-sm elegant:shadow-none">
                  {(phoneticsData as Record<string, string>)[cleanWord.toLowerCase()] || (details ? details.phonetic : `/${cleanWord.toLowerCase()}/`)}
                </span>
                <button
                  onClick={playPronunciation}
                  className="w-10 h-10 rounded-full brutal:rounded-none bg-blue-100 dark:bg-blue-900/50 brutal:bg-[#00e676] elegant:bg-[#d4af37] brutal:border-2 brutal:border-black elegant:border-none brutal:shadow-[2px_2px_0_0_#000] elegant:shadow-[0_0_20px_rgba(212,175,55,0.2)] brutal:active:shadow-[0_0_0_0_#000] brutal:active:translate-y-[2px] brutal:active:translate-x-[2px] flex items-center justify-center text-blue-700 dark:text-blue-400 brutal:text-black elegant:text-[#0c0d10] brutal:hover:bg-[#ffd803] elegant:hover:bg-[#f1df87] hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors shadow-sm transform hover:scale-105"
                  title="Listen to pronunciation"
                >
                  <Volume2
                    size={22}
                    fill="currentColor"
                    className="opacity-80"
                  />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500">
                <Loader2
                  size={24}
                  className="animate-spin mb-4 text-blue-600 dark:text-blue-500"
                />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Analyzing
                </p>
              </div>
            ) : error ? (
              <div className="py-8 text-center text-red-500 dark:text-red-400">
                <p className="text-sm font-medium">{error}</p>
                <button
                  onClick={() => setDetails(null)}
                  className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-[10px] uppercase tracking-widest rounded-sm hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Retry
                </button>
              </div>
            ) : details ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col flex-1">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 elegant:text-[#a39b8b] mb-1">
                      Meaning
                    </h4>
                    <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300 brutal:text-black elegant:text-[#f4f1ea]">
                      {details.definition}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 brutal:text-black elegant:text-[#a39b8b] mb-2">
                      Examples
                    </h4>
                    <div className="space-y-4">
                      {details.examples.map((ex, i) => (
                        <div
                          key={i}
                          className="pl-3 border-l-2 border-blue-200 dark:border-blue-800/50 brutal:border-black brutal:border-l-[4px] elegant:border-l elegant:border-[#d4af37]/30 group cursor-default"
                          onMouseEnter={() => {
                            cancelSpeech();
                            speakText(typeof ex === "string" ? ex : ex.en, "en-US", voiceGender);
                          }}
                        >
                          <div className="flex gap-2">
                            <span className="text-slate-400 dark:text-slate-600 elegant:text-[#d4af37]/50 font-bold text-sm select-none">
                              {i + 1}.
                            </span>
                            <div className="space-y-1">
                              <p className="text-sm sm:text-base font-medium leading-relaxed text-slate-800 dark:text-slate-200 brutal:text-black elegant:text-[#f4f1ea] transition-colors group-hover:text-blue-700 dark:group-hover:text-blue-400 brutal:group-hover:text-[#ff3366] elegant:group-hover:text-[#d4af37]">
                                <ClickableSentence
                                  text={typeof ex === "string" ? ex : ex.en}
                                  onWordClick={handleWordClick}
                                />
                              </p>
                              {typeof ex !== "string" && (
                                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-500 brutal:text-slate-800 elegant:text-[#a39b8b] leading-relaxed shadow-sm">
                                  {ex.zh}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {details.forms && details.forms.length > 0 && (
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 brutal:text-black elegant:text-[#a39b8b] mb-2">
                      Morphology
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {details.forms.map((form, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 brutal:bg-white brutal:border-2 brutal:border-black brutal:shadow-[2px_2px_0_0_#000] rounded-sm brutal:rounded-none elegant:rounded-[4px] elegant:bg-[#1a1c23] elegant:border elegant:border-[#d4af37]/30 elegant:shadow-none text-[9px] font-bold text-slate-600 dark:text-slate-400 brutal:text-black elegant:text-[#d4af37] tracking-wider uppercase"
                        >
                          {form}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {details.mnemonic && (
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 brutal:text-black elegant:text-[#a39b8b] mb-2">
                      Memory Anchor
                    </h4>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/30 brutal:bg-[#ffeb3b] elegant:bg-[#1a1c23] brutal:border-4 brutal:border-black brutal:shadow-[4px_4px_0_0_#000] border-l-4 border-amber-400 dark:border-amber-600 elegant:border-l elegant:border-[#d4af37] elegant:border-l-[2px] rounded-r-md brutal:rounded-none text-amber-900 dark:text-amber-200 brutal:text-black elegant:text-[#f4f1ea] elegant:shadow-[0_4px_15px_rgba(212,175,55,0.1)] text-sm leading-relaxed font-medium shadow-sm">
                      {details.mnemonic}
                    </div>
                  </div>
                )}

                {appMode === "api" && (
                  <div className="mt-8 mb-4 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-sm flex flex-col items-center justify-center p-2 relative overflow-hidden group min-h-[140px] elegant:border-[#d4af37]/30 elegant:bg-[#0c0d10]">
                    <img
                      src={imageUrl}
                      alt={cleanWord}
                      className="absolute inset-0 w-full h-full object-cover select-none mix-blend-multiply opacity-70 transition-opacity group-hover:opacity-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="relative z-10 p-1.5 px-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded border border-slate-200 dark:border-slate-700 elegant:bg-[#111318]/90 elegant:border-[#d4af37]/30 text-[9px] font-bold tracking-widest uppercase text-slate-600 dark:text-slate-400 elegant:text-[#d4af37] shadow-sm">
                      Visual Reference
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Action Footer */}
          {details && (
            <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 brutal:border-t-[4px] brutal:border-black brutal:bg-[#ffeb3b] elegant:bg-[#111318] elegant:border-[#d4af37]/30">
              <button
                onClick={onClose}
                className="w-full py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm brutal:bg-white brutal:text-black brutal:border-[4px] brutal:border-black brutal:shadow-[4px_4px_0_0_#000] brutal:rounded-none brutal:hover:bg-[#00e676] brutal:active:shadow-[0_0_0_0_#000] brutal:active:translate-y-[2px] brutal:active:translate-x-[2px] elegant:bg-transparent elegant:text-[#d4af37] elegant:border elegant:border-[#d4af37]/50 elegant:shadow-none elegant:hover:bg-[#d4af37] elegant:hover:text-[#0c0d10]"
              >
                Mark as Learned
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

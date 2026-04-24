import { useEffect, useState } from 'react';
import { WordItem } from '../data/words';
import { fetchWordDetails, WordDetails } from '../lib/gemini';
import { Volume2, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function WordDetailModal({ word, onClose }: { word: WordItem, onClose: () => void }) {
  const [details, setDetails] = useState<WordDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const cleanWord = word.word.split(' (')[0];

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchWordDetails(cleanWord);
        setDetails(data);
      } catch (err: any) {
        setError('Failed to load details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [cleanWord]);

  const playPronunciation = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanWord);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const imageUrl = `https://image.pollinations.ai/prompt/cute%20cartoon%20illustration%20teaching%20the%20English%20word%20"${cleanWord}"?width=400&height=300&nologo=true`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          className="bg-white border-l border-slate-200 shadow-2xl w-full max-w-sm sm:max-w-md h-full overflow-hidden relative z-10 flex flex-col pt-0"
        >
          {/* Header Actions */}
          <div className="absolute top-4 right-4 z-20">
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-sm bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-6 sm:px-8 sm:py-8 flex flex-col gap-6 overflow-y-auto flex-1">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 mb-1 block">Selected Word</span>
              <h2 className="text-4xl sm:text-5xl font-black text-emerald-700 tracking-tight">{cleanWord}</h2>
              <div className="flex items-center gap-3 mt-4">
                <span className="px-3 py-1 bg-emerald-50 text-[13px] font-bold rounded-md border border-emerald-100 text-emerald-700 font-mono tracking-wide shadow-sm">
                  {details ? details.phonetic : '/.../'}
                </span>
                <button 
                  onClick={playPronunciation}
                  className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 hover:bg-blue-200 transition-colors shadow-sm transform hover:scale-105"
                  title="Listen to pronunciation"
                >
                  <Volume2 size={22} fill="currentColor" className="opacity-80" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Loader2 size={24} className="animate-spin mb-4 text-blue-600" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Analyzing</p>
              </div>
            ) : error ? (
              <div className="py-8 text-center text-red-500">
                <p className="text-sm font-medium">{error}</p>
                <button 
                  onClick={() => setDetails(null)} 
                  className="mt-4 px-4 py-2 bg-slate-100 text-slate-900 font-bold text-[10px] uppercase tracking-widest rounded-sm hover:bg-slate-200"
                >
                  Retry
                </button>
              </div>
            ) : details ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col flex-1">
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-1">Meaning</h4>
                    <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-700">{details.definition}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-2">Examples</h4>
                    <div className="space-y-3">
                      {details.examples.map((ex, i) => (
                        <div key={i} className="pl-3 border-l-2 border-blue-200">
                          <p className="text-[11px] sm:text-xs italic leading-relaxed text-slate-600">"{ex}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {details.forms && details.forms.length > 0 && (
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-2">Morphology</h4>
                    <div className="flex flex-wrap gap-2">
                       {details.forms.map((form, i) => (
                          <span key={i} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-sm text-[9px] font-bold text-slate-600 tracking-wider uppercase">
                            {form}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {details.mnemonic && (
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-2">Memory Anchor</h4>
                    <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-md text-amber-900 text-sm leading-relaxed font-medium shadow-sm">
                      {details.mnemonic}
                    </div>
                  </div>
                )}

                <div className="mt-8 mb-4 bg-slate-50 border border-dashed border-slate-300 rounded-sm flex flex-col items-center justify-center p-2 relative overflow-hidden group min-h-[140px]">
                  <img 
                    src={imageUrl} 
                    alt={cleanWord}
                    className="absolute inset-0 w-full h-full object-cover select-none mix-blend-multiply opacity-70 transition-opacity group-hover:opacity-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="relative z-10 p-1.5 px-3 bg-white/90 backdrop-blur-sm rounded border border-slate-200 text-[9px] font-bold tracking-widest uppercase text-slate-600 shadow-sm">
                    Visual Reference
                  </div>
                </div>

              </div>
            ) : null}
          </div>
          
          {/* Action Footer */}
          {details && (
            <div className="p-4 sm:p-6 bg-white border-t border-slate-100 shrink-0">
               <button 
                 onClick={onClose}
                 className="w-full py-3 bg-blue-600 text-white rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-sm"
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

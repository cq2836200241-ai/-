import { useState, useEffect } from "react";
import { X, Check, Server, Key, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ApiConfig } from "../lib/gemini";

export default function ApiConfigModal({
  isOpen,
  onClose,
  currentConfig,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: ApiConfig;
  onSave: (config: ApiConfig) => void;
}) {
  const [config, setConfig] = useState<ApiConfig>(currentConfig);

  useEffect(() => {
    setConfig(currentConfig);
  }, [currentConfig, isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-slate-900 brutal:bg-[#ffd803] w-full max-w-md rounded-2xl brutal:rounded-none shadow-2xl brutal:shadow-[8px_8px_0_0_#000] overflow-hidden border border-slate-200 dark:border-slate-800 brutal:border-[4px] brutal:border-black"
        >
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 brutal:border-black brutal:border-b-[4px]">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 brutal:text-black flex items-center gap-2">
              <Server size={20} className="text-blue-500 brutal:text-black" />
              Custom API Settings
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 brutal:text-black brutal:hover:text-[#ff3366] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4 brutal:bg-white border-b brutal:border-black brutal:border-b-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 brutal:text-black flex items-center gap-1.5">
                <Server size={14} className="text-slate-400 brutal:text-black" />
                API Base URL
              </label>
              <input
                type="text"
                placeholder="e.g. https://api.openai.com/v1"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 brutal:bg-white border border-slate-200 dark:border-slate-700 brutal:border-2 brutal:border-black rounded-lg brutal:rounded-none text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 brutal:focus:ring-0 brutal:focus:border-[#ff3366] transition-all dark:text-slate-200 brutal:text-black brutal:shadow-[4px_4px_0_0_#000]"
                value={config.baseUrl || ""}
                onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 brutal:text-slate-600">
                Leave empty to use the default Gemini API endpoint. For custom APIs, provide the base URL compatible with OpenAI (must support `/chat/completions`).
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 brutal:text-black flex items-center gap-1.5">
                <Key size={14} className="text-slate-400 brutal:text-black" />
                API Key
              </label>
              <input
                type="password"
                placeholder="sk-..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 brutal:bg-white border border-slate-200 dark:border-slate-700 brutal:border-2 brutal:border-black rounded-lg brutal:rounded-none text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 brutal:focus:ring-0 brutal:focus:border-[#ff3366] transition-all dark:text-slate-200 brutal:text-black brutal:shadow-[4px_4px_0_0_#000]"
                value={config.apiKey || ""}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 brutal:text-black flex items-center gap-1.5">
                <BrainCircuit size={14} className="text-slate-400 brutal:text-black" />
                Model Name
              </label>
              <input
                type="text"
                placeholder="e.g. gpt-4o-mini"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 brutal:bg-white border border-slate-200 dark:border-slate-700 brutal:border-2 brutal:border-black rounded-lg brutal:rounded-none text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 brutal:focus:ring-0 brutal:focus:border-[#ff3366] transition-all dark:text-slate-200 brutal:text-black brutal:shadow-[4px_4px_0_0_#000]"
                value={config.model || ""}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
              />
            </div>
          </div>

          <div className="px-4 py-4 sm:px-6 sm:py-5 border-t border-slate-100 dark:border-slate-800 brutal:border-none bg-slate-50 dark:bg-slate-900/50 brutal:bg-transparent flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg brutal:rounded-none text-sm font-bold text-slate-600 dark:text-slate-400 brutal:text-black hover:bg-slate-200 dark:hover:bg-slate-800 brutal:hover:bg-white brutal:border-2 brutal:border-transparent brutal:hover:border-black transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSave(config);
                onClose();
              }}
              className="px-4 py-2 rounded-lg brutal:rounded-none text-sm font-bold bg-blue-600 brutal:bg-black text-white hover:bg-blue-700 brutal:hover:bg-[#ff3366] transition-colors flex items-center gap-1.5 shadow-sm brutal:shadow-[4px_4px_0_0_rgba(0,0,0,1)] brutal:active:shadow-[0_0_0_0_rgba(0,0,0,1)] brutal:active:translate-y-[4px] brutal:active:translate-x-[4px] brutal:border-2 brutal:border-black"
            >
              <Check size={16} />
              Save Settings
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

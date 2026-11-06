import React from 'react';
import { Sparkles, X, Brain } from 'lucide-react';

interface MemoryToastProps {
  fact: string;
  onOpenMemoryModal: () => void;
  onDismiss: () => void;
}

export const MemoryToast: React.FC<MemoryToastProps> = ({
  fact,
  onOpenMemoryModal,
  onDismiss,
}) => {
  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-40 max-w-sm sm:max-w-md animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="p-3 rounded-2xl bg-gradient-to-r from-neutral-900 via-[#161224] to-neutral-900 border border-purple-500/40 shadow-2xl shadow-purple-950/40 backdrop-blur-md flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Sparkles size={14} className="animate-spin text-purple-300" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-bold text-purple-300 tracking-wider flex items-center gap-1">
              <span>Memorie actualizată</span>
            </div>
            <p className="text-neutral-200 font-medium truncate mt-0.5 max-w-[220px] sm:max-w-[260px]">
              {fact}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenMemoryModal}
            className="px-2.5 py-1 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-white font-medium text-[11px] transition-colors cursor-pointer flex items-center gap-1"
          >
            <Brain size={12} />
            <span>Vezi</span>
          </button>
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

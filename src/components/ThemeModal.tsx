import React from 'react';
import { X, Check, Palette, Sparkles, Moon, Sun, Zap, Terminal, Flame } from 'lucide-react';
import { ThemeId, ThemeConfig } from '../types';
import { THEMES } from '../constants/themes';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'Moon':
        return <Moon size={16} className="text-purple-400" />;
      case 'Sun':
        return <Sun size={16} className="text-amber-500" />;
      case 'Zap':
        return <Zap size={16} className="text-yellow-400" />;
      case 'Terminal':
        return <Terminal size={16} className="text-emerald-400" />;
      case 'Flame':
        return <Flame size={16} className="text-rose-400" />;
      default:
        return <Palette size={16} className="text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl bg-[#0f1217] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Palette size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Personalizare Temă & Culori</h3>
              <p className="text-[11px] text-neutral-400">
                Alege paleta vizuală preferată pentru interfața rares.ro.ai
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content: Theme cards */}
        <div className="p-5 overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {THEMES.map((theme: ThemeConfig) => {
              const isSelected = theme.id === currentTheme;
              return (
                <button
                  key={theme.id}
                  onClick={() => onSelectTheme(theme.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between group ${
                    isSelected
                      ? 'border-purple-500 bg-neutral-850 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/40'
                      : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-850 hover:border-neutral-700'
                  }`}
                >
                  <div>
                    {/* Header with Icon + Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center border border-neutral-700/60">
                          {renderIcon(theme.icon)}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-white group-hover:text-purple-300 transition-colors">
                            {theme.name}
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {theme.badge}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                          <Check size={12} />
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-neutral-400 leading-relaxed mb-3">
                      {theme.description}
                    </p>
                  </div>

                  {/* Palette Swatch Preview */}
                  <div className="p-2 rounded-lg bg-neutral-950/80 border border-neutral-800 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-500 font-mono">Culori</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                        style={{ backgroundColor: theme.preview.bg }}
                        title="Fundal"
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                        style={{ backgroundColor: theme.preview.sidebar }}
                        title="Meniu Lateral"
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 shadow-xs ring-1 ring-white/30"
                        style={{ backgroundColor: theme.preview.accent }}
                        title="Accent Principal"
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                        style={{ backgroundColor: theme.preview.text }}
                        title="Text"
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/30 flex items-center gap-2 text-xs text-purple-300">
              <Sparkles size={14} className="text-purple-400 shrink-0" />
              <span>
                Paleta selectată este salvată automat și se aplică instantaneu tuturor ferestrelor, meniurilor și editorului de chat.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

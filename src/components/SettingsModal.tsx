import React, { useState } from 'react';
import { X, Trash2, Download, Upload, Info, Check, Palette, Cpu, Zap, Sparkles, Bot, Brain } from 'lucide-react';
import { ThinkingLevelType, ThemeId, AiModelType } from '../types';
import { THEMES } from '../constants/themes';
import { AI_MODELS } from '../constants/models';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customInstruction: string;
  onSaveCustomInstruction: (val: string) => void;
  thinkingLevel: ThinkingLevelType;
  onChangeThinkingLevel: (level: ThinkingLevelType) => void;
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  currentModel?: AiModelType;
  onSelectModel?: (model: AiModelType) => void;
  onClearAllConversations: () => void;
  onExportAllData: () => void;
  onImportData: (jsonStr: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  customInstruction,
  onSaveCustomInstruction,
  thinkingLevel,
  onChangeThinkingLevel,
  currentTheme,
  onSelectTheme,
  currentModel = 'rares.ro.ai',
  onSelectModel,
  onClearAllConversations,
  onExportAllData,
  onImportData,
}) => {
  const [instruction, setInstruction] = useState(customInstruction);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen) return null;

  const handleSaveInstruction = () => {
    onSaveCustomInstruction(instruction);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        onImportData(text);
        alert('Conversațiile au fost importate cu succes!');
        onClose();
      } catch (err) {
        alert('Fișierul JSON nu este valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-[#0f1217] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Setări rares.ro.ai</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-neutral-300">
          {/* User Account Quick Banner */}
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                R
              </div>
              <div>
                <span className="font-semibold text-white block">Cont: Rareș (raresp.bogdan@gmail.com)</span>
                <span className="text-[10px] text-purple-300">
                  rares.ro.ai conectat singur ⚡ · Gemini, ChatGPT & Claude Sonnet 5.5 sincronizate
                </span>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/30 shrink-0" />
          </div>

          {/* Custom Instruction */}
          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-200 block">
              Instrucțiuni personalizate de sistem (Opțional)
            </label>
            <p className="text-[11px] text-neutral-500">
              Adaugă reguli sau cerințe speciale care vor fi aplicate tuturor conversațiilor (ex: &quot;Răspunde mereu cu diacritice&quot;, &quot;Folosește exemple în TypeScript&quot;).
            </p>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Ex: Răspunde într-un mod concis, folosește limba română literară..."
              rows={3}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500 resize-none"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSaveInstruction}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <Check size={13} className="text-white" />
                    <span>Salvat!</span>
                  </>
                ) : (
                  <span>Salvează instrucțiunea</span>
                )}
              </button>
            </div>
          </div>

          {/* AI Model Selection Section */}
          <div className="space-y-2 pt-3 border-t border-neutral-800/80">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-neutral-200 flex items-center gap-1.5">
                <Cpu size={14} className="text-blue-400" />
                <span>Model AI Activ (Motor Inteligent)</span>
              </label>
              <span className="text-[10px] text-blue-300 font-mono">
                {AI_MODELS.find((m) => m.id === currentModel)?.name}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Alege ce inteligență artificială generează răspunsurile: <strong>rares.ro.ai</strong> (ultra-rapid, memorie integrată), <strong>Gemini 3.8 Flash</strong>, <strong>ChatGPT (GPT-4o)</strong> sau <strong>Claude 3.7 Sonnet</strong>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {AI_MODELS.map((model) => {
                const isSelected = model.id === currentModel;
                const renderIcon = (icon: string) => {
                  switch (icon) {
                    case 'Zap':
                      return <Zap size={14} className="text-purple-400" />;
                    case 'Sparkles':
                      return <Sparkles size={14} className="text-cyan-400" />;
                    case 'Bot':
                      return <Bot size={14} className="text-emerald-400" />;
                    case 'Brain':
                      return <Brain size={14} className="text-amber-400" />;
                    default:
                      return <Cpu size={14} className="text-blue-400" />;
                  }
                };

                return (
                  <button
                    key={model.id}
                    onClick={() => onSelectModel?.(model.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-800 border-blue-500 text-white shadow-xs ring-1 ring-blue-500/30'
                        : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-neutral-850 flex items-center justify-center border border-neutral-700/60">
                          {renderIcon(model.iconName)}
                        </div>
                        <div>
                          <span className="font-semibold text-xs block text-white">{model.name}</span>
                          <span className="text-[9px] text-neutral-400 font-mono">{model.badge}</span>
                        </div>
                      </div>
                      {isSelected && <Check size={13} className="text-emerald-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-tight mt-1 line-clamp-1">
                      {model.tagline}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Customization Section */}
          <div className="space-y-2 pt-3 border-t border-neutral-800/80">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-neutral-200 flex items-center gap-1.5">
                <Palette size={14} className="text-purple-400" />
                <span>Temă & Paletă de Culori (UI)</span>
              </label>
              <span className="text-[10px] text-purple-300 font-mono">
                {THEMES.find((t) => t.id === currentTheme)?.name}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Personalizează schema cromatică a întregii aplicații (Neon Night, Minimalist Light, Cyberpunk, etc.).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {THEMES.map((theme) => {
                const isSelected = theme.id === currentTheme;
                return (
                  <button
                    key={theme.id}
                    onClick={() => onSelectTheme(theme.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-800 border-purple-500 text-white shadow-xs ring-1 ring-purple-500/30'
                        : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-xs truncate flex items-center gap-1.5">
                        <span>{theme.name}</span>
                        {isSelected && <Check size={12} className="text-emerald-400 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-neutral-500 truncate block mt-0.5">
                        {theme.badge}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: theme.preview.bg }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: theme.preview.accent }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Thinking Level */}
          <div className="space-y-1.5 pt-3 border-t border-neutral-800/80">
            <label className="font-semibold text-neutral-200 block">
              Nivel de Raționament Implicit (Thinking Level)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH'] as ThinkingLevelType[]).map((level) => (
                <button
                  key={level}
                  onClick={() => onChangeThinkingLevel(level)}
                  className={`py-2 px-3 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                    thinkingLevel === level
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Data Backup & Restore */}
          <div className="space-y-2 pt-3 border-t border-neutral-800/80">
            <label className="font-semibold text-neutral-200 block">
              Copie de siguranță & Date
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={onExportAllData}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 transition-colors cursor-pointer"
              >
                <Download size={13} />
                <span>Exportă toate conversațiile (JSON)</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 transition-colors cursor-pointer">
                <Upload size={13} />
                <span>Importă din fișier</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Clear History Danger Zone */}
          <div className="pt-3 border-t border-neutral-800/80">
            <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/30 flex items-center justify-between">
              <div>
                <p className="font-semibold text-red-300">Șterge tot istoricul</p>
                <p className="text-[11px] text-red-400/70">
                  Această acțiune va șterge ireversibil toate conversațiile salvate local.
                </p>
              </div>
              {confirmDelete ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onClearAllConversations();
                      setConfirmDelete(false);
                      onClose();
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-[11px] cursor-pointer"
                  >
                    Confirmă
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white text-[11px] cursor-pointer"
                  >
                    Anulează
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-900/70 text-red-300 border border-red-800/50 cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Șterge</span>
                </button>
              )}
            </div>
          </div>

          {/* Model info banner */}
          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/40 flex items-center gap-2.5 text-[11px] text-purple-200">
            <Info size={16} className="text-purple-400 shrink-0" />
            <span>
              <strong>rares.ro.ai</strong> funcționează cu motorul autonom ultra-rapid, oferind timpi de răspuns infimi, memorie pe termen lung și 100% disponibilitate fără întreruperi.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

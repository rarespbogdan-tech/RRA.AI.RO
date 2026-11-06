import React, { useState } from 'react';
import {
  Menu,
  Download,
  Trash2,
  Brain,
  Sliders,
  Check,
  Edit3,
  Gamepad2,
  Palette,
} from 'lucide-react';
import { Conversation, Persona, ThinkingLevelType, AiModelType, UserProfile } from '../types';
import { PersonaIcon } from './PersonaIcon';
import { ModelSelector } from './ModelSelector';
import { User } from 'lucide-react';

interface ChatHeaderProps {
  conversation: Conversation;
  activePersona: Persona;
  currentModel: AiModelType;
  onSelectModel: (model: AiModelType) => void;
  thinkingLevel: ThinkingLevelType;
  onChangeThinkingLevel: (level: ThinkingLevelType) => void;
  memoryCount: number;
  memoryEnabled: boolean;
  onOpenMemoryModal: () => void;
  onOpenSidebar: () => void;
  onOpenPersonaModal: () => void;
  onOpenGameStudio: () => void;
  onOpenThemeModal: () => void;
  userProfile?: UserProfile;
  onOpenAccountModal?: () => void;
  onClearConversation: () => void;
  onExportConversation: (format: 'markdown' | 'json') => void;
  onRenameConversation: (newTitle: string) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  activePersona,
  currentModel,
  onSelectModel,
  thinkingLevel,
  onChangeThinkingLevel,
  memoryCount,
  memoryEnabled,
  onOpenMemoryModal,
  onOpenSidebar,
  onOpenPersonaModal,
  onOpenGameStudio,
  onOpenThemeModal,
  userProfile,
  onOpenAccountModal,
  onClearConversation,
  onExportConversation,
  onRenameConversation,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(conversation.title);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showThinkingMenu, setShowThinkingMenu] = useState(false);

  const handleSaveTitle = () => {
    if (titleInput.trim()) {
      onRenameConversation(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const thinkingLabels: Record<ThinkingLevelType, { label: string; desc: string }> = {
    LOW: { label: 'Rapid (Low)', desc: 'Latență minimă, răspuns instant' },
    MEDIUM: { label: 'Standard (Med)', desc: 'Echilibru optim între gândire și viteză' },
    HIGH: { label: 'Profund (High)', desc: 'Raționament complex și analiză adâncă' },
  };

  return (
    <header className="h-14 border-b border-neutral-800/80 bg-neutral-950/70 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between shrink-0 z-20">
      {/* Left: Mobile menu toggle + Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 lg:hidden cursor-pointer"
          title="Deschide meniu"
        >
          <Menu size={18} />
        </button>

        {isEditingTitle ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
              autoFocus
              className="bg-neutral-800 text-sm font-semibold text-white px-2.5 py-1 rounded-lg border border-neutral-700 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSaveTitle}
              className="p-1 rounded text-emerald-400 hover:bg-neutral-800 cursor-pointer"
            >
              <Check size={15} />
            </button>
          </div>
        ) : (
          <div
            onClick={() => {
              setTitleInput(conversation.title);
              setIsEditingTitle(true);
            }}
            className="flex items-center gap-1.5 cursor-pointer group max-w-xs sm:max-w-md"
            title="Apasă pentru a redenumi"
          >
            <h2 className="text-sm font-semibold text-neutral-100 truncate group-hover:text-blue-300 transition-colors">
              {conversation.title || 'Conversație nouă'}
            </h2>
            <Edit3
              size={13}
              className="text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            />
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* User Account Button (Rareș & Connected Accounts) */}
        {userProfile && (
          <button
            onClick={onOpenAccountModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/40 hover:border-purple-400 hover:bg-purple-900/50 text-xs text-neutral-200 transition-all cursor-pointer shadow-xs group"
            title={`Cont conectat: ${userProfile.name} (${userProfile.email}) · rares.ro.ai conectat singur`}
          >
            <div className="relative">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white text-[10px] font-bold">
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-[#0d0f13]" />
            </div>
            <span className="font-semibold text-white hidden md:inline">{userProfile.name}</span>
          </button>
        )}

        {/* Model Selector (rares.ro.ai, Gemini, ChatGPT, Claude) */}
        <ModelSelector
          currentModel={currentModel}
          onSelectModel={onSelectModel}
        />

        {/* Game Studio Button */}
        <button
          onClick={onOpenGameStudio}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-pink-950/40 border border-pink-500/40 hover:bg-pink-900/50 hover:border-pink-400 text-pink-200 text-xs font-semibold transition-all cursor-pointer shadow-xs group"
          title="Deschide Studio Jocuri (CosmoShooter & Creează Joc cu AI)"
        >
          <Gamepad2 size={14} className="text-pink-400 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Jocuri</span>
        </button>

        {/* Theme Customization Button */}
        <button
          onClick={onOpenThemeModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 hover:bg-neutral-800 text-neutral-300 hover:text-purple-300 text-xs font-medium transition-all cursor-pointer shadow-xs group"
          title="Personalizare Temă & Paletă de Culori (Neon Night, Minimalist Light, Cyberpunk, etc.)"
        >
          <Palette size={14} className="text-purple-400 group-hover:rotate-45 transition-transform" />
          <span className="hidden sm:inline">Temă</span>
        </button>

        {/* Memory Button */}
        <button
          onClick={onOpenMemoryModal}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
            memoryEnabled
              ? 'bg-purple-950/40 border-purple-500/50 text-purple-300 hover:bg-purple-900/50 hover:text-white shadow-xs'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
          }`}
          title={memoryEnabled ? `Memorie activă: ${memoryCount} fapte reținute` : 'Memorie dezactivată'}
        >
          <Brain size={14} className={memoryEnabled ? 'text-purple-400' : 'text-neutral-500'} />
          <span className="hidden sm:inline">Memorie</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
            memoryEnabled ? 'bg-purple-500/30 text-purple-200' : 'bg-neutral-800 text-neutral-400'
          }`}>
            {memoryCount}
          </span>
        </button>

        {/* Persona quick switch badge */}
        <button
          onClick={onOpenPersonaModal}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer"
          title="Schimbă modul AI"
        >
          <PersonaIcon name={activePersona.iconName} size={13} className="text-indigo-400" />
          <span className="font-medium truncate max-w-[120px]">{activePersona.name}</span>
          <Sliders size={11} className="text-neutral-500" />
        </button>

        {/* Thinking Level Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowThinkingMenu(!showThinkingMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Nivel de gândire AI"
          >
            <Brain size={13} className="text-purple-400" />
            <span className="font-medium hidden md:inline">{thinkingLabels[thinkingLevel].label}</span>
          </button>

          {showThinkingMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowThinkingMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl py-1.5 z-30 text-xs">
                <div className="px-3 py-1 font-semibold text-neutral-400 text-[10px] uppercase tracking-wider">
                  Nivel Raționament (Thinking)
                </div>
                {(['LOW', 'MEDIUM', 'HIGH'] as ThinkingLevelType[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      onChangeThinkingLevel(level);
                      setShowThinkingMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-start gap-2 hover:bg-neutral-800 transition-colors cursor-pointer ${
                      thinkingLevel === level ? 'bg-neutral-800/80 text-blue-400' : 'text-neutral-300'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-medium flex items-center justify-between">
                        <span>{thinkingLabels[level].label}</span>
                        {thinkingLevel === level && <Check size={13} className="text-blue-400" />}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        {thinkingLabels[level].desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Export Menu */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            title="Exportă conversația"
          >
            <Download size={14} />
            <span className="hidden md:inline font-medium">Export</span>
          </button>

          {showExportMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowExportMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl py-1 z-30 text-xs">
                <button
                  onClick={() => {
                    onExportConversation('markdown');
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
                >
                  Descarcă Markdown (.md)
                </button>
                <button
                  onClick={() => {
                    onExportConversation('json');
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
                >
                  Descarcă JSON (.json)
                </button>
              </div>
            </>
          )}
        </div>

        {/* Clear chat button */}
        {conversation.messages.length > 0 && (
          <button
            onClick={onClearConversation}
            className="p-1.5 sm:p-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Golește conversația curentă"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { ChevronDown, Check, Zap, Sparkles, Bot, Brain } from 'lucide-react';
import { AiModelType, AiModelConfig } from '../types';
import { AI_MODELS } from '../constants/models';

interface ModelSelectorProps {
  currentModel: AiModelType;
  onSelectModel: (model: AiModelType) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  currentModel,
  onSelectModel,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeConfig = AI_MODELS.find((m) => m.id === currentModel) || AI_MODELS[0];

  const renderIcon = (iconName: string, className = 'w-3.5 h-3.5') => {
    switch (iconName) {
      case 'Zap':
        return <Zap className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Bot':
        return <Bot className={className} />;
      case 'Brain':
        return <Brain className={className} />;
      default:
        return <Zap className={className} />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900/90 border border-neutral-700/80 hover:border-purple-500/80 text-xs transition-all cursor-pointer shadow-sm group hover:bg-neutral-850 ring-1 ring-white/5 hover:ring-purple-500/30"
        title="Apasă pentru a alege modelul AI: rares.ro.ai, Gemini, ChatGPT sau Claude"
      >
        <div
          className={`w-4 h-4 rounded-md bg-gradient-to-tr ${activeConfig.color} flex items-center justify-center text-white shrink-0 shadow-xs`}
        >
          {renderIcon(activeConfig.iconName, 'w-2.5 h-2.5')}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider hidden md:inline">
            Model:
          </span>
          <span className="font-bold text-neutral-100 group-hover:text-white transition-colors">
            {activeConfig.name}
          </span>
        </div>
        <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800/90 text-neutral-300 font-mono hidden sm:inline border border-neutral-700/50">
          {activeConfig.badge}
        </span>
        <ChevronDown
          size={13}
          className={`text-neutral-400 group-hover:text-white transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 rounded-2xl bg-[#0f1217] border border-neutral-800 shadow-2xl p-2 z-40 text-xs space-y-1">
            <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
              Alege Modelul Inteligent
            </div>

            {AI_MODELS.map((model: AiModelConfig) => {
              const isSelected = model.id === currentModel;
              return (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelectModel(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-850 border-neutral-700 shadow-xs'
                      : 'border-transparent hover:bg-neutral-900/80 hover:border-neutral-800'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${model.color} flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm`}
                  >
                    {renderIcon(model.iconName, 'w-3 h-3')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-100 truncate">
                        {model.name}
                      </span>
                      {isSelected && <Check size={13} className="text-emerald-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                      {model.tagline}
                    </p>
                    <span className="inline-block mt-1 text-[9px] px-1.5 py-0.2 rounded bg-neutral-800/80 text-neutral-400 font-mono">
                      {model.provider}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

import React from 'react';
import { X, Check } from 'lucide-react';
import { Persona } from '../types';
import { PersonaIcon } from './PersonaIcon';

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  personas: Persona[];
  activePersonaId: string;
  onSelectPersona: (persona: Persona) => void;
}

export const PersonaModal: React.FC<PersonaModalProps> = ({
  isOpen,
  onClose,
  personas,
  activePersonaId,
  onSelectPersona,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-[#0f1217] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Alege Modul Specializat</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Personalizează stilul, expertiza și tonul răspunsurilor rares.ro.ai.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {personas.map((persona) => {
              const isSelected = persona.id === activePersonaId;
              return (
                <div
                  key={persona.id}
                  onClick={() => {
                    onSelectPersona(persona);
                    onClose();
                  }}
                  className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-950/30 border-blue-500/80 shadow-md ring-1 ring-blue-500/30'
                      : 'bg-neutral-900/60 border-neutral-800/80 hover:bg-neutral-800/70 hover:border-neutral-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-neutral-800 text-neutral-300'
                          }`}
                        >
                          <PersonaIcon name={persona.iconName} size={15} />
                        </div>
                        <span className="font-semibold text-xs text-neutral-100">
                          {persona.name}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          <Check size={12} />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-neutral-300">
                      {persona.tagline}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                      {persona.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-neutral-800/60 text-[10px] text-neutral-500">
                    Ex: {persona.samplePrompts[0]?.slice(0, 45)}...
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

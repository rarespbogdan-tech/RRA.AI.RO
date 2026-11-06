import React, { useState } from 'react';
import {
  X,
  Brain,
  Plus,
  Trash2,
  Edit2,
  Check,
  Search,
  Sparkles,
  User,
  Sliders,
  FolderGit2,
  Target,
  ScanText,
  AlertCircle,
} from 'lucide-react';
import { MemoryItem, MemoryCategory } from '../types';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryItem[];
  memoryEnabled: boolean;
  onToggleMemoryEnabled: (enabled: boolean) => void;
  onAddMemory: (fact: string, category: MemoryCategory) => void;
  onUpdateMemory: (id: string, newFact: string, newCategory: MemoryCategory) => void;
  onDeleteMemory: (id: string) => void;
  onClearAllMemories: () => void;
  onScanCurrentConversation?: () => Promise<void>;
  isScanning?: boolean;
}

const CATEGORY_CONFIG: Record<
  MemoryCategory,
  { label: string; icon: React.FC<{ size?: number; className?: string }>; color: string }
> = {
  profile: {
    label: 'Profil & Identitate',
    icon: User,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  preference: {
    label: 'Preferințe & Stil',
    icon: Sliders,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  fact: {
    label: 'Fapte & Proiecte',
    icon: FolderGit2,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  goal: {
    label: 'Obiective & Planuri',
    icon: Target,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
};

export const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  onClose,
  memories,
  memoryEnabled,
  onToggleMemoryEnabled,
  onAddMemory,
  onUpdateMemory,
  onDeleteMemory,
  onClearAllMemories,
  onScanCurrentConversation,
  isScanning = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFact, setNewFact] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('fact');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFact, setEditFact] = useState('');
  const [editCategory, setEditCategory] = useState<MemoryCategory>('fact');

  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFact.trim()) return;
    onAddMemory(newFact.trim(), newCategory);
    setNewFact('');
    setShowAddForm(false);
  };

  const startEdit = (m: MemoryItem) => {
    setEditingId(m.id);
    setEditFact(m.fact);
    setEditCategory(m.category);
  };

  const handleSaveEdit = (id: string) => {
    if (editFact.trim()) {
      onUpdateMemory(id, editFact.trim(), editCategory);
    }
    setEditingId(null);
  };

  const filteredMemories = memories.filter((m) => {
    const matchesSearch =
      m.fact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.sourceSnippet && m.sourceSnippet.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategoryFilter === 'all' || m.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-[#0f1217] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Brain size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                Memorie Inteligentă
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-neutral-800 text-neutral-300">
                  {memories.length} {memories.length === 1 ? 'amintire' : 'amintiri'}
                </span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Detalii persistente reținute de rares.ro.ai pentru răspunsuri contextuale.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Master Memory Switch Bar */}
        <div className="px-5 py-3 bg-neutral-900/60 border-b border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-neutral-300">
            <Sparkles size={14} className={memoryEnabled ? 'text-purple-400' : 'text-neutral-500'} />
            <span className="font-medium">
              {memoryEnabled ? 'Memoria persistentă este activă' : 'Memoria persistentă este dezactivată'}
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={memoryEnabled}
              onChange={(e) => onToggleMemoryEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Action Bar (Search, Add, Scan) */}
        <div className="p-4 border-b border-neutral-800/80 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-2.5 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Caută în amintiri..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-neutral-500 hover:text-neutral-300"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              {onScanCurrentConversation && (
                <button
                  onClick={onScanCurrentConversation}
                  disabled={isScanning}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                  title="Scanează discuția curentă pentru a extrage automat memorii"
                >
                  <ScanText size={14} className={isScanning ? 'animate-spin text-purple-400' : 'text-purple-400'} />
                  <span>{isScanning ? 'Scanare...' : 'Scanează chat'}</span>
                </button>
              )}

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Adaugă</span>
              </button>
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer text-[11px] whitespace-nowrap ${
                selectedCategoryFilter === 'all'
                  ? 'bg-neutral-800 text-white border-neutral-700'
                  : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:text-neutral-200'
              }`}
            >
              Toate ({memories.length})
            </button>
            {(Object.keys(CATEGORY_CONFIG) as MemoryCategory[]).map((cat) => {
              const count = memories.filter((m) => m.category === cat).length;
              const conf = CATEGORY_CONFIG[cat];
              const Icon = conf.icon;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer text-[11px] whitespace-nowrap ${
                    selectedCategoryFilter === cat
                      ? 'bg-neutral-800 text-white border-neutral-700'
                      : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                  }`}
                >
                  <Icon size={12} />
                  <span>
                    {conf.label} ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Manual Add Form (Collapsible) */}
        {showAddForm && (
          <form
            onSubmit={handleSaveAdd}
            className="p-4 bg-neutral-900/90 border-b border-neutral-800 space-y-3"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
              <span>Adaugă o amintire manual</span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-neutral-500 hover:text-neutral-300"
              >
                <X size={14} />
              </button>
            </div>

            <input
              type="text"
              value={newFact}
              onChange={(e) => setNewFact(e.target.value)}
              placeholder="Ex: Utilizatorul este dezvoltator software și preferă exemplele în TypeScript."
              autoFocus
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-purple-500"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-400">Categorie:</span>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-xs text-neutral-300 focus:outline-none"
                >
                  <option value="profile">Profil & Identitate</option>
                  <option value="preference">Preferințe & Stil</option>
                  <option value="fact">Fapte & Proiecte</option>
                  <option value="goal">Obiective & Planuri</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-2.5 py-1 rounded-lg text-xs text-neutral-400 hover:text-white"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={!newFact.trim()}
                  className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-medium"
                >
                  Salvează amintirea
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Memory List Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-2.5">
          {filteredMemories.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 mx-auto">
                <Brain size={24} />
              </div>
              <p className="text-sm font-semibold text-neutral-300">
                {searchQuery
                  ? 'Nicio amintire găsită pentru căutarea ta.'
                  : 'Nu există încă nicio amintire înregistrată.'}
              </p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Pe măsură ce conversezi, rares.ro.ai va extrage automat fapte importante (cum ar fi numele tău, profesia sau preferințele). Le poți adăuga și manual oricând.
              </p>
            </div>
          ) : (
            filteredMemories.map((m) => {
              const conf = CATEGORY_CONFIG[m.category] || CATEGORY_CONFIG.fact;
              const Icon = conf.icon;
              const isEditing = editingId === m.id;

              if (isEditing) {
                return (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl border border-purple-500/80 bg-neutral-900/90 space-y-2.5"
                  >
                    <textarea
                      value={editFact}
                      onChange={(e) => setEditFact(e.target.value)}
                      rows={2}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-200 focus:outline-none focus:border-purple-500 resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as MemoryCategory)}
                        className="bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-xs text-neutral-300 focus:outline-none"
                      >
                        <option value="profile">Profil & Identitate</option>
                        <option value="preference">Preferințe & Stil</option>
                        <option value="fact">Fapte & Proiecte</option>
                        <option value="goal">Obiective & Planuri</option>
                      </select>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 rounded-lg text-xs text-neutral-400 hover:text-white"
                        >
                          Anulează
                        </button>
                        <button
                          onClick={() => handleSaveEdit(m.id)}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium cursor-pointer"
                        >
                          <Check size={13} />
                          <span>Actualizează</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  className="group relative p-3 sm:p-3.5 rounded-xl border border-neutral-800/80 bg-neutral-900/50 hover:bg-neutral-850 hover:border-neutral-700/80 transition-all flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium border shrink-0 flex items-center gap-1 mt-0.5 ${conf.color}`}
                    >
                      <Icon size={11} />
                      <span>{conf.label}</span>
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-neutral-200 leading-relaxed font-medium">
                        {m.fact}
                      </p>
                      {m.sourceSnippet && (
                        <p className="text-[10px] text-neutral-500 mt-1 italic truncate">
                          &quot;{m.sourceSnippet}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => startEdit(m)}
                      className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Editează amintirea"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => onDeleteMemory(m.id)}
                      className="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Șterge amintirea"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Danger Clear */}
        <div className="p-3.5 border-t border-neutral-800/80 bg-neutral-950/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
            <AlertCircle size={14} className="text-purple-400" />
            <span>Memoria este stocată local și securizată.</span>
          </div>

          {memories.length > 0 && (
            <div>
              {confirmClear ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onClearAllMemories();
                      setConfirmClear(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-[11px] cursor-pointer"
                  >
                    Confirmă ștergerea
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-2 py-1 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white text-[11px] cursor-pointer"
                  >
                    Anulează
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="text-neutral-400 hover:text-red-400 transition-colors text-[11px] cursor-pointer"
                >
                  Șterge toate amintirile
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

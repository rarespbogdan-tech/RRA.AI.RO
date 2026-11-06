import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Search,
  Pin,
  Trash2,
  Edit2,
  Check,
  X,
  Settings,
  Bot,
  Sliders,
  Brain,
  Gamepad2,
  Palette,
} from 'lucide-react';
import { Conversation, Persona, UserProfile } from '../types';
import { PersonaIcon } from './PersonaIcon';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  personas: Persona[];
  activePersona: Persona;
  memoryCount: number;
  memoryEnabled: boolean;
  onOpenMemoryModal: () => void;
  onOpenGameStudio: () => void;
  onOpenThemeModal?: () => void;
  userProfile?: UserProfile;
  onOpenAccountModal?: () => void;
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onTogglePinConversation: (id: string) => void;
  onOpenPersonaModal: () => void;
  onOpenSettingsModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  activePersona,
  memoryCount,
  memoryEnabled,
  onOpenMemoryModal,
  onOpenGameStudio,
  onOpenThemeModal,
  userProfile,
  onOpenAccountModal,
  isOpen,
  onClose,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  onTogglePinConversation,
  onOpenPersonaModal,
  onOpenSettingsModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedConversations = filteredConversations.filter((c) => c.pinned);
  const unpinnedConversations = filteredConversations.filter((c) => !c.pinned);

  const startEditing = (c: Conversation) => {
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const saveEditing = (id: string) => {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-72 sm:w-80 bg-[#0d0f13] border-r border-neutral-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-purple-500/25">
              <Bot size={18} />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white tracking-tight bg-gradient-to-r from-purple-300 via-blue-200 to-white bg-clip-text text-transparent">
                rares.ro.ai
              </h1>
              <span className="text-[10px] text-purple-400 font-medium">Motor Autonom Ultra-Rapid</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 lg:hidden cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action: New Chat button & Game Studio button */}
        <div className="p-3 space-y-2">
          <button
            onClick={() => {
              onNewConversation();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer group"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-200" />
            <span>Conversație nouă</span>
          </button>

          <button
            onClick={() => {
              onOpenGameStudio();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-950/60 via-pink-950/40 to-neutral-900 border border-pink-500/30 hover:border-pink-500/60 text-white font-medium text-xs shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Gamepad2 size={16} className="text-pink-400 group-hover:rotate-12 transition-transform" />
              <span>Studio Jocuri</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-semibold border border-pink-500/30">
              Create a Game
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Caută în conversații..."
              className="w-full bg-neutral-900/80 border border-neutral-800/90 rounded-xl pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
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
        </div>

        {/* Active Persona Banner / Selector */}
        <div className="px-3 py-1 space-y-1.5">
          <button
            onClick={onOpenPersonaModal}
            className="w-full p-2 rounded-xl bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800/60 flex items-center justify-between text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <PersonaIcon name={activePersona.iconName} size={13} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-neutral-400 font-medium">Mod activ</div>
                <div className="text-xs font-semibold text-neutral-200 truncate group-hover:text-blue-300">
                  {activePersona.name}
                </div>
              </div>
            </div>
            <Sliders size={13} className="text-neutral-500 group-hover:text-neutral-300 shrink-0" />
          </button>

          <button
            onClick={() => {
              onOpenMemoryModal();
              onClose();
            }}
            className={`w-full p-2 rounded-xl border flex items-center justify-between text-left transition-colors cursor-pointer group ${
              memoryEnabled
                ? 'bg-purple-950/25 border-purple-800/40 hover:bg-purple-900/35 hover:border-purple-700/60'
                : 'bg-neutral-900/40 border-neutral-800/50 hover:bg-neutral-800/60'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                  memoryEnabled
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-neutral-800 text-neutral-500'
                }`}
              >
                <Brain size={13} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-neutral-400 font-medium">Memorie AI</div>
                <div className="text-xs font-semibold text-neutral-200 truncate group-hover:text-purple-300">
                  {memoryEnabled ? `${memoryCount} amintiri reținute` : 'Memorie dezactivată'}
                </div>
              </div>
            </div>
            <span
              className={`w-2 h-2 rounded-full ${
                memoryEnabled ? 'bg-purple-400 ring-2 ring-purple-500/30' : 'bg-neutral-600'
              }`}
            />
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-neutral-500">
              {searchQuery ? 'Nicio conversație găsită.' : 'Încă nu ai nicio conversație.'}
            </div>
          ) : (
            <>
              {/* Pinned Section */}
              {pinnedConversations.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-neutral-500 tracking-wider flex items-center gap-1">
                    <Pin size={10} className="text-amber-400" />
                    <span>Fixate</span>
                  </div>
                  {pinnedConversations.map((c) => (
                    <ConversationItem
                      key={c.id}
                      conversation={c}
                      isActive={c.id === activeConversationId}
                      isEditing={editingId === c.id}
                      editTitle={editTitle}
                      setEditTitle={setEditTitle}
                      onSelect={() => {
                        onSelectConversation(c.id);
                        onClose();
                      }}
                      onStartEdit={() => startEditing(c)}
                      onSaveEdit={() => saveEditing(c.id)}
                      onCancelEdit={() => setEditingId(null)}
                      onTogglePin={() => onTogglePinConversation(c.id)}
                      onDelete={() => onDeleteConversation(c.id)}
                    />
                  ))}
                </div>
              )}

              {/* Unpinned / Recent Section */}
              {unpinnedConversations.length > 0 && (
                <div>
                  {pinnedConversations.length > 0 && (
                    <div className="px-3 py-1 text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                      Recente
                    </div>
                  )}
                  {unpinnedConversations.map((c) => (
                    <ConversationItem
                      key={c.id}
                      conversation={c}
                      isActive={c.id === activeConversationId}
                      isEditing={editingId === c.id}
                      editTitle={editTitle}
                      setEditTitle={setEditTitle}
                      onSelect={() => {
                        onSelectConversation(c.id);
                        onClose();
                      }}
                      onStartEdit={() => startEditing(c)}
                      onSaveEdit={() => saveEditing(c.id)}
                      onCancelEdit={() => setEditingId(null)}
                      onTogglePin={() => onTogglePinConversation(c.id)}
                      onDelete={() => onDeleteConversation(c.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* User Account Bar */}
        {userProfile && (
          <div
            onClick={onOpenAccountModal}
            className="p-2.5 mx-2 mb-2 rounded-xl bg-purple-950/30 border border-purple-500/30 hover:border-purple-400 hover:bg-purple-900/40 transition-all cursor-pointer flex items-center justify-between group shadow-xs"
            title="Apasă pentru detalii cont & sincronizare AI"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-white truncate block group-hover:text-purple-200">
                  {userProfile.name}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono truncate block">
                  {userProfile.email}
                </span>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/30 shrink-0" />
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800/80 bg-neutral-950/40 flex items-center justify-between text-xs text-neutral-400">
          <button
            onClick={onOpenSettingsModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Settings size={14} />
            <span>Setări</span>
          </button>

          <div className="flex items-center gap-1.5 text-[11px] text-purple-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span>rares.ro.ai Autonom</span>
          </div>
        </div>
      </aside>
    </>
  );
};

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  isEditing: boolean;
  editTitle: string;
  setEditTitle: (t: string) => void;
  onSelect: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}

function ConversationItem({
  conversation,
  isActive,
  isEditing,
  editTitle,
  setEditTitle,
  onSelect,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onTogglePin,
  onDelete,
}: ConversationItemProps) {
  if (isEditing) {
    return (
      <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-neutral-800">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSaveEdit();
            if (e.key === 'Escape') onCancelEdit();
          }}
          autoFocus
          className="flex-1 bg-transparent text-xs text-white focus:outline-none"
        />
        <button
          onClick={onSaveEdit}
          className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
        >
          <Check size={13} />
        </button>
        <button
          onClick={onCancelEdit}
          className="p-1 text-neutral-400 hover:text-neutral-200 cursor-pointer"
        >
          <X size={13} />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
        isActive
          ? 'bg-neutral-800/90 text-white font-medium shadow-xs'
          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/70'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <MessageSquare
          size={14}
          className={isActive ? 'text-blue-400 shrink-0' : 'text-neutral-500 shrink-0'}
        />
        <span className="truncate">{conversation.title || 'Conversație fără titlu'}</span>
      </div>

      {/* Action buttons (Pin, Rename, Delete) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity"
      >
        <button
          onClick={onTogglePin}
          className={`p-1 rounded hover:bg-neutral-700/80 transition-colors ${
            conversation.pinned ? 'text-amber-400' : 'text-neutral-400 hover:text-white'
          }`}
          title={conversation.pinned ? 'Anulează fixarea' : 'Fixează sus'}
        >
          <Pin size={12} />
        </button>
        <button
          onClick={onStartEdit}
          className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-700/80 transition-colors"
          title="Redenumește"
        >
          <Edit2 size={12} />
        </button>
        <button
          onClick={onDelete}
          className="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-neutral-700/80 transition-colors"
          title="Șterge"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

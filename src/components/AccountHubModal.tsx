import React, { useState } from 'react';
import {
  X,
  User,
  Zap,
  Sparkles,
  Bot,
  Brain,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Shield,
  Key,
  Check,
} from 'lucide-react';
import { UserProfile } from '../types';

interface AccountHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onLogout: () => void;
}

export const AccountHubModal: React.FC<AccountHubModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onLogout,
}) => {
  const [name, setName] = useState(profile.name || 'Rareș');
  const [email, setEmail] = useState(profile.email || 'raresp.bogdan@gmail.com');
  const [requireLogin, setRequireLogin] = useState(profile.requireLoginOnEntry);
  const [isSyncing, setIsSyncing] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: name.trim() || 'Rareș',
      email: email.trim() || 'raresp.bogdan@gmail.com',
      requireLoginOnEntry: requireLogin,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleResyncAll = async () => {
    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 800));
    onUpdateProfile({
      connectedAccounts: {
        raresAi: true,
        gemini: true,
        chatgpt: true,
        claude: true,
      },
    });
    setIsSyncing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0c0e14] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-neutral-800 bg-[#10131b] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 ring-1 ring-white/10">
              <User size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{profile.name}</h3>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  CONECTAT ACUM
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono">{profile.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-neutral-300">
          {/* Autonomous Status Highlight */}
          <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Zap size={16} />
              </div>
              <div>
                <span className="font-bold text-white block">rares.ro.ai Autonom</span>
                <span className="text-[11px] text-purple-300">
                  Conectat singur automat · Fără autentificare terță necesară
                </span>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-500/30" />
          </div>

          {/* Connected AI Accounts List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-neutral-200 block">
                Stare Conexiuni Conturi AI
              </label>
              <button
                type="button"
                onClick={handleResyncAll}
                disabled={isSyncing}
                className="flex items-center gap-1 text-[11px] text-purple-300 hover:text-purple-200 transition-colors cursor-pointer"
              >
                <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                <span>Re-sincronizează</span>
              </button>
            </div>

            <div className="space-y-2">
              {/* Gemini */}
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <Sparkles size={14} />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Google Gemini (3.8 Flash)</span>
                    <span className="text-[10px] text-neutral-400">
                      Sincronizat cu contul {profile.email}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle2 size={13} />
                  <span>Conectat</span>
                </div>
              </div>

              {/* ChatGPT */}
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Bot size={14} />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">OpenAI ChatGPT (GPT-4o)</span>
                    <span className="text-[10px] text-neutral-400">
                      Conexiune activă la rețeaua OpenAI
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle2 size={13} />
                  <span>Conectat</span>
                </div>
              </div>

              {/* Claude Sonnet 5.5 */}
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Brain size={14} />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Claude Sonnet 5.5</span>
                    <span className="text-[10px] text-neutral-400">
                      Anthropic AI Sonnet 5.5 sincronizat
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle2 size={13} />
                  <span>Conectat</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <form onSubmit={handleSave} className="space-y-3 pt-3 border-t border-neutral-800/80">
            <span className="font-semibold text-neutral-200 block">
              Setări Cont & Autentificare
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Nume Afișat</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Require Login Toggle */}
            <label className="flex items-center gap-2 pt-1 text-xs text-neutral-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={requireLogin}
                onChange={(e) => setRequireLogin(e.target.checked)}
                className="rounded border-neutral-700 bg-neutral-900 text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
              <span>Cere autentificare de fiecare dată când intru în aplicație</span>
            </label>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-900/50 hover:text-white transition-colors cursor-pointer text-xs"
              >
                <LogOut size={13} />
                <span>Deconectează-te</span>
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors cursor-pointer text-xs shadow-md shadow-purple-600/20"
              >
                {savedNotice ? (
                  <>
                    <Check size={13} />
                    <span>Salvat!</span>
                  </>
                ) : (
                  <span>Salvează Modificările</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-[#0a0c10] flex items-center justify-between text-[11px] text-neutral-500">
          <span className="flex items-center gap-1.5">
            <Shield size={12} className="text-emerald-400" />
            <span>rares.ro.ai v2.4 · Conectat Autonom</span>
          </span>
          <span className="font-mono">Claude Sonnet 5.5 / Gemini / GPT-4o</span>
        </div>
      </div>
    </div>
  );
};

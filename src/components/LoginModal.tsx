import React, { useState } from 'react';
import {
  LogIn,
  Zap,
  Sparkles,
  Bot,
  Brain,
  Shield,
  CheckCircle2,
  Lock,
  ArrowRight,
  User,
  Loader2,
} from 'lucide-react';
import { UserProfile } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (profile: Partial<UserProfile>) => void;
  initialProfile: UserProfile;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onLogin,
  initialProfile,
}) => {
  const [name, setName] = useState(initialProfile.name || 'Rareș');
  const [email, setEmail] = useState(initialProfile.email || 'raresp.bogdan@gmail.com');
  const [requireLogin, setRequireLogin] = useState(
    initialProfile.requireLoginOnEntry ?? true
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStep, setConnectionStep] = useState(0);

  if (!isOpen) return null;

  const handleStartLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsConnecting(true);
    setConnectionStep(1); // Gemini
    await new Promise((r) => setTimeout(r, 450));

    setConnectionStep(2); // ChatGPT
    await new Promise((r) => setTimeout(r, 450));

    setConnectionStep(3); // Claude Sonnet 5.5
    await new Promise((r) => setTimeout(r, 450));

    setConnectionStep(4); // All connected!
    await new Promise((r) => setTimeout(r, 350));

    onLogin({
      name: name.trim(),
      email: email.trim(),
      isLoggedIn: true,
      requireLoginOnEntry: requireLogin,
      connectedAccounts: {
        raresAi: true, // Connected on its own!
        gemini: true,
        chatgpt: true,
        claude: true,
      },
      lastLoginAt: Date.now(),
    });
    setIsConnecting(false);
    setConnectionStep(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0b0d12] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-neutral-200">
        {/* Background glow */}
        <div className="absolute -top-24 -left-24 w-52 h-52 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 mb-3 ring-1 ring-white/20">
            <User size={26} />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Autentificare Cont Utilizator
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Conectează-te pentru a sincroniza conturile Gemini, ChatGPT & Claude
          </p>
        </div>

        {/* Autonomous rares.ro.ai connection banner */}
        <div className="mb-5 p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Zap size={14} />
          </div>
          <div className="text-xs">
            <div className="flex items-center gap-1.5 font-bold text-purple-200">
              <span>rares.ro.ai Autonom</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                CONECTAT SINGUR
              </span>
            </div>
            <p className="text-[11px] text-purple-300/80 mt-0.5 leading-relaxed">
              Motorul tău principal este deja conectat automat și gata să te salute instant la intrare!
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleStartLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Nume Utilizator
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Rareș"
                className="w-full bg-neutral-900/90 border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Adresă Email Cont
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: raresp.bogdan@gmail.com"
                className="w-full bg-neutral-900/90 border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Connected AI Services Preview */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-neutral-400 block mb-2">
              Sincronizare Conturi AI la Conectare:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={12} className="text-cyan-400" />
                  <span className="text-neutral-300">Google Gemini</span>
                </div>
                {connectionStep >= 1 ? (
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-neutral-600" />
                )}
              </div>

              <div className="p-2 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Bot size={12} className="text-emerald-400" />
                  <span className="text-neutral-300">OpenAI ChatGPT</span>
                </div>
                {connectionStep >= 2 ? (
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-neutral-600" />
                )}
              </div>

              <div className="p-2 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between col-span-2">
                <div className="flex items-center gap-1.5">
                  <Brain size={12} className="text-amber-400" />
                  <span className="text-neutral-300">Claude Sonnet 5.5 (Anthropic)</span>
                </div>
                {connectionStep >= 3 ? (
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-neutral-600" />
                )}
              </div>
            </div>
          </div>

          {/* Toggle Require Login on Entry */}
          <label className="flex items-center gap-2 pt-1 text-xs text-neutral-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={requireLogin}
              onChange={(e) => setRequireLogin(e.target.checked)}
              className="rounded border-neutral-700 bg-neutral-900 text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
            <span>Cere autentificare de fiecare dată când intru în aplicație</span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isConnecting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer mt-3"
          >
            {isConnecting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Se conectează conturile AI...</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span>Conectează-te ca {name}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <p className="text-[10px] text-center text-neutral-500 mt-4 flex items-center justify-center gap-1">
          <Shield size={11} className="text-emerald-400" />
          <span>Sesiune securizată local · rares.ro.ai conectat autonom</span>
        </p>
      </div>
    </div>
  );
};

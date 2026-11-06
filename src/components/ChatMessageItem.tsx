import React, { useState } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  User,
  AlertTriangle,
} from 'lucide-react';
import { ChatMessage, Persona } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { PersonaIcon } from './PersonaIcon';

interface ChatMessageItemProps {
  message: ChatMessage;
  persona?: Persona;
  isLastAssistant: boolean;
  onRegenerate?: () => void;
  onReaction?: (messageId: string, reaction: 'like' | 'dislike') => void;
  onPreviewImage?: (src: string, alt?: string) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  persona,
  isLastAssistant,
  onRegenerate,
  onReaction,
  onPreviewImage,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Sinteza vocală nu este suportată în acest browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // clear queue
    const cleanText = message.content.replace(/```[\s\S]*?```/g, 'Bloc de cod omis.');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Try finding Romanian voice or standard system voice
    const voices = window.speechSynthesis.getVoices();
    const roVoice = voices.find((v) => v.lang.startsWith('ro'));
    if (roVoice) {
      utterance.voice = roVoice;
    }
    utterance.lang = roVoice ? roVoice.lang : 'ro-RO';

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`group relative flex w-full gap-3 sm:gap-4 px-3 sm:px-6 py-4 transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-neutral-900/40 border-y border-neutral-800/40'
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0 pt-0.5">
        {isUser ? (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm ring-1 ring-white/10">
            <User size={16} />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-sm ring-1 ring-white/10">
            <PersonaIcon
              name={persona?.iconName || 'Sparkles'}
              className="w-4 h-4 text-white"
            />
          </div>
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header (Author + Time) */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-neutral-300">
            {isUser ? 'Tu' : `rares.ro.ai • ${persona?.name || 'Asistent'}`}
          </span>
          <span className="text-neutral-500">{formatTime(message.timestamp)}</span>
          {isUser && message.image && (
            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-medium border border-blue-500/20">
              Imagine atașată
            </span>
          )}
        </div>

        {/* Attached image if any */}
        {message.image && (
          <div className="pt-1 pb-2">
            <button
              onClick={() =>
                onPreviewImage?.(
                  message.image?.data.startsWith('data:')
                    ? message.image.data
                    : `data:${message.image?.mimeType};base64,${message.image?.data}`,
                  message.image?.name
                )
              }
              className="group/img relative block max-w-xs sm:max-w-sm rounded-xl overflow-hidden border border-neutral-700/60 bg-neutral-950 hover:border-blue-500/60 transition-all cursor-pointer shadow-md"
            >
              <img
                src={
                  message.image.data.startsWith('data:')
                    ? message.image.data
                    : `data:${message.image.mimeType};base64,${message.image.data}`
                }
                alt={message.image.name || 'Imagine trimisă'}
                className="w-full h-auto max-h-64 object-cover group-hover/img:scale-[1.01] transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-xs font-medium text-white backdrop-blur-[1px]">
                Apasă pentru mărire
              </div>
            </button>
          </div>
        )}

        {/* Message Content */}
        {message.error ? (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-sm">
            <AlertTriangle size={17} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-200">Eroare la generarea răspunsului</p>
              <p className="text-xs text-red-300/80 mt-0.5">{message.error}</p>
            </div>
          </div>
        ) : (
          <div className="text-sm leading-relaxed text-neutral-200">
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div>
                <MarkdownRenderer content={message.content} />
                {message.isStreaming && (
                  <span className="inline-block w-2 h-4 ml-1 bg-blue-400 animate-pulse rounded-sm align-middle" />
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Toolbar for AI message */}
        {!isUser && !message.error && (
          <div className="flex items-center gap-1 pt-1.5 text-neutral-400 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Copiază răspunsul"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-[11px] text-emerald-400">Copiat</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span className="text-[11px]">Copiază</span>
                </>
              )}
            </button>

            <button
              onClick={handleSpeech}
              className={`p-1.5 rounded-md hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer text-xs flex items-center gap-1 ${
                isSpeaking ? 'text-blue-400 bg-blue-500/10' : ''
              }`}
              title={isSpeaking ? 'Oprește vocea' : 'Ascultă răspunsul'}
            >
              {isSpeaking ? (
                <>
                  <VolumeX size={13} className="text-blue-400 animate-pulse" />
                  <span className="text-[11px] text-blue-400">Oprește</span>
                </>
              ) : (
                <>
                  <Volume2 size={13} />
                  <span className="text-[11px]">Ascultă</span>
                </>
              )}
            </button>

            {isLastAssistant && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1.5 rounded-md hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer text-xs flex items-center gap-1"
                title="Regenerează răspunsul"
              >
                <RotateCcw size={13} />
                <span className="text-[11px]">Regenerează</span>
              </button>
            )}

            <div className="w-[1px] h-3 bg-neutral-800 mx-1" />

            <button
              onClick={() => onReaction?.(message.id, 'like')}
              className={`p-1.5 rounded-md hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer ${
                message.reaction === 'like' ? 'text-emerald-400 bg-emerald-500/10' : ''
              }`}
              title="Răspuns util"
            >
              <ThumbsUp size={13} />
            </button>

            <button
              onClick={() => onReaction?.(message.id, 'dislike')}
              className={`p-1.5 rounded-md hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer ${
                message.reaction === 'dislike' ? 'text-rose-400 bg-rose-500/10' : ''
              }`}
              title="Răspuns nesatisfăcător"
            >
              <ThumbsDown size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

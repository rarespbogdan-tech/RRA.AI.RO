import React, { useRef, useState, useEffect } from 'react';
import {
  Send,
  Square,
  Paperclip,
  Mic,
  MicOff,
  X,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { MessageImage } from '../types';

interface ChatInputProps {
  onSendMessage: (content: string, image?: MessageImage) => void;
  onStopGeneration?: () => void;
  isStreaming: boolean;
  samplePrompts?: string[];
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopGeneration,
  isStreaming,
  samplePrompts = [],
  placeholder = 'Scrie un mesaj sau o întrebare... (Apasă Enter pentru a trimite)',
}) => {
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<MessageImage | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea as text grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [text]);

  // Setup Web Speech API for voice dictation
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'ro-RO';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Recunoașterea vocală nu este suportată în acest browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error starting recognition:', err);
      }
    }
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Te rugăm să selectezi un fișier de tip imagine (PNG, JPG, WebP).');
      return;
    }
    // Limit to ~8MB
    if (file.size > 8 * 1024 * 1024) {
      alert('Imaginea este prea mare. Dimensiunea maximă admisă este de 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage({
        data: result,
        mimeType: file.type,
        name: file.name,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isStreaming) {
      onStopGeneration?.();
      return;
    }

    const trimmed = text.trim();
    if (!trimmed && !selectedImage) return;

    onSendMessage(trimmed || 'Analizează imaginea atașată te rog.', selectedImage || undefined);
    setText('');
    setSelectedImage(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 pb-4 pt-1">
      {/* Sample Prompts Chips */}
      {samplePrompts.length > 0 && !text && !selectedImage && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2 font-medium">
            <Sparkles size={13} className="text-amber-400" />
            <span>Sugestii de pornire rapidă:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {samplePrompts.slice(0, 4).map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setText(prompt);
                  textareaRef.current?.focus();
                }}
                className="text-left text-xs p-2.5 rounded-xl bg-neutral-900/70 hover:bg-neutral-800/90 border border-neutral-800/80 hover:border-neutral-700 text-neutral-300 hover:text-white transition-all cursor-pointer shadow-sm group"
              >
                <span className="line-clamp-2 leading-relaxed group-hover:text-blue-300 transition-colors">
                  {prompt}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Container */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative rounded-2xl border transition-all duration-200 bg-neutral-900/90 backdrop-blur-md shadow-xl ${
          isDragging
            ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-950/20'
            : 'border-neutral-800 focus-within:border-neutral-600 focus-within:ring-1 focus-within:ring-neutral-600/40'
        }`}
      >
        {/* Drag overlay notice */}
        {isDragging && (
          <div className="absolute inset-0 z-20 rounded-2xl bg-blue-900/60 backdrop-blur-xs flex items-center justify-center text-sm font-medium text-blue-200 border-2 border-dashed border-blue-400">
            <ImageIcon size={20} className="mr-2 animate-bounce" />
            Eliberează imaginea pentru a o atașa
          </div>
        )}

        {/* Selected Image Preview Pill */}
        {selectedImage && (
          <div className="p-2.5 border-b border-neutral-800/60 flex items-center gap-2">
            <div className="relative group/thumb w-12 h-12 rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950 shrink-0">
              <img
                src={selectedImage.data}
                alt="Previzualizare"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 text-xs">
              <p className="font-medium text-neutral-200 truncate">{selectedImage.name}</p>
              <p className="text-neutral-500 text-[10px]">
                {selectedImage.size ? `${(selectedImage.size / 1024).toFixed(0)} KB` : 'Imagine atașată'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Șterge imaginea"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Text Input Area */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? 'Ascult... vorbiți acum' : placeholder}
          rows={1}
          className="w-full bg-transparent px-4 pt-3.5 pb-2 text-sm text-neutral-100 placeholder-neutral-500 resize-none focus:outline-none max-h-48 leading-relaxed"
        />

        {/* Controls row */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          {/* Left tools: Attach image, Voice dictation */}
          <div className="flex items-center gap-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-neutral-400 hover:text-blue-400 hover:bg-neutral-800/80 transition-colors cursor-pointer"
              title="Atașează o imagine"
            >
              <Paperclip size={17} />
            </button>

            <button
              type="button"
              onClick={toggleListening}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'text-red-400 bg-red-500/15 animate-pulse'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80'
              }`}
              title={isListening ? 'Oprește dictarea' : 'Dictare vocală (Română)'}
            >
              {isListening ? <MicOff size={17} /> : <Mic size={17} />}
            </button>

            {text.length > 0 && (
              <span className="text-[11px] text-neutral-500 ml-2 select-none">
                {text.length} caractere
              </span>
            )}
          </div>

          {/* Right tool: Send or Stop */}
          <div className="flex items-center gap-2">
            {isStreaming ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-500 text-white text-xs font-medium transition-all shadow-md cursor-pointer animate-pulse"
                title="Oprește generarea"
              >
                <Square size={13} fill="currentColor" />
                <span>Oprește</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!text.trim() && !selectedImage}
                className={`p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                  text.trim() || selectedImage
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-50'
                }`}
                title="Trimite mesajul (Enter)"
              >
                <Send size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-2 pt-1.5 text-[11px] text-neutral-500">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>rares.ro.ai • Motor autonom ultra-rapid activat</span>
        </span>
        <span className="hidden sm:inline">Shift + Enter pentru rând nou</span>
      </div>
    </div>
  );
};

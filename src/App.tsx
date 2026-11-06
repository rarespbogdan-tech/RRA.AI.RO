import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessageItem } from './components/ChatMessageItem';
import { ChatInput } from './components/ChatInput';
import { PersonaModal } from './components/PersonaModal';
import { SettingsModal } from './components/SettingsModal';
import { MemoryModal } from './components/MemoryModal';
import { MemoryToast } from './components/MemoryToast';
import { ImageModal } from './components/ImageModal';
import { GameStudioModal } from './components/GameStudioModal';
import { ThemeModal } from './components/ThemeModal';
import { LoginModal } from './components/LoginModal';
import { AccountHubModal } from './components/AccountHubModal';
import { PersonaIcon } from './components/PersonaIcon';
import { PERSONAS } from './constants/personas';
import {
  Conversation,
  ChatMessage,
  MessageImage,
  Persona,
  ThinkingLevelType,
  AiModelType,
  ThemeId,
  MemoryItem,
  MemoryCategory,
  UserProfile,
} from './types';
import { Sparkles, Brain, Zap, User, Shield, Check } from 'lucide-react';

const STORAGE_KEY_CONVERSATIONS = 'chatbox_conversations_v1';
const STORAGE_KEY_ACTIVE_ID = 'chatbox_active_id_v1';
const STORAGE_KEY_SETTINGS = 'chatbox_settings_v1';
const STORAGE_KEY_MEMORIES = 'chatbox_memories_v1';
const STORAGE_KEY_MEMORY_ENABLED = 'chatbox_memory_enabled_v1';
const STORAGE_KEY_MODEL = 'rares_selected_model_v1';
const STORAGE_KEY_THEME = 'rares_theme_v1';
const STORAGE_KEY_USER_PROFILE = 'rares_user_profile_v1';

export default function App() {
  // Load initial settings
  const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevelType>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.thinkingLevel) return parsed.thinkingLevel;
      }
    } catch (e) {
      // fallback
    }
    return 'MEDIUM';
  });

  const [customInstruction, setCustomInstruction] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.customInstruction) return parsed.customInstruction;
      }
    } catch (e) {
      // fallback
    }
    return '';
  });

  // Long-Term Memory State
  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MEMORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Could not load memories from localStorage:', e);
    }
    return [];
  });

  const [memoryEnabled, setMemoryEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MEMORY_ENABLED);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch (e) {
      // fallback
    }
    return true;
  });

  const [memoryModalOpen, setMemoryModalOpen] = useState(false);
  const [newMemoryToast, setNewMemoryToast] = useState<string | null>(null);
  const [isScanningMemory, setIsScanningMemory] = useState(false);

  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading conversations:', e);
    }

    // Default first conversation
    const initialId = 'conv-' + Date.now();
    return [
      {
        id: initialId,
        title: 'Conversație nouă',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        personaId: 'universal',
        messages: [],
      },
    ];
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    const savedId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (savedId && conversations.some((c) => c.id === savedId)) {
      return savedId;
    }
    return conversations[0]?.id || '';
  });

  const [currentModel, setCurrentModel] = useState<AiModelType>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MODEL);
      if (saved && ['rares.ro.ai', 'gemini', 'chatgpt', 'claude'].includes(saved)) {
        return saved as AiModelType;
      }
    } catch (e) {
      // fallback
    }
    return 'rares.ro.ai';
  });

  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (
        saved &&
        ['neon-night', 'minimalist-light', 'cyberpunk', 'emerald-matrix', 'sunset-horizon'].includes(
          saved
        )
      ) {
        return saved as ThemeId;
      }
    } catch (e) {
      // fallback
    }
    return 'neon-night';
  });

  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [gameStudioOpen, setGameStudioOpen] = useState(false);

  // User Profile & AI Account Sync State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER_PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          connectedAccounts: {
            raresAi: true, // rares.ro.ai is always connected autonomously!
            gemini: Boolean(parsed.isLoggedIn),
            chatgpt: Boolean(parsed.isLoggedIn),
            claude: Boolean(parsed.isLoggedIn),
          },
        };
      }
    } catch (e) {
      // fallback
    }
    return {
      name: 'Rareș',
      email: 'raresp.bogdan@gmail.com',
      isLoggedIn: false,
      requireLoginOnEntry: true,
      connectedAccounts: {
        raresAi: true,
        gemini: false,
        chatgpt: false,
        claude: false,
      },
    };
  });

  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER_PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.requireLoginOnEntry) return true;
        return !parsed.isLoggedIn;
      }
    } catch (e) {
      // fallback
    }
    return true; // Default prompt login on entry as requested
  });

  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [loginToastGreeting, setLoginToastGreeting] = useState<string | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [personaModalOpen, setPersonaModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ src: string; alt?: string } | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active conversation
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];

  // Active persona for current conversation
  const activePersona =
    PERSONAS.find((p) => p.id === activeConversation?.personaId) || PERSONAS[0];

  // Persist conversations
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
    } catch (e) {
      console.warn('Could not persist conversations to localStorage:', e);
    }
  }, [conversations]);

  // Persist active conversation id
  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeConversationId);
    }
  }, [activeConversationId]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_SETTINGS,
        JSON.stringify({ thinkingLevel, customInstruction })
      );
    } catch (e) {
      console.warn('Could not save settings:', e);
    }
  }, [thinkingLevel, customInstruction]);

  // Persist memories
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MEMORIES, JSON.stringify(memories));
    } catch (e) {
      console.warn('Could not save memories:', e);
    }
  }, [memories]);

  // Persist memory enabled flag
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MEMORY_ENABLED, String(memoryEnabled));
    } catch (e) {
      console.warn('Could not save memory enabled flag:', e);
    }
  }, [memoryEnabled]);

  // Persist selected model
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MODEL, currentModel);
    } catch (e) {
      console.warn('Could not save selected model:', e);
    }
  }, [currentModel]);

  // Persist and apply selected theme
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, currentTheme);
      document.documentElement.setAttribute('data-theme', currentTheme);
    } catch (e) {
      console.warn('Could not save selected theme:', e);
    }
  }, [currentTheme]);

  // Persist user profile
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER_PROFILE, JSON.stringify(userProfile));
    } catch (e) {
      console.warn('Could not save user profile:', e);
    }
  }, [userProfile]);

  // Auto-dismiss new memory toast after 6 seconds
  useEffect(() => {
    if (newMemoryToast) {
      const timer = setTimeout(() => {
        setNewMemoryToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [newMemoryToast]);

  // Auto-dismiss login greeting toast after 6 seconds
  useEffect(() => {
    if (loginToastGreeting) {
      const timer = setTimeout(() => {
        setLoginToastGreeting(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [loginToastGreeting]);

  // Auto-scroll on new messages or streaming
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [activeConversationId]);

  useEffect(() => {
    if (isStreaming) {
      scrollToBottom(true);
    }
  }, [activeConversation?.messages]);

  // Handle New Conversation
  const handleNewConversation = (preferredPersonaId?: string) => {
    const newId = 'conv-' + Date.now();
    const newConv: Conversation = {
      id: newId,
      title: 'Conversație nouă',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      personaId: preferredPersonaId || activePersona.id,
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
  };

  // Switch persona for the active conversation
  const handleSelectPersona = (persona: Persona) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId ? { ...c, personaId: persona.id } : c
      )
    );
  };

  // Delete conversation
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      if (updated.length === 0) {
        const freshId = 'conv-' + Date.now();
        const fresh: Conversation = {
          id: freshId,
          title: 'Conversație nouă',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          personaId: 'universal',
          messages: [],
        };
        setActiveConversationId(freshId);
        return [fresh];
      }
      if (activeConversationId === id) {
        setActiveConversationId(updated[0].id);
      }
      return updated;
    });
  };

  // Rename conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  };

  // Toggle pin conversation
  const handleTogglePinConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  };

  // Clear current conversation messages
  const handleClearConversation = () => {
    if (window.confirm('Ești sigur că vrei să golești această conversație?')) {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConversationId ? { ...c, messages: [] } : c))
      );
    }
  };

  // Clear all conversations
  const handleClearAllConversations = () => {
    const freshId = 'conv-' + Date.now();
    const fresh: Conversation = {
      id: freshId,
      title: 'Conversație nouă',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      personaId: 'universal',
      messages: [],
    };
    setConversations([fresh]);
    setActiveConversationId(freshId);
  };

  // Memory Management Handlers
  const handleAddMemory = (fact: string, category: MemoryCategory) => {
    const newItem: MemoryItem = {
      id: 'mem-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      fact,
      category,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sourceConversationId: activeConversationId,
    };
    setMemories((prev) => [newItem, ...prev]);
    setNewMemoryToast(fact);
  };

  const handleUpdateMemory = (id: string, newFact: string, newCategory: MemoryCategory) => {
    setMemories((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, fact: newFact, category: newCategory, updatedAt: Date.now() } : m
      )
    );
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleClearAllMemories = () => {
    setMemories([]);
  };

  const handleScanCurrentConversation = async () => {
    if (!activeConversation?.messages.length) {
      alert('Această conversație nu conține mesaje pentru analiză.');
      return;
    }
    setIsScanningMemory(true);
    try {
      const res = await fetch('/api/memory/scan-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: activeConversation.messages,
          existingMemories: memories.map((m) => ({ fact: m.fact, category: m.category })),
        }),
      });
      const data = await res.json();
      if (data.newMemories && data.newMemories.length > 0) {
        const newItems: MemoryItem[] = data.newMemories.map((nm: any) => ({
          id: 'mem-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          fact: nm.fact,
          category: nm.category,
          sourceSnippet: nm.sourceSnippet,
          sourceConversationId: activeConversationId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }));
        setMemories((prev) => [...newItems, ...prev]);
        setNewMemoryToast(`Au fost reținute ${newItems.length} detalii noi`);
      } else {
        alert('Nu au fost identificate fapte sau preferințe noi în această conversație.');
      }
    } catch (err) {
      console.error('Scan error:', err);
      alert('A apărut o eroare la scanarea conversației.');
    } finally {
      setIsScanningMemory(false);
    }
  };

  // Message reaction
  const handleReaction = (messageId: string, reaction: 'like' | 'dislike') => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConversationId) return c;
        return {
          ...c,
          messages: c.messages.map((m) =>
            m.id === messageId
              ? { ...m, reaction: m.reaction === reaction ? undefined : reaction }
              : m
          ),
        };
      })
    );
  };

  // Stop streaming generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConversationId) return c;
        return {
          ...c,
          messages: c.messages.map((m) =>
            m.isStreaming ? { ...m, isStreaming: false } : m
          ),
        };
      })
    );
  };

  // Send message and stream response from server
  const handleSendMessage = async (content: string, image?: MessageImage) => {
    if (isStreaming) return;

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content,
      timestamp: Date.now(),
      image,
    };

    const assistantMessageId = 'msg-' + (Date.now() + 1);
    const placeholderAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'model',
      content: '',
      timestamp: Date.now() + 1,
      isStreaming: true,
    };

    const currentMessages = activeConversation.messages;
    const isFirstMessage = currentMessages.length === 0;

    // Update conversation with user message and empty streaming assistant message
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConversationId) return c;
        return {
          ...c,
          updatedAt: Date.now(),
          messages: [...c.messages, userMessage, placeholderAssistantMessage],
        };
      })
    );

    // If it's the first message, generate a smart title in background
    if (isFirstMessage) {
      fetch('/api/chat/suggest-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: content }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.title) {
            handleRenameConversation(activeConversationId, data.title);
          }
        })
        .catch((e) => console.warn('Could not generate smart title:', e));
    }

    // Build history for backend
    const fullHistory = [...currentMessages, userMessage];

    // Combine system instructions: persona instruction + user custom instruction
    let fullSystemInstruction = activePersona.systemInstruction;
    if (customInstruction.trim()) {
      fullSystemInstruction += `\n\nReguli adiționale solicitate de utilizator: ${customInstruction.trim()}`;
    }

    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: fullHistory.map((m) => ({
            role: m.role,
            content: m.content,
            image: m.image
              ? { data: m.image.data, mimeType: m.image.mimeType }
              : undefined,
          })),
          systemInstruction: fullSystemInstruction,
          thinkingLevel,
          memories: memoryEnabled ? memories : [],
          memoryEnabled,
          engine: 'rares.ro.ai',
          model: currentModel,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          // Parse SSE event and data
          const eventMatch = line.match(/^event: (.*)$/m);
          const dataMatch = line.match(/^data: ([\s\S]*)$/m);

          const eventType = eventMatch ? eventMatch[1].trim() : 'chunk';
          const rawData = dataMatch ? dataMatch[1].trim() : '';

          if (eventType === 'error') {
            try {
              const errObj = JSON.parse(rawData);
              throw new Error(errObj.message || 'Eroare necunoscută');
            } catch (jsonErr) {
              throw new Error(rawData || 'Eroare primită de la server');
            }
          }

          if (eventType === 'chunk' && rawData) {
            try {
              const parsed = JSON.parse(rawData);
              if (parsed.text) {
                accumulatedText += parsed.text;
                // Update message in state
                setConversations((prev) =>
                  prev.map((c) => {
                    if (c.id !== activeConversationId) return c;
                    return {
                      ...c,
                      messages: c.messages.map((m) =>
                        m.id === assistantMessageId
                          ? { ...m, content: accumulatedText }
                          : m
                      ),
                    };
                  })
                );
              }
            } catch (err) {
              console.warn('Error parsing SSE data:', err);
            }
          }
        }
      }

      // Finalize message
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeConversationId) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantMessageId
                ? { ...m, content: accumulatedText, isStreaming: false }
                : m
            ),
          };
        })
      );

      // Automatic memory extraction in background if memory is enabled
      if (memoryEnabled && content.trim().length >= 5) {
        fetch('/api/memory/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userMessage: content,
            assistantReply: accumulatedText,
            existingMemories: memories.map((m) => ({
              fact: m.fact,
              category: m.category,
            })),
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.newMemories && data.newMemories.length > 0) {
              const newItems: MemoryItem[] = data.newMemories.map((nm: any) => ({
                id: 'mem-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
                fact: nm.fact,
                category: nm.category,
                sourceSnippet: nm.sourceSnippet,
                sourceConversationId: activeConversationId,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              }));
              setMemories((prev) => [...newItems, ...prev]);
              setNewMemoryToast(newItems[0].fact);
            }
          })
          .catch((e) => console.warn('Memory extraction error:', e));
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream stopped by user.');
      } else {
        console.error('Chat error:', err);
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== activeConversationId) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMessageId
                  ? {
                      ...m,
                      isStreaming: false,
                      error: err.message || 'A apărut o problemă la comunicare.',
                    }
                  : m
              ),
            };
          })
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate last response
  const handleRegenerate = () => {
    if (isStreaming || !activeConversation.messages.length) return;
    const messages = [...activeConversation.messages];
    const lastMsg = messages[messages.length - 1];

    if (lastMsg.role === 'model') {
      messages.pop(); // remove model message
    }

    const lastUserMsg = messages[messages.length - 1];
    if (!lastUserMsg || lastUserMsg.role !== 'user') return;

    // Remove the user message too because handleSendMessage will re-add it
    messages.pop();

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId ? { ...c, messages } : c
      )
    );

    handleSendMessage(lastUserMsg.content, lastUserMsg.image);
  };

  // User Login & AI Accounts Connect
  const handleUserLogin = (updated: Partial<UserProfile>) => {
    const newProfile: UserProfile = {
      ...userProfile,
      ...updated,
      isLoggedIn: true,
      connectedAccounts: {
        raresAi: true, // rares.ro.ai is always connected autonomously!
        gemini: true,
        chatgpt: true,
        claude: true,
      },
      lastLoginAt: Date.now(),
    };
    setUserProfile(newProfile);
    setLoginModalOpen(false);

    // rares.ro.ai autonomous greeting ("salut userul")!
    const userName = newProfile.name || 'Rareș';
    const greetingText = `Salut, **${userName}**! Sunt **rares.ro.ai** și m-am conectat deja autonom pentru tine. 🚀\n\nConturile tale **Google Gemini**, **OpenAI ChatGPT** și **Claude Sonnet 5.5** au fost conectate și sincronizate cu succes. Toate sistemele sunt active. Cu ce începem astăzi?`;

    // Add greeting to current conversation if empty or fresh
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversationId) {
          if (c.messages.length === 0) {
            return {
              ...c,
              messages: [
                {
                  id: 'msg-welcome-' + Date.now(),
                  role: 'model',
                  content: greetingText,
                  timestamp: Date.now(),
                  model: 'rares.ro.ai',
                },
              ],
            };
          }
        }
        return c;
      })
    );

    // Register user name in memory
    const nameFact = `Utilizatorul se numește ${userName}.`;
    if (!memories.some((m) => m.fact.toLowerCase().includes(userName.toLowerCase()))) {
      setMemories((prev) => [
        {
          id: 'mem-user-name-' + Date.now(),
          fact: nameFact,
          category: 'profile',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          sourceSnippet: `Autentificare cont ca ${userName}`,
        },
        ...prev,
      ]);
    }

    setLoginToastGreeting(`Salut, ${userName}! rares.ro.ai conectat autonom ⚡`);
  };

  const handleUserLogout = () => {
    setUserProfile((prev) => ({
      ...prev,
      isLoggedIn: false,
      connectedAccounts: {
        raresAi: true, // rares.ro.ai is still connected autonomously!
        gemini: false,
        chatgpt: false,
        claude: false,
      },
    }));
    setLoginModalOpen(true);
  };

  // Export conversation as Markdown or JSON
  const handleExportConversation = (format: 'markdown' | 'json') => {
    if (!activeConversation) return;

    if (format === 'markdown') {
      let md = `# ${activeConversation.title}\n\n`;
      md += `*Creat: ${new Date(activeConversation.createdAt).toLocaleString()}*\n`;
      md += `*Mod AI: ${activePersona.name}*\n`;
      if (memoryEnabled && memories.length > 0) {
        md += `*Memorie activă: ${memories.length} fapte contextuale*\n`;
      }
      md += `\n---\n\n`;

      activeConversation.messages.forEach((m) => {
        const author = m.role === 'user' ? 'Tu' : activePersona.name;
        const time = new Date(m.timestamp).toLocaleTimeString();
        md += `### ${author} (${time})\n\n${m.content}\n\n`;
      });

      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeConversation.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'conversatie'}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const dataStr = JSON.stringify(activeConversation, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chatbox-${activeConversation.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Export all conversations + memories
  const handleExportAllData = () => {
    const backup = {
      conversations,
      memories,
      settings: { thinkingLevel, customInstruction, memoryEnabled },
      exportedAt: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatbox-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import conversations & memories from JSON
  const handleImportData = (jsonStr: string) => {
    const parsed = JSON.parse(jsonStr);
    if (parsed.conversations && Array.isArray(parsed.conversations)) {
      setConversations(parsed.conversations);
      if (parsed.conversations[0]?.id) {
        setActiveConversationId(parsed.conversations[0].id);
      }
      if (Array.isArray(parsed.memories)) {
        setMemories(parsed.memories);
      }
    } else if (Array.isArray(parsed) && parsed.length > 0) {
      setConversations(parsed);
      setActiveConversationId(parsed[0].id);
    } else if (parsed && parsed.id && parsed.messages) {
      setConversations((prev) => [parsed, ...prev]);
      setActiveConversationId(parsed.id);
    }
  };

  const messages = activeConversation?.messages || [];
  const hasMessages = messages.length > 0;

  return (
    <div
      data-theme={currentTheme}
      className="app-theme-root flex h-screen w-screen overflow-hidden bg-[#0a0c10] text-neutral-100 transition-colors duration-200"
    >
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        personas={PERSONAS}
        activePersona={activePersona}
        memoryCount={memories.length}
        memoryEnabled={memoryEnabled}
        onOpenMemoryModal={() => setMemoryModalOpen(true)}
        onOpenGameStudio={() => setGameStudioOpen(true)}
        userProfile={userProfile}
        onOpenAccountModal={() => setAccountModalOpen(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelectConversation={(id) => setActiveConversationId(id)}
        onNewConversation={() => handleNewConversation()}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onTogglePinConversation={handleTogglePinConversation}
        onOpenPersonaModal={() => setPersonaModalOpen(true)}
        onOpenSettingsModal={() => setSettingsModalOpen(true)}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Top Header */}
        <ChatHeader
          conversation={activeConversation}
          activePersona={activePersona}
          currentModel={currentModel}
          onSelectModel={setCurrentModel}
          thinkingLevel={thinkingLevel}
          onChangeThinkingLevel={setThinkingLevel}
          memoryCount={memories.length}
          memoryEnabled={memoryEnabled}
          onOpenMemoryModal={() => setMemoryModalOpen(true)}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenPersonaModal={() => setPersonaModalOpen(true)}
          onOpenGameStudio={() => setGameStudioOpen(true)}
          onOpenThemeModal={() => setThemeModalOpen(true)}
          userProfile={userProfile}
          onOpenAccountModal={() => setAccountModalOpen(true)}
          onClearConversation={handleClearConversation}
          onExportConversation={handleExportConversation}
          onRenameConversation={(t) => handleRenameConversation(activeConversationId, t)}
        />

        {/* Messages Stream Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col">
          {!hasMessages ? (
            /* Welcome Hero for Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto my-auto">
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 ring-1 ring-white/20">
                  <PersonaIcon name={activePersona.iconName} size={30} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0a0c10] flex items-center justify-center">
                  <Sparkles size={11} className="text-white" />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                <span className="bg-gradient-to-r from-purple-400 via-blue-300 to-white bg-clip-text text-transparent">
                  rares.ro.ai
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-md leading-relaxed mb-4">
                Asistent inteligent autonom și ultra-rapid. Răspunde instantaneu, reține preferințele tale în memorie și nu se blochează niciodată.
              </p>

              {/* Memory Indicator Chip */}
              {memoryEnabled && memories.length > 0 && (
                <button
                  onClick={() => setMemoryModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/40 border border-purple-800/40 text-purple-300 hover:text-white text-xs font-medium transition-colors mb-6 cursor-pointer"
                >
                  <Brain size={13} className="text-purple-400" />
                  <span>{memories.length} {memories.length === 1 ? 'amintire activă' : 'amintiri active'} în context</span>
                </button>
              )}
            </div>
          ) : (
            /* Messages List */
            <div className="divide-y divide-neutral-800/40 pb-4">
              {messages.map((message, index) => (
                <ChatMessageItem
                  key={message.id}
                  message={message}
                  persona={activePersona}
                  isLastAssistant={
                    index === messages.length - 1 && message.role === 'model'
                  }
                  onRegenerate={handleRegenerate}
                  onReaction={handleReaction}
                  onPreviewImage={(src, alt) => setPreviewImage({ src, alt })}
                />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onStopGeneration={handleStopGeneration}
          isStreaming={isStreaming}
          samplePrompts={!hasMessages ? activePersona.samplePrompts : []}
        />
      </main>

      {/* Modals */}
      <PersonaModal
        isOpen={personaModalOpen}
        onClose={() => setPersonaModalOpen(false)}
        personas={PERSONAS}
        activePersonaId={activePersona.id}
        onSelectPersona={handleSelectPersona}
      />

      <MemoryModal
        isOpen={memoryModalOpen}
        onClose={() => setMemoryModalOpen(false)}
        memories={memories}
        memoryEnabled={memoryEnabled}
        onToggleMemoryEnabled={setMemoryEnabled}
        onAddMemory={handleAddMemory}
        onUpdateMemory={handleUpdateMemory}
        onDeleteMemory={handleDeleteMemory}
        onClearAllMemories={handleClearAllMemories}
        onScanCurrentConversation={handleScanCurrentConversation}
        isScanning={isScanningMemory}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        customInstruction={customInstruction}
        onSaveCustomInstruction={setCustomInstruction}
        thinkingLevel={thinkingLevel}
        onChangeThinkingLevel={setThinkingLevel}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
        currentModel={currentModel}
        onSelectModel={setCurrentModel}
        onClearAllConversations={handleClearAllConversations}
        onExportAllData={handleExportAllData}
        onImportData={handleImportData}
      />

      <ImageModal
        src={previewImage?.src || null}
        alt={previewImage?.alt}
        onClose={() => setPreviewImage(null)}
      />

      {/* Game Studio & Creator Modal */}
      <GameStudioModal
        isOpen={gameStudioOpen}
        onClose={() => setGameStudioOpen(false)}
        onAskAiToCreateGame={handleSendMessage}
      />

      {/* Theme Customizer Modal */}
      <ThemeModal
        isOpen={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
      />

      {/* User Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onLogin={handleUserLogin}
        initialProfile={userProfile}
      />

      {/* User & AI Accounts Hub Modal */}
      <AccountHubModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        profile={userProfile}
        onUpdateProfile={(updates) => setUserProfile((prev) => ({ ...prev, ...updates }))}
        onLogout={handleUserLogout}
      />

      {/* Floating Login Greeting Toast ("salut userul") */}
      {loginToastGreeting && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0e1118]/95 border border-purple-500/60 shadow-2xl backdrop-blur-md text-xs text-white">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Zap size={16} />
          </div>
          <div>
            <div className="font-bold flex items-center gap-1.5 text-purple-200">
              <span>{loginToastGreeting}</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Gemini, ChatGPT și Claude Sonnet 5.5 sincronizate cu succes.
            </p>
          </div>
          <button
            onClick={() => setLoginToastGreeting(null)}
            className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Memory Capture Toast */}
      {newMemoryToast && (
        <MemoryToast
          fact={newMemoryToast}
          onOpenMemoryModal={() => {
            setNewMemoryToast(null);
            setMemoryModalOpen(true);
          }}
          onDismiss={() => setNewMemoryToast(null)}
        />
      )}
    </div>
  );
}

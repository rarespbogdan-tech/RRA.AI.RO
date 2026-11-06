export type MessageRole = 'user' | 'model';

export interface MessageImage {
  data: string; // base64 data url or base64 string
  mimeType: string;
  name?: string;
  size?: number;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  image?: MessageImage;
  reaction?: 'like' | 'dislike';
  isStreaming?: boolean;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  personaId: string;
  messages: ChatMessage[];
  pinned?: boolean;
}

export type ThinkingLevelType = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Persona {
  id: string;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  systemInstruction: string;
  category: 'general' | 'coding' | 'creative' | 'learning' | 'productivity';
  samplePrompts: string[];
}

export type MemoryCategory = 'profile' | 'preference' | 'fact' | 'goal';

export interface MemoryItem {
  id: string;
  fact: string;
  category: MemoryCategory;
  createdAt: number;
  updatedAt: number;
  sourceSnippet?: string;
  sourceConversationId?: string;
}

export interface MemoryExtractionResult {
  newMemories: Array<{
    fact: string;
    category: MemoryCategory;
    sourceSnippet?: string;
  }>;
}

export type AiModelType = 'rares.ro.ai' | 'gemini' | 'chatgpt' | 'claude';

export interface AiModelConfig {
  id: AiModelType;
  name: string;
  provider: string;
  badge: string;
  tagline: string;
  color: string;
  accentBorder: string;
  iconName: string;
  description: string;
}

export interface GameDefinition {
  id: string;
  title: string;
  genre: 'space' | 'arcade' | 'retro' | 'custom';
  description: string;
  controlsHint: string;
  highScoreKey: string;
}

export type ThemeId = 'neon-night' | 'minimalist-light' | 'cyberpunk' | 'emerald-matrix' | 'sunset-horizon';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  badge: string;
  description: string;
  icon: string;
  isLight?: boolean;
  preview: {
    bg: string;
    sidebar: string;
    accent: string;
    text: string;
  };
}

export interface ArcadeHeroProfile {
  name: string;
  skin: 'rares-cyber' | 'pixel-rares' | 'quantum-ship' | 'neon-mecha';
  laserColor: string;
  specialPower: 'rapid-blaster' | 'shield-overcharge' | 'mega-beam' | 'quantum-speed';
  avatarEmoji: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  isLoggedIn: boolean;
  requireLoginOnEntry: boolean;
  connectedAccounts: {
    raresAi: boolean;
    gemini: boolean;
    chatgpt: boolean;
    claude: boolean;
  };
  lastLoginAt?: number;
}


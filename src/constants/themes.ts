import { ThemeId, ThemeConfig } from '../types';

export const THEMES: ThemeConfig[] = [
  {
    id: 'neon-night',
    name: 'Neon Night',
    badge: 'Implicit',
    description: 'Fundal obsidian profund cu accente neon violet și indigo radiant.',
    icon: 'Moon',
    isLight: false,
    preview: {
      bg: '#0a0c10',
      sidebar: '#0d0f13',
      accent: '#8b5cf6',
      text: '#f3f4f6',
    },
  },
  {
    id: 'minimalist-light',
    name: 'Minimalist Light',
    badge: 'Luminos',
    description: 'Stil aerisit, curat și luminos, cu fundal alb pur și text contrastant de înaltă lizibilitate.',
    icon: 'Sun',
    isLight: true,
    preview: {
      bg: '#f8fafc',
      sidebar: '#ffffff',
      accent: '#2563eb',
      text: '#0f172a',
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    badge: 'Neon Glow',
    description: 'Estetică high-tech futuristă cu accente neon galben-electric și roz cibernetic.',
    icon: 'Zap',
    isLight: false,
    preview: {
      bg: '#07080d',
      sidebar: '#0c0d15',
      accent: '#facc15',
      text: '#fdf4dc',
    },
  },
  {
    id: 'emerald-matrix',
    name: 'Emerald Matrix',
    badge: 'Terminal',
    description: 'Vibrație de terminal hacker cu nuanțe de smarald, verde fosfor și contrast profund.',
    icon: 'Terminal',
    isLight: false,
    preview: {
      bg: '#050a07',
      sidebar: '#08110c',
      accent: '#10b981',
      text: '#d1fae5',
    },
  },
  {
    id: 'sunset-horizon',
    name: 'Sunset Horizon',
    badge: 'Cald',
    description: 'Atmosferă crepusculară caldă cu nuanțe de rubin, amurg roz și cupru strălucitor.',
    icon: 'Flame',
    isLight: false,
    preview: {
      bg: '#0d090d',
      sidebar: '#140d14',
      accent: '#f43f5e',
      text: '#ffe4e6',
    },
  },
];

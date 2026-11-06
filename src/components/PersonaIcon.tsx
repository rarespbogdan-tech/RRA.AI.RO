import React from 'react';
import {
  Sparkles,
  Code,
  PenTool,
  GraduationCap,
  Zap,
  Globe,
  Bot,
  MessageSquare,
} from 'lucide-react';

interface PersonaIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const PersonaIcon: React.FC<PersonaIconProps> = ({ name, className = 'w-4 h-4', size }) => {
  switch (name) {
    case 'Sparkles':
      return <Sparkles size={size} className={className} />;
    case 'Code':
      return <Code size={size} className={className} />;
    case 'PenTool':
      return <PenTool size={size} className={className} />;
    case 'GraduationCap':
      return <GraduationCap size={size} className={className} />;
    case 'Zap':
      return <Zap size={size} className={className} />;
    case 'Globe':
      return <Globe size={size} className={className} />;
    case 'Bot':
      return <Bot size={size} className={className} />;
    default:
      return <MessageSquare size={size} className={className} />;
  }
};

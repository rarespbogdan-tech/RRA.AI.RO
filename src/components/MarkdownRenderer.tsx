import React, { useState } from 'react';
import { marked } from 'marked';
import { Check, Copy, Terminal } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

interface CodeBlockProps {
  language: string;
  code: string;
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-neutral-800 bg-[#0c0e12] shadow-sm">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-neutral-900/90 border-b border-neutral-800 text-xs text-neutral-400">
        <div className="flex items-center gap-1.5 font-mono font-medium text-neutral-300">
          <Terminal size={13} className="text-blue-400" />
          <span>{language || 'text'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Copiază codul"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copiat!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copiază</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto text-xs sm:text-sm font-mono text-neutral-200 leading-relaxed bg-[#0a0c10]">
        <pre className="!bg-transparent !p-0 !m-0">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Split content by code blocks: ```lang\ncode\n```
  const parts: React.ReactNode[] = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore) {
      const html = marked.parse(textBefore, { breaks: true, gfm: true }) as string;
      parts.push(
        <div
          key={`text-${lastIndex}`}
          className="prose-chat text-neutral-100"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    const language = match[1] || '';
    const code = match[2];
    parts.push(
      <CodeBlock
        key={`code-${match.index}`}
        language={language}
        code={code.trimEnd()}
      />
    );

    lastIndex = match.index + match[0].length;
  }

  const remainingText = content.substring(lastIndex);
  if (remainingText) {
    const html = marked.parse(remainingText, { breaks: true, gfm: true }) as string;
    parts.push(
      <div
        key={`text-${lastIndex}`}
        className="prose-chat text-neutral-100"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return <div className="space-y-1">{parts}</div>;
};

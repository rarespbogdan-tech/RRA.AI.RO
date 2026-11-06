import React from 'react';
import { X, Download } from 'lucide-react';

interface ImageModalProps {
  src: string | null;
  alt?: string;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ src, alt, onClose }) => {
  if (!src) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
        {/* Top actions */}
        <div className="w-full flex items-center justify-between pb-3 text-neutral-300">
          <span className="text-xs font-medium truncate max-w-xs">{alt || 'Imagine'}</span>
          <div className="flex items-center gap-2">
            <a
              href={src}
              download={alt || 'imagine-chatbox.png'}
              className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-white transition-colors"
              title="Descarcă imaginea"
            >
              <Download size={16} />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-white transition-colors cursor-pointer"
              title="Închide"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Image preview */}
        <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-2xl">
          <img
            src={src}
            alt={alt || 'Imagine'}
            className="max-h-[80vh] max-w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

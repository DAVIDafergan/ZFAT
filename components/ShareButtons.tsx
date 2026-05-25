import React, { useState } from 'react';
import { Facebook, Twitter, MessageCircleMore, Copy, Check, Link2 } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  description?: string;
  shareUrl: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ title, description = '', shareUrl }) => {
  const [copied, setCopied] = useState(false);
  const shareText = `${title}${description ? ` - ${description}` : ''}`;

  const openPopup = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span className="text-sm font-extrabold text-gray-700">שתפו את הכתבה</span>
        <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600" dir="ltr">
          <Link2 size={14} />
          <span>{shareUrl.replace(/^https?:\/\//, '')}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button onClick={() => openPopup(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`)} className="inline-flex items-center gap-2 rounded-full bg-[#22c55e] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#16a34a]" aria-label="שתף בוואטסאפ">
          <MessageCircleMore size={18} /> WhatsApp
        </button>
        <button onClick={() => openPopup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)} className="inline-flex items-center gap-2 rounded-full bg-[#1877f2] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0e5fcb]" aria-label="שתף בפייסבוק">
          <Facebook size={18} /> Facebook
        </button>
        <button onClick={() => openPopup(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`)} className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-bold text-white transition hover:bg-gray-800" aria-label="שתף ב-X">
          <Twitter size={18} /> X
        </button>
        <button onClick={handleCopy} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:border-red-200 hover:text-red-700" aria-live="polite">
          {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
          {copied ? 'הועתק' : 'העתק קישור'}
        </button>
      </div>
    </div>
  );
};

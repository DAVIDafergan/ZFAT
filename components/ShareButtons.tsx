import React, { useState } from 'react';
import { Facebook, Twitter, MessageCircleMore, Copy, Check, Share2 } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  description?: string;
  shareUrl: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ title, description = '', shareUrl }) => {
  const [copied, setCopied] = useState(false);
  const [shareReady, setShareReady] = useState(false);
  const shareText = `${title}${description ? ` - ${description}` : ''}`;
  const canUseNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const openPopup = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');

  const handleNativeShare = async () => {
    if (!canUseNativeShare) {
      handleCopy();
      return;
    }

    try {
      await navigator.share({
        title,
        text: shareText,
        url: shareUrl,
      });
      setShareReady(true);
      window.setTimeout(() => setShareReady(false), 1800);
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') return;
      handleCopy();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setShareReady(false);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0f1729] p-4 shadow-[0_20px_60px_rgba(15,23,42,0.35)] sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-extrabold text-white/85">שתפו את הכתבה</span>
        <button
          onClick={handleNativeShare}
          className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-gradient-to-r from-red-700 to-red-600 px-4 py-2.5 text-sm font-black text-white shadow-lg transition hover:from-red-600 hover:to-red-500"
          aria-live="polite"
        >
          {shareReady ? <Check size={18} /> : <Share2 size={18} />}
          {shareReady ? 'נפתח לשיתוף' : 'שתפו מהטלפון'}
        </button>
      </div>
      <div className="flex flex-wrap gap-2.5 sm:gap-3">
        <button onClick={() => openPopup(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`)} className="inline-flex items-center gap-2 rounded-full bg-[#1fa855] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#178448]" aria-label="שתף בוואטסאפ">
          <MessageCircleMore size={18} /> WhatsApp
        </button>
        <button onClick={() => openPopup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)} className="inline-flex items-center gap-2 rounded-full bg-[#1f69d9] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#1452b0]" aria-label="שתף בפייסבוק">
          <Facebook size={18} /> Facebook
        </button>
        <button onClick={() => openPopup(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`)} className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-bold text-white transition hover:bg-gray-800" aria-label="שתף ב-X">
          <Twitter size={18} /> X
        </button>
        <button onClick={handleCopy} className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:border-red-300 hover:text-red-200" aria-live="polite">
          {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
          {copied ? 'הועתק' : 'העתק קישור'}
        </button>
      </div>
    </div>
  );
};

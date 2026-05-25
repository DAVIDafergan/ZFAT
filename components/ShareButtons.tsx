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
    <div className="rounded-3xl border border-gray-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-extrabold text-gray-700">שתפו את הכתבה</span>
        <button
          onClick={handleNativeShare}
          className="inline-flex items-center gap-2 rounded-full bg-red-700 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-800"
          aria-live="polite"
        >
          {shareReady ? <Check size={18} /> : <Share2 size={18} />}
          {shareReady ? 'נפתח לשיתוף' : 'שתפו מהטלפון'}
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        {!canUseNativeShare && (
          <>
            <button onClick={() => openPopup(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`)} className="inline-flex items-center gap-2 rounded-full bg-[#22c55e] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#16a34a]" aria-label="שתף בוואטסאפ">
              <MessageCircleMore size={18} /> WhatsApp
            </button>
            <button onClick={() => openPopup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)} className="inline-flex items-center gap-2 rounded-full bg-[#1877f2] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0e5fcb]" aria-label="שתף בפייסבוק">
              <Facebook size={18} /> Facebook
            </button>
            <button onClick={() => openPopup(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`)} className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-bold text-white transition hover:bg-gray-800" aria-label="שתף ב-X">
              <Twitter size={18} /> X
            </button>
          </>
        )}
        <button onClick={handleCopy} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:border-red-200 hover:text-red-700" aria-live="polite">
          {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
          {copied ? 'הועתק' : 'העתק קישור'}
        </button>
      </div>
    </div>
  );
};

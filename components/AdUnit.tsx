import React, { useEffect, useState } from 'react';
import { Ad } from '../types';

interface AdUnitProps {
  ad: Ad | undefined;
  className?: string;
  label?: boolean;
}

export const AdUnit: React.FC<AdUnitProps> = ({ ad, className = '', label = true }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const normalizeLink = (value?: string) => {
    const candidate = (value || '').trim();
    if (!candidate) return '';
    try {
      const parsed = new URL(candidate);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.toString();
      return '';
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (!ad || !ad.slides || ad.slides.length <= 1) return;
    const interval = window.setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % ad.slides.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [ad]);

  if (!ad || !ad.isActive || !ad.slides || ad.slides.length === 0) return null;
  const currentSlide = ad.slides[currentSlideIndex];
  const externalLink = normalizeLink(currentSlide.linkUrl);
  const media = currentSlide.videoUrl ? (
    <video key={currentSlide.videoUrl} src={currentSlide.videoUrl} className="h-auto w-full bg-black object-contain animate-fade-in" autoPlay muted loop playsInline />
  ) : (
    <img key={currentSlide.imageUrl} src={currentSlide.imageUrl} alt={ad.title} loading="lazy" decoding="async" className="h-auto w-full bg-black object-contain animate-fade-in" />
  );

  return (
    <div className={`relative my-4 flex flex-col items-center justify-center ${className}`}>
      {label && <span className="mb-1 text-[10px] uppercase tracking-wider text-gray-400">פרסומת</span>}
      {externalLink ? (
        <a href={externalLink} target="_blank" rel="noopener noreferrer" className="group block w-full overflow-hidden rounded-2xl shadow-sm transition-all hover:shadow-md" aria-label={`מעבר אל ${ad.title}`}>
          {media}
          {ad.slides.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
              {ad.slides.map((_, idx) => (
                <span key={idx} className={`h-1.5 w-1.5 rounded-full shadow-sm ${idx === currentSlideIndex ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          )}
        </a>
      ) : (
        <div className="block w-full overflow-hidden rounded-2xl shadow-sm">
          {media}
          {ad.slides.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
              {ad.slides.map((_, idx) => (
                <span key={idx} className={`h-1.5 w-1.5 rounded-full shadow-sm ${idx === currentSlideIndex ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

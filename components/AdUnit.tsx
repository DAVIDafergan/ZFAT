
import React, { useState, useEffect } from 'react';
import { Ad } from '../types';

interface AdUnitProps {
  ad: Ad | undefined;
  className?: string;
  label?: boolean;
}

export const AdUnit: React.FC<AdUnitProps> = ({ ad, className = '', label = true }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    if (!ad || !ad.slides || ad.slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % ad.slides.length);
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(interval);
  }, [ad]);

  if (!ad || !ad.isActive || !ad.slides || ad.slides.length === 0) return null;

  const currentSlide = ad.slides[currentSlideIndex];

  return (
    <div className={`flex flex-col items-center justify-center my-4 ${className} relative group`}>
      {label && <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">פרסומת</span>}
      <a 
        href={currentSlide.linkUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block w-full overflow-hidden rounded-md shadow-sm transition-all hover:shadow-md relative"
      >
        {currentSlide.videoUrl ? (
          <video 
            key={currentSlide.videoUrl}
            src={currentSlide.videoUrl}
            className="w-full h-auto object-cover animate-fade-in"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img 
            key={currentSlide.imageUrl} // Key change forces animation
            src={currentSlide.imageUrl} 
            alt={ad.title} 
            className="w-full h-auto object-cover animate-fade-in" 
          />
        )}
        
        {/* Carousel Indicators if multiple slides */}
        {ad.slides.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            {ad.slides.map((_, idx) => (
              <span 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full shadow-sm ${idx === currentSlideIndex ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}
      </a>
    </div>
  );
};

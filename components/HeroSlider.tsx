import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Post, CATEGORY_COLORS } from '../types';

interface HeroSliderProps {
  posts: Post[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ posts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const featuredPosts = posts.slice(0, 5);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % featuredPosts.length);
    setImageLoaded(false);
  }, [featuredPosts.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? featuredPosts.length - 1 : prev - 1));
    setImageLoaded(false);
  }, [featuredPosts.length]);

  useEffect(() => {
    if (featuredPosts.length <= 1) return;
    const timer = window.setInterval(goNext, 6000);
    return () => window.clearInterval(timer);
  }, [featuredPosts.length, goNext]);

  if (featuredPosts.length === 0) return null;
  const currentPost = featuredPosts[currentIndex];

  return (
    <section
      className="relative w-full overflow-hidden bg-[#05070c]"
      aria-label="כותרות ראשיות"
      dir="rtl"
    >
      <div className="relative flex min-h-[340px] w-full sm:min-h-[420px] lg:min-h-[500px]">

        {/* Image pane: full background on mobile, left 55% on desktop */}
        <div className="absolute inset-0 lg:relative lg:w-[55%] lg:shrink-0">
          <img
            key={currentPost.id}
            src={currentPost.imageUrl}
            alt={currentPost.title}
            loading={currentIndex === 0 ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={currentIndex === 0 ? 'high' : 'auto'}
            onLoad={() => setImageLoaded(true)}
            className={`h-full w-full object-cover object-center transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {/* Mobile: gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/15 lg:hidden" />
          {/* Desktop: right-edge fade into text pane */}
          <div className="absolute inset-0 hidden bg-gradient-to-l from-[#05070c] via-transparent to-transparent lg:block" />
        </div>

        {/* Text pane: right 45% on desktop, overlay on mobile */}
        <div className="relative z-10 flex w-full flex-col justify-center px-5 pb-10 pt-8 lg:w-[45%] lg:px-10 lg:py-12 xl:px-14">
          <div
            key={`badges-${currentIndex}`}
            className="animate-headline-in mb-4 flex flex-wrap items-center gap-2 sm:mb-5"
          >
            <span
              className={`${
                CATEGORY_COLORS[currentPost.category]
              } inline-flex items-center rounded-full px-4 py-1.5 text-xs font-black text-white shadow-sm sm:text-sm`}
            >
              {currentPost.category}
            </span>
            <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-black tracking-[0.12em] text-white/90 sm:text-xs">
              כתבה ראשית
            </span>
          </div>

          <h2
            key={`title-${currentIndex}`}
            className="animate-headline-in news-headline mb-4 break-words text-2xl font-black leading-snug text-white sm:text-3xl md:text-4xl lg:text-[2.4rem] xl:text-5xl"
          >
            <Link to={`/article/${currentPost.id}`} className="transition hover:text-red-200">
              {currentPost.title}
            </Link>
          </h2>

          <p
            key={`excerpt-${currentIndex}`}
            className="animate-headline-in mb-6 line-clamp-3 text-sm leading-7 text-white/80 sm:text-base sm:leading-8"
          >
            {currentPost.excerpt}
          </p>

          <div>
            <Link
              to={`/article/${currentPost.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-red-700 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-red-800 active:scale-95 sm:px-8 sm:py-3.5 sm:text-base"
            >
              לכתבה המלאה
              <ChevronLeft size={18} />
            </Link>
          </div>
        </div>
      </div>

      {featuredPosts.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/25 bg-black/45 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/65 sm:right-5 sm:block"
            aria-label="כותרת קודמת"
          >
            <ChevronRight size={24} />
          </button>

          <button
            onClick={goNext}
            className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/25 bg-black/45 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/65 sm:left-5 sm:block"
            aria-label="כותרת הבאה"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-5">
            {featuredPosts.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setCurrentIndex(idx); setImageLoaded(false); }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-8 bg-red-500'
                    : 'w-2 bg-white/45 hover:bg-white/70'
                }`}
                aria-label={`עבור לכותרת ${idx + 1}`}
                aria-current={idx === currentIndex}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

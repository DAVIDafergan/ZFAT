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
      className="w-full overflow-hidden bg-[#05070c]"
      aria-label="כותרות ראשיות"
    >
      {/* ── DESKTOP: תמונה שמאל 55%, כותרת ימין 45%, גובה קבוע 480px ── */}
      <div className="hidden lg:flex lg:h-[480px] xl:h-[520px]" dir="ltr">

        {/* תמונה — גובה קבוע, object-cover תמיד */}
        <div className="relative h-full w-[55%] shrink-0 overflow-hidden">
          <img
            key={currentPost.id}
            src={currentPost.imageUrl}
            alt={currentPost.title}
            width={880}
            height={480}
            loading={currentIndex === 0 ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={currentIndex === 0 ? 'high' : 'auto'}
            onLoad={() => setImageLoaded(true)}
            className={`h-full w-full object-cover object-center transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[#05070c] via-[#05070c]/20 to-transparent" />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#05070c]/60 to-transparent" />
        </div>

        {/* טקסט — צד ימין */}
        <div className="relative flex h-full w-[45%] flex-col justify-center px-10 xl:px-14" dir="rtl">
          <div
            key={`badges-${currentIndex}`}
            className="animate-headline-in mb-5 flex flex-wrap items-center gap-2"
          >
            <span className={`${CATEGORY_COLORS[currentPost.category]} inline-flex items-center rounded-full px-4 py-1.5 text-sm font-black text-white shadow-sm`}>
              {currentPost.category}
            </span>
            <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-black tracking-[0.12em] text-white/85">
              כתבה ראשית
            </span>
          </div>

          {/* line-clamp-3 מונע הגדלת הגובה */}
          <h2
            key={`title-${currentIndex}`}
            className="animate-headline-in news-headline mb-4 line-clamp-3 text-[1.9rem] font-black leading-snug text-white xl:text-[2.2rem]"
          >
            <Link to={`/article/${currentPost.id}`} className="transition hover:text-red-200">
              {currentPost.title}
            </Link>
          </h2>

          <p
            key={`excerpt-${currentIndex}`}
            className="animate-headline-in mb-7 line-clamp-2 text-base leading-7 text-white/75"
          >
            {currentPost.excerpt}
          </p>

          <div className="flex items-center gap-4">
            <Link
              to={`/article/${currentPost.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-red-700 px-7 py-3 text-sm font-black text-white shadow-lg transition hover:bg-red-800 active:scale-95"
            >
              לכתבה המלאה
              <ChevronLeft size={17} />
            </Link>

            {featuredPosts.length > 1 && (
              <div className="flex items-center gap-1.5">
                {featuredPosts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setCurrentIndex(idx); setImageLoaded(false); }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? 'w-7 bg-red-500' : 'w-2 bg-white/35 hover:bg-white/60'
                    }`}
                    aria-label={`עבור לכותרת ${idx + 1}`}
                    aria-current={idx === currentIndex}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* חצי ניווט דסקטופ */}
        {featuredPosts.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute right-5 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/70"
              aria-label="כותרת קודמת"
            >
              <ChevronRight size={22} />
            </button>
            <button
              onClick={goNext}
              className="absolute left-5 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/70"
              aria-label="כותרת הבאה"
            >
              <ChevronLeft size={22} />
            </button>
          </>
        )}
      </div>

      {/* ── MOBILE: כותרת + רקע כהה למעלה, תמונה למטה ── */}
      <div className="flex flex-col lg:hidden">

        {/* אזור טקסט */}
        <div
          key={`mobile-text-${currentIndex}`}
          className="animate-headline-in bg-[#0b0f19] px-4 pb-5 pt-5"
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={`${CATEGORY_COLORS[currentPost.category]} inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-black text-white`}>
              {currentPost.category}
            </span>
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black text-white/80">
              כתבה ראשית
            </span>
          </div>

          <h2 className="news-headline mb-2.5 line-clamp-3 text-xl font-black leading-snug text-white sm:text-2xl">
            <Link to={`/article/${currentPost.id}`} className="transition active:text-red-300">
              {currentPost.title}
            </Link>
          </h2>

          <p className="mb-4 line-clamp-2 text-sm leading-6 text-white/65">
            {currentPost.excerpt}
          </p>

          <div className="flex items-center justify-between">
            <Link
              to={`/article/${currentPost.id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-red-700 px-5 py-2.5 text-sm font-black text-white transition active:scale-95"
            >
              לכתבה המלאה
              <ChevronLeft size={15} />
            </Link>

            {featuredPosts.length > 1 && (
              <div className="flex items-center gap-1.5">
                {featuredPosts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setCurrentIndex(idx); setImageLoaded(false); }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? 'w-6 bg-red-500' : 'w-2 bg-white/30'
                    }`}
                    aria-label={`עבור לכותרת ${idx + 1}`}
                    aria-current={idx === currentIndex}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* תמונה — גובה קבוע תמיד */}
        <div className="relative h-[220px] w-full overflow-hidden sm:h-[280px]">
          <img
            key={`mob-img-${currentPost.id}`}
            src={currentPost.imageUrl}
            alt={currentPost.title}
            width={880}
            height={480}
            loading={currentIndex === 0 ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={currentIndex === 0 ? 'high' : 'auto'}
            onLoad={() => setImageLoaded(true)}
            className={`h-full w-full object-cover object-center transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#0b0f19] to-transparent" />

          {featuredPosts.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/55 p-2 text-white backdrop-blur-sm"
                aria-label="כותרת קודמת"
              >
                <ChevronRight size={18} />
              </button>
              <button
                onClick={goNext}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/55 p-2 text-white backdrop-blur-sm"
                aria-label="כותרת הבאה"
              >
                <ChevronLeft size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

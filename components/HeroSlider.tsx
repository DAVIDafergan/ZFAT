import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Post, CATEGORY_COLORS } from '../types';

interface HeroSliderProps {
  posts: Post[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ posts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featuredPosts = posts.slice(0, 5);

  useEffect(() => {
    if (featuredPosts.length <= 1) return;
    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredPosts.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [featuredPosts.length]);

  if (featuredPosts.length === 0) return null;
  const currentPost = featuredPosts[currentIndex];

  return (
    <section className="relative w-full overflow-hidden bg-[#05070c]" aria-label="כותרות ראשיות">
      <div className="relative min-h-[500px] sm:min-h-[600px] lg:min-h-[680px]">
        <img
          src={currentPost.imageUrl}
          alt={currentPost.title}
          loading={currentIndex === 0 ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={currentIndex === 0 ? 'high' : 'auto'}
          className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/20" />

        <div className="relative container mx-auto flex min-h-[500px] items-end px-4 pb-10 pt-16 sm:min-h-[600px] sm:pb-12 lg:min-h-[680px] lg:pb-16">
          <div key={currentIndex} className="animate-headline-in w-full max-w-3xl rounded-[1.5rem] border border-white/15 bg-black/45 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:rounded-[2rem] sm:p-7 md:p-9">
            <div className="mb-4 flex flex-wrap items-center gap-3 sm:mb-5">
              <span className={`${CATEGORY_COLORS[currentPost.category]} inline-flex items-center rounded-full px-4 py-2 text-xs font-black text-white shadow-sm sm:text-sm`}>
                {currentPost.category}
              </span>
              <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11px] font-black tracking-[0.14em] text-white/90 sm:text-xs">
                BREAKING NEWS
              </span>
            </div>

            <h2 className="news-headline break-words text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              <Link to={`/article/${currentPost.id}`} className="transition hover:text-red-200">
                {currentPost.title}
              </Link>
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:mt-5 sm:text-base md:text-lg">
              {currentPost.excerpt}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
              <Link
                to={`/article/${currentPost.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-red-700 px-6 py-3 text-sm font-black text-white transition hover:bg-red-800 sm:px-8 sm:py-3.5 sm:text-base"
              >
                לכתבה המלאה
                <ChevronLeft size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {featuredPosts.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev === 0 ? featuredPosts.length - 1 : prev - 1))}
            className="absolute left-4 top-1/2 hidden z-10 -translate-y-1/2 rounded-full border border-white/25 bg-black/45 p-3 text-white backdrop-blur-sm transition hover:bg-black/65 sm:left-6 sm:block"
            aria-label="כותרת קודמת"
          >
            <ChevronLeft size={28} />
          </button>

          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredPosts.length)}
            className="absolute right-4 top-1/2 hidden z-10 -translate-y-1/2 rounded-full border border-white/25 bg-black/45 p-3 text-white backdrop-blur-sm transition hover:bg-black/65 sm:right-6 sm:block"
            aria-label="כותרת הבאה"
          >
            <ChevronRight size={28} />
          </button>

          <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-8">
            {featuredPosts.map((post, idx) => (
              <button
                key={post.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-9 bg-red-500' : 'w-2.5 bg-white/50 hover:bg-white/75'
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

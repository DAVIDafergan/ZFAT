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
    <section className="relative w-full bg-gray-50 overflow-hidden" aria-label="כותרות ראשיות">
      <div className="flex flex-col lg:flex-row items-stretch gap-0 min-h-[500px] sm:min-h-[600px] lg:min-h-[680px]">
        <div className="relative w-full lg:w-1/2 flex-shrink-0 overflow-hidden bg-gray-200 order-2 lg:order-1">
          <img
            src={currentPost.imageUrl}
            alt={currentPost.title}
            loading={currentIndex === 0 ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={currentIndex === 0 ? 'high' : 'auto'}
            className="w-full h-full object-contain object-center transition-opacity duration-700"
          />

          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-transparent lg:from-black/20 lg:to-transparent pointer-events-none" />
        </div>

        <div className="relative w-full lg:w-1/2 flex-shrink-0 flex flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-10 lg:py-20 bg-white order-1 lg:order-2">
          <div key={currentIndex} className="animate-headline-in w-full max-w-md space-y-4 sm:space-y-5 md:space-y-6">
            <div>
              <span className={`${CATEGORY_COLORS[currentPost.category]} inline-block rounded-full px-4 py-2 text-xs font-black shadow-sm sm:text-sm md:text-base`}>
                {currentPost.category}
              </span>
            </div>

            <h2 className="news-headline break-words text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight sm:leading-[1.2] text-gray-900">
              <Link to={`/article/${currentPost.id}`} className="transition hover:text-red-600">
                {currentPost.title}
              </Link>
            </h2>

            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-600">
              {currentPost.excerpt}
            </p>

            <div className="pt-2 sm:pt-4">
              <Link
                to={`/article/${currentPost.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-red-700 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 text-xs sm:text-sm md:text-base font-black text-white transition hover:bg-red-800 hover:scale-105 active:scale-95 shadow-lg"
              >
                קרא עכשיו
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
            className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur-sm transition hover:bg-black/60 sm:left-6 sm:block z-10"
            aria-label="כותרת קודמת"
          >
            <ChevronLeft size={28} />
          </button>

          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredPosts.length)}
            className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur-sm transition hover:bg-black/60 sm:right-6 sm:block z-10"
            aria-label="כותרת הבאה"
          >
            <ChevronRight size={28} />
          </button>

          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 z-10">
            {featuredPosts.map((post, idx) => (
              <button
                key={post.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-8 bg-red-600' : 'w-2.5 bg-gray-400 hover:bg-gray-600'
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

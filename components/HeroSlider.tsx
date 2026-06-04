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
  const isInitialSlide = currentIndex === 0;
  const categoryTint = CATEGORY_COLORS[currentPost.category].replace('bg-', 'from-');

  return (
    <section className="animate-scan-line relative h-[360px] w-full overflow-hidden bg-gray-900 sm:h-[420px] md:h-[620px]" aria-label="כותרות ראשיות">
      <div className="absolute inset-0">
        <img src={currentPost.imageUrl} alt="" aria-hidden="true" loading={isInitialSlide ? 'eager' : 'lazy'} decoding="async" fetchPriority={isInitialSlide ? 'high' : 'auto'} className="absolute inset-0 h-full w-full object-cover brightness-50 blur-xs transition-opacity duration-700" />
        <img src={currentPost.imageUrl} alt={currentPost.title} loading={isInitialSlide ? 'eager' : 'lazy'} decoding="async" fetchPriority={isInitialSlide ? 'high' : 'auto'} className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
        <div className={`absolute inset-0 bg-gradient-to-l ${categoryTint}/40 via-transparent to-black/20`} />
      </div>

      <div className="absolute inset-0 flex items-end">
        <div className="container mx-auto w-full px-4 pb-5 sm:pb-8 md:pb-14">
          <div key={currentIndex} className="animate-headline-in max-w-4xl rounded-[1.5rem] border border-white/30 bg-black/60 p-4 text-white shadow-2xl backdrop-blur-md sm:rounded-[2rem] sm:p-6 md:p-10 lg:p-12">
            <span className={`${CATEGORY_COLORS[currentPost.category]} mb-2 inline-block rounded-full px-3 py-1.5 text-xs font-black shadow-md sm:mb-3 sm:px-4 sm:py-2 sm:text-sm md:text-base`}>{currentPost.category}</span>
            <h2 className="news-headline mb-3 break-words text-lg font-black leading-tight sm:mb-4 sm:text-2xl sm:leading-[1.15] md:text-4xl md:leading-[1.1] lg:text-6xl lg:leading-[1.05]">
              <Link to={`/article/${currentPost.id}`} className="transition hover:text-red-300 drop-shadow-lg">{currentPost.title}</Link>
            </h2>
            <p className="mb-4 hidden max-w-2xl text-xs leading-relaxed text-gray-50 drop-shadow-md sm:mb-6 sm:block sm:text-sm md:text-base lg:text-lg">{currentPost.excerpt}</p>
            <Link to={`/article/${currentPost.id}`} className="inline-flex items-center gap-2 rounded-full bg-red-700 px-5 py-2.5 text-xs font-black text-white shadow-lg transition hover:scale-105 hover:bg-red-800 active:scale-95 sm:px-8 sm:py-3 sm:text-sm md:px-10 md:py-4 md:text-base">
              קרא עכשיו
            </Link>
          </div>
        </div>
      </div>

      {featuredPosts.length > 1 && (
        <>
          <button onClick={() => setCurrentIndex((prev) => (prev === 0 ? featuredPosts.length - 1 : prev - 1))} className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/35 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/60 sm:left-4 sm:block sm:p-3" aria-label="כותרת קודמת">
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredPosts.length)} className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/35 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/60 sm:right-4 sm:block sm:p-3" aria-label="כותרת הבאה">
            <ChevronRight size={24} />
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {featuredPosts.map((post, idx) => (
              <button key={post.id} onClick={() => setCurrentIndex(idx)} className={`h-2 rounded-full transition-all ${idx === currentIndex ? 'w-10 bg-red-600' : 'w-4 bg-white/40 hover:bg-white'}`} aria-label={`עבור לכותרת ${idx + 1}`} aria-current={idx === currentIndex} />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

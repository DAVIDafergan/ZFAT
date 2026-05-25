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
    <section className="relative h-[340px] w-full overflow-hidden bg-gray-900 md:h-[620px]" aria-label="כותרות ראשיות">
      <div className="absolute inset-0">
        <img src={currentPost.imageUrl} alt={currentPost.title} className="h-full w-full object-cover opacity-85" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
      </div>

      <div className="absolute inset-0 flex items-end">
        <div className="container mx-auto w-full px-4 pb-8 md:pb-14">
          <div className="max-w-3xl rounded-[2rem] border border-white/10 bg-black/25 p-6 text-white shadow-2xl backdrop-blur-sm md:p-10">
            <span className={`${CATEGORY_COLORS[currentPost.category]} mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-black shadow-sm`}>{currentPost.category}</span>
            <h2 className="news-headline mb-4 text-3xl font-black leading-tight md:text-6xl">
              <Link to={`/article/${currentPost.id}`} className="transition hover:text-red-300">{currentPost.title}</Link>
            </h2>
            <p className="mb-6 max-w-2xl text-lg leading-8 text-gray-100">{currentPost.excerpt}</p>
            <Link to={`/article/${currentPost.id}`} className="inline-flex items-center gap-2 rounded-full bg-red-700 px-8 py-3 text-sm font-black text-white transition hover:bg-red-800">
              קרא עכשיו
            </Link>
          </div>
        </div>
      </div>

      {featuredPosts.length > 1 && (
        <>
          <button onClick={() => setCurrentIndex((prev) => (prev === 0 ? featuredPosts.length - 1 : prev - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-3 text-white backdrop-blur-sm transition hover:bg-black/60" aria-label="כותרת קודמת">
            <ChevronLeft size={28} />
          </button>
          <button onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredPosts.length)} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-3 text-white backdrop-blur-sm transition hover:bg-black/60" aria-label="כותרת הבאה">
            <ChevronRight size={28} />
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

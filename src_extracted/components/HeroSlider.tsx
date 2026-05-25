import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Post, CATEGORY_COLORS } from '../types';

interface HeroSliderProps {
  posts: Post[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ posts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featuredPosts = posts.slice(0, 5); // Take up to 5 featured posts

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredPosts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredPosts.length]);

  if (featuredPosts.length === 0) return null;

  const currentPost = featuredPosts[currentIndex];

  return (
    <div className="relative w-full h-[400px] md:h-[500px] bg-gray-900 overflow-hidden group">
      {/* Background Image */}
      <div className="absolute inset-0 transition-all duration-700 ease-in-out">
        <img 
          src={currentPost.imageUrl} 
          alt={currentPost.title} 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 right-0 w-full p-6 md:p-12 md:w-2/3 lg:w-1/2">
        <span className={`${CATEGORY_COLORS[currentPost.category]} text-white px-3 py-1 rounded-sm text-sm font-bold tracking-wide mb-3 inline-block shadow-sm`}>
          {currentPost.category}
        </span>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4 drop-shadow-lg">
          <Link to={`/article/${currentPost.id}`} className="hover:text-red-400 transition-colors">
            {currentPost.title}
          </Link>
        </h2>
        <p className="text-gray-200 text-lg line-clamp-2 mb-6 font-light">
          {currentPost.excerpt}
        </p>
        <Link 
          to={`/article/${currentPost.id}`}
          className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-all hover:shadow-lg hover:scale-105"
        >
          קרא עוד
        </Link>
      </div>

      {/* Controls */}
      <button 
        onClick={() => setCurrentIndex((prev) => (prev === 0 ? featuredPosts.length - 1 : prev - 1))}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={32} />
      </button>
      <button 
        onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredPosts.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={32} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-6 flex gap-2">
        {featuredPosts.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-8 bg-red-600' : 'w-4 bg-white/50 hover:bg-white'}`}
          />
        ))}
      </div>
    </div>
  );
};
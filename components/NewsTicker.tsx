import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';

interface NewsTickerProps {
  posts: Post[];
}

export const NewsTicker: React.FC<NewsTickerProps> = ({ posts }) => {
  if (posts.length === 0) return null;
  return (
    <div className="relative z-40 flex h-11 items-center overflow-hidden border-b-4 border-red-700 bg-[#111] text-white" aria-label="מבזקים" role="region">
      <div className="z-10 flex h-full shrink-0 items-center bg-red-700 px-5 text-sm font-black shadow-lg">מבזקים</div>
      <div className="ticker-track flex-1 overflow-hidden px-4" aria-live="polite">
        <div className="ticker-content flex whitespace-nowrap py-3 hover:[animation-play-state:paused]">
          {[...posts, ...posts].map((post, index) => (
            <Link key={`${post.id}-${index}`} to={`/article/${post.id}`} className="ml-10 inline-flex items-center gap-2 text-sm font-bold transition hover:text-red-300">
              <span className="text-red-500">•</span>
              <span className="text-white/70">{post.date}</span>
              <span>{post.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

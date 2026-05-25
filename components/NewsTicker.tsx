import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';

interface NewsTickerProps {
  posts: Post[];
}

export const NewsTicker: React.FC<NewsTickerProps> = ({ posts }) => {
  return (
    <div className="bg-black text-white h-10 flex items-center overflow-hidden border-b-4 border-red-700 relative z-40">
      <div className="bg-red-700 h-full flex items-center px-4 font-bold text-sm shrink-0 z-10 shadow-lg">
        מבזקים
      </div>
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        {/* Simple CSS Animation for ticker */}
        <div className="whitespace-nowrap animate-[ticker_30s_linear_infinite] hover:[animation-play-state:paused] flex gap-8 pr-4">
          {posts.map((post) => (
            <Link key={post.id} to={`/article/${post.id}`} className="flex items-center gap-2 hover:text-red-400 transition-colors text-sm">
              <span className="text-red-500">•</span>
              <span className="font-medium">{post.date}</span>
              <span>{post.title}</span>
            </Link>
          ))}
           {/* Duplicate for seamless loop */}
           {posts.map((post) => (
            <Link key={`dup-${post.id}`} to={`/article/${post.id}`} className="flex items-center gap-2 hover:text-red-400 transition-colors text-sm">
              <span className="text-red-500">•</span>
              <span className="font-medium">{post.date}</span>
              <span>{post.title}</span>
            </Link>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(100%); } /* RTL Logic */
        }
      `}</style>
    </div>
  );
};
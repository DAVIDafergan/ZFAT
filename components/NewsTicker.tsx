import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';

interface NewsTickerProps {
  posts: Post[];
}

export const NewsTicker: React.FC<NewsTickerProps> = ({ posts }) => {
  const tickerPosts = useMemo(() => posts.slice(0, 12), [posts]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleLetters, setVisibleLetters] = useState(0);

  useEffect(() => {
    if (tickerPosts.length === 0) return;
    if (activeIndex >= tickerPosts.length) {
      setActiveIndex(0);
      setVisibleLetters(0);
    }
  }, [activeIndex, tickerPosts.length]);

  useEffect(() => {
    if (tickerPosts.length === 0) return;
    const activePost = tickerPosts[activeIndex];
    if (!activePost) return;

    let timer: number;
    if (visibleLetters < activePost.title.length) {
      timer = window.setTimeout(() => {
        setVisibleLetters((value) => value + 1);
      }, 42);
    } else {
      timer = window.setTimeout(() => {
        setVisibleLetters(0);
        setActiveIndex((value) => (value + 1) % tickerPosts.length);
      }, 2500);
    }

    return () => window.clearTimeout(timer);
  }, [activeIndex, tickerPosts, visibleLetters]);

  if (tickerPosts.length === 0) return null;
  const activePost = tickerPosts[activeIndex];
  const typedTitle = activePost.title.slice(0, visibleLetters);

  return (
    <div className="relative z-40 flex min-h-[44px] items-center overflow-hidden border-y border-red-900/40 bg-[#090c14] text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)]" aria-label="מבזקים" role="region">
      <div className="z-10 flex h-[44px] shrink-0 items-center gap-2 bg-red-700 px-4 text-[12px] font-black leading-none tracking-[0.12em] text-white">
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
        מבזק
      </div>
      <div className="flex h-[44px] flex-1 items-center overflow-hidden px-4" aria-live="polite">
        <Link to={`/article/${activePost.id}`} className="group flex h-full w-full min-w-0 items-center gap-3 text-[13px] font-bold leading-none text-white/85 transition hover:text-red-300">
          <span className="shrink-0 text-red-400">•</span>
          <span className="block min-w-0 flex-1 leading-[1.2]">
            <span className="line-clamp-1">
              {typedTitle}
              <span className="ml-0.5 inline-block h-[1em] w-[1px] animate-pulse bg-red-400 align-[-0.12em]" />
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
};

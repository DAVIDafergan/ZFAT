import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, Loader2, Check, Share2 } from 'lucide-react';
import { Post, CATEGORY_COLORS } from '../types';
import { buildShareUrl } from '../services/siteConfig';
import { formatGregorianDate, formatHebrewDate, formatPublishTime, resolvePostDateForDisplay } from '../services/dateUtils';

interface PostCardProps {
  post: Post;
  layout?: 'grid' | 'list';
}

export const PostCard: React.FC<PostCardProps> = ({ post, layout = 'grid' }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [shareReady, setShareReady] = useState(false);
  const categoryColor = CATEGORY_COLORS[post.category] || 'bg-gray-600';
  const shortUrl = buildShareUrl(post.id);
  const displayDate = resolvePostDateForDisplay(post.publishedAt, post.createdAt, post.date);
  const publishTime = formatPublishTime(displayDate);

  const handleReadMore = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/article/${post.id}`);
    }, 250);
  };

  const handleShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: shortUrl,
        });
      } else {
        await navigator.clipboard.writeText(shortUrl);
      }
      setShareReady(true);
      window.setTimeout(() => setShareReady(false), 1800);
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') return;
      setShareReady(false);
    }
  };

  const displayExcerpt = post.excerpt || post.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);

  if (layout === 'list') {
    return (
      <article className="mobile-card-transition group flex gap-3 overflow-hidden rounded-[1.4rem] border border-transparent bg-white/95 p-3 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:-translate-x-1 hover:shadow-xl sm:gap-5 sm:rounded-[1.75rem] sm:border-gray-100 sm:p-4 sm:shadow-sm">
        {post.imageUrl && (
          <Link to={`/article/${post.id}`} className="relative aspect-[4/3] w-[34%] shrink-0 overflow-hidden rounded-[1rem] shadow-inner md:w-1/4 md:rounded-[1.25rem]">
            <img src={post.imageUrl} alt={post.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
            <span className={`absolute top-0 right-0 rounded-bl-2xl px-3 py-1 text-[10px] font-black text-white shadow-md md:text-xs ${categoryColor}`}>{post.category}</span>
          </Link>
        )}
        <div className="flex flex-1 flex-col justify-between py-1">
          <Link to={`/article/${post.id}`}>
            <h3 className="news-headline mb-2 text-base font-black leading-7 text-gray-900 transition group-hover:text-red-700 sm:mb-3 sm:text-lg md:text-xl">{post.title}</h3>
            <p className="line-clamp-2 text-sm leading-6 text-gray-500 md:leading-7">{displayExcerpt}</p>
          </Link>
          <div className="mt-2 flex items-center justify-between border-t border-gray-100/70 pt-2 text-[11px] text-gray-400 sm:mt-3 sm:border-gray-50 sm:pt-3 sm:text-xs md:border-none md:pt-0">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 font-bold sm:px-3"><Clock size={12} /> <span>{formatGregorianDate(displayDate)}{publishTime ? ` · ${publishTime}` : ''}</span></div>
              <div className="font-bold text-gray-500">{formatHebrewDate(displayDate)}</div>
            </div>
            <button onClick={handleShare} className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 font-black text-red-700 transition hover:bg-red-100 sm:px-3" aria-live="polite">
              {shareReady ? <Check size={12} /> : <Share2 size={12} />}
              {shareReady ? 'שותף' : 'שתפו'}
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="mobile-card-transition group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-transparent bg-white/95 shadow-[0_12px_26px_rgba(15,23,42,0.08)] transition hover:-translate-y-1.5 hover:shadow-xl sm:rounded-[2rem] sm:border-gray-100 sm:shadow-sm">
      {post.imageUrl && (
        <Link to={`/article/${post.id}`} className="relative block aspect-[16/10] overflow-hidden">
          <img src={post.imageUrl} alt={post.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-70" />
          <span className={`absolute top-3 right-3 rounded-xl px-2.5 py-1 text-[10px] font-black text-white shadow-md sm:top-4 sm:right-4 sm:px-3 sm:py-1.5 sm:shadow-lg ${categoryColor}`}>{post.category}</span>
        </Link>
      )}
      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold text-gray-400">
          <Clock size={12} /> <span>{formatGregorianDate(displayDate)}{publishTime ? ` · ${publishTime}` : ''}</span>
          <span className="text-gray-300">|</span>
          <span>{formatHebrewDate(displayDate)}</span>
        </div>
        <Link to={`/article/${post.id}`} className="mb-3 block">
          <h3 className="news-headline line-clamp-2 text-lg font-black leading-tight text-gray-900 transition group-hover:text-red-700 sm:text-xl">{post.title}</h3>
        </Link>
        <p className="mb-4 line-clamp-3 flex-1 text-sm leading-6 text-gray-500 sm:mb-5 sm:leading-7">{displayExcerpt}</p>
        <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-3 sm:pt-4">
          <button onClick={handleReadMore} disabled={isLoading} className="inline-flex items-center gap-1 text-sm font-black text-red-700 transition hover:gap-2 disabled:opacity-70">
            {isLoading ? <>טוען <Loader2 size={14} className="animate-spin" /></> : <>קרא עוד <ChevronLeft size={14} /></>}
          </button>
          <button onClick={handleShare} className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-black text-red-700 transition hover:bg-red-100 sm:px-3 sm:text-xs" aria-live="polite">
            {shareReady ? <Check size={12} /> : <Share2 size={12} />}
            {shareReady ? 'שותף' : 'שתפו'}
          </button>
        </div>
      </div>
    </article>
  );
};

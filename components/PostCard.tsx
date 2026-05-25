import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, Loader2, Eye, Link2 } from 'lucide-react';
import { Post, CATEGORY_COLORS } from '../types';
import { buildShortPostUrl } from '../services/siteConfig';

interface PostCardProps {
  post: Post;
  layout?: 'grid' | 'list';
}

export const PostCard: React.FC<PostCardProps> = ({ post, layout = 'grid' }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const categoryColor = CATEGORY_COLORS[post.category] || 'bg-gray-600';
  const shortUrl = buildShortPostUrl(post.shortLinkCode, post.id);

  const handleReadMore = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/article/${post.id}`);
    }, 250);
  };

  if (layout === 'list') {
    return (
      <Link to={`/article/${post.id}`} className="group flex gap-3 overflow-hidden rounded-[1.4rem] border border-gray-100 bg-white p-3 shadow-sm transition hover:-translate-x-1 hover:shadow-xl sm:gap-5 sm:rounded-[1.75rem] sm:p-4">
        <div className="relative aspect-[4/3] w-[34%] shrink-0 overflow-hidden rounded-[1rem] shadow-inner md:w-1/4 md:rounded-[1.25rem]">
          <img src={post.imageUrl} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
          <span className={`absolute top-0 right-0 rounded-bl-2xl px-3 py-1 text-[10px] font-black text-white shadow-md md:text-xs ${categoryColor}`}>{post.category}</span>
        </div>
        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            <h3 className="news-headline mb-2 text-base font-black leading-snug text-gray-900 transition group-hover:text-red-700 sm:mb-3 sm:text-lg md:text-xl">{post.title}</h3>
            <p className="hidden line-clamp-2 text-sm leading-7 text-gray-500 md:block">{post.excerpt}</p>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-gray-50 pt-2 text-[11px] text-gray-400 sm:mt-3 sm:pt-3 sm:text-xs md:border-none md:pt-0">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 font-bold sm:px-3"><Clock size={12} /> <span>{post.date}</span></div>
              <div className="flex items-center gap-1.5 font-bold"><Eye size={12} /> <span>{post.views}</span></div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 font-black text-red-700 sm:px-3" dir="ltr"><Link2 size={12} /> {shortUrl.split('/').pop()}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1.5 hover:shadow-xl sm:rounded-[2rem]">
      <Link to={`/article/${post.id}`} className="relative block aspect-[16/10] overflow-hidden">
        <img src={post.imageUrl} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-70" />
        <span className={`absolute top-3 right-3 rounded-xl px-2.5 py-1 text-[10px] font-black text-white shadow-lg sm:top-4 sm:right-4 sm:px-3 sm:py-1.5 ${categoryColor}`}>{post.category}</span>
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold text-gray-400">
          <Clock size={12} /> <span>{post.date}</span>
          <span className="text-gray-300">|</span>
          <Eye size={12} /> <span>{post.views}</span>
        </div>
        <Link to={`/article/${post.id}`} className="mb-3 block">
          <h3 className="news-headline text-lg font-black leading-tight text-gray-900 transition group-hover:text-red-700 sm:text-xl">{post.title}</h3>
        </Link>
        <p className="mb-4 line-clamp-3 flex-1 text-sm leading-6 text-gray-500 sm:mb-5 sm:leading-7">{post.excerpt}</p>
        <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-3 sm:pt-4">
          <button onClick={handleReadMore} disabled={isLoading} className="inline-flex items-center gap-1 text-sm font-black text-red-700 transition hover:gap-2 disabled:opacity-70">
            {isLoading ? <>טוען <Loader2 size={14} className="animate-spin" /></> : <>קרא עוד <ChevronLeft size={14} /></>}
          </button>
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-black text-gray-600 sm:px-3 sm:text-xs" dir="ltr"><Link2 size={12} /> {shortUrl.split('/').pop()}</span>
        </div>
      </div>
    </article>
  );
};

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
      <Link to={`/article/${post.id}`} className="group flex gap-5 overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-x-1 hover:shadow-xl">
        <div className="relative aspect-[4/3] w-1/3 shrink-0 overflow-hidden rounded-[1.25rem] shadow-inner md:w-1/4">
          <img src={post.imageUrl} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
          <span className={`absolute top-0 right-0 rounded-bl-2xl px-3 py-1 text-[10px] font-black text-white shadow-md md:text-xs ${categoryColor}`}>{post.category}</span>
        </div>
        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            <h3 className="news-headline mb-3 text-lg font-black leading-snug text-gray-900 transition group-hover:text-red-700 md:text-xl">{post.title}</h3>
            <p className="hidden line-clamp-2 text-sm leading-7 text-gray-500 md:block">{post.excerpt}</p>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3 text-xs text-gray-400 md:border-none md:pt-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 font-bold"><Clock size={12} /> <span>{post.date}</span></div>
              <div className="flex items-center gap-1.5 font-bold"><Eye size={12} /> <span>{post.views}</span></div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 font-black text-red-700" dir="ltr"><Link2 size={12} /> {shortUrl.split('/').pop()}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1.5 hover:shadow-xl">
      <Link to={`/article/${post.id}`} className="relative block aspect-[16/10] overflow-hidden">
        <img src={post.imageUrl} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-70" />
        <span className={`absolute top-4 right-4 rounded-xl px-3 py-1.5 text-[10px] font-black text-white shadow-lg ${categoryColor}`}>{post.category}</span>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold text-gray-400">
          <Clock size={12} /> <span>{post.date}</span>
          <span className="text-gray-300">|</span>
          <Eye size={12} /> <span>{post.views}</span>
        </div>
        <Link to={`/article/${post.id}`} className="mb-3 block">
          <h3 className="news-headline text-xl font-black leading-tight text-gray-900 transition group-hover:text-red-700">{post.title}</h3>
        </Link>
        <p className="mb-5 line-clamp-3 flex-1 text-sm leading-7 text-gray-500">{post.excerpt}</p>
        <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-4">
          <button onClick={handleReadMore} disabled={isLoading} className="inline-flex items-center gap-1 text-sm font-black text-red-700 transition hover:gap-2 disabled:opacity-70">
            {isLoading ? <>טוען <Loader2 size={14} className="animate-spin" /></> : <>קרא עוד <ChevronLeft size={14} /></>}
          </button>
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-black text-gray-600" dir="ltr"><Link2 size={12} /> {shortUrl.split('/').pop()}</span>
        </div>
      </div>
    </article>
  );
};

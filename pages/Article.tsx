import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CATEGORY_COLORS, Comment } from '../types';
import { Calendar, User, Eye, Tag, ThumbsUp, MessageCircle, Send, ArrowUpDown, Link2 } from 'lucide-react';
import { AdUnit } from '../components/AdUnit';
import { PostCard } from '../components/PostCard';
import { ShareButtons } from '../components/ShareButtons';
import { buildShortPostUrl } from '../services/siteConfig';

export const Article: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { posts, ads, user, comments, addComment, toggleLikeComment, incrementViews } = useApp();
  const [commentText, setCommentText] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'top'>('newest');

  useEffect(() => {
    if (id) incrementViews(id);
    window.scrollTo(0, 0);
  }, [id]);

  const post = posts.find((p) => p.id === id);
  const inlineAd = ads.find(a => a.area === 'article_inline' && a.isActive);
  const bottomAd = ads.find(a => a.area === 'article_bottom' && a.isActive);
  const articleComments = comments.filter(c => c.postId === post?.id);

  const sortedComments = useMemo(() => {
    const list = [...articleComments];
    if (sortBy === 'newest') return list.reverse();
    if (sortBy === 'top') return list.sort((a, b) => b.likes - a.likes);
    return list;
  }, [articleComments, sortBy]);

  if (!post) return <Navigate to="/" />;

  const categoryColor = CATEGORY_COLORS[post.category] || 'bg-gray-600';
  const relatedPosts = posts.filter(p => p.category === post.category && p.id !== post.id).slice(0, 3);
  const shareUrl = buildShortPostUrl(post.shortLinkCode, post.id);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      postId: post.id,
      userId: user ? user.id : `guest-${Date.now()}`,
      userName: user ? user.name : 'אורח',
      content: commentText,
      date: new Date().toLocaleString('he-IL'),
      likes: 0,
      likedBy: [],
    };
    addComment(newComment);
    setCommentText('');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-[#f7f5f1] pb-12">
      <article className="container mx-auto max-w-5xl px-4 py-8">
        <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm">
          <div className="px-6 py-8 md:px-10 md:py-10">
            <div className="mb-5 flex flex-wrap gap-3 text-sm font-bold">
              <span className={`${categoryColor} rounded-full px-3 py-1.5 text-white shadow-sm`}>{post.category}</span>
              <span className="inline-flex items-center gap-1.5 text-gray-500"><Calendar size={14} /> {post.date}</span>
              <span className="inline-flex items-center gap-1.5 text-gray-500"><User size={14} /> {post.author}</span>
              <span className="inline-flex items-center gap-1.5 text-gray-500"><Eye size={14} /> {post.views.toLocaleString('he-IL')} צפיות</span>
            </div>

            <h1 className="news-headline mb-6 text-4xl font-black leading-tight text-gray-900 md:text-6xl">{post.title}</h1>
            <p className="mb-8 border-r-4 border-red-600 pr-5 text-xl leading-9 text-gray-600 md:text-2xl">{post.excerpt}</p>

            <div className="mb-8 rounded-[2rem] overflow-hidden shadow-lg">
              <img src={post.imageUrl} alt={post.title} className="max-h-[560px] w-full object-cover" />
              <div className="flex items-center justify-between gap-4 bg-gray-950 px-4 py-3 text-xs font-bold text-gray-300">
                <span>צילום: דוברות / רשתות חברתיות</span>
                <span className="inline-flex items-center gap-2" dir="ltr"><Link2 size={13} /> {shareUrl.replace(/^https?:\/\//, '')}</span>
              </div>
            </div>

            <div className="mb-8">
              <ShareButtons title={post.title} description={post.excerpt} shareUrl={shareUrl} />
            </div>

            <AdUnit ad={inlineAd} className="mb-8 rounded-2xl overflow-hidden border border-gray-100 shadow-sm" />

            <div className="article-content max-w-none text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />

            <div className="mt-12 flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-600 transition hover:bg-gray-200">
                  <Tag size={12} /> {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="px-6 pb-10 md:px-10">
            <AdUnit ad={bottomAd} className="mt-4" />
          </div>
        </div>

        <div className="mt-12 rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2"><MessageCircle className="text-red-600" /> תגובות ({articleComments.length})</h3>
            <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 text-sm">
              <span className="px-2 text-gray-400"><ArrowUpDown size={14} /></span>
              {[
                ['newest', 'חדש ביותר'],
                ['oldest', 'ישן ביותר'],
                ['top', 'הכי אהובים'],
              ].map(([value, label]) => (
                <button key={value} onClick={() => setSortBy(value as 'newest' | 'oldest' | 'top')} className={`rounded-full px-3 py-2 text-xs font-black transition md:text-sm ${sortBy === value ? 'bg-red-700 text-white shadow-sm' : 'text-gray-500 hover:bg-white hover:text-gray-800'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handlePostComment} className="mb-10">
            <div className="flex gap-4 items-start">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 text-gray-600 font-black shadow-sm">{user ? user.name.charAt(0) : <User size={18} />}</div>
              <div className="flex-1">
                {!user && (
                  <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl bg-blue-50 p-3 text-sm font-medium text-blue-900">
                    <span>מגיב כאורח.</span>
                    <Link to="/login" className="font-black hover:underline">התחבר</Link>
                    <span>או</span>
                    <Link to="/register" className="font-black hover:underline">הירשם</Link>
                    <span>כדי לשמור היסטוריה.</span>
                  </div>
                )}
                <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} className="min-h-[120px] w-full resize-none rounded-[1.5rem] border border-gray-200 bg-gray-50 p-4 text-base outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100" placeholder={user ? `היי ${user.name}, מה דעתך?` : 'כתוב תגובה...'} />
                <div className="mt-3 flex justify-end">
                  <button type="submit" disabled={!commentText.trim()} className="inline-flex items-center gap-2 rounded-full bg-red-700 px-6 py-3 text-sm font-black text-white shadow-md transition hover:bg-red-800 disabled:opacity-50">
                    <Send size={16} /> פרסם תגובה
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div className="space-y-5">
            {sortedComments.length > 0 ? sortedComments.map(comment => {
              const isLiked = user ? comment.likedBy.includes(user.id) : false;
              return (
                <div key={comment.id} className="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${comment.userId.startsWith('guest') ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-700'}`}>{comment.userName.charAt(0)}</div>
                      <div>
                        <span className="block font-black text-gray-900">{comment.userName}</span>
                        <span className="text-xs font-bold text-gray-400">{comment.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="mb-4 pr-12 text-base leading-8 text-gray-700">{comment.content}</p>
                  <div className="pr-12">
                    <button onClick={() => toggleLikeComment(comment.id)} className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold transition ${isLiked ? 'bg-red-100 text-red-700' : 'bg-white text-gray-500 hover:text-red-600'}`} disabled={!user} title={!user ? 'התחבר כדי לעשות לייק' : ''}>
                      <ThumbsUp size={16} className={isLiked ? 'fill-current' : ''} />
                      <span>{comment.likes} לייקים</span>
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div className="rounded-[1.5rem] border border-dashed border-gray-300 bg-gray-50 py-10 text-center">
                <MessageCircle size={40} className="mx-auto mb-3 text-gray-200" />
                <p className="font-bold text-gray-500">היה הראשון להגיב לכתבה זו!</p>
              </div>
            )}
          </div>
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className="mt-12 border-t border-gray-200 bg-white py-12">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mb-8 flex items-center justify-between gap-4">
              <h3 className="news-headline border-r-4 border-red-700 pr-4 text-2xl font-black text-gray-800">אולי יעניין אותך גם</h3>
              <Link to={`/category/${post.category}`} className="text-sm font-black text-red-700 hover:underline">לכל הכתבות בנושא</Link>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {relatedPosts.map(p => <PostCard key={p.id} post={p} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

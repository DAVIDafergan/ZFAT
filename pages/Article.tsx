import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CATEGORY_COLORS, Comment } from '../types';
import { Calendar, User, Tag, ThumbsUp, MessageCircle, Send, ArrowUpDown } from 'lucide-react';
import { AdUnit } from '../components/AdUnit';
import { PostCard } from '../components/PostCard';
import { ShareButtons } from '../components/ShareButtons';
import { buildShortPostUrl } from '../services/siteConfig';
import { formatGregorianDate, formatHebrewDate } from '../services/dateUtils';
import { sortPostsByNewest } from '../services/postSort';

export const Article: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { posts, ads, user, comments, addComment, toggleLikeComment, incrementViews, isLoading } = useApp();
  const [commentText, setCommentText] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'top'>('newest');
  const [commentSubmitted, setCommentSubmitted] = useState(false);

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

  if (!post && isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-[#f7f5f1]">
        <p className="text-lg font-black text-gray-600">טוען כתבה...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-[#f7f5f1] px-4">
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-gray-900">הכתבה לא נמצאה</h1>
          <p className="mt-3 text-sm font-bold text-gray-500">ייתכן שהקישור שגוי או שהכתבה הוסרה.</p>
          <Link to="/" className="mt-5 inline-flex rounded-full bg-red-700 px-5 py-2.5 text-sm font-black text-white hover:bg-red-800">
            חזרה לעמוד הבית
          </Link>
        </div>
      </div>
    );
  }

  const categoryColor = CATEGORY_COLORS[post.category] || 'bg-gray-600';
  const relatedPosts = sortPostsByNewest(posts.filter(p => p.category === post.category && p.id !== post.id)).slice(0, 3);
  const shareUrl = buildShortPostUrl(post.shortLinkCode, post.id);
  const postImages = (Array.isArray(post.images) && post.images.length > 0
    ? post.images.filter((image) => image.url)
    : post.imageUrl ? [{ url: post.imageUrl, photographer: '' }] : []);
  const leadImage = postImages[0] || null;
  const galleryImages = postImages.slice(1);

  const renderEditorialImage = (image: { url: string; photographer?: string }, index: number) => (
    <figure key={`${image.url}-${index}`} className="my-10 border-y border-gray-200 bg-white py-4 sm:py-5">
      <img
        src={image.url}
        alt={`${post.title} - תמונה ${index + 1}`}
        loading={index === 0 ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={index === 0 ? 'high' : undefined}
        className="max-h-[620px] w-full object-cover"
      />
      <figcaption className="mt-3 flex flex-wrap items-center gap-3 px-3 text-xs font-bold text-gray-600 sm:px-5">
        <span className="h-px w-10 bg-red-600" />
        <span>צילום: {image.photographer || 'דוברות / רשתות חברתיות'}</span>
      </figcaption>
    </figure>
  );

  // Interleave gallery images between content paragraphs
  const renderContentWithImages = () => {
    const content = post.content;
    if (galleryImages.length === 0) {
      return <div className="article-content max-w-none text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />;
    }
    // Split content after each </p> tag
    const rawParts = content.split('</p>');
    const parts = rawParts.map((p, i) => i < rawParts.length - 1 ? p + '</p>' : p).filter(Boolean);

    if (parts.length <= 1) {
      return (
        <>
          <div className="article-content max-w-none text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
          <div className="mt-8 space-y-6">
            {galleryImages.map((image, index) => renderEditorialImage(image, index + 1))}
          </div>
        </>
      );
    }

    const step = Math.max(1, Math.floor(parts.length / (galleryImages.length + 1)));
    const elements: React.ReactNode[] = [];
    let lastPartIndex = 0;

    galleryImages.forEach((image, imageIndex) => {
      const insertAfterIndex = Math.min((imageIndex + 1) * step, parts.length - 1);
      const textSegment = parts.slice(lastPartIndex, insertAfterIndex).join('');
      if (textSegment.trim()) {
        elements.push(
          <div key={`text-${imageIndex}`} className="article-content max-w-none text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: textSegment }} />
        );
      }
      elements.push(renderEditorialImage(image, imageIndex + 1));
      lastPartIndex = insertAfterIndex;
    });

    const remaining = parts.slice(lastPartIndex).join('');
    if (remaining.trim()) {
      elements.push(
        <div key="text-final" className="article-content max-w-none text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: remaining }} />
      );
    }
    return <>{elements}</>;
  };

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
    setCommentSubmitted(true);
    setTimeout(() => setCommentSubmitted(false), 8000);
  };

  return (
    <div className="min-h-screen bg-[#f7f5f1] pb-12">
      <article className="container mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <div className="overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white shadow-sm sm:rounded-[2rem]">
          <div className="px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10">
            <div className="mb-5 flex flex-wrap gap-3 text-sm font-bold">
              <span className={`${categoryColor} rounded-full px-3 py-1.5 text-white shadow-sm`}>{post.category}</span>
              <span className="inline-flex items-center gap-1.5 text-gray-500"><Calendar size={14} /> {formatGregorianDate(post.date)}</span>
              <span className="inline-flex items-center gap-1.5 text-gray-500">{formatHebrewDate(post.date)}</span>
              <span className="inline-flex items-center gap-1.5 text-gray-500"><User size={14} /> {post.author}</span>
            </div>

            <h1 className="news-headline mb-4 text-3xl font-black leading-tight text-gray-900 sm:mb-6 sm:text-4xl md:text-6xl">{post.title}</h1>
            <p className="mb-6 border-r-4 border-red-600 pr-4 text-lg leading-8 text-gray-600 sm:mb-8 sm:pr-5 sm:text-xl md:text-2xl">{post.excerpt}</p>

            {leadImage && (
              <div className="mb-8">{renderEditorialImage(leadImage, 0)}</div>
            )}

            <div className="mb-8">
              <ShareButtons title={post.title} description={post.excerpt} shareUrl={shareUrl} />
            </div>

            <AdUnit ad={inlineAd} className="mb-8 rounded-2xl overflow-hidden border border-gray-100 shadow-sm" />

            {renderContentWithImages()}

            <div className="mt-12 flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-600 transition hover:bg-gray-200">
                  <Tag size={12} /> {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="px-4 pb-6 sm:px-6 sm:pb-10 md:px-10">
            <AdUnit ad={bottomAd} className="mt-4" />
          </div>
        </div>

        <div className="mt-10 rounded-[1.5rem] border border-gray-100 bg-white p-4 shadow-sm sm:mt-12 sm:rounded-[2rem] sm:p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-4 md:flex-row md:items-center md:justify-between">
            <h3 className="flex items-center gap-2 text-xl font-black text-gray-900 sm:text-2xl"><MessageCircle className="text-red-600" /> תגובות ({articleComments.length})</h3>
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
                <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} className="min-h-[120px] w-full resize-none rounded-[1.25rem] border border-gray-200 bg-gray-50 p-4 text-base outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100 sm:rounded-[1.5rem]" placeholder={user ? `היי ${user.name}, מה דעתך?` : 'כתוב תגובה...'} />
                <div className="mt-3 flex justify-end">
                  <button type="submit" disabled={!commentText.trim()} className="inline-flex items-center gap-2 rounded-full bg-red-700 px-6 py-3 text-sm font-black text-white shadow-md transition hover:bg-red-800 disabled:opacity-50">
                    <Send size={16} /> פרסם תגובה
                  </button>
                </div>
                {commentSubmitted && (
                  <div className="mt-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-bold text-yellow-800">
                    ✓ תגובתך התקבלה ותפורסם לאחר אישור המנהל.
                  </div>
                )}
              </div>
            </div>
          </form>

          <div className="space-y-5">
            {sortedComments.length > 0 ? sortedComments.map(comment => {
              const isLiked = user ? comment.likedBy.includes(user.id) : false;
              return (
                <div key={comment.id} className="rounded-[1.25rem] border border-gray-100 bg-gray-50 p-4 shadow-sm sm:rounded-[1.5rem] sm:p-5">
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

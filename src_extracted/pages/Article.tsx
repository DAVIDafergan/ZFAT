
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CATEGORY_COLORS, Comment } from '../types';
import { Calendar, User, Eye, Share2, Tag, ThumbsUp, MessageCircle, Send, ArrowUpDown } from 'lucide-react';
import { AdUnit } from '../components/AdUnit';
import { PostCard } from '../components/PostCard';

export const Article: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { posts, ads, user, comments, addComment, toggleLikeComment, incrementViews } = useApp();
  const [commentText, setCommentText] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'top'>('newest');

  // Increment view counter on mount
  useEffect(() => {
    if (id) {
      incrementViews(id);
    }
    window.scrollTo(0, 0);
  }, [id]); // Intentionally not including incrementViews to avoid dependency loops if context updates

  const post = posts.find((p) => p.id === id);
  const bottomAd = ads.find(a => a.area === 'article_bottom' && a.isActive);

  // Filter comments for this post
  const articleComments = comments.filter(c => c.postId === post?.id);

  // Sort comments logic
  const sortedComments = useMemo(() => {
    const list = [...articleComments];
    if (sortBy === 'newest') {
      return list.reverse(); // Assuming original list is oldest-first
    }
    if (sortBy === 'top') {
      return list.sort((a, b) => b.likes - a.likes);
    }
    // 'oldest' is default (original order)
    return list;
  }, [articleComments, sortBy]);

  if (!post) {
    return <Navigate to="/" />;
  }

  const categoryColor = CATEGORY_COLORS[post.category] || 'bg-gray-600';
  
  const relatedPosts = posts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  const shareOnWhatsapp = () => {
    const text = encodeURIComponent(`${post.title}\nלקריאה: https://zfatbt.com/p/${post.shortLinkCode}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
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
      likedBy: []
    };

    addComment(newComment);
    setCommentText('');
    setSortBy('newest'); // Switch to newest to see the new comment
  };

  return (
    <div className="bg-white min-h-screen pb-12">
      {/* Article Header */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-wrap gap-3 mb-4 text-sm">
          <span className={`${categoryColor} text-white px-2 py-0.5 rounded font-bold`}>
            {post.category}
          </span>
          <span className="flex items-center text-gray-500 gap-1">
            <Calendar size={14} /> {post.date}
          </span>
          <span className="flex items-center text-gray-500 gap-1">
            <User size={14} /> {post.author}
          </span>
          <span className="flex items-center text-gray-500 gap-1">
            <Eye size={14} /> {post.views.toLocaleString()} צפיות
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-6">
          {post.title}
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed mb-8 border-r-4 border-red-600 pr-4">
          {post.excerpt}
        </p>

        {/* Share Bar */}
        <div className="flex items-center gap-4 mb-8 border-y border-gray-100 py-4">
          <span className="font-bold text-gray-700">שתפו:</span>
          <button 
            onClick={shareOnWhatsapp}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full font-bold transition-colors"
          >
            <Share2 size={18} />
            WhatsApp
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors">
             <span className="sr-only">Facebook</span>
             F
          </button>
          <button className="bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-full transition-colors">
             <span className="sr-only">Twitter</span>
             T
          </button>
        </div>

        {/* Main Image */}
        <div className="rounded-xl overflow-hidden shadow-lg mb-8">
          <img src={post.imageUrl} alt={post.title} className="w-full h-auto object-cover max-h-[500px]" />
          <div className="bg-gray-100 px-4 py-2 text-xs text-gray-500 text-left">
            צילום: דוברות / רשתות חברתיות
          </div>
        </div>

        {/* Content */}
        <div 
          className="prose prose-lg prose-red max-w-none text-gray-800 leading-relaxed font-normal"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        {/* Tags */}
        <div className="mt-12 flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-gray-200 cursor-pointer transition">
              <Tag size={12} /> {tag}
            </span>
          ))}
        </div>

        {/* Ad Unit */}
        <AdUnit ad={bottomAd} className="mt-12" />

        {/* Social Comments Section */}
        <div className="mt-12 bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-gray-200 pb-4">
            <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <MessageCircle className="text-red-600" />
              תגובות ({articleComments.length})
            </h3>

            {/* Sort Controls */}
             <div className="flex items-center gap-1 text-sm bg-white p-1 rounded-lg border border-gray-200 self-start md:self-auto shadow-sm">
                <span className="px-2 text-gray-400 hidden sm:block"><ArrowUpDown size={14} /></span>
                <button
                  onClick={() => setSortBy('newest')}
                  className={`px-3 py-1.5 rounded-md transition-all font-bold text-xs md:text-sm ${sortBy === 'newest' ? 'bg-red-50 text-red-700 shadow-sm ring-1 ring-red-100' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                >
                  חדש ביותר
                </button>
                <button
                  onClick={() => setSortBy('oldest')}
                   className={`px-3 py-1.5 rounded-md transition-all font-bold text-xs md:text-sm ${sortBy === 'oldest' ? 'bg-red-50 text-red-700 shadow-sm ring-1 ring-red-100' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                >
                  ישן ביותר
                </button>
                <button
                  onClick={() => setSortBy('top')}
                   className={`px-3 py-1.5 rounded-md transition-all font-bold text-xs md:text-sm ${sortBy === 'top' ? 'bg-red-50 text-red-700 shadow-sm ring-1 ring-red-100' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                >
                  הכי אהובים
                </button>
             </div>
          </div>

          {/* Comment Form */}
          <form onSubmit={handlePostComment} className="mb-10 relative">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold shrink-0 border-2 border-white shadow-sm">
                {user ? user.name.charAt(0) : <User size={20} />}
              </div>
              <div className="flex-1">
                 {!user && (
                    <div className="mb-3 flex items-center gap-2 text-sm bg-blue-50 text-blue-800 p-2 rounded-lg">
                      <span>מגיב כאורח.</span>
                      <Link to="/login" className="font-bold hover:underline">התחבר</Link>
                      <span>או</span>
                      <Link to="/register" className="font-bold hover:underline">הירשם</Link>
                      <span>לשמירת היסטוריה וקבלת התראות.</span>
                    </div>
                 )}
                 <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none min-h-[100px] shadow-sm text-base bg-white"
                  placeholder={user ? `היי ${user.name}, מה דעתך?` : "כתוב תגובה..."}
                />
                <div className="mt-2 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={!commentText.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg"
                  >
                    <Send size={16} /> פרסם תגובה
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {sortedComments.length > 0 ? (
              sortedComments.map(comment => {
                const isLiked = user ? comment.likedBy.includes(user.id) : false;
                return (
                  <div key={comment.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm animate-fade-in hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                         <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${comment.userId.startsWith('guest') ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-700'}`}>
                           {comment.userName.charAt(0)}
                         </div>
                         <div>
                           <span className="font-bold text-gray-900 block leading-tight">{comment.userName}</span>
                           <span className="text-xs text-gray-400">{comment.date}</span>
                         </div>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4 leading-relaxed pr-12 text-base">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-4 pr-12">
                      <button 
                        onClick={() => toggleLikeComment(comment.id)}
                        className={`flex items-center gap-1.5 text-sm font-medium transition py-1 px-2 rounded-full ${isLiked ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-gray-50'}`}
                        disabled={!user}
                        title={!user ? 'התחבר כדי לעשות לייק' : ''}
                      >
                        <ThumbsUp size={16} className={isLiked ? 'fill-current' : ''} />
                        {comment.likes > 0 && <span>{comment.likes}</span>}
                        <span>{user ? 'לייק' : `${comment.likes} לייקים`}</span>
                      </button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                <MessageCircle size={40} className="mx-auto text-gray-200 mb-2" />
                <p className="text-gray-500">היה הראשון להגיב לכתבה זו!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="bg-gray-50 py-12 border-t border-gray-200 mt-12">
          <div className="container mx-auto px-4">
             <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
                <h3 className="text-2xl font-black text-gray-800 border-r-4 border-red-700 pr-4">
                   אולי יעניין אותך גם
                </h3>
                <Link to={`/category/${post.category}`} className="text-red-700 font-bold hover:underline text-sm">
                  לכל הכתבות בנושא &larr;
                </Link>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
               {relatedPosts.map(p => (
                 <PostCard key={p.id} post={p} />
               ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

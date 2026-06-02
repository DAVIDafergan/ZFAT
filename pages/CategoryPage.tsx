
import React from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PostCard } from '../components/PostCard';
import { AdUnit } from '../components/AdUnit';
import { CATEGORY_COLORS } from '../types';

export const CategoryPage: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const { posts, ads } = useApp();

  const decodedCategory = categoryName ? decodeURIComponent(categoryName) : '';
  const categoryPosts = posts
    .filter((post) => post.category === decodedCategory)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const headerBgClass = CATEGORY_COLORS[decodedCategory as keyof typeof CATEGORY_COLORS] || 'bg-gray-800';
  const topAd = ads.find((ad) => ad.area === 'category_top' && ad.isActive);
  const midAd = ads.find((ad) => ad.area === 'category_mid' && ad.isActive);
  const splitIndex = Math.ceil(categoryPosts.length / 2);
  const firstChunk = categoryPosts.slice(0, splitIndex);
  const secondChunk = categoryPosts.slice(splitIndex);

  return (
    <div className="min-h-screen bg-[#f7f5f1] pb-14">
      <div className={`relative mb-6 overflow-hidden ${headerBgClass} py-10 text-white sm:mb-8 sm:py-14`}>
        <div className="absolute inset-0 bg-gradient-to-l from-black/25 via-transparent to-black/20" />
        <div className="absolute left-8 top-4 h-28 w-28 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-36 w-36 rounded-full bg-black/20 blur-3xl" />
        <div className="container mx-auto px-4">
          <h1 className="news-headline mb-2 text-3xl font-black sm:text-4xl md:text-5xl">{decodedCategory}</h1>
          <p className="text-sm font-bold text-white/90 sm:text-lg">כל הכתבות והעדכונים בנושא {decodedCategory}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="mb-10">
          <AdUnit ad={topAd} className="w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm" />
        </div>

        {categoryPosts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 sm:gap-6">
              {firstChunk.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            <div className="my-10">
              <AdUnit ad={midAd} className="w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm" />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 sm:gap-6">
              {secondChunk.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </>
        ) : (
          <div className="col-span-full py-20 text-center text-gray-500">
            <p className="text-xl font-bold">לא נמצאו כתבות בקטגוריה זו.</p>
          </div>
        )}
      </div>
    </div>
  );
};

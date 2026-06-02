import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PostCard } from '../components/PostCard';
import { AdUnit } from '../components/AdUnit';
import { Search } from 'lucide-react';
import { sortPostsByNewest } from '../services/postSort';

export const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { posts, ads } = useApp();
  const topAd = ads.find((ad) => ad.area === 'search_top' && ad.isActive);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return sortPostsByNewest(posts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q)
    ));
  }, [posts, query]);

  return (
    <div className="container mx-auto px-4 py-10 animate-fade-in">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Search className="text-blue-600" size={28} />
          <h1 className="text-3xl font-black text-gray-900">תוצאות חיפוש</h1>
        </div>
        {query && (
          <p className="text-gray-500 text-lg">
            נמצאו <span className="font-bold text-gray-800">{results.length}</span> תוצאות עבור:
            <span className="font-bold text-blue-600 mr-1">"{query}"</span>
          </p>
        )}
      </div>

      <div className="mb-10">
        <AdUnit ad={topAd} className="w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm" />
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Search size={60} className="mx-auto text-gray-200 mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">לא נמצאו תוצאות</h2>
          <p className="text-gray-400 mb-6">נסה מילות חיפוש אחרות</p>
          <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
            חזור לעמוד הראשי
          </Link>
        </div>
      )}
    </div>
  );
};

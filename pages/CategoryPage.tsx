
import React from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PostCard } from '../components/PostCard';
import { CATEGORY_COLORS } from '../types';

export const CategoryPage: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const { posts } = useApp();

  // Decode URI component to handle Hebrew characters in URL
  const decodedCategory = categoryName ? decodeURIComponent(categoryName) : '';

  const categoryPosts = posts.filter(p => p.category === decodedCategory);
  
  // Find color for this category or default
  // We need to match the enum value or find key by value if needed, but here we used string values in enum
  const categoryColor = Object.values(CATEGORY_COLORS).find((_, idx) => 
     Object.keys(CATEGORY_COLORS)[idx] === decodedCategory
  ) || 'bg-red-700';

  // Specific header background based on category
  const headerBgClass = Object.entries(CATEGORY_COLORS).find(([key]) => key === decodedCategory)?.[1] || 'bg-gray-800';

  return (
    <div className="min-h-screen">
      {/* Category Header */}
      <div className={`${headerBgClass} text-white py-12 mb-8`}>
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-black mb-2">{decodedCategory}</h1>
          <p className="text-white/80 text-lg">כל הכתבות והעדכונים בנושא {decodedCategory}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryPosts.length > 0 ? (
            categoryPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-gray-500">
              <p className="text-xl">לא נמצאו כתבות בקטגוריה זו.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

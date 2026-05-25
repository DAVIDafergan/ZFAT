import React, { useMemo, useState } from 'react';
import { Building2, Search, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BoardListingCard } from '../components/BoardListingCard';
import { PageHero } from '../components/PageHero';
import { AdUnit } from '../components/AdUnit';

export const BoardPage: React.FC = () => {
  const { boardListings, ads } = useApp();
  const [query, setQuery] = useState('');
  const [dealFilter, setDealFilter] = useState<'all' | 'rent' | 'sale'>('all');
  const topAd = ads.find((ad) => ad.area === 'board_top' && ad.isActive);

  const filteredListings = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return boardListings.filter((listing) => {
      const matchesDeal = dealFilter === 'all' || listing.dealType === dealFilter;
      const haystack = [listing.title, listing.location, listing.details].join(' ').toLowerCase();
      const matchesQuery = !normalized || haystack.includes(normalized);
      return listing.isActive && matchesDeal && matchesQuery;
    });
  }, [boardListings, dealFilter, query]);

  return (
    <div className="min-h-screen bg-[#f6f6f7] pb-16">
      <PageHero
        eyebrow="לוח בתנופה"
        title="דירות להשכרה ולמכירה בצפת"
        description={'עמוד מודגש ומעוצב בסגנון מקצועי ללוח הנדל"ן של צפת. כל מודעה כוללת תמונה, מיקום, מחיר, גודל, פרטים נוספים, מרפסת ויצירת קשר ישירה בוואטסאפ.'}
        accent="from-red-900 via-red-800 to-[#111827]"
      >
        <div className="grid gap-4 rounded-[2rem] border border-white/15 bg-white/10 p-4 backdrop-blur-sm md:grid-cols-[1.6fr_0.9fr]">
          <div>
            <label htmlFor="listing-search" className="mb-2 block text-sm font-bold text-white/80">חיפוש לפי שכונה, רחוב או תיאור</label>
            <div className="flex items-center gap-3 rounded-full bg-white px-4 py-3 text-gray-800 shadow-lg">
              <Search size={18} className="text-red-700" />
              <input id="listing-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="לדוגמה: כנען, העיר העתיקה, מרפסת" className="w-full bg-transparent text-sm font-bold outline-none" />
            </div>
          </div>
          <div>
            <label htmlFor="listing-filter" className="mb-2 block text-sm font-bold text-white/80">סינון מהיר</label>
            <select id="listing-filter" value={dealFilter} onChange={(event) => setDealFilter(event.target.value as 'all' | 'rent' | 'sale')} className="w-full rounded-full border-0 bg-white px-4 py-3 text-sm font-bold text-gray-800 shadow-lg outline-none">
              <option value="all">הכל</option>
              <option value="rent">להשכרה</option>
              <option value="sale">למכירה</option>
            </select>
          </div>
        </div>
      </PageHero>

      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <AdUnit ad={topAd} className="w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm" />
        </div>

        <div className="mb-8 grid gap-4 rounded-[2rem] border border-red-100 bg-white p-6 shadow-sm md:grid-cols-3">
          <div className="rounded-3xl bg-red-50 p-5">
            <p className="text-sm font-black text-red-700">מודעות פעילות</p>
            <p className="mt-2 text-4xl font-black text-gray-900">{filteredListings.length}</p>
          </div>
          <div className="rounded-3xl bg-gray-50 p-5">
            <p className="text-sm font-black text-gray-700">צור קשר ישיר</p>
            <p className="mt-2 text-sm font-medium leading-7 text-gray-600">בלחיצה על כפתור וואטסאפ נפתחת הודעה מוכנה שמציינת שהגולש הגיע דרך לוח בתנופה.</p>
          </div>
          <div className="rounded-3xl bg-[#111827] p-5 text-white">
            <p className="inline-flex items-center gap-2 text-sm font-black text-white/80"><Sparkles size={16} /> באנר מקצועי</p>
            <p className="mt-2 text-sm font-medium leading-7 text-white/80">תצוגה חדשותית, ברורה ומודרנית כמו אתרי החדשות הגדולים.</p>
          </div>
        </div>

        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            {filteredListings.map((listing) => (
              <BoardListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-gray-300 bg-white px-6 py-16 text-center text-gray-500 shadow-sm">
            <Building2 className="mx-auto mb-4 text-gray-300" size={36} />
            <p className="text-lg font-bold">לא נמצאו מודעות לפי הסינון שבחרת.</p>
          </div>
        )}
      </div>
    </div>
  );
};

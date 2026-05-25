import React, { useMemo, useState } from 'react';
import { Building2, Search } from 'lucide-react';
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
  const rentCount = filteredListings.filter((listing) => listing.dealType === 'rent').length;
  const saleCount = filteredListings.filter((listing) => listing.dealType === 'sale').length;

  return (
    <div className="min-h-screen bg-[#f6f6f7] pb-16">
      <PageHero
        eyebrow="לוח בתנופה"
        title="דירות להשכרה ולמכירה בצפת"
        description={'עמוד מודגש ומעוצב בסגנון מקצועי ללוח הנדל"ן של צפת. כל מודעה כוללת תמונה, מיקום, מחיר, גודל, פרטים נוספים, מרפסת ויצירת קשר ישירה בוואטסאפ.'}
        accent="from-red-900 via-red-800 to-[#111827]"
      >
        <div className="grid gap-3 rounded-[1.5rem] border border-white/15 bg-white/10 p-3 backdrop-blur-sm sm:gap-4 sm:rounded-[2rem] sm:p-4 md:grid-cols-[1.6fr_0.9fr]">
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

        <div className="mb-8 overflow-hidden rounded-[1.5rem] bg-gradient-to-l from-[#1ebe5d] via-[#25d366] to-[#128c4a] shadow-xl sm:rounded-[2rem]">
          <div className="flex flex-col items-center gap-4 p-5 text-center sm:flex-row sm:gap-6 sm:p-7 sm:text-right">
            <div className="shrink-0 rounded-full bg-white/15 p-4">
              <svg viewBox="0 0 24 24" fill="white" className="h-10 w-10 sm:h-12 sm:w-12">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div className="flex-1 text-white">
              <p className="text-xl font-black leading-snug sm:text-2xl">לפרסום בצפת בתנופה</p>
              <p className="mt-1 text-sm font-bold text-white/90 sm:text-base">פרסמו את הנכס שלכם בלוח הנדל"ן של צפת – פשוט, מהיר ואפקטיבי</p>
            </div>
            <a
              href="https://wa.me/972525981770"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-black text-[#128c4a] shadow-lg transition hover:scale-105 hover:shadow-xl sm:px-8 sm:py-4 sm:text-base"
            >
              צרו קשר עכשיו
            </a>
          </div>
        </div>

        <div className="mb-8 grid gap-4 rounded-[1.5rem] border border-red-100 bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-6 md:grid-cols-3">
          <div className="rounded-3xl bg-red-50 p-4 sm:p-5">
            <p className="text-sm font-black text-red-700">מודעות פעילות</p>
            <p className="mt-2 text-3xl font-black text-gray-900 sm:text-4xl">{filteredListings.length}</p>
          </div>
          <div className="rounded-3xl bg-gray-50 p-4 sm:p-5">
            <p className="text-sm font-black text-gray-700">להשכרה</p>
            <p className="mt-2 text-3xl font-black text-gray-900 sm:text-4xl">{rentCount}</p>
          </div>
          <div className="rounded-3xl bg-[#111827] p-4 text-white sm:p-5">
            <p className="text-sm font-black text-white/80">למכירה</p>
            <p className="mt-2 text-3xl font-black text-white sm:text-4xl">{saleCount}</p>
          </div>
        </div>

        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 sm:gap-8">
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

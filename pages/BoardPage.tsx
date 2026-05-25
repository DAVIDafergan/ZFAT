import React, { useMemo, useState } from 'react';
import { Building2, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BoardListingCard } from '../components/BoardListingCard';
import { PageHero } from '../components/PageHero';
import { AdUnit } from '../components/AdUnit';
import { BoardListingDealType } from '../types';

type DealFilter = 'all' | BoardListingDealType;
type BalconyFilter = 'all' | 'with' | 'without';
type SortMode = 'newest' | 'priceAsc' | 'priceDesc' | 'sizeDesc';

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\w\u0590-\u05FF\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const toPositiveNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const isSmartQueryMatch = (queryTokens: string[], listing: { title: string; location: string; details: string; dealType: BoardListingDealType; hasBalcony: boolean }) => {
  if (queryTokens.length === 0) return true;

  const haystack = normalizeText(
    [
      listing.title,
      listing.location,
      listing.details,
      listing.dealType === 'rent' ? 'להשכרה שכירות' : 'למכירה מכירה',
      listing.hasBalcony ? 'מרפסת' : 'ללא מרפסת',
    ].join(' '),
  );

  return queryTokens.every((token) => haystack.includes(token));
};

export const BoardPage: React.FC = () => {
  const { boardListings, ads } = useApp();
  const [query, setQuery] = useState('');
  const [dealFilter, setDealFilter] = useState<DealFilter>('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [balconyFilter, setBalconyFilter] = useState<BalconyFilter>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minSize, setMinSize] = useState('');
  const [maxSize, setMaxSize] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const topAd = ads.find((ad) => ad.area === 'board_top' && ad.isActive);
  const activeListings = useMemo(() => boardListings.filter((listing) => listing.isActive), [boardListings]);
  const locationOptions = useMemo(
    () => Array.from(new Set(activeListings.map((listing) => listing.location))).sort((a, b) => a.localeCompare(b, 'he')),
    [activeListings],
  );

  const filteredListings = useMemo(() => {
    const queryTokens = normalizeText(query).split(' ').filter(Boolean);
    const minPriceValue = toPositiveNumber(minPrice);
    const maxPriceValue = toPositiveNumber(maxPrice);
    const minSizeValue = toPositiveNumber(minSize);
    const maxSizeValue = toPositiveNumber(maxSize);

    const filtered = activeListings.filter((listing) => {
      const matchesDeal = dealFilter === 'all' || listing.dealType === dealFilter;
      const matchesLocation = locationFilter === 'all' || listing.location === locationFilter;
      const matchesBalcony =
        balconyFilter === 'all'
        || (balconyFilter === 'with' && listing.hasBalcony)
        || (balconyFilter === 'without' && !listing.hasBalcony);
      const matchesPrice = (minPriceValue === null || listing.price >= minPriceValue) && (maxPriceValue === null || listing.price <= maxPriceValue);
      const matchesSize = (minSizeValue === null || listing.sizeSqm >= minSizeValue) && (maxSizeValue === null || listing.sizeSqm <= maxSizeValue);
      const matchesQuery = isSmartQueryMatch(queryTokens, listing);

      return matchesDeal && matchesLocation && matchesBalcony && matchesPrice && matchesSize && matchesQuery;
    });

    return filtered.sort((a, b) => {
      if (sortMode === 'priceAsc') return a.price - b.price;
      if (sortMode === 'priceDesc') return b.price - a.price;
      if (sortMode === 'sizeDesc') return b.sizeSqm - a.sizeSqm;

      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
      return bTime - aTime;
    });
  }, [activeListings, balconyFilter, dealFilter, locationFilter, maxPrice, maxSize, minPrice, minSize, query, sortMode]);

  const clearFilters = () => {
    setQuery('');
    setDealFilter('all');
    setLocationFilter('all');
    setBalconyFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setMinSize('');
    setMaxSize('');
    setSortMode('newest');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f7e9eb_0%,_#f7f7f8_28%,_#eef2f7_100%)] pb-16">
      <PageHero
        eyebrow="לוח בתנופה"
        title="דירות להשכרה ולמכירה בצפת"
        description={'לוח נדל"ן מחודש עם חיפוש חכם, סינון מתקדם וחוויית גלילה דינמית בעיצוב חדשותי יוקרתי.'}
        accent="from-[#7a0b14] via-[#5a1020] to-[#0f172a]"
      >
        <div className="animate-scan-line relative grid gap-3 rounded-[1.5rem] border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-sm sm:gap-4 sm:rounded-[2rem] sm:p-4 md:grid-cols-[1.6fr_0.9fr]">
          <div>
            <label htmlFor="listing-search" className="mb-2 block text-sm font-bold text-white/80">חיפוש לפי שכונה, רחוב או תיאור</label>
            <div className="flex items-center gap-3 rounded-full bg-white px-4 py-3 text-gray-800 shadow-lg">
              <Search size={18} className="text-red-700" />
              <input
                id="listing-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="לדוגמה: כנען, מרפסת, שכירות, מרכז"
                className="w-full bg-transparent text-sm font-bold outline-none"
              />
            </div>
          </div>
          <div>
            <label htmlFor="listing-filter" className="mb-2 block text-sm font-bold text-white/80">סוג עסקה</label>
            <select id="listing-filter" value={dealFilter} onChange={(event) => setDealFilter(event.target.value as DealFilter)} className="w-full rounded-full border-0 bg-white px-4 py-3 text-sm font-bold text-gray-800 shadow-lg outline-none">
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
          <div className="animate-luxury-rise flex flex-col items-center gap-4 p-5 text-center sm:flex-row sm:gap-6 sm:p-7 sm:text-right">
            <div className="animate-orbit-glow shrink-0 rounded-full bg-white/15 p-4">
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

        <div className="mb-8 rounded-[1.5rem] border border-[#d9dce5] bg-white/90 p-4 shadow-xl shadow-slate-200/70 backdrop-blur-sm sm:rounded-[2rem] sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#0f172a] px-3 py-2 text-xs font-black text-white sm:text-sm">
              <Sparkles size={15} className="text-amber-300" />
              חיפוש חכם וסינון מתקדם
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-sm font-black text-red-700 transition hover:bg-red-100"
            >
              <X size={15} />
              ניקוי פילטרים
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <label htmlFor="location-filter" className="mb-1 block text-xs font-black text-gray-600">אזור</label>
              <select id="location-filter" value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-bold text-gray-800 outline-none transition focus:border-red-300 focus:bg-white">
                <option value="all">כל האזורים</option>
                {locationOptions.map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="balcony-filter" className="mb-1 block text-xs font-black text-gray-600">מרפסת</label>
              <select id="balcony-filter" value={balconyFilter} onChange={(event) => setBalconyFilter(event.target.value as BalconyFilter)} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-bold text-gray-800 outline-none transition focus:border-red-300 focus:bg-white">
                <option value="all">לא משנה</option>
                <option value="with">עם מרפסת</option>
                <option value="without">ללא מרפסת</option>
              </select>
            </div>
            <div>
              <label htmlFor="sort-mode" className="mb-1 block text-xs font-black text-gray-600">מיון</label>
              <select id="sort-mode" value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-bold text-gray-800 outline-none transition focus:border-red-300 focus:bg-white">
                <option value="newest">הכי חדשות</option>
                <option value="priceAsc">מחיר: נמוך לגבוה</option>
                <option value="priceDesc">מחיר: גבוה לנמוך</option>
                <option value="sizeDesc">גודל: מהגדול לקטן</option>
              </select>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3">
              <p className="mb-2 inline-flex items-center gap-1 text-xs font-black text-gray-600"><SlidersHorizontal size={13} /> תוצאות</p>
              <p className="text-2xl font-black text-gray-900">{filteredListings.length}</p>
              <p className="text-xs font-bold text-gray-500">מודעות תואמות לסינון</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <label htmlFor="min-price" className="mb-1 block text-xs font-black text-gray-600">מחיר מינימום</label>
              <input id="min-price" type="number" min={0} value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="₪0" className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm font-bold text-gray-800 outline-none transition focus:border-red-300" />
            </div>
            <div>
              <label htmlFor="max-price" className="mb-1 block text-xs font-black text-gray-600">מחיר מקסימום</label>
              <input id="max-price" type="number" min={0} value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="ללא הגבלה" className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm font-bold text-gray-800 outline-none transition focus:border-red-300" />
            </div>
            <div>
              <label htmlFor="min-size" className="mb-1 block text-xs font-black text-gray-600">גודל מינימום (מ״ר)</label>
              <input id="min-size" type="number" min={0} value={minSize} onChange={(event) => setMinSize(event.target.value)} placeholder="לדוגמה 60" className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm font-bold text-gray-800 outline-none transition focus:border-red-300" />
            </div>
            <div>
              <label htmlFor="max-size" className="mb-1 block text-xs font-black text-gray-600">גודל מקסימום (מ״ר)</label>
              <input id="max-size" type="number" min={0} value={maxSize} onChange={(event) => setMaxSize(event.target.value)} placeholder="ללא הגבלה" className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm font-bold text-gray-800 outline-none transition focus:border-red-300" />
            </div>
          </div>
        </div>

        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 sm:gap-8">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="animate-stagger-in">
                <BoardListingCard listing={listing} />
              </div>
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

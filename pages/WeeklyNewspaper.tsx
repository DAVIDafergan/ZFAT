import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WeeklyPaper } from '../types';
import { PageHero } from '../components/PageHero';
import { WeeklyPaperCard } from '../components/WeeklyPaperCard';
import { AdUnit } from '../components/AdUnit';
import { formatWeekLabel } from '../services/siteConfig';

export const WeeklyNewspaper: React.FC = () => {
  const { weeklyPapers, ads } = useApp();
  const [query, setQuery] = useState('');
  const [selectedPaper, setSelectedPaper] = useState<WeeklyPaper | null>(weeklyPapers[0] || null);
  const topAd = ads.find((ad) => ad.area === 'weekly_top' && ad.isActive);

  const filteredPapers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return weeklyPapers;
    return weeklyPapers.filter((paper) => {
      const haystack = [paper.title, paper.description, paper.weekKey, formatWeekLabel(paper.weekKey)]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [query, weeklyPapers]);

  return (
    <div className="min-h-screen bg-[#f4f1ec] pb-16">
      <PageHero
        eyebrow="העיתון השבועי"
        title="כל המהדורות השבועיות במקום אחד"
        description="המערכת יכולה להעלות PDF מלא של העיתון, והקוראים יכולים לחפש לפי שבוע, לעיין אונליין ולהוריד למחשב."
        accent="from-[#111827] via-[#1f2937] to-red-800"
      >
        <div className="max-w-xl rounded-[2rem] border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
          <label htmlFor="weekly-paper-search" className="mb-2 block text-sm font-bold text-white/80">חיפוש לפי שבוע או כותרת</label>
          <div className="flex items-center gap-3 rounded-full bg-white px-4 py-3 text-gray-800 shadow-lg">
            <Search size={18} className="text-red-700" />
            <input
              id="weekly-paper-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="לדוגמה: שבוע 21 / 2026"
              className="w-full bg-transparent text-sm font-bold outline-none"
            />
          </div>
        </div>
      </PageHero>

      <div className="container mx-auto px-4 py-10">
        <div className="mb-10">
          <AdUnit ad={topAd} className="w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm" />
        </div>

        {selectedPaper && (
          <div className="mb-10 overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-xl">
            <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-black text-red-700">{formatWeekLabel(selectedPaper.weekKey)}</p>
                <h2 className="news-headline text-3xl font-black text-gray-900">{selectedPaper.title}</h2>
                <p className="mt-2 max-w-3xl text-sm font-medium leading-7 text-gray-600">{selectedPaper.description}</p>
              </div>
              <div className="flex gap-3">
                <a href={selectedPaper.pdfUrl} download target="_blank" rel="noreferrer" className="rounded-full bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-800">הורד PDF</a>
                <button onClick={() => setSelectedPaper(null)} className="rounded-full border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-red-200 hover:text-red-700">סגור תצוגה</button>
              </div>
            </div>
            <div className="bg-gray-950 p-3 md:p-6">
              <iframe src={selectedPaper.pdfUrl} title={selectedPaper.title} className="h-[78vh] w-full rounded-[1.5rem] border-0 bg-white" />
            </div>
          </div>
        )}

        {filteredPapers.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredPapers.map((paper) => (
              <WeeklyPaperCard key={paper.id} paper={paper} onOpen={setSelectedPaper} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-gray-300 bg-white px-6 py-16 text-center text-gray-500 shadow-sm">
            <X className="mx-auto mb-4 text-gray-300" size={36} />
            <p className="text-lg font-bold">לא נמצאה מהדורה מתאימה.</p>
          </div>
        )}
      </div>
    </div>
  );
};

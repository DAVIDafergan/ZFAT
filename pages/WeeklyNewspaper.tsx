import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus, Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WeeklyPaper } from '../types';
import { PageHero } from '../components/PageHero';
import { WeeklyPaperCard } from '../components/WeeklyPaperCard';
import { AdUnit } from '../components/AdUnit';
import { getWeeklyPaperDateLabel } from '../services/siteConfig';

export const WeeklyNewspaper: React.FC = () => {
  const { weeklyPapers, ads } = useApp();
  const [query, setQuery] = useState('');
  const [selectedPaper, setSelectedPaper] = useState<WeeklyPaper | null>(weeklyPapers[0] || null);
  const [hasAutoSelected, setHasAutoSelected] = useState(Boolean(weeklyPapers[0]));
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 640 ? 100 : 125));
  const [isDesktopSpread, setIsDesktopSpread] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 1024 : false));
  const readerRef = useRef<HTMLDivElement | null>(null);
  const topAd = ads.find((ad) => ad.area === 'weekly_top' && ad.isActive);
  const getDefaultZoom = () => (typeof window !== 'undefined' && window.innerWidth < 640 ? 100 : 125);

  const filteredPapers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return weeklyPapers;
    return weeklyPapers.filter((paper) => {
      const haystack = [paper.title, paper.description, paper.hebrewDate, paper.weekKey, getWeeklyPaperDateLabel(paper)]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [query, weeklyPapers]);

  useEffect(() => {
    if (!hasAutoSelected && !selectedPaper && weeklyPapers.length > 0) {
      setSelectedPaper(weeklyPapers[0]);
      setCurrentPage(1);
      setZoom(getDefaultZoom());
      setHasAutoSelected(true);
    }
  }, [hasAutoSelected, selectedPaper, weeklyPapers]);

  useEffect(() => {
    const onResize = () => setIsDesktopSpread(window.innerWidth >= 1024);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (isDesktopSpread) {
      setCurrentPage((prev) => (prev % 2 === 0 ? Math.max(1, prev - 1) : prev));
    }
  }, [isDesktopSpread]);

  const openPaper = (paper: WeeklyPaper) => {
    setSelectedPaper(paper);
    setCurrentPage(1);
    setZoom(getDefaultZoom());
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      window.setTimeout(() => {
        readerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  };

  const spreadStep = isDesktopSpread ? 2 : 1;
  const spreadStartPage = isDesktopSpread && currentPage % 2 === 0 ? Math.max(1, currentPage - 1) : currentPage;

  const createReaderSrc = (page: number) =>
    selectedPaper
      ? `${selectedPaper.pdfUrl}#page=${page}&zoom=${zoom}&view=FitH&pagemode=none&toolbar=0&navpanes=0`
      : '';

  const rightPageSrc = createReaderSrc(spreadStartPage);
  const leftPageSrc = createReaderSrc(spreadStartPage + 1);

  return (
    <div className="min-h-screen bg-[#f4f1ec] pb-16">
      <PageHero
        eyebrow="העיתון השבועי"
        title="כל המהדורות השבועיות במקום אחד"
        description="המערכת יכולה להעלות PDF מלא של העיתון, והקוראים יכולים לחפש לפי תאריך עברי, לעיין אונליין ולהוריד למחשב."
        accent="from-[#111827] via-[#1f2937] to-red-800"
      >
        <div className="max-w-xl rounded-[1.5rem] border border-white/15 bg-white/10 p-3 backdrop-blur-sm sm:rounded-[2rem] sm:p-4">
          <label htmlFor="weekly-paper-search" className="mb-2 block text-sm font-bold text-white/80">חיפוש לפי תאריך עברי או כותרת</label>
          <div className="flex items-center gap-3 rounded-full bg-white px-4 py-3 text-gray-800 shadow-lg">
            <Search size={18} className="text-red-700" />
            <input
              id="weekly-paper-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={'לדוגמה: י"ג בסיוון תשפ"ו'}
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
          <div ref={readerRef} className="mb-10 scroll-mt-24 overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white shadow-xl sm:rounded-[2rem]">
            <div className="flex flex-col gap-4 border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-black text-red-700">{getWeeklyPaperDateLabel(selectedPaper)}</p>
                <h2 className="news-headline text-2xl font-black text-gray-900 sm:text-3xl">{selectedPaper.title}</h2>
                <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-gray-600 sm:leading-7">{selectedPaper.description}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href={selectedPaper.pdfUrl} target="_blank" rel="noreferrer" className="rounded-full border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-red-200 hover:text-red-700">פתיחה במסך מלא</a>
                <a href={selectedPaper.pdfUrl} download target="_blank" rel="noreferrer" className="rounded-full bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-800">הורד PDF</a>
                <button onClick={() => setSelectedPaper(null)} className="rounded-full border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-red-200 hover:text-red-700">סגור תצוגה</button>
              </div>
            </div>
            <div className="space-y-4 bg-gradient-to-b from-[#121212] to-[#2d2d2d] p-3 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-white sm:px-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - spreadStep))}
                    className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-2 text-xs font-bold transition hover:border-white/40 hover:bg-white/10 sm:text-sm"
                  >
                    <ChevronRight size={16} /> עמוד קודם
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => prev + spreadStep)}
                    className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-2 text-xs font-bold transition hover:border-white/40 hover:bg-white/10 sm:text-sm"
                  >
                    עמוד הבא <ChevronLeft size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Search size={15} className="text-white/80" />
                  <button
                    onClick={() => setZoom((prev) => Math.max(75, prev - 25))}
                    className="rounded-full border border-white/20 p-2 transition hover:border-white/40 hover:bg-white/10"
                    aria-label="הקטנת זום"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="min-w-14 text-center text-sm font-black">{zoom}%</span>
                  <button
                    onClick={() => setZoom((prev) => Math.min(250, prev + 25))}
                    className="rounded-full border border-white/20 p-2 transition hover:border-white/40 hover:bg-white/10"
                    aria-label="הגדלת זום"
                  >
                    <Plus size={14} />
                  </button>
                  <input
                    type="range"
                    min={75}
                    max={250}
                    step={25}
                    value={zoom}
                    onChange={(event) => setZoom(Number(event.target.value))}
                    className="w-24 accent-red-500 sm:w-32"
                    aria-label="שליטת זום"
                  />
                </div>
              </div>
              <div className="rounded-[1.25rem] bg-[#efe8de] p-2 shadow-[0_14px_40px_rgba(0,0,0,0.35)] sm:p-4">
                {isDesktopSpread ? (
                  <div className="grid grid-cols-2 gap-3 rounded-[1rem] bg-[#e5ddd2] p-3">
                    <iframe key={`${spreadStartPage}-${zoom}-right`} src={rightPageSrc} title={`${selectedPaper.title} עמוד ${spreadStartPage}`} className="h-[72vh] min-h-[520px] w-full rounded-[0.85rem] border-0 bg-white" />
                    <iframe key={`${spreadStartPage + 1}-${zoom}-left`} src={leftPageSrc} title={`${selectedPaper.title} עמוד ${spreadStartPage + 1}`} className="h-[72vh] min-h-[520px] w-full rounded-[0.85rem] border-0 bg-white" />
                  </div>
                ) : (
                  <iframe key={`${currentPage}-${zoom}-single`} src={rightPageSrc} title={selectedPaper.title} className="h-[64vh] min-h-[360px] w-full rounded-[1rem] border-0 bg-white md:h-[78vh]" />
                )}
              </div>
              <p className="text-center text-xs font-medium text-white/80 sm:text-sm">
                {isDesktopSpread
                  ? `מצב פריסה פתוחה פעיל: מוצגים עמודים ${spreadStartPage}-${spreadStartPage + 1} כמו עיתון פתוח.`
                  : `כעת מוצג עמוד ${currentPage}. בדפדפן נייד אפשר לבצע זום במחוות אצבעות או לפתוח במסך מלא לחוויית דפדוף מלאה.`}
              </p>
            </div>
          </div>
        )}

        {filteredPapers.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPapers.map((paper) => (
              <WeeklyPaperCard key={paper.id} paper={paper} onOpen={openPaper} />
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

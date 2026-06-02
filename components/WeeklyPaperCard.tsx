import React from 'react';
import { BookOpen } from 'lucide-react';
import { WeeklyPaper } from '../types';
import { getWeeklyPaperDateLabel } from '../services/siteConfig';

interface WeeklyPaperCardProps {
  paper: WeeklyPaper;
  onOpen: (paper: WeeklyPaper) => void;
}

export const WeeklyPaperCard: React.FC<WeeklyPaperCardProps> = ({ paper, onOpen }) => {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
        {paper.coverImageUrl ? (
          <img src={paper.coverImageUrl} alt={paper.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-red-100 to-white text-red-700">
            <BookOpen size={32} />
          </div>
        )}
        <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-black text-red-700 shadow-sm">
          {getWeeklyPaperDateLabel(paper)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-2 sm:p-4">
        <h2 className="news-headline mb-1 line-clamp-2 text-xs font-black leading-4 text-gray-900 sm:text-lg sm:leading-tight">{paper.title}</h2>
        <p className="mb-2 line-clamp-2 text-[10px] leading-4 text-gray-600 sm:text-sm sm:leading-6">{paper.description}</p>
        <button onClick={() => onOpen(paper)} className="mt-auto w-full rounded-full bg-red-700 px-2 py-1.5 text-xs font-bold text-white transition hover:bg-red-800 sm:px-4 sm:py-2 sm:text-sm">
          עיון בעיתון
        </button>
      </div>
    </article>
  );
};

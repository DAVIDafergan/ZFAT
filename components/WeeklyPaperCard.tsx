import React from 'react';
import { Download, BookOpen } from 'lucide-react';
import { WeeklyPaper } from '../types';
import { formatWeekLabel } from '../services/siteConfig';

interface WeeklyPaperCardProps {
  paper: WeeklyPaper;
  onOpen: (paper: WeeklyPaper) => void;
}

export const WeeklyPaperCard: React.FC<WeeklyPaperCardProps> = ({ paper, onOpen }) => {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
        {paper.coverImageUrl ? (
          <img src={paper.coverImageUrl} alt={paper.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-red-100 to-white text-red-700">
            <BookOpen size={42} />
          </div>
        )}
        <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-red-700 shadow-sm">
          {formatWeekLabel(paper.weekKey)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h2 className="news-headline mb-2 text-2xl font-black text-gray-900">{paper.title}</h2>
        <p className="mb-5 text-sm font-medium leading-7 text-gray-600">{paper.description}</p>
        <div className="mt-auto flex flex-wrap gap-3">
          <button onClick={() => onOpen(paper)} className="inline-flex items-center gap-2 rounded-full bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-800">
            <BookOpen size={16} /> עיון בעיתון
          </button>
          <a href={paper.pdfUrl} download target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-red-200 hover:text-red-700">
            <Download size={16} /> הורדה למחשב
          </a>
        </div>
      </div>
    </article>
  );
};

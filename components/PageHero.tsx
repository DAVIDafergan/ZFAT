import React from 'react';
import { LOGO_URL } from '../services/siteConfig';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  accent?: string;
  children?: React.ReactNode;
}

export const PageHero: React.FC<PageHeroProps> = ({ eyebrow, title, description, accent = 'from-red-700 via-red-800 to-[#111827]', children }) => {
  return (
    <section className={`relative overflow-hidden bg-gradient-to-l ${accent} text-white`}>
      <div className="absolute inset-0 opacity-20" aria-hidden="true">
        <div className="absolute right-10 top-10 h-40 w-40 rounded-full bg-white blur-3xl" />
        <div className="absolute left-10 bottom-0 h-48 w-48 rounded-full bg-yellow-300 blur-3xl" />
      </div>
      <div className="container mx-auto px-4 py-14 md:py-20 relative z-10">
        <div className="max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-extrabold tracking-[0.2em] text-white/90">
            <img src={LOGO_URL} alt="" className="h-7 w-auto opacity-90" />
            <span>{eyebrow}</span>
          </div>
          <h1 className="news-headline mb-4 text-4xl font-black leading-tight md:text-6xl">{title}</h1>
          <p className="max-w-3xl text-lg font-medium leading-8 text-white/85 md:text-xl">{description}</p>
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
};

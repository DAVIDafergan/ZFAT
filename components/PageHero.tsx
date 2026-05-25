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
      <div className="container relative z-10 mx-auto px-4 py-10 sm:py-14 md:py-20">
        <div className="max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-extrabold tracking-[0.14em] text-white/90 sm:mb-5 sm:gap-3 sm:px-4 sm:text-sm sm:tracking-[0.2em]">
            <img src={LOGO_URL} alt="" className="h-6 w-auto opacity-90 sm:h-7" />
            <span>{eyebrow}</span>
          </div>
          <h1 className="news-headline mb-3 text-3xl font-black leading-tight sm:mb-4 sm:text-4xl md:text-6xl">{title}</h1>
          <p className="max-w-3xl text-sm font-medium leading-6 text-white/85 sm:text-lg sm:leading-8 md:text-xl">{description}</p>
          {children && <div className="mt-6 sm:mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
};

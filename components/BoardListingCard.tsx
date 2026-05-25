import React from 'react';
import { Building2, CalendarDays, MapPin, Phone, Ruler, SunMedium } from 'lucide-react';
import { BoardListing, DEAL_TYPE_LABELS } from '../types';
import { buildListingWhatsappUrl } from '../services/siteConfig';

interface BoardListingCardProps {
  listing: BoardListing;
}

export const BoardListingCard: React.FC<BoardListingCardProps> = ({ listing }) => {
  const whatsappUrl = buildListingWhatsappUrl(listing.title, listing.contactPhone);
  const createdAt = listing.createdAt ? Date.parse(listing.createdAt) : NaN;
  const publishedDate = Number.isNaN(createdAt)
    ? null
    : new Date(createdAt).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' });

  return (
    <article className="group animate-luxury-rise overflow-hidden rounded-[1.5rem] border border-[#dfe3eb] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:border-[#c8ced9] hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)] sm:rounded-[2rem]">
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <img src={listing.imageUrl} alt={listing.title} className="animate-luxury-pan h-full w-full object-cover transition duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        <div className="absolute right-3 top-3 flex gap-2 sm:right-4 sm:top-4">
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-black text-[#7a0b14] shadow sm:px-3 sm:text-xs">{DEAL_TYPE_LABELS[listing.dealType]}</span>
          <span className="rounded-full bg-black/75 px-2.5 py-1 text-[11px] font-black text-white shadow sm:px-3 sm:text-xs">₪{listing.price.toLocaleString('he-IL')}</span>
        </div>
        {publishedDate && (
          <div className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold text-white/95 backdrop-blur-sm sm:left-4 sm:top-4 sm:text-xs">
            <span className="inline-flex items-center gap-1"><CalendarDays size={12} /> {publishedDate}</span>
          </div>
        )}
        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/15 blur-2xl transition group-hover:scale-125" />
        <div className="absolute -left-8 bottom-0 h-16 w-16 rounded-full bg-red-500/20 blur-xl transition group-hover:translate-y-1" />
        <div className="absolute right-3 bottom-3 left-3 text-white sm:right-4 sm:bottom-4 sm:left-4">
          <h2 className="news-headline text-xl font-black leading-tight sm:text-2xl">{listing.title}</h2>
          <div className="mt-2 flex items-center gap-2 text-sm font-bold text-white/85">
            <MapPin size={14} />
            <span>{listing.location}</span>
          </div>
        </div>
      </div>
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-2.5 text-xs font-bold text-gray-700 sm:gap-3 sm:text-sm">
          <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50/80 px-3 py-2.5 sm:py-3"><Ruler size={16} className="text-red-700" /> {listing.sizeSqm} מ"ר</div>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/90 px-3 py-2.5 sm:py-3"><SunMedium size={16} className="text-red-700" /> {listing.hasBalcony ? 'כולל מרפסת' : 'ללא מרפסת'}</div>
        </div>
        <p className="min-h-[64px] text-sm leading-6 text-gray-600 sm:min-h-[72px] sm:leading-7">{listing.details}</p>
        <div className="flex flex-col gap-3 rounded-3xl border border-[#d7dee7] bg-gradient-to-l from-white via-slate-50 to-[#f5f7fb] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-gray-900">{listing.contactName}</p>
            <p className="text-sm font-medium text-gray-600" dir="ltr">{listing.contactPhone}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`tel:${listing.contactPhone}`} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:-translate-y-0.5 hover:border-red-200 hover:text-red-700">
              <Phone size={15} /> התקשר
            </a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#22c55e] px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#16a34a]">
              <Building2 size={15} /> פתח וואטסאפ
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};

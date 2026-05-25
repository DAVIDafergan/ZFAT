import React from 'react';
import { Building2, MapPin, Phone, Ruler, SunMedium } from 'lucide-react';
import { BoardListing, DEAL_TYPE_LABELS } from '../types';
import { buildListingWhatsappUrl } from '../services/siteConfig';

interface BoardListingCardProps {
  listing: BoardListing;
}

export const BoardListingCard: React.FC<BoardListingCardProps> = ({ listing }) => {
  const whatsappUrl = buildListingWhatsappUrl(listing.title, listing.contactPhone);
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <img src={listing.imageUrl} alt={listing.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        <div className="absolute right-4 top-4 flex gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-red-700 shadow">{DEAL_TYPE_LABELS[listing.dealType]}</span>
          <span className="rounded-full bg-black/75 px-3 py-1 text-xs font-black text-white shadow">₪{listing.price.toLocaleString('he-IL')}</span>
        </div>
        <div className="absolute bottom-4 right-4 left-4 text-white">
          <h2 className="news-headline text-2xl font-black leading-tight">{listing.title}</h2>
          <div className="mt-2 flex items-center gap-2 text-sm font-bold text-white/85">
            <MapPin size={14} />
            <span>{listing.location}</span>
          </div>
        </div>
      </div>
      <div className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-3 text-sm font-bold text-gray-700">
          <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-3"><Ruler size={16} className="text-red-700" /> {listing.sizeSqm} מ"ר</div>
          <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-3"><SunMedium size={16} className="text-red-700" /> {listing.hasBalcony ? 'כולל מרפסת' : 'ללא מרפסת'}</div>
        </div>
        <p className="min-h-[72px] text-sm leading-7 text-gray-600">{listing.details}</p>
        <div className="flex items-center justify-between gap-3 rounded-3xl border border-red-100 bg-red-50 px-4 py-4">
          <div>
            <p className="text-sm font-black text-gray-900">{listing.contactName}</p>
            <p className="text-sm font-medium text-gray-600" dir="ltr">{listing.contactPhone}</p>
          </div>
          <div className="flex gap-2">
            <a href={`tel:${listing.contactPhone}`} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:border-red-200 hover:text-red-700">
              <Phone size={15} /> התקשר
            </a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#22c55e] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#16a34a]">
              <Building2 size={15} /> פתח וואטסאפ
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};

import React from 'react';
import { Info, MapPin, Phone } from 'lucide-react';
import { BOARD_LISTING_CATEGORY_LABELS, BoardListing } from '../types';

interface ManagedListingCardProps {
  listing: BoardListing;
}

export const ManagedListingCard: React.FC<ManagedListingCardProps> = ({ listing }) => {
  const title = listing.title.trim() || BOARD_LISTING_CATEGORY_LABELS[listing.listingCategory];
  const hasImage = Boolean(listing.imageUrl?.trim());
  const hasPhone = Boolean(listing.contactPhone?.trim());
  const hasDetails = Boolean(listing.details?.trim());
  const hasLocation = Boolean(listing.location?.trim());

  return (
    <article className="overflow-hidden rounded-[1.4rem] border border-gray-200 bg-white shadow-sm">
      <div className="aspect-[16/10] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {hasImage ? (
          <img src={listing.imageUrl} alt={title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm font-black text-gray-500">
            {BOARD_LISTING_CATEGORY_LABELS[listing.listingCategory]}
          </div>
        )}
      </div>
      <div className="space-y-3 p-4 sm:p-5">
        <h3 className="news-headline text-xl font-black text-gray-900 sm:text-2xl">{title}</h3>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-gray-700">
          {hasLocation ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5">
              <MapPin size={15} className="text-red-700" /> {listing.location}
            </span>
          ) : null}
          {hasPhone ? (
            <a href={`tel:${listing.contactPhone}`} className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-red-700 transition hover:bg-red-100">
              <Phone size={15} /> {listing.contactPhone}
            </a>
          ) : null}
        </div>
        {hasDetails ? (
          <p className="text-sm leading-6 text-gray-600 sm:leading-7">{listing.details}</p>
        ) : (
          <p className="text-sm font-medium text-gray-400">לא נוספו פרטים נוספים.</p>
        )}
        {!hasLocation && !hasPhone && !hasDetails ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-black text-gray-500">
            <Info size={14} /> הפרטים יתעדכנו בקרוב
          </div>
        ) : null}
      </div>
    </article>
  );
};

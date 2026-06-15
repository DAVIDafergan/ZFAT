export enum Category {
  NEWS = 'מבזקים',
  COMMUNITY = 'קהילה וחברה',
  ECONOMY = 'כלכלה',
  POLITICS = 'פוליטיקה',
  SECURITY = 'ביטחון',
  CULTURE = 'תרבות ואומנות',
  CRIME = 'משפט ופלילים',
  HEALTH = 'בריאות',
  WEATHER = 'מזג אוויר',
  INFRASTRUCTURE = 'תשתיות ותנועה',
  LOCAL = 'צפת והגליל',
  SYNAGOGUES = 'בתי כנסת בצפת',
  KOSHER_RESTAURANTS = 'מסעדות כשרות',
  MIKVAOT = 'מקוואות',
  ATTRACTIONS = 'אטרקציות',
  SIMCHAOT = 'שמחות'
}

export interface PostImage {
  url: string;
  photographer?: string;
}

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: Category;
  author: string;
  date: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  imageUrl: string;
  tags: string[];
  isFeatured: boolean;
  featuredAt?: string;
  views: number;
  shortLinkCode: string;
  images?: PostImage[];
}

export interface AdSlide {
  id: string;
  imageUrl: string;
  videoUrl?: string;
  linkUrl?: string;
}

export type AdArea =
  | 'leaderboard'
  | 'homepage_mid'
  | 'homepage_feed'
  | 'sidebar'
  | 'sidebar_video'
  | 'article_inline'
  | 'article_bottom'
  | 'category_top'
  | 'category_mid'
  | 'weekly_top'
  | 'board_top'
  | 'contact_top'
  | 'search_top';

export interface Ad {
  id: string;
  title: string;
  area: AdArea;
  isActive: boolean;
  slides: AdSlide[];
}

export interface User {
  id: string;
  name: string;
  email?: string;
  password?: string;
  role: 'admin' | 'editor' | 'writer' | 'user';
  isAuthenticated: boolean;
  joinedDate?: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  content: string;
  date: string;
  likes: number;
  likedBy: string[];
  approved?: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  joinedDate: string;
  isActive: boolean;
}

export interface WeeklyPaper {
  id: string;
  title: string;
  hebrewDate: string;
  weekKey?: string;
  description: string;
  pdfUrl: string;
  coverImageUrl: string;
  publishedAt: string;
  isActive: boolean;
}

export type BoardListingDealType = 'rent' | 'sale' | 'vacation';
export type BoardListingCategory = 'real_estate' | 'restaurants' | 'synagogues' | 'mikvaot' | 'attractions';
export type ManagedBoardListingCategory = Exclude<BoardListingCategory, 'real_estate'>;

export interface Agent {
  id: string;
  name: string;
  phone: string;
  imageUrl: string;
  createdAt?: string;
}

export interface BoardListing {
  id: string;
  title: string;
  imageUrl: string;
  listingCategory: BoardListingCategory;
  location: string;
  dealType: BoardListingDealType;
  price: number;
  sizeSqm: number;
  details: string;
  hasBalcony: boolean;
  contactName: string;
  contactPhone: string;
  agentId?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  grayscale: boolean;
  highlightLinks: boolean;
  stopAnimations: boolean;
}

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.NEWS]: 'bg-red-600',
  [Category.COMMUNITY]: 'bg-green-600',
  [Category.ECONOMY]: 'bg-emerald-700',
  [Category.POLITICS]: 'bg-blue-600',
  [Category.SECURITY]: 'bg-orange-600',
  [Category.CULTURE]: 'bg-purple-600',
  [Category.CRIME]: 'bg-gray-800',
  [Category.HEALTH]: 'bg-teal-600',
  [Category.WEATHER]: 'bg-cyan-600',
  [Category.INFRASTRUCTURE]: 'bg-yellow-600',
  [Category.LOCAL]: 'bg-red-700',
  [Category.SYNAGOGUES]: 'bg-indigo-600',
  [Category.KOSHER_RESTAURANTS]: 'bg-lime-600',
  [Category.MIKVAOT]: 'bg-sky-700',
  [Category.ATTRACTIONS]: 'bg-violet-600',
  [Category.SIMCHAOT]: 'bg-pink-600',
};

export const DEAL_TYPE_LABELS: Record<BoardListingDealType, string> = {
  rent: 'להשכרה',
  sale: 'למכירה',
  vacation: 'צימרים ונופש',
};

export const BOARD_LISTING_CATEGORY_LABELS: Record<BoardListingCategory, string> = {
  real_estate: 'נדל"ן',
  restaurants: 'מסעדות כשרות',
  synagogues: 'בתי כנסת בצפת',
  mikvaot: 'מקוואות',
  attractions: 'אטרקציות',
};

export const PAGE_CATEGORY_TO_MANAGED_BOARD_CATEGORY: Partial<Record<Category, ManagedBoardListingCategory>> = {
  [Category.KOSHER_RESTAURANTS]: 'restaurants',
  [Category.SYNAGOGUES]: 'synagogues',
  [Category.MIKVAOT]: 'mikvaot',
  [Category.ATTRACTIONS]: 'attractions',
};

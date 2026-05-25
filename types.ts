export enum Category {
  NEWS = 'מבזקים',
  COMMUNITY = 'קהילה וחברה',
  POLITICS = 'פוליטיקה',
  SECURITY = 'ביטחון',
  CULTURE = 'תרבות ואומנות',
  CRIME = 'משפט ופלילים',
  WEATHER = 'מזג אוויר',
  INFRASTRUCTURE = 'תשתיות ותנועה',
  LOCAL = 'צפת והגליל'
}

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: Category;
  author: string;
  date: string;
  imageUrl: string;
  tags: string[];
  isFeatured: boolean;
  views: number;
  shortLinkCode: string;
}

export interface AdSlide {
  id: string;
  imageUrl: string;
  videoUrl?: string;
  linkUrl: string;
}

export interface Ad {
  id: string;
  title: string;
  area: 'leaderboard' | 'sidebar' | 'sidebar_video' | 'article_bottom' | 'homepage_mid';
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
  weekKey: string;
  description: string;
  pdfUrl: string;
  coverImageUrl: string;
  publishedAt: string;
  isActive: boolean;
}

export type BoardListingDealType = 'rent' | 'sale';

export interface BoardListing {
  id: string;
  title: string;
  imageUrl: string;
  location: string;
  dealType: BoardListingDealType;
  price: number;
  sizeSqm: number;
  details: string;
  hasBalcony: boolean;
  contactName: string;
  contactPhone: string;
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
  [Category.POLITICS]: 'bg-blue-600',
  [Category.SECURITY]: 'bg-orange-600',
  [Category.CULTURE]: 'bg-purple-600',
  [Category.CRIME]: 'bg-gray-800',
  [Category.WEATHER]: 'bg-cyan-600',
  [Category.INFRASTRUCTURE]: 'bg-yellow-600',
  [Category.LOCAL]: 'bg-red-700',
};

export const DEAL_TYPE_LABELS: Record<BoardListingDealType, string> = {
  rent: 'להשכרה',
  sale: 'למכירה',
};

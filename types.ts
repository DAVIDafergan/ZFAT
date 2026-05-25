
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
  content: string; // HTML content simulation
  category: Category;
  author: string;
  date: string;
  imageUrl: string;
  tags: string[];
  isFeatured: boolean; // For main slider
  views: number;
  shortLinkCode: string;
}

export interface AdSlide {
  id: string;
  imageUrl: string;
  videoUrl?: string; // Added video support
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
  email?: string; // Added email
  password?: string; // For simulation only
  role: 'admin' | 'editor' | 'writer' | 'user'; // Added 'user'
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
  likedBy: string[]; // User IDs who liked this
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string; // Added phone number
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

export interface AccessibilitySettings {
  fontSize: number; // 0=normal, 1=large, 2=extra large
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
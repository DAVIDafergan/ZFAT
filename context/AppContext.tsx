import { createContext, useContext } from 'react';
import {
  Post,
  Ad,
  User,
  Comment,
  ContactMessage,
  NewsletterSubscriber,
  AccessibilitySettings,
  WeeklyPaper,
  BoardListing,
} from '../types';

export interface AppState {
  posts: Post[];
  ads: Ad[];
  user: User | null;
  comments: Comment[];
  registeredUsers: User[];
  contactMessages: ContactMessage[];
  newsletterSubscribers: NewsletterSubscriber[];
  weeklyPapers: WeeklyPaper[];
  boardListings: BoardListing[];
  accessibility: AccessibilitySettings;
  isLoading: boolean;

  addPost: (post: Post) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  incrementViews: (id: string) => void;
  updateAd: (id: string, updates: Partial<Ad>) => Promise<void>;
  createAd: (ad: Ad) => Promise<void>;
  deleteAd: (id: string) => Promise<void>;
  createWeeklyPaper: (paper: WeeklyPaper) => Promise<void>;
  deleteWeeklyPaper: (id: string) => Promise<void>;
  createBoardListing: (listing: BoardListing) => Promise<void>;
  deleteBoardListing: (id: string) => Promise<void>;

  login: (usernameOrEmail: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (user: User) => Promise<boolean>;

  addComment: (comment: Comment) => Promise<void>;
  toggleLikeComment: (commentId: string) => Promise<void>;

  addContactMessage: (msg: ContactMessage) => Promise<void>;
  subscribeToNewsletter: (email: string) => Promise<boolean>;
  sendNewsletter: (subject: string, content: string, postId?: string) => Promise<void>;

  toggleAccessibilityOption: (option: keyof AccessibilitySettings) => void;
  setFontSize: (size: number) => void;
  resetAccessibility: () => void;
}

export const AppContext = createContext<AppState | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

import { Post, Ad, User, Comment, ContactMessage, NewsletterSubscriber, WeeklyPaper, BoardListing } from '../types';
import {
  INITIAL_POSTS,
  INITIAL_ADS,
  INITIAL_COMMENTS,
  INITIAL_USERS,
  INITIAL_MESSAGES,
  INITIAL_SUBSCRIBERS,
  INITIAL_WEEKLY_PAPERS,
  INITIAL_BOARD_LISTINGS,
} from './mockData';
import { API_URL, USE_SERVER, normalizeShareCode } from './siteConfig';

const getToken = () => localStorage.getItem('zfat_jwt');

class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

const authHeaders = (): Record<string, string> => {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getStorage = <T>(key: string, defaultData: T): T => {
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(key, JSON.stringify(defaultData));
  return defaultData;
};

const setStorage = (key: string, data: unknown) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const resolveId = (item: { id?: string; _id?: string }) => item.id || item._id || '';

const normalizePost = (post: any): Post => {
  const normalizedImages = Array.isArray(post.images)
    ? post.images
      .map((image: any) => ({
        url: image?.url || '',
        photographer: image?.photographer || '',
      }))
      .filter((image: { url: string }) => Boolean(image.url))
    : [];
  const fallbackImageUrl = post.imageUrl || normalizedImages[0]?.url || '';
  const images = normalizedImages.length > 0
    ? normalizedImages
    : (fallbackImageUrl ? [{ url: fallbackImageUrl, photographer: '' }] : []);

  return {
    id: resolveId(post),
    title: post.title || '',
    excerpt: post.excerpt || '',
    content: post.content || '',
    category: post.category,
    author: post.author || 'מערכת',
    date: post.date || (post.createdAt ? new Date(post.createdAt).toLocaleDateString('he-IL') : new Date().toLocaleDateString('he-IL')),
    imageUrl: fallbackImageUrl,
    tags: Array.isArray(post.tags) ? post.tags : [],
    isFeatured: Boolean(post.isFeatured),
    views: Number(post.views || 0),
    shortLinkCode: normalizeShareCode(post.shortLinkCode, resolveId(post)),
    images,
  };
};

const normalizeAd = (ad: any): Ad => ({
  id: resolveId(ad),
  title: ad.title || '',
  area: ad.area,
  isActive: Boolean(ad.isActive),
  slides: Array.isArray(ad.slides)
    ? ad.slides.map((slide: any, index: number) => ({
        id: resolveId(slide) || `${resolveId(ad)}-${index}`,
        imageUrl: slide.imageUrl || '',
        videoUrl: slide.videoUrl || '',
        linkUrl: slide.linkUrl || '',
      }))
    : [],
});

const normalizeComment = (comment: any): Comment => ({
  id: resolveId(comment),
  postId: comment.postId?.toString?.() || comment.postId || '',
  userId: comment.userId || '',
  userName: comment.userName || '',
  content: comment.content || '',
  date: comment.date || (comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('he-IL') : new Date().toLocaleDateString('he-IL')),
  likes: Number(comment.likes || 0),
  likedBy: Array.isArray(comment.likedBy) ? comment.likedBy : [],
});

const normalizeMessage = (message: any): ContactMessage => ({
  id: resolveId(message),
  name: message.name || '',
  email: message.email || '',
  phone: message.phone || '',
  subject: message.subject || '',
  message: message.message || '',
  date: message.date || (message.createdAt ? new Date(message.createdAt).toLocaleDateString('he-IL') : new Date().toLocaleDateString('he-IL')),
  read: Boolean(message.read),
});

const normalizeSubscriber = (subscriber: any): NewsletterSubscriber => ({
  id: resolveId(subscriber),
  email: subscriber.email || '',
  joinedDate: subscriber.joinedDate || (subscriber.createdAt ? new Date(subscriber.createdAt).toLocaleDateString('he-IL') : new Date().toLocaleDateString('he-IL')),
  isActive: subscriber.isActive !== false,
});

const normalizeUser = (user: any): User => ({
  id: resolveId(user),
  name: user.name || '',
  email: user.email || '',
  role: user.role || 'user',
  isAuthenticated: user.isAuthenticated !== false,
  joinedDate: user.joinedDate || (user.createdAt ? new Date(user.createdAt).toLocaleDateString('he-IL') : undefined),
});

const normalizeWeeklyPaper = (paper: any): WeeklyPaper => ({
  id: resolveId(paper),
  title: paper.title || '',
  weekKey: paper.weekKey || '',
  description: paper.description || '',
  pdfUrl: paper.pdfUrl || '',
  coverImageUrl: paper.coverImageUrl || '',
  publishedAt: paper.publishedAt || paper.createdAt || new Date().toISOString(),
  isActive: paper.isActive !== false,
});

const normalizeBoardListing = (listing: any): BoardListing => ({
  id: resolveId(listing),
  title: listing.title || '',
  imageUrl: listing.imageUrl || '',
  location: listing.location || '',
  dealType: listing.dealType || 'rent',
  price: Number(listing.price || 0),
  sizeSqm: Number(listing.sizeSqm || 0),
  details: listing.details || '',
  hasBalcony: Boolean(listing.hasBalcony),
  contactName: listing.contactName || '',
  contactPhone: listing.contactPhone || '',
  isActive: listing.isActive !== false,
  createdAt: listing.createdAt || new Date().toISOString(),
});

const shouldUseServer = () => USE_SERVER;

const fetchJson = async (path: string, init?: RequestInit) => {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, init);
  } catch (err) {
    console.error(`[API] Network error for ${path}:`, err);
    throw new ApiRequestError('לא ניתן להתחבר לשרת כרגע. ודאו שה-Backend פעיל ונסו שוב.', 503);
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    console.error(`[API] Request failed: ${path} [${response.status}]`, data);
    throw new ApiRequestError(data?.message || `Request failed: ${response.status}`, response.status);
  }
  return data;
};

const shouldFallbackToLocal = (error: unknown) => (
  !(error instanceof ApiRequestError) || error.status >= 500
);

export const api = {
  fetchInitialData: async () => {
    if (shouldUseServer()) {
      try {
        const [posts, ads, comments, weeklyPapers, boardListings] = await Promise.all([
          fetchJson('/api/posts', { headers: authHeaders() }),
          fetchJson('/api/ads', { headers: authHeaders() }),
          fetchJson('/api/comments', { headers: authHeaders() }),
          fetchJson('/api/weekly-papers', { headers: authHeaders() }),
          fetchJson('/api/board-listings', { headers: authHeaders() }),
        ]);
        const messagesRes = await fetch(`${API_URL}/api/messages`, { headers: authHeaders() }).catch((error) => {
          console.error('[API] Failed loading messages', error);
          return null;
        });
        const subscribersRes = await fetch(`${API_URL}/api/subscribers`, { headers: authHeaders() }).catch((error) => {
          console.error('[API] Failed loading subscribers', error);
          return null;
        });
        const usersRes = await fetch(`${API_URL}/api/auth/users`, { headers: authHeaders() }).catch((error) => {
          console.error('[API] Failed loading users', error);
          return null;
        });
        const messages = messagesRes?.ok ? await messagesRes.json() : [];
        const subscribers = subscribersRes?.ok ? await subscribersRes.json() : [];
        const users = usersRes?.ok ? await usersRes.json() : [];

        return {
          posts: (posts.data || posts).map(normalizePost),
          ads: (ads || []).map(normalizeAd),
          comments: (comments || []).map(normalizeComment),
          registeredUsers: (users || []).map(normalizeUser),
          contactMessages: (messages || []).map(normalizeMessage),
          newsletterSubscribers: (subscribers || []).map(normalizeSubscriber),
          weeklyPapers: (weeklyPapers || []).map(normalizeWeeklyPaper),
          boardListings: (boardListings || []).map(normalizeBoardListing),
        };
      } catch (error) {
        console.warn('Server connection failed, falling back to local storage', error);
      }
    }

    return api.fetchInitialDataLocal();
  },

  fetchInitialDataLocal: async () => {
    await delay(500);
    return {
      posts: getStorage('zfat_posts', INITIAL_POSTS).map(normalizePost),
      ads: getStorage('zfat_ads', INITIAL_ADS).map(normalizeAd),
      comments: getStorage('zfat_comments', INITIAL_COMMENTS).map(normalizeComment),
      registeredUsers: getStorage('zfat_users_db', INITIAL_USERS).map(normalizeUser),
      contactMessages: getStorage('zfat_messages', INITIAL_MESSAGES).map(normalizeMessage),
      newsletterSubscribers: getStorage('zfat_subscribers', INITIAL_SUBSCRIBERS).map(normalizeSubscriber),
      weeklyPapers: getStorage('zfat_weekly_papers', INITIAL_WEEKLY_PAPERS).map(normalizeWeeklyPaper),
      boardListings: getStorage('zfat_board_listings', INITIAL_BOARD_LISTINGS).map(normalizeBoardListing),
    };
  },

  addPost: async (post: Post) => {
    if (shouldUseServer()) {
      try {
        await fetchJson('/api/posts', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(post),
        });
        return;
      } catch (error) {
        console.warn('Falling back to local post creation', error);
      }
    }

    await delay(200);
    const posts = getStorage('zfat_posts', INITIAL_POSTS);
    setStorage('zfat_posts', [post, ...posts]);
  },

  updatePost: async (id: string, updates: Partial<Post>) => {
    if (shouldUseServer()) {
      try {
        await fetchJson(`/api/posts/${id}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(updates),
        });
        return;
      } catch (error) {
        console.warn('Falling back to local post update', error);
      }
    }

    await delay(150);
    const posts = getStorage<Post[]>('zfat_posts', INITIAL_POSTS);
    setStorage('zfat_posts', posts.map((post) => (post.id === id ? { ...post, ...updates } : post)));
  },

  deletePost: async (id: string) => {
    if (shouldUseServer()) {
      try {
        await fetchJson(`/api/posts/${id}`, {
          method: 'DELETE',
          headers: authHeaders(),
        });
        return;
      } catch (error) {
        console.warn('Falling back to local post deletion', error);
      }
    }

    await delay(150);
    const posts = getStorage<Post[]>('zfat_posts', INITIAL_POSTS);
    setStorage('zfat_posts', posts.filter(p => p.id !== id));
  },

  incrementViews: async (id: string) => {
    if (shouldUseServer()) {
      fetch(`${API_URL}/api/posts/${id}/views`, { method: 'PATCH' }).catch((error) => {
        console.error('[API] Failed to increment post views', { id, error });
      });
      return;
    }

    const posts = getStorage<Post[]>('zfat_posts', INITIAL_POSTS);
    setStorage('zfat_posts', posts.map(p => p.id === id ? { ...p, views: (p.views || 0) + 1 } : p));
  },

  updateAd: async (id: string, updates: Partial<Ad>) => {
    if (shouldUseServer()) {
      try {
        await fetchJson(`/api/ads/${id}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(updates),
        });
        return;
      } catch (error) {
        console.warn('Falling back to local ad update', error);
      }
    }

    await delay(150);
    const ads = getStorage<Ad[]>('zfat_ads', INITIAL_ADS);
    setStorage('zfat_ads', ads.map(a => a.id === id ? { ...a, ...updates } : a));
  },

  createAd: async (ad: Ad) => {
    if (shouldUseServer()) {
      try {
        await fetchJson('/api/ads', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(ad),
        });
        return;
      } catch (error) {
        console.warn('Falling back to local ad creation', error);
      }
    }

    await delay(150);
    const ads = getStorage<Ad[]>('zfat_ads', INITIAL_ADS);
    setStorage('zfat_ads', [...ads, ad]);
  },

  deleteAd: async (id: string) => {
    if (shouldUseServer()) {
      try {
        await fetchJson(`/api/ads/${id}`, {
          method: 'DELETE',
          headers: authHeaders(),
        });
        return;
      } catch (error) {
        console.warn('Falling back to local ad deletion', error);
      }
    }

    await delay(150);
    const ads = getStorage<Ad[]>('zfat_ads', INITIAL_ADS);
    setStorage('zfat_ads', ads.filter(a => a.id !== id));
  },

  createWeeklyPaper: async (paper: WeeklyPaper) => {
    if (shouldUseServer()) {
      try {
        await fetchJson('/api/weekly-papers', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(paper),
        });
        return;
      } catch (error) {
        if (!shouldFallbackToLocal(error)) throw error;
        console.warn('Falling back to local weekly paper creation', error);
      }
    }

    try {
      const papers = getStorage<WeeklyPaper[]>('zfat_weekly_papers', INITIAL_WEEKLY_PAPERS);
      setStorage('zfat_weekly_papers', [paper, ...papers]);
    } catch (error) {
      throw new ApiRequestError('העיתון גדול מדי לשמירה מקומית. העלו קישור ל-PDF במקום קובץ מלא.', 413);
    }
  },

  deleteWeeklyPaper: async (id: string) => {
    if (shouldUseServer()) {
      try {
        await fetchJson(`/api/weekly-papers/${id}`, {
          method: 'DELETE',
          headers: authHeaders(),
        });
        return;
      } catch (error) {
        console.warn('Falling back to local weekly paper deletion', error);
      }
    }

    const papers = getStorage<WeeklyPaper[]>('zfat_weekly_papers', INITIAL_WEEKLY_PAPERS);
    setStorage('zfat_weekly_papers', papers.filter(paper => paper.id !== id));
  },

  createBoardListing: async (listing: BoardListing) => {
    if (shouldUseServer()) {
      try {
        await fetchJson('/api/board-listings', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(listing),
        });
        return;
      } catch (error) {
        console.warn('Falling back to local board listing creation', error);
      }
    }

    const listings = getStorage<BoardListing[]>('zfat_board_listings', INITIAL_BOARD_LISTINGS);
    setStorage('zfat_board_listings', [listing, ...listings]);
  },

  deleteBoardListing: async (id: string) => {
    if (shouldUseServer()) {
      try {
        await fetchJson(`/api/board-listings/${id}`, {
          method: 'DELETE',
          headers: authHeaders(),
        });
        return;
      } catch (error) {
        console.warn('Falling back to local board listing deletion', error);
      }
    }

    const listings = getStorage<BoardListing[]>('zfat_board_listings', INITIAL_BOARD_LISTINGS);
    setStorage('zfat_board_listings', listings.filter(listing => listing.id !== id));
  },

  uploadFile: async (file: File, folder = 'admin'): Promise<string> => {
    if (!shouldUseServer()) {
      throw new ApiRequestError('Server upload is disabled', 400);
    }
    const token = getToken();
    if (!token) {
      throw new ApiRequestError('אין הרשאה להעלאת קבצים', 401);
    }

    const body = new FormData();
    body.append('file', file);
    body.append('folder', folder);
    const headers = authHeaders();
    delete headers['Content-Type'];

    let response: Response;
    try {
      response = await fetch(`${API_URL}/api/uploads`, {
        method: 'POST',
        headers,
        body,
      });
    } catch {
      throw new ApiRequestError('העלאת הקובץ נכשלה', 503);
    }

    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.url) {
      throw new ApiRequestError(data?.message || 'העלאת הקובץ נכשלה', response.status);
    }

    return data.url;
  },

  login: async (usernameOrEmail: string, pass: string): Promise<User> => {
    if (shouldUseServer()) {
      try {
        const data = await fetchJson('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: usernameOrEmail, usernameOrEmail, password: pass }),
        });
        if (!data?.token || !data?.user) {
          throw new ApiRequestError('התקבלה תגובה לא תקינה מהשרת', 502);
        }
        localStorage.setItem('zfat_jwt', data.token);
        return normalizeUser({ ...data.user, isAuthenticated: true });
      } catch (error) {
        if (error instanceof ApiRequestError) {
          if ([400, 401, 404].includes(error.status)) {
            throw new ApiRequestError('אימייל או סיסמה שגויים', error.status);
          }
          if (error.status === 429) {
            throw new ApiRequestError('יותר מדי ניסיונות התחברות. נסו שוב בעוד כמה דקות.', error.status);
          }
        }
        throw error;
      }
    }

    await delay(250);
    const users = getStorage<User[]>('zfat_users_db', INITIAL_USERS);
    const normalizedIdentifier = usernameOrEmail.trim().toLowerCase();
    const found = users.find(u => ((u.email || '').toLowerCase() === normalizedIdentifier || u.name === usernameOrEmail.trim()) && u.password === pass);
    if (!found) {
      throw new ApiRequestError('שם משתמש או סיסמה שגויים', 401);
    }
    return { ...found, isAuthenticated: true };
  },

  register: async (user: User): Promise<User> => {
    if (shouldUseServer()) {
      try {
        const data = await fetchJson('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        });
        if (data.token) localStorage.setItem('zfat_jwt', data.token);
        return normalizeUser({ ...data.user, isAuthenticated: true });
      } catch (error) {
        console.error('[API][Auth] Register failed', {
          email: user.email,
          error,
        });
        throw error;
      }
    }

    await delay(250);
    const users = getStorage<User[]>('zfat_users_db', INITIAL_USERS);
    const normalizedUser = { ...user, name: user.name.trim(), email: user.email?.trim().toLowerCase() };
    if (users.some(u => u.email?.toLowerCase() === normalizedUser.email?.toLowerCase())) {
      throw new ApiRequestError('כתובת האימייל כבר רשומה במערכת', 409);
    }
    setStorage('zfat_users_db', [...users, normalizedUser]);
    return normalizeUser(normalizedUser);
  },

  fetchUsers: async (): Promise<User[]> => {
    if (shouldUseServer()) {
      const users = await fetchJson('/api/auth/users', { headers: authHeaders() });
      return (users || []).map(normalizeUser);
    }

    await delay(150);
    return getStorage<User[]>('zfat_users_db', INITIAL_USERS).map(normalizeUser);
  },

  verifyToken: async (): Promise<User | null> => {
    if (!shouldUseServer()) return null;
    const token = getToken();
    if (!token) return null;
    try {
      const user = await fetchJson('/api/auth/me', { headers: authHeaders() });
      return normalizeUser({ ...user, isAuthenticated: true });
    } catch (error) {
      console.error('[API][Auth] Token verification failed', error);
      localStorage.removeItem('zfat_jwt');
      return null;
    }
  },

  addComment: async (comment: Comment) => {
    if (shouldUseServer()) {
      try {
        await fetchJson('/api/comments', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(comment),
        });
        return;
      } catch (error) {
        console.warn('Falling back to local comment creation', error);
      }
    }

    const comments = getStorage<Comment[]>('zfat_comments', INITIAL_COMMENTS);
    setStorage('zfat_comments', [...comments, comment]);
  },

  toggleLike: async (commentId: string, userId: string) => {
    if (shouldUseServer()) {
      fetch(`${API_URL}/api/comments/${commentId}/like`, {
        method: 'PATCH',
        headers: authHeaders(),
      }).catch((error) => {
        console.error('[API] Failed to toggle comment like', { commentId, userId, error });
      });
      return;
    }

    const comments = getStorage<Comment[]>('zfat_comments', INITIAL_COMMENTS);
    const updated = comments.map(c => {
      if (c.id === commentId) {
        const hasLiked = c.likedBy.includes(userId);
        return {
          ...c,
          likes: hasLiked ? c.likes - 1 : c.likes + 1,
          likedBy: hasLiked ? c.likedBy.filter(id => id !== userId) : [...c.likedBy, userId],
        };
      }
      return c;
    });
    setStorage('zfat_comments', updated);
  },

  sendMessage: async (msg: ContactMessage) => {
    if (shouldUseServer()) {
      try {
        await fetchJson('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(msg),
        });
        return;
      } catch (error) {
        console.warn('Falling back to local message creation', error);
      }
    }

    const messages = getStorage<ContactMessage[]>('zfat_messages', INITIAL_MESSAGES);
    setStorage('zfat_messages', [msg, ...messages]);
  },

  subscribe: async (email: string): Promise<boolean> => {
    if (shouldUseServer()) {
      try {
        await fetchJson('/api/subscribers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        return true;
      } catch (error) {
        console.error('[API] Newsletter subscribe failed', { email, error });
        return false;
      }
    }

    const subs = getStorage<NewsletterSubscriber[]>('zfat_subscribers', INITIAL_SUBSCRIBERS);
    if (subs.some(s => s.email === email)) return false;
    const newSub: NewsletterSubscriber = {
      id: Date.now().toString(),
      email,
      joinedDate: new Date().toLocaleDateString('he-IL'),
      isActive: true,
    };
    setStorage('zfat_subscribers', [...subs, newSub]);
    return true;
  },
};

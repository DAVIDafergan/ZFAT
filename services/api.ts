import { Post, Ad, User, Comment, ContactMessage, NewsletterSubscriber } from '../types';
import { INITIAL_POSTS, INITIAL_ADS, INITIAL_COMMENTS, INITIAL_USERS, INITIAL_MESSAGES, INITIAL_SUBSCRIBERS } from './mockData';

// SET THIS TO TRUE WHEN YOU HAVE A REAL SERVER CONNECTED
const USE_SERVER = false;
const API_URL = (() => {
  try {
    return (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';
  } catch {
    return 'http://localhost:3001';
  }
})();

const getToken = () => localStorage.getItem('zfat_jwt');

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

const normalizePost = (post: any): Post => ({
  id: resolveId(post),
  title: post.title || '',
  excerpt: post.excerpt || '',
  content: post.content || '',
  category: post.category,
  author: post.author || 'מערכת',
  date: post.date || (post.createdAt ? new Date(post.createdAt).toLocaleDateString('he-IL') : new Date().toLocaleDateString('he-IL')),
  imageUrl: post.imageUrl || '',
  tags: Array.isArray(post.tags) ? post.tags : [],
  isFeatured: Boolean(post.isFeatured),
  views: Number(post.views || 0),
  shortLinkCode: post.shortLinkCode || ''
});

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
        linkUrl: slide.linkUrl || '#'
      }))
    : []
});

const normalizeComment = (comment: any): Comment => ({
  id: resolveId(comment),
  postId: comment.postId?.toString?.() || comment.postId || '',
  userId: comment.userId || '',
  userName: comment.userName || '',
  content: comment.content || '',
  date: comment.date || (comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('he-IL') : new Date().toLocaleDateString('he-IL')),
  likes: Number(comment.likes || 0),
  likedBy: Array.isArray(comment.likedBy) ? comment.likedBy : []
});

const normalizeMessage = (message: any): ContactMessage => ({
  id: resolveId(message),
  name: message.name || '',
  email: message.email || '',
  phone: message.phone || '',
  subject: message.subject || '',
  message: message.message || '',
  date: message.date || (message.createdAt ? new Date(message.createdAt).toLocaleDateString('he-IL') : new Date().toLocaleDateString('he-IL')),
  read: Boolean(message.read)
});

const normalizeSubscriber = (subscriber: any): NewsletterSubscriber => ({
  id: resolveId(subscriber),
  email: subscriber.email || '',
  joinedDate: subscriber.joinedDate || (subscriber.createdAt ? new Date(subscriber.createdAt).toLocaleDateString('he-IL') : new Date().toLocaleDateString('he-IL')),
  isActive: subscriber.isActive !== false
});

const normalizeUser = (user: any): User => ({
  id: resolveId(user),
  name: user.name || '',
  email: user.email || '',
  role: user.role || 'user',
  isAuthenticated: user.isAuthenticated !== false,
  joinedDate: user.joinedDate || (user.createdAt ? new Date(user.createdAt).toLocaleDateString('he-IL') : undefined)
});

export const api = {
  fetchInitialData: async () => {
    if (USE_SERVER) {
      try {
        const [postsRes, adsRes, commentsRes] = await Promise.all([
          fetch(`${API_URL}/api/posts`, { headers: authHeaders() }),
          fetch(`${API_URL}/api/ads`, { headers: authHeaders() }),
          fetch(`${API_URL}/api/comments`, { headers: authHeaders() }),
        ]);
        if (!postsRes.ok || !adsRes.ok || !commentsRes.ok) throw new Error('Server error');
        const [posts, ads, comments] = await Promise.all([
          postsRes.json(),
          adsRes.json(),
          commentsRes.json(),
        ]);
        const messagesRes = await fetch(`${API_URL}/api/messages`, { headers: authHeaders() }).catch(() => null);
        const subscribersRes = await fetch(`${API_URL}/api/subscribers`, { headers: authHeaders() }).catch(() => null);
        const messages = messagesRes?.ok ? await messagesRes.json() : [];
        const subscribers = subscribersRes?.ok ? await subscribersRes.json() : [];
        return {
          posts: (posts.data || posts).map(normalizePost),
          ads: (ads || []).map(normalizeAd),
          comments: (comments || []).map(normalizeComment),
          registeredUsers: [],
          contactMessages: (messages || []).map(normalizeMessage),
          newsletterSubscribers: (subscribers || []).map(normalizeSubscriber)
        };
      } catch (error) {
        console.warn('Server connection failed, falling back to local storage', error);
        return api.fetchInitialDataLocal();
      }
    }

    return api.fetchInitialDataLocal();
  },

  fetchInitialDataLocal: async () => {
    await delay(800);
    return {
      posts: getStorage('zfat_posts', INITIAL_POSTS),
      ads: getStorage('zfat_ads', INITIAL_ADS),
      comments: getStorage('zfat_comments', INITIAL_COMMENTS),
      registeredUsers: getStorage('zfat_users_db', INITIAL_USERS),
      contactMessages: getStorage('zfat_messages', INITIAL_MESSAGES),
      newsletterSubscribers: getStorage('zfat_subscribers', INITIAL_SUBSCRIBERS),
    };
  },

  addPost: async (post: Post) => {
    if (USE_SERVER) {
      const res = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(post)
      });
      if (!res.ok) throw new Error('Failed to create post');
      return;
    }

    await delay(500);
    const posts = getStorage('zfat_posts', INITIAL_POSTS);
    setStorage('zfat_posts', [post, ...posts]);
  },

  deletePost: async (id: string) => {
    if (USE_SERVER) {
      const res = await fetch(`${API_URL}/api/posts/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete post');
      return;
    }

    await delay(300);
    const posts = getStorage<Post[]>('zfat_posts', INITIAL_POSTS);
    setStorage('zfat_posts', posts.filter(p => p.id !== id));
  },

  incrementViews: async (id: string) => {
    if (USE_SERVER) {
      fetch(`${API_URL}/api/posts/${id}/views`, { method: 'PATCH' }).catch(() => {});
      return;
    }

    const posts = getStorage<Post[]>('zfat_posts', INITIAL_POSTS);
    const updated = posts.map(p => p.id === id ? { ...p, views: (p.views || 0) + 1 } : p);
    setStorage('zfat_posts', updated);
  },

  updateAd: async (id: string, updates: Partial<Ad>) => {
    if (USE_SERVER) {
      await fetch(`${API_URL}/api/ads/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updates)
      });
      return;
    }

    await delay(400);
    const ads = getStorage<Ad[]>('zfat_ads', INITIAL_ADS);
    setStorage('zfat_ads', ads.map(a => a.id === id ? { ...a, ...updates } : a));
  },

  createAd: async (ad: Ad) => {
    if (USE_SERVER) {
      await fetch(`${API_URL}/api/ads`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(ad)
      });
      return;
    }

    await delay(400);
    const ads = getStorage<Ad[]>('zfat_ads', INITIAL_ADS);
    setStorage('zfat_ads', [...ads, ad]);
  },

  deleteAd: async (id: string) => {
    if (USE_SERVER) {
      await fetch(`${API_URL}/api/ads/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      return;
    }

    await delay(300);
    const ads = getStorage<Ad[]>('zfat_ads', INITIAL_ADS);
    setStorage('zfat_ads', ads.filter(a => a.id !== id));
  },

  login: async (usernameOrEmail: string, pass: string): Promise<User | null> => {
    if (USE_SERVER) {
      try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: usernameOrEmail, password: pass })
        });
        if (!res.ok) return null;
        const data = await res.json();
        if (data.token) localStorage.setItem('zfat_jwt', data.token);
        return data.user ? normalizeUser({ ...data.user, isAuthenticated: true }) : null;
      } catch {
        return null;
      }
    }

    await delay(600);
    const users = getStorage<User[]>('zfat_users_db', INITIAL_USERS);
    const found = users.find(u => (u.email === usernameOrEmail || u.name === usernameOrEmail) && u.password === pass);
    if (found) return { ...found, isAuthenticated: true };
    return null;
  },

  register: async (user: User): Promise<boolean> => {
    if (USE_SERVER) {
      try {
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
        if (!res.ok) return false;
        const data = await res.json();
        if (data.token) localStorage.setItem('zfat_jwt', data.token);
        return Boolean(data.token);
      } catch {
        return false;
      }
    }

    await delay(600);
    const users = getStorage<User[]>('zfat_users_db', INITIAL_USERS);
    if (users.some(u => u.email === user.email)) return false;
    setStorage('zfat_users_db', [...users, user]);
    return true;
  },

  verifyToken: async (): Promise<User | null> => {
    if (!USE_SERVER) return null;
    const token = getToken();
    if (!token) return null;
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, { headers: authHeaders() });
      if (!res.ok) {
        localStorage.removeItem('zfat_jwt');
        return null;
      }
      const user = await res.json();
      return normalizeUser({ ...user, isAuthenticated: true });
    } catch {
      return null;
    }
  },

  addComment: async (comment: Comment) => {
    if (USE_SERVER) {
      await fetch(`${API_URL}/api/comments`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(comment)
      });
      return;
    }

    await delay(300);
    const comments = getStorage<Comment[]>('zfat_comments', INITIAL_COMMENTS);
    setStorage('zfat_comments', [...comments, comment]);
  },

  toggleLike: async (commentId: string, userId: string) => {
    if (USE_SERVER) {
      fetch(`${API_URL}/api/comments/${commentId}/like`, {
        method: 'PATCH',
        headers: authHeaders()
      }).catch(() => {});
      return;
    }

    const comments = getStorage<Comment[]>('zfat_comments', INITIAL_COMMENTS);
    const updated = comments.map(c => {
      if (c.id === commentId) {
        const hasLiked = c.likedBy.includes(userId);
        return {
          ...c,
          likes: hasLiked ? c.likes - 1 : c.likes + 1,
          likedBy: hasLiked ? c.likedBy.filter(id => id !== userId) : [...c.likedBy, userId]
        };
      }
      return c;
    });
    setStorage('zfat_comments', updated);
  },

  sendMessage: async (msg: ContactMessage) => {
    if (USE_SERVER) {
      await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(msg)
      });
      return;
    }

    await delay(500);
    const msgs = getStorage<ContactMessage[]>('zfat_messages', INITIAL_MESSAGES);
    setStorage('zfat_messages', [msg, ...msgs]);
  },

  subscribe: async (email: string): Promise<boolean> => {
    if (USE_SERVER) {
      try {
        const res = await fetch(`${API_URL}/api/subscribers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        return res.ok;
      } catch {
        return false;
      }
    }

    await delay(400);
    const subs = getStorage<NewsletterSubscriber[]>('zfat_subscribers', INITIAL_SUBSCRIBERS);
    if (subs.some(s => s.email === email)) return false;

    const newSub: NewsletterSubscriber = {
      id: Date.now().toString(),
      email,
      joinedDate: new Date().toLocaleDateString('he-IL'),
      isActive: true
    };
    setStorage('zfat_subscribers', [...subs, newSub]);
    return true;
  }
};

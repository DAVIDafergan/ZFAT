
import { Post, Ad, User, Comment, ContactMessage, NewsletterSubscriber, Category } from '../types';
import { INITIAL_POSTS, INITIAL_ADS, INITIAL_COMMENTS, INITIAL_USERS, INITIAL_MESSAGES, INITIAL_SUBSCRIBERS } from './mockData';

// SET THIS TO TRUE WHEN YOU HAVE A REAL SERVER CONNECTED
const USE_SERVER = false;
const API_URL = 'http://localhost:3000/api'; // Replace with your real server URL in production

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get data from storage or defaults
const getStorage = <T>(key: string, defaultData: T): T => {
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(key, JSON.stringify(defaultData));
  return defaultData;
};

// Helper to set data to storage
const setStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const api = {
  // --- INITIALIZATION ---
  fetchInitialData: async () => {
    if (USE_SERVER) {
      try {
        const [posts, ads, comments, users, messages, subscribers] = await Promise.all([
          fetch(`${API_URL}/posts`).then(r => r.json()),
          fetch(`${API_URL}/ads`).then(r => r.json()),
          fetch(`${API_URL}/comments`).then(r => r.json()),
          fetch(`${API_URL}/users`).then(r => r.json()),
          fetch(`${API_URL}/messages`).then(r => r.json()).catch(() => []),
          fetch(`${API_URL}/subscribers`).then(r => r.json()).catch(() => [])
        ]);
        return { 
          posts, 
          ads, 
          comments, 
          registeredUsers: users,
          contactMessages: messages,
          newsletterSubscribers: subscribers
        };
      } catch (error) {
        console.error("Server connection failed, falling back to local", error);
        return api.fetchInitialDataLocal();
      }
    } else {
      return api.fetchInitialDataLocal();
    }
  },

  fetchInitialDataLocal: async () => {
    await delay(800); // Simulate loading
    return {
      posts: getStorage('zfat_posts', INITIAL_POSTS),
      ads: getStorage('zfat_ads', INITIAL_ADS),
      comments: getStorage('zfat_comments', INITIAL_COMMENTS),
      registeredUsers: getStorage('zfat_users_db', INITIAL_USERS),
      contactMessages: getStorage('zfat_messages', INITIAL_MESSAGES),
      newsletterSubscribers: getStorage('zfat_subscribers', INITIAL_SUBSCRIBERS),
    };
  },

  // --- POSTS ---
  addPost: async (post: Post) => {
    if (USE_SERVER) {
      await fetch(`${API_URL}/posts`, { method: 'POST', body: JSON.stringify(post) });
    } else {
      await delay(500);
      const posts = getStorage('zfat_posts', INITIAL_POSTS);
      setStorage('zfat_posts', [post, ...posts]);
    }
  },

  deletePost: async (id: string) => {
    if (USE_SERVER) {
      await fetch(`${API_URL}/posts/${id}`, { method: 'DELETE' });
    } else {
      await delay(300);
      const posts = getStorage<Post[]>('zfat_posts', INITIAL_POSTS);
      setStorage('zfat_posts', posts.filter(p => p.id !== id));
    }
  },

  incrementViews: async (id: string) => {
    // Usually fire and forget, but here we update local
    const posts = getStorage<Post[]>('zfat_posts', INITIAL_POSTS);
    const updated = posts.map(p => p.id === id ? { ...p, views: (p.views || 0) + 1 } : p);
    setStorage('zfat_posts', updated);
  },

  // --- ADS ---
  updateAd: async (id: string, updates: Partial<Ad>) => {
    if (USE_SERVER) {
      await fetch(`${API_URL}/ads/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
    } else {
      await delay(400);
      const ads = getStorage<Ad[]>('zfat_ads', INITIAL_ADS);
      setStorage('zfat_ads', ads.map(a => a.id === id ? { ...a, ...updates } : a));
    }
  },

  createAd: async (ad: Ad) => {
    if (USE_SERVER) {
        await fetch(`${API_URL}/ads`, { method: 'POST', body: JSON.stringify(ad) });
    } else {
        await delay(400);
        const ads = getStorage<Ad[]>('zfat_ads', INITIAL_ADS);
        setStorage('zfat_ads', [...ads, ad]);
    }
  },

  deleteAd: async (id: string) => {
      if (USE_SERVER) {
          await fetch(`${API_URL}/ads/${id}`, { method: 'DELETE' });
      } else {
          await delay(300);
          const ads = getStorage<Ad[]>('zfat_ads', INITIAL_ADS);
          setStorage('zfat_ads', ads.filter(a => a.id !== id));
      }
  },

  // --- USERS & AUTH ---
  login: async (usernameOrEmail: string, pass: string): Promise<User | null> => {
    await delay(600);
    // Hardcoded Admin
    if (usernameOrEmail === 'SMULIK8181' && pass === '8181') {
      return { id: 'admin1', name: 'מנהל ראשי', role: 'admin', isAuthenticated: true };
    }
    
    // Check DB
    const users = getStorage<User[]>('zfat_users_db', INITIAL_USERS);
    const found = users.find(u => (u.email === usernameOrEmail || u.name === usernameOrEmail) && u.password === pass);
    
    if (found) return { ...found, isAuthenticated: true };
    return null;
  },

  register: async (user: User): Promise<boolean> => {
    await delay(600);
    const users = getStorage<User[]>('zfat_users_db', INITIAL_USERS);
    if (users.some(u => u.email === user.email)) return false;
    
    setStorage('zfat_users_db', [...users, user]);
    return true;
  },

  // --- COMMENTS ---
  addComment: async (comment: Comment) => {
    if (USE_SERVER) {
      await fetch(`${API_URL}/comments`, { method: 'POST', body: JSON.stringify(comment) });
    } else {
      await delay(300);
      const comments = getStorage<Comment[]>('zfat_comments', INITIAL_COMMENTS);
      setStorage('zfat_comments', [...comments, comment]);
    }
  },

  toggleLike: async (commentId: string, userId: string) => {
    // In local mode we just toggle
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

  // --- MESSAGES ---
  sendMessage: async (msg: ContactMessage) => {
    if (USE_SERVER) {
        await fetch(`${API_URL}/messages`, { method: 'POST', body: JSON.stringify(msg) });
    } else {
        await delay(500);
        const msgs = getStorage<ContactMessage[]>('zfat_messages', INITIAL_MESSAGES);
        setStorage('zfat_messages', [msg, ...msgs]);
    }
  },

  // --- NEWSLETTER ---
  subscribe: async (email: string): Promise<boolean> => {
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

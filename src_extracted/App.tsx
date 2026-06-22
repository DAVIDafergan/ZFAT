import React, { Suspense, lazy, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Header } from './components/Header';
import { NewsTicker } from './components/NewsTicker';
import { StickyWhatsappButton } from './components/StickyWhatsappButton';
import { Home } from './pages/Home';
import { AccessibilityWidget } from './components/AccessibilityWidget';
import {
  Post,
  Ad,
  User,
  Comment,
  ContactMessage,
  Category,
  NewsletterSubscriber,
  AccessibilitySettings,
  WeeklyPaper,
  Agent,
  BoardListing,
} from './types';
import { AppContext } from './context/AppContext';
import { api } from './services/api';
import { Loader2, Newspaper, Building2 } from 'lucide-react';
import { API_URL, LOGO_URL, normalizeShareCode } from './services/siteConfig';
import { sortPostsByNewest } from './services/postSort';

const Article = lazy(() => import('./pages/Article').then((module) => ({ default: module.Article })));
const CategoryPage = lazy(() => import('./pages/CategoryPage').then((module) => ({ default: module.CategoryPage })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then((module) => ({ default: module.AdminDashboard })));
const Login = lazy(() => import('./pages/Login').then((module) => ({ default: module.Login })));
const Register = lazy(() => import('./pages/Register').then((module) => ({ default: module.Register })));
const Contact = lazy(() => import('./pages/Contact').then((module) => ({ default: module.Contact })));
const SearchResults = lazy(() => import('./pages/SearchResults').then((module) => ({ default: module.SearchResults })));
const WeeklyNewspaper = lazy(() => import('./pages/WeeklyNewspaper').then((module) => ({ default: module.WeeklyNewspaper })));
const BoardPage = lazy(() => import('./pages/BoardPage').then((module) => ({ default: module.BoardPage })));

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4 text-center px-4">
          <h2 className="text-2xl font-black text-gray-800">אירעה שגיאה</h2>
          <p className="text-gray-500">אנא נסה לרענן את הדף</p>
          <button onClick={() => window.location.reload()} className="rounded-full bg-red-700 px-6 py-3 font-black text-white transition hover:bg-red-800">רענן דף</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [weeklyPapers, setWeeklyPapers] = useState<WeeklyPaper[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [boardListings, setBoardListings] = useState<BoardListing[]>([]);
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    fontSize: 0,
    highContrast: false,
    grayscale: false,
    highlightLinks: false,
    stopAnimations: false,
  });
  const [footerEmail, setFooterEmail] = useState('');
  const [footerNewsletterStatus, setFooterNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [shortPathHandled, setShortPathHandled] = useState(false);

  const mergeRegisteredUser = (incomingUser: User) => {
    setRegisteredUsers((prev) => {
      const normalizedEmail = (incomingUser.email || '').toLowerCase();
      const nextUsers = prev.filter((currentUser) => currentUser.id !== incomingUser.id && (currentUser.email || '').toLowerCase() !== normalizedEmail);
      return [...nextUsers, incomingUser];
    });
  };

  useEffect(() => {
    const init = async () => {
      performance.mark('app-init-start');

      // 1. Restore cached posts immediately — no white screen
      let hasCachedContent = false;
      try {
        const cachedPosts = localStorage.getItem('zfat_cached_posts');
        if (cachedPosts) {
          const parsed = JSON.parse(cachedPosts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPosts(sortPostsByNewest(parsed));
            setIsLoading(false);
            const splashEl = document.getElementById('splash-overlay');
            if (splashEl) splashEl.style.animationPlayState = 'running';
            hasCachedContent = true;
            const skeletonEl = document.getElementById('app-skeleton');
            if (skeletonEl) skeletonEl.style.display = 'none';
            // Note: we deliberately do NOT return here even though content is
            // already on screen. A cached snapshot can be missing a post that was
            // published moments ago (e.g. a freshly shared article link) - the code
            // below always continues on to fetch live data in the background and
            // silently refreshes `posts`/`ads` once it arrives.
          }
        }
      } catch (_) {}

      // 2. Restore cached ads immediately
      try {
        const cachedAds = localStorage.getItem('zfat_cached_ads');
        if (cachedAds) {
          const parsed = JSON.parse(cachedAds);
          if (Array.isArray(parsed) && parsed.length > 0) setAds(parsed);
        }
      } catch (_) {}

      const hasToken = Boolean(localStorage.getItem('zfat_jwt'));
      const savedUser = localStorage.getItem('zfat_user');
      if (hasToken && savedUser) {
        try { setUser(JSON.parse(savedUser)); } catch (_) {}
      }

      // 3. If no cache: wake-up ping so the server starts spinning up
      //    while the skeleton is still showing, before the main fetch
      if (!hasCachedContent) {
        try {
          await fetch(`${API_URL}/health`, { cache: 'no-store', signal: AbortSignal.timeout(1500) }).catch(() => {});
        } catch (_) {}
      }

      try {
        performance.mark('app-critical-fetch-start');

        // 4. Fetch only critical data (posts + ads) and verify auth in parallel
        const [criticalData, authenticatedUser] = await Promise.all([
          api.fetchCriticalData(),
          hasToken ? api.verifyToken() : Promise.resolve(null),
        ]);

        performance.mark('app-critical-fetch-end');
        performance.measure('critical-data-fetch', 'app-critical-fetch-start', 'app-critical-fetch-end');

        const sortedPosts = sortPostsByNewest(criticalData.posts);
        setPosts(sortedPosts);
        setAds(criticalData.ads);

        const skeletonEl = document.getElementById('app-skeleton');
        if (skeletonEl) skeletonEl.style.display = 'none';
        setIsLoading(false);
        const splashEl = document.getElementById('splash-overlay');
        if (splashEl) splashEl.style.animationPlayState = 'running';

        // Cache posts and ads for instant display on next visit
        try {
          localStorage.setItem('zfat_cached_posts', JSON.stringify(sortedPosts.slice(0, 30)));
          localStorage.setItem('zfat_cached_posts_ts', String(Date.now()));
          localStorage.setItem('zfat_cached_ads', JSON.stringify(criticalData.ads));
        } catch (_) {}

        if (authenticatedUser) {
          setUser(authenticatedUser);
        } else {
          localStorage.removeItem('zfat_jwt');
          setUser(null);
        }

        // 5. Load secondary data in background — does NOT block home page display
        api.fetchSecondaryData().then((secondaryData) => {
          setComments(secondaryData.comments);
          setWeeklyPapers(secondaryData.weeklyPapers || []);
          setAgents(secondaryData.agents || []);
          setBoardListings(secondaryData.boardListings || []);
          performance.mark('app-secondary-fetch-end');
          performance.measure('secondary-data-fetch', 'app-critical-fetch-end', 'app-secondary-fetch-end');
        }).catch((err) => {
          console.warn('[App] Secondary data load failed', err);
        });

        // 6. Load admin data in background when user is confirmed admin
        if (authenticatedUser?.role === 'admin') {
          Promise.all([
            api.fetchUsers(),
            api.fetchPendingComments(),
            api.fetchAdminData(),
          ]).then(([users, pending, adminData]) => {
            setRegisteredUsers(users);
            setPendingComments(pending);
            setContactMessages(adminData.contactMessages || []);
            setNewsletterSubscribers(adminData.newsletterSubscribers || []);
          }).catch((err) => {
            console.warn('[App] Admin data load failed', err);
          });
        }

        performance.mark('app-init-end');
        performance.measure('app-total-init', 'app-init-start', 'app-init-end');

      } catch (error) {
        console.error('Failed to load initial data', error);
        setIsLoading(false);
        const splashEl = document.getElementById('splash-overlay');
        if (splashEl) splashEl.style.animationPlayState = 'running';
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('zfat_user', JSON.stringify(user));
    else localStorage.removeItem('zfat_user');
  }, [user]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const scale = accessibility.fontSize === 0 ? 1 : accessibility.fontSize === 1 ? 1.15 : 1.3;
    root.style.setProperty('--font-scale', scale.toString());
    body.classList.toggle('a11y-grayscale', accessibility.grayscale);
    body.classList.toggle('a11y-high-contrast', accessibility.highContrast);
    body.classList.toggle('a11y-highlight-links', accessibility.highlightLinks);
    body.classList.toggle('a11y-stop-animations', accessibility.stopAnimations);
  }, [accessibility]);

  const addPost = async (post: Post) => {
    const saved = await api.addPost(post);
    setPosts((prev) => sortPostsByNewest([saved, ...prev]));
  };

  const updatePost = async (id: string, updates: Partial<Post>) => {
    const updatedPost = await api.updatePost(id, updates);
    setPosts((prev) => sortPostsByNewest(prev.map((post) => (post.id === id ? updatedPost : post))));
  };

  const deletePost = async (id: string) => {
    await api.deletePost(id);
    setPosts((prev) => prev.filter((post) => post.id !== id));
  };

  const incrementViews = (id: string) => {
    api.incrementViews(id);
    setPosts((prev) => prev.map((post) => post.id === id ? { ...post, views: (post.views || 0) + 1 } : post));
  };

  const updateAd = async (id: string, updates: Partial<Ad>) => {
    await api.updateAd(id, updates);
    setAds((prev) => prev.map((ad) => ad.id === id ? { ...ad, ...updates } : ad));
  };

  const createAd = async (ad: Ad) => {
    await api.createAd(ad);
    setAds((prev) => [...prev, ad]);
  };

  const deleteAd = async (id: string) => {
    await api.deleteAd(id);
    setAds((prev) => prev.filter((ad) => ad.id !== id));
  };

  const createWeeklyPaper = async (paper: WeeklyPaper) => {
    await api.createWeeklyPaper(paper);
    setWeeklyPapers((prev) => [paper, ...prev]);
  };

  const deleteWeeklyPaper = async (id: string) => {
    await api.deleteWeeklyPaper(id);
    setWeeklyPapers((prev) => prev.filter((paper) => paper.id !== id));
  };

  const createAgent = async (agent: Agent) => {
    const savedAgent = await api.createAgent(agent);
    setAgents((prev) => [savedAgent, ...prev]);
  };

  const deleteAgent = async (id: string) => {
    await api.deleteAgent(id);
    setAgents((prev) => prev.filter((agent) => agent.id !== id));
    setBoardListings((prev) => prev.map((listing) => (
      listing.agentId === id ? { ...listing, agentId: undefined } : listing
    )));
  };

  const createBoardListing = async (listing: BoardListing) => {
    const savedListing = await api.createBoardListing(listing);
    setBoardListings((prev) => [savedListing, ...prev]);
  };

  const deleteBoardListing = async (id: string) => {
    await api.deleteBoardListing(id);
    setBoardListings((prev) => prev.filter((listing) => listing.id !== id));
  };

  const login = async (usernameOrEmail: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setAuthLoading(true);
    try {
      const authenticatedUser = await api.login(usernameOrEmail, password);
      setUser(authenticatedUser);
      if (authenticatedUser.role === 'admin') {
        const [users, pending] = await Promise.all([
          api.fetchUsers(),
          api.fetchPendingComments(),
        ]);
        setRegisteredUsers(users);
        setPendingComments(pending);
      } else {
        mergeRegisteredUser(authenticatedUser);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'ההתחברות נכשלה. נסו שוב.' };
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (newUser: User): Promise<{ success: boolean; error?: string }> => {
    setAuthLoading(true);
    try {
      const createdUser = await api.register(newUser);
      mergeRegisteredUser(createdUser);
      setUser(createdUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'ההרשמה נכשלה. נסו שוב.' };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('zfat_jwt');
    localStorage.removeItem('zfat_user');
    setUser(null);
  };

  const addComment = async (comment: Comment) => {
    await api.addComment(comment);
    // Comment is pending approval — do not add to displayed comments
  };

  const fetchPendingComments = async () => {
    const pending = await api.fetchPendingComments();
    setPendingComments(pending);
  };

  const approveComment = async (commentId: string) => {
    await api.approveComment(commentId);
    const approved = pendingComments.find(c => c.id === commentId);
    setPendingComments(prev => prev.filter(c => c.id !== commentId));
    if (approved) {
      setComments(prev => [{ ...approved, approved: true }, ...prev]);
    }
  };

  const deleteComment = async (commentId: string) => {
    await api.deleteComment(commentId);
    setPendingComments(prev => prev.filter(c => c.id !== commentId));
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  const toggleLikeComment = async (commentId: string) => {
    if (!user) return;
    await api.toggleLike(commentId, user.id);
    setComments((prev) => prev.map((comment) => {
      if (comment.id !== commentId) return comment;
      const hasLiked = comment.likedBy.includes(user.id);
      return {
        ...comment,
        likes: hasLiked ? comment.likes - 1 : comment.likes + 1,
        likedBy: hasLiked ? comment.likedBy.filter((id) => id !== user.id) : [...comment.likedBy, user.id],
      };
    }));
  };

  const addContactMessage = async (msg: ContactMessage) => {
    await api.sendMessage(msg);
    setContactMessages((prev) => [msg, ...prev]);
  };

  const subscribeToNewsletter = async (email: string) => {
    const success = await api.subscribe(email);
    if (success) {
      setNewsletterSubscribers((prev) => [...prev, {
        id: Date.now().toString(),
        email,
        joinedDate: new Date().toLocaleDateString('he-IL'),
        isActive: true,
      }]);
    }
    return success;
  };

  const sendNewsletter = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
  };

  const toggleAccessibilityOption = (option: keyof AccessibilitySettings) => {
    if (option === 'fontSize') return;
    setAccessibility((prev) => ({ ...prev, [option]: !prev[option] }));
  };

  const setFontSize = (size: number) => setAccessibility((prev) => ({ ...prev, fontSize: size }));
  const resetAccessibility = () => setAccessibility({ fontSize: 0, highContrast: false, grayscale: false, highlightLinks: false, stopAnimations: false });

  const handleFooterSubscribe = async () => {
    if (!footerEmail.trim()) return;
    setFooterNewsletterStatus('loading');
    const success = await subscribeToNewsletter(footerEmail);
    setFooterNewsletterStatus(success ? 'success' : 'error');
    if (success) setFooterEmail('');
  };

  useEffect(() => {
    const pingServer = () => fetch(`${API_URL}/health`, { cache: 'no-store', keepalive: true }).catch(() => {});
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        pingServer();
      }
    };

    pingServer();
    const interval = setInterval(pingServer, 3 * 60 * 1000);
    window.addEventListener('focus', pingServer);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', pingServer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash) return;
    const articleMatch = window.location.pathname.match(/^\/article\/([^/]+)$/);
    if (!articleMatch) return;
    window.location.replace(`${window.location.origin}/#/article/${articleMatch[1]}`);
  }, []);

  useEffect(() => {
    if (shortPathHandled || typeof window === 'undefined') return;
    const match = window.location.pathname.match(/^\/p\/([^/]+)/);
    if (!match) {
      setShortPathHandled(true);
      return;
    }
    if (isLoading) return;

    const requestedCode = normalizeShareCode(match[1]);
    const matchedPost = posts.find((post) => normalizeShareCode(post.shortLinkCode, post.id) === requestedCode);
    const targetHash = matchedPost ? `#/article/${matchedPost.id}` : '#/';
    window.location.replace(`${window.location.origin}/${targetHash}`);
    setShortPathHandled(true);
  }, [isLoading, posts, shortPathHandled]);

  const TICKER_MAX_AGE_MS = 48 * 60 * 60 * 1000;
  const tickerPosts = sortPostsByNewest(
    posts.filter((post) => {
      if (post.category !== Category.NEWS) return false;
      const publicationDate = post.publishedAt || post.createdAt || post.date;
      if (!publicationDate) return true;
      const publishedAtMs = new Date(publicationDate).getTime();
      if (Number.isNaN(publishedAtMs)) return true;
      return Date.now() - publishedAtMs <= TICKER_MAX_AGE_MS;
    }),
  );

  return (
    <>
    <AppContext.Provider value={{
      posts,
      ads,
      user,
      comments,
      registeredUsers,
      contactMessages,
      newsletterSubscribers,
      weeklyPapers,
      agents,
      boardListings,
      accessibility,
      isLoading,
      authLoading,
      addPost,
      updatePost,
      deletePost,
      incrementViews,
      updateAd,
      createAd,
      deleteAd,
      createWeeklyPaper,
      deleteWeeklyPaper,
      createAgent,
      deleteAgent,
      createBoardListing,
      deleteBoardListing,
      login,
      logout,
      register,
      addComment,
      toggleLikeComment,
      pendingComments,
      fetchPendingComments,
      approveComment,
      deleteComment,
      addContactMessage,
      subscribeToNewsletter,
      sendNewsletter,
      toggleAccessibilityOption,
      setFontSize,
      resetAccessibility,
    }}>
      <HashRouter>
        <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#f7f5f1] text-gray-900">
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-1/2 focus:-translate-x-1/2 focus:rounded-full focus:bg-yellow-400 focus:px-4 focus:py-2 focus:font-black focus:text-black focus:z-[100] focus:shadow-xl">דלג לתוכן הראשי</a>
          <Header onSearch={() => {}} user={user} />
          <NewsTicker posts={tickerPosts} />

          <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
            <ErrorBoundary>
              <Suspense
                fallback={
                  <div className="flex min-h-[50vh] items-center justify-center">
                    <Loader2 size={28} className="animate-spin text-red-700" />
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/article/:id" element={<Article />} />
                  <Route path="/category/:categoryName" element={<CategoryPage />} />
                  <Route path="/weekly-paper" element={<WeeklyNewspaper />} />
                  <Route path="/board" element={<BoardPage />} />
                  <Route path="/admin" element={
                    authLoading ? (
                      <div className="flex min-h-[50vh] items-center justify-center">
                        <Loader2 size={28} className="animate-spin text-red-700" />
                      </div>
                    ) : user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />
                  } />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>

          <footer className="mt-12 bg-gradient-to-b from-[#0b1221] via-[#0f172a] to-[#05070f] py-16 text-gray-300">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
                  <div className="mb-5 flex justify-center md:justify-start">
                    <img src={LOGO_URL} alt="צפת בתנופה" loading="lazy" decoding="async" className="h-16 w-auto md:h-20" />
                  </div>
                  <p className="text-sm leading-7 text-gray-300">האתר המקומי לצפת: חדשות, מבזקים, קהילה, לוח בתנופה והעיתון השבועי במקום אחד.</p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
                  <h4 className="mb-4 text-lg font-black text-white">ניווט מהיר</h4>
                  <ul className="space-y-3 text-sm font-bold">
                    <li><Link to="/weekly-paper" className="transition hover:text-red-300">העיתון השבועי</Link></li>
                    <li><Link to="/board" className="transition hover:text-red-300">לוח בתנופה</Link></li>
                    <li><Link to="/contact" className="transition hover:text-red-300">צור קשר</Link></li>
                  </ul>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
                  <h4 className="mb-4 text-lg font-black text-white">אזורים בולטים</h4>
                  <ul className="space-y-3 text-sm font-bold">
                    <li className="inline-flex items-center gap-2"><Newspaper size={14} className="text-red-400" /> ארכיון שבועי דיגיטלי</li>
                    <li className="inline-flex items-center gap-2"><Building2 size={14} className="text-red-400" /> מודעות נדל"ן עם וואטסאפ</li>
                    <li>שיתוף כתבות עם קישור קצר ותצוגה מקדימה</li>
                  </ul>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
                  <h4 className="mb-4 text-lg font-black text-white">הירשמו לניוזלטר</h4>
                  {footerNewsletterStatus === 'success' ? (
                    <p className="py-4 text-center font-black text-green-400">נרשמת בהצלחה! ✓</p>
                  ) : (
                    <>
                      <input type="email" placeholder="הכנס אימייל..." value={footerEmail} onChange={(event) => setFooterEmail(event.target.value)} className="mb-3 w-full rounded-xl border border-white/20 bg-[#0f182c] p-3 text-white outline-none transition focus:border-red-500" />
                      {footerNewsletterStatus === 'error' && <p className="mb-2 text-sm text-red-300">כתובת זו כבר רשומה במערכת.</p>}
                      <button onClick={handleFooterSubscribe} disabled={footerNewsletterStatus === 'loading'} className="w-full rounded-xl bg-red-700 py-3 font-black text-white transition hover:bg-red-800 disabled:opacity-60">
                        {footerNewsletterStatus === 'loading' ? 'שולח...' : 'הרשמה'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 text-xs md:flex-row">
                <p>&copy; {new Date().getFullYear()} צפת בתנופה. כל הזכויות שמורות.</p>
                <a
                  href="https://wa.me/972556674329"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-black text-gray-300 transition hover:text-green-400"
                >
                  פיתוח ובנייה: DA פרויקטים ויזמות
                </a>
              </div>
            </div>
          </footer>

          <StickyWhatsappButton />
          <AccessibilityWidget />
        </div>
      </HashRouter>
    </AppContext.Provider>
    </>
  );
};

export default App;

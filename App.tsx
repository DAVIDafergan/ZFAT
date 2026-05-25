import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Header } from './components/Header';
import { NewsTicker } from './components/NewsTicker';
import { Home } from './pages/Home';
import { Article } from './pages/Article';
import { CategoryPage } from './pages/CategoryPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Contact } from './pages/Contact';
import { SearchResults } from './pages/SearchResults';
import { WeeklyNewspaper } from './pages/WeeklyNewspaper';
import { BoardPage } from './pages/BoardPage';
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
  BoardListing,
} from './types';
import { AppContext } from './context/AppContext';
import { api } from './services/api';
import { Loader2, Newspaper, Building2 } from 'lucide-react';
import { LOGO_URL } from './services/siteConfig';

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
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [weeklyPapers, setWeeklyPapers] = useState<WeeklyPaper[]>([]);
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

  const mergeRegisteredUser = (incomingUser: User) => {
    setRegisteredUsers((prev) => {
      const normalizedEmail = (incomingUser.email || '').toLowerCase();
      const nextUsers = prev.filter((currentUser) => currentUser.id !== incomingUser.id && (currentUser.email || '').toLowerCase() !== normalizedEmail);
      return [...nextUsers, incomingUser];
    });
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const hasToken = Boolean(localStorage.getItem('zfat_jwt'));
        const savedUser = localStorage.getItem('zfat_user');
        if (hasToken && savedUser) {
          setUser(JSON.parse(savedUser));
        }

        const data = await api.fetchInitialData();
        setPosts(data.posts);
        setAds(data.ads);
        setComments(data.comments);
        setRegisteredUsers(data.registeredUsers);
        setContactMessages(data.contactMessages || []);
        setNewsletterSubscribers(data.newsletterSubscribers || []);
        setWeeklyPapers(data.weeklyPapers || []);
        setBoardListings(data.boardListings || []);
        const authenticatedUser = await api.verifyToken();
        if (authenticatedUser) {
          setUser(authenticatedUser);
          if (authenticatedUser.role === 'admin') {
            setRegisteredUsers(await api.fetchUsers());
          }
        } else {
          localStorage.removeItem('zfat_jwt');
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to load initial data', error);
      } finally {
        setIsLoading(false);
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
    await api.addPost(post);
    setPosts((prev) => [post, ...prev]);
  };

  const updatePost = async (id: string, updates: Partial<Post>) => {
    await api.updatePost(id, updates);
    setPosts((prev) => prev.map((post) => (post.id === id ? { ...post, ...updates } : post)));
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

  const createBoardListing = async (listing: BoardListing) => {
    await api.createBoardListing(listing);
    setBoardListings((prev) => [listing, ...prev]);
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
        setRegisteredUsers(await api.fetchUsers());
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
    setComments((prev) => [...prev, comment]);
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f5f1]">
        <img src={LOGO_URL} alt="צפת בתנופה" className="h-16 w-auto animate-pulse opacity-80" />
        <Loader2 size={40} className="animate-spin text-red-700" />
        <p className="font-black text-gray-500">טוען נתונים...</p>
      </div>
    );
  }

  const tickerPosts = posts.filter((post) => post.category === Category.NEWS);

  return (
    <AppContext.Provider value={{
      posts,
      ads,
      user,
      comments,
      registeredUsers,
      contactMessages,
      newsletterSubscribers,
      weeklyPapers,
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
      createBoardListing,
      deleteBoardListing,
      login,
      logout,
      register,
      addComment,
      toggleLikeComment,
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
          <div className="hidden md:block"><NewsTicker posts={tickerPosts.slice(0, 10)} /></div>

          <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
            <ErrorBoundary>
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
            </ErrorBoundary>
          </main>

          <footer className="mt-12 border-t-8 border-red-700 bg-[#111] py-16 text-gray-400">
            <div className="container mx-auto grid grid-cols-1 gap-10 px-4 text-center md:grid-cols-4 md:text-right">
              <div>
                <div className="mb-6 flex justify-center md:justify-start">
                  <img src={LOGO_URL} alt="צפת בתנופה" className="h-16 w-auto md:h-20" />
                </div>
                <p className="text-sm leading-7 text-gray-400">האתר המקומי לצפת: חדשות, מבזקים, קהילה, לוח בתנופה והעיתון השבועי במקום אחד.</p>
              </div>
              <div>
                <h4 className="mb-6 inline-block border-b border-gray-800 pb-2 font-black text-white">ניווט מהיר</h4>
                <ul className="space-y-3 text-sm font-bold">
                  <li><Link to="/weekly-paper" className="transition hover:text-red-400">העיתון השבועי</Link></li>
                  <li><Link to="/board" className="transition hover:text-red-400">לוח בתנופה</Link></li>
                  <li><Link to="/contact" className="transition hover:text-red-400">צור קשר</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="mb-6 inline-block border-b border-gray-800 pb-2 font-black text-white">אזורים בולטים</h4>
                <ul className="space-y-3 text-sm font-bold">
                  <li className="inline-flex items-center gap-2"><Newspaper size={14} className="text-red-500" /> ארכיון שבועי דיגיטלי</li>
                  <li className="inline-flex items-center gap-2"><Building2 size={14} className="text-red-500" /> מודעות נדל"ן עם וואטסאפ</li>
                  <li>שיתוף כתבות עם קישור קצר ותצוגה מקדימה</li>
                </ul>
              </div>
              <div>
                <h4 className="mb-6 inline-block border-b border-gray-800 pb-2 font-black text-white">הירשמו לניוזלטר</h4>
                {footerNewsletterStatus === 'success' ? (
                  <p className="py-4 text-center font-black text-green-400">נרשמת בהצלחה! ✓</p>
                ) : (
                  <>
                    <input type="email" placeholder="הכנס אימייל..." value={footerEmail} onChange={(event) => setFooterEmail(event.target.value)} className="mb-3 w-full rounded-xl border border-gray-700 bg-gray-800 p-3 text-white outline-none transition focus:border-red-500" />
                    {footerNewsletterStatus === 'error' && <p className="mb-2 text-sm text-red-400">כתובת זו כבר רשומה במערכת.</p>}
                    <button onClick={handleFooterSubscribe} disabled={footerNewsletterStatus === 'loading'} className="w-full rounded-xl bg-red-700 py-3 font-black text-white transition hover:bg-red-800 disabled:opacity-60">
                      {footerNewsletterStatus === 'loading' ? 'שולח...' : 'הרשמה'}
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="container mx-auto mt-16 flex flex-col items-center justify-between gap-4 border-t border-gray-800 px-4 pt-8 text-xs md:flex-row">
              <p>&copy; {new Date().getFullYear()} צפת בתנופה. כל הזכויות שמורות.</p>
              <p className="font-black text-gray-500">פיתוח ובנייה: DA פרויקטים ויזמות</p>
            </div>
          </footer>

          <AccessibilityWidget />
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;

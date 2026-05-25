
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { NewsTicker } from './components/NewsTicker';
import { Home } from './pages/Home';
import { Article } from './pages/Article';
import { CategoryPage } from './pages/CategoryPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Contact } from './pages/Contact';
import { AccessibilityWidget } from './components/AccessibilityWidget';
import { Post, Ad, User, Comment, ContactMessage, Category, NewsletterSubscriber, AccessibilitySettings } from './types';
import { AppContext } from './context/AppContext';
import { api } from './services/api';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Data State
  const [posts, setPosts] = useState<Post[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([]);
  
  // Accessibility State
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    fontSize: 0,
    highContrast: false,
    grayscale: false,
    highlightLinks: false,
    stopAnimations: false,
  });

  // Initial Data Fetch
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const data = await api.fetchInitialData();
        setPosts(data.posts);
        setAds(data.ads);
        setComments(data.comments);
        setRegisteredUsers(data.registeredUsers);
        if(data.contactMessages) setContactMessages(data.contactMessages);
        if(data.newsletterSubscribers) setNewsletterSubscribers(data.newsletterSubscribers);
        
        // Restore user session
        const savedUser = localStorage.getItem('zfat_user');
        if (savedUser) setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to load initial data", e);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Persist User Session only
  useEffect(() => { 
    if (user) localStorage.setItem('zfat_user', JSON.stringify(user));
    else localStorage.removeItem('zfat_user');
  }, [user]);

  // Actions wrapped with API calls
  const addPost = async (post: Post) => {
    await api.addPost(post);
    setPosts(prev => [post, ...prev]);
  };

  const deletePost = async (id: string) => {
    await api.deletePost(id);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const incrementViews = (id: string) => {
    api.incrementViews(id);
    setPosts(prev => prev.map(post => 
      post.id === id ? { ...post, views: (post.views || 0) + 1 } : post
    ));
  };

  const updateAd = async (id: string, updates: Partial<Ad>) => {
    await api.updateAd(id, updates);
    setAds(prev => prev.map(ad => ad.id === id ? { ...ad, ...updates } : ad));
  };

  const createAd = async (ad: Ad) => {
    await api.createAd(ad);
    setAds(prev => [...prev, ad]);
  };

  const deleteAd = async (id: string) => {
    await api.deleteAd(id);
    setAds(prev => prev.filter(a => a.id !== id));
  };

  const login = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    const authenticatedUser = await api.login(usernameOrEmail, password);
    if (authenticatedUser) {
      setUser(authenticatedUser);
      return true;
    }
    return false;
  };

  const register = async (newUser: User): Promise<boolean> => {
    const success = await api.register(newUser);
    if (success) {
      setRegisteredUsers(prev => [...prev, newUser]);
      setUser({ ...newUser, isAuthenticated: true });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const addComment = async (comment: Comment) => {
    await api.addComment(comment);
    setComments(prev => [...prev, comment]);
  };

  const toggleLikeComment = async (commentId: string) => {
    if (!user) return;
    await api.toggleLike(commentId, user.id);
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const hasLiked = c.likedBy.includes(user.id);
        return {
          ...c,
          likes: hasLiked ? c.likes - 1 : c.likes + 1,
          likedBy: hasLiked ? c.likedBy.filter(id => id !== user.id) : [...c.likedBy, user.id]
        };
      }
      return c;
    }));
  };

  const addContactMessage = async (msg: ContactMessage) => {
    await api.sendMessage(msg);
    setContactMessages(prev => [msg, ...prev]);
  };

  const subscribeToNewsletter = async (email: string) => {
    const success = await api.subscribe(email);
    if (success) {
      setNewsletterSubscribers(prev => [...prev, {
        id: Date.now().toString(),
        email,
        joinedDate: new Date().toLocaleDateString('he-IL'),
        isActive: true
      }]);
    }
    return success;
  };

  const sendNewsletter = async (subject: string, content: string, postId?: string) => {
    // Mock sending email
    console.log(`Sending Newsletter to ${newsletterSubscribers.length} subscribers.`);
    await new Promise(r => setTimeout(r, 1000));
    alert(`הניוזלטר נשלח בהצלחה ל-${newsletterSubscribers.length} מנויים!`);
  };

  // Accessibility Logic
  const toggleAccessibilityOption = (option: keyof AccessibilitySettings) => {
    if (option === 'fontSize') return; 
    setAccessibility(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const setFontSize = (size: number) => {
    setAccessibility(prev => ({ ...prev, fontSize: size }));
  };

  const resetAccessibility = () => {
    setAccessibility({
      fontSize: 0,
      highContrast: false,
      grayscale: false,
      highlightLinks: false,
      stopAnimations: false,
    });
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <img src="logo.png" alt="Loading..." className="h-16 w-auto animate-pulse opacity-50" onError={(e) => e.currentTarget.style.display = 'none'} />
        <Loader2 size={40} className="animate-spin text-red-700" />
        <p className="text-gray-500 font-bold">טוען נתונים...</p>
      </div>
    );
  }

  const tickerPosts = posts.filter(p => p.category === Category.NEWS);

  return (
    <AppContext.Provider value={{ 
      posts, ads, user, comments, registeredUsers, contactMessages, newsletterSubscribers, accessibility, isLoading,
      addPost, deletePost, incrementViews, updateAd, createAd, deleteAd, login, logout, register, 
      addComment, toggleLikeComment, addContactMessage, subscribeToNewsletter, sendNewsletter,
      toggleAccessibilityOption, setFontSize, resetAccessibility
    }}>
      <HashRouter>
        <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-[#f8f9fa] relative">
          
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-1/2 focus:-translate-x-1/2 focus:bg-yellow-400 focus:text-black focus:px-4 focus:py-2 focus:z-[100] focus:rounded font-bold shadow-xl">
            דלג לתוכן הראשי
          </a>

          <Header onSearch={() => {}} user={user} />
          
          <div className="hidden md:block">
            <NewsTicker posts={tickerPosts.slice(0, 10)} />
          </div>
          
          <main id="main-content" className="flex-1 w-full max-w-[100vw] overflow-x-hidden focus:outline-none" tabIndex={-1}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/article/:id" element={<Article />} />
              <Route path="/category/:categoryName" element={<CategoryPage />} />
              <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard /> : <Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <footer className="bg-[#111] text-gray-400 py-16 mt-12 border-t-8 border-red-700">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10 text-center md:text-right">
              <div>
                <div className="mb-6 flex justify-center md:justify-start">
                   <img 
                    src="logo.png" 
                    alt="צפת בתנופה" 
                    className="h-16 md:h-20 w-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }} 
                   />
                   <div className="hidden text-white leading-none">
                     <h3 className="text-3xl font-black tracking-tight">צפת<span className="text-red-600">בתנופה</span></h3>
                   </div>
                </div>
                <p className="text-sm leading-relaxed text-gray-400">האתר המוביל לחדשות, תרבות וקהילה בצפת והגליל.</p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-6 border-b border-gray-800 pb-2 inline-block">ניווט מהיר</h4>
                <ul className="space-y-3 text-sm">
                  <li><a href="#" className="hover:text-red-500 transition">אודות</a></li>
                  <li><a href="/#/contact" className="hover:text-red-500 transition">צור קשר</a></li>
                  <li><a href="#" className="hover:text-red-500 transition">פרסום באתר</a></li>
                </ul>
              </div>
               <div>
                <h4 className="text-white font-bold mb-6 border-b border-gray-800 pb-2 inline-block">קטגוריות</h4>
                <ul className="space-y-3 text-sm">
                  <li><a href="/#/category/מבזקים" className="hover:text-red-500 transition">מבזקים</a></li>
                  <li><a href="/#/category/נדלן" className="hover:text-red-500 transition">נדל"ן</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-6 border-b border-gray-800 pb-2 inline-block">הירשמו לניוזלטר</h4>
                <input type="email" placeholder="הכנס אימייל..." className="w-full bg-gray-800 border border-gray-700 focus:border-red-600 rounded p-3 mb-3 text-white outline-none transition" />
                <button 
                  onClick={() => alert('תודה על הרשמתך!')}
                  className="w-full bg-red-700 text-white font-bold py-3 rounded hover:bg-red-800 transition shadow-lg hover:shadow-red-900/20"
                >
                  הרשמה
                </button>
              </div>
            </div>
            <div className="container mx-auto px-4 mt-16 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs gap-4">
              <p>&copy; {new Date().getFullYear()} צפת בתנופה. כל הזכויות שמורות.</p>
              <p className="font-bold text-gray-500 hover:text-white transition-colors cursor-default">
                פיתוח ובנייה: DA פרויקטים ויזמות
              </p>
            </div>
          </footer>

          <AccessibilityWidget />
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;

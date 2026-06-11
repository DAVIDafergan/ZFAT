import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { Category, User, Post, CATEGORY_COLORS } from '../types';
import { useApp } from '../context/AppContext';
import { LOGO_URL } from '../services/siteConfig';

interface HeaderProps {
  onSearch: (query: string) => void;
  user: User | null;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { logout, posts } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const primaryCategories = Object.values(Category).slice(0, 4);
  const mobileMenuCategories = Object.values(Category);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    setSearchQuery('');
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = useMemo<Post[]>(() => {
    if (searchQuery.trim().length < 2) return [];
    const normalized = searchQuery.toLowerCase();
    return posts.filter(post =>
      post.title.toLowerCase().includes(normalized) ||
      post.tags.some(tag => tag.toLowerCase().includes(normalized))
    ).slice(0, 5);
  }, [searchQuery, posts]);

  const submitSearch = (queryValue: string) => {
    const query = queryValue.trim();
    if (!query) return;
    onSearch(query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setIsSearchFocused(false);
    setIsMenuOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitSearch(searchQuery);
  };

  const handleSuggestionClick = (postId: string) => {
    navigate(`/article/${postId}`);
    setIsSearchFocused(false);
  };

  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.innerWidth < 1024) return;
    event.preventDefault();
    window.location.assign('/');
  };

  return (
    <>
      <div className="h-[calc(5rem+env(safe-area-inset-top))] lg:h-[calc(5.5rem+env(safe-area-inset-top))]" />
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${isScrolled ? 'border-b border-white/15 bg-[#8b0000]/98 shadow-[0_12px_28px_rgba(0,0,0,0.22)] backdrop-blur-[3px] supports-[backdrop-filter]:bg-[#8b0000]/95' : 'border-b border-white/20 bg-[#8b0000] shadow-none backdrop-blur-0'}`}>
        <div className="h-[env(safe-area-inset-top)]" />
        <div className={`container mx-auto px-4 ${isScrolled ? 'py-2' : 'py-3'}`}>
          <div className="flex items-center justify-between gap-3">
            <button type="button" className="rounded-full p-2 text-white transition-all duration-300 hover:bg-white/15 hover:scale-105 lg:hidden" onClick={() => setIsMenuOpen(true)} aria-label="פתח תפריט ניווט" aria-expanded={isMenuOpen}>
              <Menu size={24} />
            </button>

            <Link to="/" onClick={handleLogoClick} className="flex flex-1 items-center justify-center lg:flex-none lg:justify-start" aria-label="דף הבית">
              <img
                src={LOGO_URL}
                alt="לוגו צפת בתנופה"
                width={320}
                height={96}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="h-14 w-auto drop-shadow-[0_3px_14px_rgba(0,0,0,0.45)] transition-all sm:h-14 md:h-14 lg:h-16"
              />
            </Link>

            {user && (
              <div className="flex items-center gap-2 lg:hidden">
                <Link
                  to={isAdmin ? '/admin' : '/'}
                  className="inline-flex min-w-[4.5rem] items-center justify-center rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/20"
                >
                  {isAdmin ? 'ניהול' : user.name}
                </Link>
              </div>
            )}

            <nav className="hidden flex-1 items-center justify-center lg:flex">
              <ul className="flex items-center gap-6 text-sm font-extrabold text-white xl:text-base">
                {primaryCategories.map((cat) => (
                  <li key={cat}>
                    <Link
                      to={`/category/${cat}`}
                      className="relative transition-all duration-300 hover:text-red-100 after:absolute after:-bottom-1 after:right-0 after:h-0.5 after:w-0 after:bg-white/80 after:transition-all hover:after:w-full"
                    >
                      {cat}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/weekly-paper" className="relative transition-all duration-300 hover:text-red-100 after:absolute after:-bottom-1 after:right-0 after:h-0.5 after:w-0 after:bg-white/80 after:transition-all hover:after:w-full">
                    העיתון השבועי
                  </Link>
                </li>
                <li>
                  <Link to="/board" className="relative transition-all duration-300 hover:text-red-100 after:absolute after:-bottom-1 after:right-0 after:h-0.5 after:w-0 after:bg-white/80 after:transition-all hover:after:w-full">
                    לוח בתנופה
                  </Link>
                </li>
                <li className="group relative">
                  <button type="button" className="inline-flex items-center gap-1 transition hover:text-red-100" aria-haspopup="true">
                    עוד <ChevronDown size={15} />
                  </button>
                  <div className="invisible absolute right-0 top-full mt-3 w-56 rounded-2xl border border-gray-100 bg-white py-3 text-gray-800 opacity-0 shadow-2xl transition-all group-hover:visible group-hover:opacity-100">
                    {Object.values(Category).slice(4).map((cat) => (
                      <Link key={cat} to={`/category/${cat}`} className="block px-5 py-2.5 text-sm font-bold transition hover:bg-red-50 hover:text-red-700">{cat}</Link>
                    ))}
                  </div>
                </li>
              </ul>
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <div ref={searchRef} className="relative">
                <form onSubmit={handleSearchSubmit} className={`flex h-12 items-center overflow-hidden rounded-full border px-1.5 transition-all duration-300 ${isSearchFocused ? 'w-[21rem] border-white/60 bg-white shadow-2xl' : 'w-[19rem] border-white/25 bg-white/14 shadow-[0_8px_24px_rgba(0,0,0,0.16)] hover:bg-white/18'}`}>
                  <button type="submit" onClick={() => { setIsSearchFocused(true); setTimeout(() => searchInputRef.current?.focus(), 0); }} className={`flex h-9 min-w-9 items-center justify-center rounded-full transition ${isSearchFocused ? 'bg-red-700 text-white shadow-md' : 'text-white'}`} aria-label="חפש באתר">
                    <Search size={19} />
                  </button>
                  <input ref={searchInputRef} value={searchQuery} onFocus={() => setIsSearchFocused(true)} onChange={(event) => setSearchQuery(event.target.value)} placeholder="חפשו כתבות, נושאים ותגיות" className={`w-full bg-transparent px-3 text-sm font-bold outline-none transition ${isSearchFocused ? 'text-gray-800 placeholder:text-gray-400' : 'text-white placeholder:text-white/70'}`} aria-label="חיפוש" />
                </form>
                {isSearchFocused && suggestions.length > 0 && (
                  <div className="absolute right-0 top-full mt-3 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
                    {suggestions.map((post) => (
                      <button key={post.id} onClick={() => handleSuggestionClick(post.id)} className="flex w-full items-center gap-4 border-b border-gray-50 px-4 py-3 text-right transition hover:bg-red-50 last:border-b-0">
                        <img src={post.imageUrl} alt="" loading="lazy" decoding="async" className="h-12 w-12 rounded-xl object-cover" />
                        <div className="flex-1">
                          <p className="line-clamp-1 text-sm font-black text-gray-900">{post.title}</p>
                          <p className="mt-1 text-xs font-bold text-gray-500">{post.category}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all duration-300 hover:bg-white/20 hover:scale-105" onClick={() => setIsUserMenuOpen((value) => !value)} aria-haspopup="menu" aria-expanded={isUserMenuOpen} aria-label="תפריט משתמש">
                  <UserIcon size={18} />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute left-0 top-full mt-3 w-52 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
                    {user ? (
                      <>
                        <div className="border-b border-gray-100 px-4 py-3">
                          <p className="text-sm font-black text-gray-900">{user.name}</p>
                          <p className="text-xs font-bold text-gray-500">{user.email || 'משתמש רשום'}</p>
                        </div>
                        {isAdmin && <Link to="/admin" className="block px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-red-50 hover:text-red-700">מערכת ניהול</Link>}
                        <button type="button" onClick={logout} className="flex w-full items-center gap-2 px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-red-50 hover:text-red-700">
                          <LogOut size={16} /> יציאה
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" className="block px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-red-50 hover:text-red-700">התחברות</Link>
                        <Link to="/register" className="block px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-red-50 hover:text-red-700">הרשמה</Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </header>

      {isMenuOpen && (
        <div className="animate-overlay-in fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px] lg:hidden" role="dialog" aria-modal="true" onClick={() => setIsMenuOpen(false)}>
          <div className="animate-drawer-in ml-auto flex h-full w-[84%] max-w-[20rem] flex-col border-l border-red-100 bg-gradient-to-b from-white via-red-50/35 to-white p-4 shadow-2xl sm:p-5" onClick={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="rounded-2xl bg-[#8B0000] px-3 py-2 shadow-lg">
                <img src={LOGO_URL} alt="לוגו צפת בתנופה" width={320} height={96} loading="lazy" decoding="async" className="h-11 w-auto drop-shadow-[0_0_16px_rgba(255,255,255,0.42)]" />
              </div>
              <button type="button" className="rounded-full bg-gray-100 p-2 text-gray-700" onClick={() => setIsMenuOpen(false)} aria-label="סגור תפריט">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="mb-5 flex items-center gap-2 rounded-[1.25rem] border border-gray-200 bg-white px-2 py-2 shadow-sm">
              <button type="submit" className="flex h-10 w-10 items-center justify-center rounded-full bg-red-700 text-white" aria-label="חפש באתר">
                <Search size={18} />
              </button>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="חפשו כתבות ותגיות"
                className="w-full bg-transparent px-2 text-sm font-bold text-gray-800 outline-none placeholder:text-gray-400"
                aria-label="חיפוש"
              />
            </form>
            <div className="flex-1 space-y-5 overflow-y-auto pb-4">
              <div>
                <p className="mb-2 px-1 text-[11px] font-black tracking-[0.18em] text-gray-400">קטגוריות</p>
                <div className="grid grid-cols-2 gap-2">
                  {mobileMenuCategories.map((cat) => (
                    <Link key={cat} to={`/category/${cat}`} className="flex min-h-[3rem] items-center rounded-2xl border border-transparent bg-white/80 px-3 py-2 text-sm font-bold leading-5 text-gray-800 transition hover:border-red-100 hover:bg-red-50 hover:text-red-700">
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 px-1 text-[11px] font-black tracking-[0.18em] text-gray-400">תוכן מרכזי</p>
                <div className="space-y-1.5">
                  <Link to="/weekly-paper" className="block rounded-2xl bg-white/80 px-3 py-2.5 text-sm font-bold text-gray-800 transition hover:bg-red-50 hover:text-red-700">
                    העיתון השבועי
                  </Link>
                  <Link to="/board" className="block rounded-2xl bg-white/80 px-3 py-2.5 text-sm font-bold text-gray-800 transition hover:bg-red-50 hover:text-red-700">
                    לוח בתנופה
                  </Link>
                </div>
              </div>

              {isAdmin && (
                <div>
                  <p className="mb-2 px-1 text-[11px] font-black tracking-[0.18em] text-gray-400">ניווט מהיר</p>
                  <div className="space-y-1.5">
                    <Link to="/admin" className="block rounded-2xl px-3 py-2.5 text-sm font-bold text-gray-800 transition hover:bg-red-50 hover:text-red-700">מערכת ניהול</Link>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-4">
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="inline-flex items-center justify-center rounded-full bg-red-700 px-3 py-2.5 text-sm font-black text-white transition hover:bg-red-800">
                      ניהול
                    </Link>
                  )}
                  <button type="button" onClick={logout} className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-2.5 text-sm font-black text-gray-700 transition hover:border-red-200 hover:text-red-700">
                    יציאה
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="inline-flex items-center justify-center rounded-full bg-red-700 px-3 py-2.5 text-sm font-black text-white transition hover:bg-red-800">
                    התחברות
                  </Link>
                  <Link to="/register" className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-2.5 text-sm font-black text-gray-700 transition hover:border-red-200 hover:text-red-700">
                    הרשמה
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

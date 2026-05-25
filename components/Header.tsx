import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, User as UserIcon, LogOut, ChevronDown, Newspaper, Building2 } from 'lucide-react';
import { Category, User, Post } from '../types';
import { useApp } from '../context/AppContext';
import { LOGO_URL } from '../services/siteConfig';

interface HeaderProps {
  onSearch: (query: string) => void;
  user: User | null;
}

const quickLinks = [
  { label: 'העיתון השבועי', to: '/weekly-paper', icon: Newspaper },
  { label: 'לוח בתנופה', to: '/board', icon: Building2 },
  { label: 'צור קשר', to: '/contact' },
];

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    onSearch(query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setIsSearchFocused(false);
  };

  const handleSuggestionClick = (postId: string) => {
    navigate(`/article/${postId}`);
    setIsSearchFocused(false);
  };

  return (
    <>
      <div className="h-20 lg:h-28" />
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${isScrolled ? 'border-b border-white/20 bg-[#a31319]/78 py-2 shadow-[0_14px_40px_rgba(0,0,0,0.38)] backdrop-blur-lg' : 'border-b border-white/10 bg-[#a31319]/96 py-3 shadow-xl'}`}>
        <div className="container mx-auto px-4">
          <div className="mb-3 hidden items-center justify-between text-xs font-bold text-white/80 lg:flex">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1">מהדורה דיגיטלית</span>
              <span>חדשות, קהילה, נדל"ן והעיתון השבועי</span>
            </div>
            <div className="flex items-center gap-4">
              {quickLinks.map(({ label, to, icon: Icon }) => (
                <Link key={label} to={to} className="inline-flex items-center gap-1.5 hover:text-white">
                  {Icon ? <Icon size={14} /> : null}
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button type="button" className="rounded-full p-2 text-white transition hover:bg-white/10 lg:hidden" onClick={() => setIsMenuOpen(true)} aria-label="פתח תפריט ניווט" aria-expanded={isMenuOpen}>
              <Menu size={28} />
            </button>

            <Link to="/" className="flex flex-1 items-center justify-center lg:flex-none lg:justify-start" aria-label="דף הבית">
              <div className={`rounded-2xl px-3 py-2 transition-all ${isScrolled ? 'bg-white/10 ring-1 ring-white/15 shadow-[0_12px_30px_rgba(0,0,0,0.28)]' : 'shadow-[0_10px_24px_rgba(0,0,0,0.18)]'}`}>
                <img src={LOGO_URL} alt="לוגו צפת בתנופה" className="h-12 w-auto drop-shadow-[0_0_16px_rgba(255,255,255,0.42)] md:h-14 lg:h-16" />
              </div>
            </Link>

            <nav className="hidden flex-1 items-center justify-center lg:flex">
              <ul className="flex items-center gap-6 text-sm font-extrabold text-white xl:text-base">
                {Object.values(Category).slice(0, 4).map((cat) => (
                  <li key={cat}><Link to={`/category/${cat}`} className="transition hover:text-red-100">{cat}</Link></li>
                ))}
                {quickLinks.map(({ label, to }) => (
                  <li key={label}><Link to={to} className="transition hover:text-red-100">{label}</Link></li>
                ))}
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
                <form onSubmit={handleSearchSubmit} className={`flex h-11 items-center overflow-hidden rounded-full border transition-all ${isSearchFocused || searchQuery ? 'w-[300px] border-white/40 bg-white shadow-xl' : 'w-11 border-white/20 bg-white/10 hover:bg-white/15'}`}>
                  <button type={isSearchFocused || searchQuery ? 'submit' : 'button'} onClick={() => { setIsSearchFocused(true); setTimeout(() => searchInputRef.current?.focus(), 0); }} className={`flex h-11 w-11 items-center justify-center ${isSearchFocused || searchQuery ? 'text-red-700' : 'text-white'}`} aria-label="חפש באתר">
                    <Search size={19} />
                  </button>
                  <input ref={searchInputRef} value={searchQuery} onFocus={() => setIsSearchFocused(true)} onChange={(event) => setSearchQuery(event.target.value)} placeholder="חיפוש כתבות, נושאים ותגיות" className={`w-full bg-transparent pl-4 pr-1 text-sm font-bold outline-none ${isSearchFocused || searchQuery ? 'text-gray-800 opacity-100' : 'opacity-0'}`} aria-label="חיפוש" />
                </form>
                {isSearchFocused && suggestions.length > 0 && (
                  <div className="absolute right-0 top-full mt-3 w-96 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
                    {suggestions.map((post) => (
                      <button key={post.id} onClick={() => handleSuggestionClick(post.id)} className="flex w-full items-center gap-4 border-b border-gray-50 px-4 py-3 text-right transition hover:bg-red-50 last:border-b-0">
                        <img src={post.imageUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
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
                <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/15" onClick={() => setIsUserMenuOpen((value) => !value)} aria-haspopup="menu" aria-expanded={isUserMenuOpen} aria-label="תפריט משתמש">
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
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden" role="dialog" aria-modal="true" onClick={() => setIsMenuOpen(false)}>
          <div className="ml-auto h-full w-[88%] max-w-sm border-l border-red-100 bg-gradient-to-b from-white via-red-50/40 to-white p-6 shadow-2xl animate-fade-in" onClick={(event) => event.stopPropagation()}>
            <div className="mb-8 flex items-center justify-between">
              <div className="rounded-2xl bg-[#a31319] px-3 py-2 shadow-lg">
                <img src={LOGO_URL} alt="לוגו צפת בתנופה" className="h-12 w-auto drop-shadow-[0_0_16px_rgba(255,255,255,0.42)]" />
              </div>
              <button type="button" className="rounded-full bg-gray-100 p-2 text-gray-700" onClick={() => setIsMenuOpen(false)} aria-label="סגור תפריט">
                <X size={22} />
              </button>
            </div>
            <div className="space-y-2">
              {[...Object.values(Category), ...quickLinks.map((item) => item.label)].map((label, index) => {
                const to = index < Object.values(Category).length ? `/category/${Object.values(Category)[index]}` : quickLinks[index - Object.values(Category).length].to;
                return (
                  <Link key={label} to={to} className="block rounded-2xl px-4 py-3 text-base font-black text-gray-800 transition hover:bg-red-50 hover:text-red-700">
                    {label}
                  </Link>
                );
              })}
              {isAdmin && <Link to="/admin" className="block rounded-2xl px-4 py-3 text-base font-black text-gray-800 transition hover:bg-red-50 hover:text-red-700">מערכת ניהול</Link>}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

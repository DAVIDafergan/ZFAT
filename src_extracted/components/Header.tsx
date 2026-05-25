
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, User as UserIcon, LogOut, ChevronDown, UserPlus, Loader2 } from 'lucide-react';
import { Category, User, Post } from '../types';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  onSearch: (query: string) => void;
  user: User | null;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Post[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const { logout, posts } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    setSearchQuery('');
    setSuggestions([]);
  }, [location]);

  // Click outside to close search suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-suggest logic
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const filtered = posts.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, posts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setIsMenuOpen(false);
      setIsSearchFocused(false);
    }
  };

  const handleSuggestionClick = (postId: string) => {
    navigate(`/article/${postId}`);
    setSearchQuery('');
    setSuggestions([]);
    setIsSearchFocused(false);
    setIsMenuOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchFocused(!isSearchFocused);
    if (!isSearchFocused) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  return (
    <>
      {/* Spacer for Fixed Header */}
      <div className="h-16 lg:h-24"></div>

      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-red-700/85 backdrop-blur-md shadow-lg border-b border-white/10 py-2' 
            : 'bg-red-700 py-3 lg:py-4 shadow-md'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 lg:h-16">
            
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu size={28} />
            </button>

            {/* Logo Section */}
            <Link to="/" className="flex items-center justify-center flex-1 lg:flex-none lg:justify-start">
               <div className="relative group cursor-pointer flex items-center gap-2">
                 <div className="flex items-center">
                    {/* Logo Image */}
                    <img 
                      src="logo.png" 
                      alt="לוגו צפת בתנופה" 
                      className="h-10 md:h-14 lg:h-16 w-auto object-contain transition-transform duration-300 hover:scale-105" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        e.currentTarget.nextElementSibling?.classList.add('flex');
                      }}
                    />
                    {/* Fallback Text Logo */}
                    <div className="hidden flex-col items-start leading-none text-white">
                      <span className="text-2xl md:text-3xl font-black tracking-tighter drop-shadow-sm">
                        צפת בתנופה
                      </span>
                      <span className="text-[0.65rem] text-red-100 font-bold tracking-widest uppercase mr-0.5 mt-0.5">
                        חדשות הגליל והסביבה
                      </span>
                   </div>
                 </div>
               </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center justify-center flex-1 px-10">
              <ul className="flex items-center gap-5 xl:gap-8 text-base font-bold text-white">
                {Object.values(Category).slice(0, 5).map((cat) => (
                  <li key={cat}>
                    <Link 
                      to={`/category/${cat}`}
                      className="relative py-2 hover:text-red-200 transition-colors group opacity-90 hover:opacity-100 whitespace-nowrap"
                    >
                      {cat}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full ease-out"></span>
                    </Link>
                  </li>
                ))}
                <li className="relative group z-50">
                   <button className="flex items-center gap-1 hover:text-red-200 py-2 transition-colors opacity-90">
                     עוד <ChevronDown size={14} strokeWidth={3} />
                   </button>
                   <div className="absolute top-full right-0 w-56 bg-white/95 backdrop-blur-md shadow-2xl rounded-xl py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 border border-gray-100">
                      <div className="absolute -top-2 right-6 w-4 h-4 bg-white/95 transform rotate-45 border-t border-l border-gray-100"></div>
                      {Object.values(Category).slice(5).map((cat) => (
                        <Link 
                          key={cat} 
                          to={`/category/${cat}`}
                          className="block px-6 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors text-sm font-medium"
                        >
                          {cat}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 my-2"></div>
                      <Link to="/contact" className="block px-6 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors text-sm font-medium">
                        צור קשר
                      </Link>
                   </div>
                </li>
              </ul>
            </nav>

            {/* Desktop Utils */}
            <div className="hidden lg:flex items-center gap-4">
              
              {/* Premium Search Bar */}
              <div ref={searchRef} className="relative group flex items-center">
                <form 
                  onSubmit={handleSearchSubmit} 
                  className={`relative flex items-center transition-all duration-500 ease-in-out ${
                    isSearchFocused || searchQuery ? 'w-[300px] bg-white shadow-xl' : 'w-[40px] bg-white/20 hover:bg-white/30'
                  } rounded-full overflow-hidden h-10 border ${isSearchFocused ? 'border-transparent' : 'border-transparent'}`}
                >
                   {/* Search Icon / Toggle */}
                   <div 
                      className={`absolute right-0 top-0 h-10 w-10 flex items-center justify-center cursor-pointer z-10 transition-colors duration-300 ${
                        isSearchFocused ? 'text-gray-500' : 'text-white'
                      }`}
                      onClick={() => !isSearchFocused && toggleSearch()}
                   >
                     <Search size={20} strokeWidth={2.5} />
                   </div>

                   <input 
                    ref={searchInputRef}
                    type="text" 
                    placeholder="חפש כתבה, נושא או תגית..." 
                    className={`w-full h-full bg-transparent text-gray-800 placeholder-gray-400 pl-10 pr-10 text-sm font-medium focus:outline-none transition-opacity duration-300 ${
                      isSearchFocused || searchQuery ? 'opacity-100' : 'opacity-0'
                    }`}
                    value={searchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  {/* Clear Button */}
                  {(isSearchFocused || searchQuery) && (
                    <button 
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setIsSearchFocused(false);
                      }}
                      className="absolute left-3 top-2.5 text-gray-300 hover:text-red-600 transition-colors z-20"
                    >
                      <X size={16} strokeWidth={3} />
                    </button>
                  )}
                </form>

                {/* Rich Suggestions Dropdown */}
                {isSearchFocused && searchQuery.length > 1 && (
                  <div className="absolute top-full right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in origin-top-right ring-1 ring-black/5">
                    {suggestions.length > 0 ? (
                      <div>
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                           <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">תוצאות מובילות</span>
                           <span className="text-xs text-red-600 font-medium">{suggestions.length} תוצאות</span>
                        </div>
                        <ul className="max-h-[300px] overflow-y-auto custom-scrollbar">
                          {suggestions.map(post => (
                            <li key={post.id}>
                              <button 
                                onClick={() => handleSuggestionClick(post.id)}
                                className="w-full text-right px-4 py-3 hover:bg-red-50/80 transition-all flex items-start gap-4 border-b border-gray-50 last:border-0 group"
                              >
                                <img src={post.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 shadow-sm group-hover:shadow-md transition-shadow" />
                                <div className="flex-1">
                                  <span className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-red-700 mb-0.5">{post.title}</span>
                                  <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{post.category}</span>
                                    <span>{post.date}</span>
                                  </div>
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                        <button className="w-full text-center py-3 text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 transition-colors border-t border-red-100">
                          לכל התוצאות
                        </button>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <div className="inline-block p-3 rounded-full bg-gray-50 text-gray-400 mb-2">
                          <Search size={24} />
                        </div>
                        <p className="text-gray-500 text-sm font-medium">לא נמצאו תוצאות לחיפוש זה.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-black/20 hover:bg-black/30 backdrop-blur-sm rounded-full text-white text-sm font-bold transition border border-white/20"
                  >
                    <UserIcon size={16} />
                    <span className="max-w-[100px] truncate">{user.name}</span>
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 z-50 animate-fade-in text-gray-800 border border-gray-100">
                      {isAdmin && (
                        <Link to="/admin" className="block px-4 py-2 hover:bg-red-50 hover:text-red-700 text-sm font-bold">
                          ניהול אתר
                        </Link>
                      )}
                      <button 
                        onClick={logout} 
                        className="w-full text-right px-4 py-2 hover:bg-red-50 hover:text-red-700 text-sm flex items-center gap-2"
                      >
                         <LogOut size={14} /> יציאה
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link 
                    to="/login" 
                    className="text-white hover:text-red-100 text-sm font-bold transition px-2"
                  >
                    כניסה
                  </Link>
                  <span className="text-red-400/60">|</span>
                  <Link 
                    to="/register" 
                    className="bg-white text-red-700 hover:bg-red-50 px-4 py-2 rounded-full text-sm font-bold transition shadow-md hover:shadow-lg flex items-center gap-1"
                  >
                    <UserPlus size={14} /> הרשמה
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Utils */}
            <div className="lg:hidden flex items-center gap-3">
              <Link to={user ? (isAdmin ? "/admin" : "/") : "/login"} className="p-1 text-white hover:bg-white/10 rounded-full transition-colors">
                <UserIcon size={24} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <div 
        className={`fixed inset-0 z-[60] lg:hidden transition-all duration-300 ${isMenuOpen ? 'visible' : 'invisible'}`}
      >
        <div 
          className={`absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        <div 
          className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-6 flex items-center justify-between border-b border-gray-100 bg-red-700 text-white">
            <span className="font-black text-2xl tracking-tight">צפת בתנופה</span>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Mobile Search with Suggest */}
          <div className="p-6 pb-2">
             <div className="relative">
                <form onSubmit={handleSearchSubmit}>
                  <input 
                    type="text" 
                    placeholder="חפש באתר..." 
                    className="w-full bg-gray-100 text-gray-800 rounded-xl pr-11 pl-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-red-200 focus:bg-white transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="absolute right-4 top-3.5 text-gray-400">
                    <Search size={20} />
                  </button>
                </form>
                {/* Mobile Suggestions */}
                {searchQuery.length > 1 && suggestions.length > 0 && (
                  <div className="mt-2 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    {suggestions.map(post => (
                      <button 
                        key={post.id}
                        onClick={() => handleSuggestionClick(post.id)}
                        className="w-full text-right px-4 py-3 hover:bg-red-50 transition-colors flex items-center gap-3 border-b border-gray-50 last:border-0"
                      >
                         <Search size={14} className="text-gray-400" />
                         <span className="text-sm font-medium text-gray-700 line-clamp-1">{post.title}</span>
                      </button>
                    ))}
                  </div>
                )}
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <nav className="space-y-2">
              {Object.values(Category).map((cat) => (
                <Link 
                  key={cat} 
                  to={`/category/${cat}`}
                  className="block px-5 py-3.5 rounded-xl text-gray-700 font-bold hover:bg-red-50 hover:text-red-700 transition-all flex items-center justify-between group border border-transparent hover:border-red-100"
                >
                  {cat}
                  <span className="text-gray-300 group-hover:text-red-400 transform group-hover:-translate-x-1 transition-transform">&larr;</span>
                </Link>
              ))}
              <div className="border-t border-gray-100 my-2"></div>
              <Link 
                  to="/contact"
                  className="block px-5 py-3.5 rounded-xl text-gray-700 font-bold hover:bg-red-50 hover:text-red-700 transition-all"
                >
                  צור קשר
                </Link>
            </nav>
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50">
             {user ? (
               <div className="text-center">
                  <p className="font-bold text-gray-800 mb-3">שלום, {user.name}</p>
                  {isAdmin && (
                    <Link to="/admin" className="block w-full py-2.5 bg-red-700 text-white rounded-lg mb-2 shadow-lg">
                      אזור ניהול
                    </Link>
                  )}
                  <button onClick={logout} className="block w-full py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700">
                    יציאה
                  </button>
               </div>
             ) : (
               <div className="flex gap-3">
                 <Link to="/login" className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 text-center rounded-xl font-bold">
                   כניסה
                 </Link>
                 <Link to="/register" className="flex-1 py-3 bg-red-700 text-white text-center rounded-xl font-bold shadow-lg shadow-red-200">
                   הרשמה
                 </Link>
               </div>
             )}
          </div>
        </div>
      </div>
    </>
  );
};

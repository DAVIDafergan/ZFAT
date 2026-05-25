import React from 'react';
import { useApp } from '../context/AppContext';
import { HeroSlider } from '../components/HeroSlider';
import { PostCard } from '../components/PostCard';
import { AdUnit } from '../components/AdUnit';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Mail, Newspaper, Building2 } from 'lucide-react';
import { Category, CATEGORY_COLORS } from '../types';
import { formatWeekLabel } from '../services/siteConfig';

export const Home: React.FC = () => {
  const { posts, ads, weeklyPapers, boardListings } = useApp();

  const featuredPosts = posts.filter(p => p.isFeatured);
  const latestPosts = posts.slice(0, 6);
  const newsPosts = posts.filter((post) => post.category === Category.NEWS).slice(0, 6);
  const leaderboardAd = ads.find(a => a.area === 'leaderboard' && a.isActive);
  const sidebarAd = ads.find(a => a.area === 'sidebar' && a.isActive);
  const sidebarVideoAd = ads.find(a => a.area === 'sidebar_video' && a.isActive);
  const midPageAd = ads.find(a => a.area === 'homepage_mid' && a.isActive);
  const homeFeedAd = ads.find(a => a.area === 'homepage_feed' && a.isActive);
  const categoriesToShow = Object.values(Category).filter(c => c !== Category.NEWS);
  const leadPaper = weeklyPapers[0];
  const featuredListings = boardListings.slice(0, 2);
  const formatRelativeTime = (dateLabel: string) => {
    const parsedDate = new Date(dateLabel);
    if (Number.isNaN(parsedDate.getTime())) return dateLabel;
    const diffMinutes = Math.max(1, Math.floor((Date.now() - parsedDate.getTime()) / 60000));
    if (diffMinutes < 60) return `לפני ${diffMinutes} דק׳`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `לפני ${diffHours} שעות`;
    const diffDays = Math.floor(diffHours / 24);
    return `לפני ${diffDays} ימים`;
  };

  return (
    <div className="animate-fade-in bg-[#f7f5f1] pb-16 sm:pb-20">
      {/* Hero — flush to header, no mobile gap */}
      <div className="-mt-1 shadow-2xl sm:mt-0 sm:mb-10">
        <HeroSlider posts={featuredPosts} />
      </div>

      <div className="container mx-auto px-4">
        <div className="mb-8 grid gap-5 lg:grid-cols-[1.3fr_0.7fr] sm:mb-10 sm:gap-6">
          <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b0f19] shadow-[0_22px_60px_rgba(2,6,23,0.35)] sm:rounded-[2rem]">
            <div className="border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs font-black text-white/85">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> מהדורה ראשית
              </div>
              <h2 className="news-headline text-2xl font-black text-white sm:text-3xl">חדשות אחרונות מצפת והגליל</h2>
            </div>
            <div className="space-y-3 p-4 sm:space-y-4 sm:p-6">
              {(newsPosts.length > 0 ? newsPosts : latestPosts).map((post, index) => (
                <Link key={post.id} to={`/article/${post.id}`} className="group block">
                  <article className="flex items-start gap-3 rounded-[1.2rem] border border-white/10 bg-[#101827] p-3 transition hover:border-red-500/40 hover:bg-[#131d2f] sm:gap-4 sm:p-4">
                    <div className="w-full">
                      <h3 className="line-clamp-2 text-sm font-black leading-6 text-white transition group-hover:text-red-300 sm:text-base">
                        {post.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/65 sm:text-sm">
                        {post.excerpt}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-bold text-white/55 sm:mt-3 sm:text-xs">
                        <span>{formatRelativeTime(post.date)}</span>
                        <span className="h-1 w-1 rounded-full bg-white/30" />
                        <span>{post.views.toLocaleString('he-IL')} צפיות</span>
                      </div>
                    </div>
                    <div className="aspect-[4/3] w-[34%] shrink-0 overflow-hidden rounded-xl border border-white/10 sm:w-[32%]">
                      <img src={post.imageUrl} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {leadPaper && (
              <Link to="/weekly-paper" className="block overflow-hidden rounded-[1.5rem] bg-[#111827] p-4 text-white shadow-xl transition hover:-translate-y-1 sm:rounded-[2rem] sm:p-6">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black text-white/80">
                  <Newspaper size={14} /> {formatWeekLabel(leadPaper.weekKey)}
                </div>
                <h3 className="news-headline text-2xl font-black leading-tight sm:text-3xl">העיתון השבועי</h3>
                <p className="mt-3 text-sm font-medium leading-6 text-white/75 sm:leading-7">עיון אונליין, הורדת PDF וחיפוש מהיר לפי שבוע.</p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-black text-red-300">
                  לפתיחת המהדורה <ArrowLeft size={16} />
                </div>
              </Link>
            )}
            <Link to="/board" className="block overflow-hidden rounded-[1.5rem] bg-gradient-to-l from-red-800 via-red-700 to-[#7f1116] p-4 text-white shadow-xl transition hover:-translate-y-1 sm:rounded-[2rem] sm:p-6">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black text-white/85">
                <Building2 size={14} /> לוח בתנופה
              </div>
              <h3 className="news-headline text-2xl font-black leading-tight sm:text-3xl">מודעות נדל"ן בצפת</h3>
              <p className="mt-3 text-sm font-medium leading-6 text-white/80 sm:leading-7">דירות להשכרה ולמכירה עם יצירת קשר ישירה בוואטסאפ.</p>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-black text-yellow-200">
                מעבר ללוח <ArrowLeft size={16} />
              </div>
            </Link>
          </div>
        </div>

        <div className="mb-12">
          <AdUnit ad={leaderboardAd} className="w-full max-w-6xl mx-auto rounded-lg overflow-hidden shadow-sm" />
        </div>

        {featuredListings.length > 0 && (
          <section className="mb-12 rounded-[1.5rem] border border-red-100 bg-white p-4 shadow-sm sm:mb-16 sm:rounded-[2rem] sm:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <p className="text-sm font-black text-red-700">לוח בתנופה</p>
                <h2 className="news-headline text-2xl font-black text-gray-900 sm:text-3xl">דירות נבחרות השבוע</h2>
              </div>
              <Link to="/board" className="rounded-full border border-red-100 px-4 py-2 text-sm font-black text-red-700 transition hover:bg-red-50">לכל המודעות</Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 sm:gap-6">
              {featuredListings.map((listing) => (
                <article key={listing.id} className="rounded-[1.4rem] border border-gray-100 bg-gray-50 p-4 sm:rounded-[1.75rem] sm:p-5">
                  <div className="mb-4 aspect-[16/10] overflow-hidden rounded-[1.1rem] sm:rounded-[1.5rem]">
                    <img src={listing.imageUrl} alt={listing.title} className="h-full w-full object-cover" />
                  </div>
                  <h3 className="news-headline text-xl font-black text-gray-900 sm:text-2xl">{listing.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-gray-600 sm:leading-7">{listing.location} • ₪{listing.price.toLocaleString('he-IL')} • {listing.sizeSqm} מ"ר</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-16 sm:gap-10">
          <div className="lg:w-2/3">
            <div className="mb-12 sm:mb-16">
              {/* Dark section title bar */}
              <div className="mb-6 flex items-center justify-between gap-3 overflow-hidden rounded-2xl bg-[#111827] px-5 py-4 shadow-xl sm:mb-8 sm:rounded-[1.5rem] sm:px-6 sm:py-5">
                <div className="flex items-center gap-3">
                  <span className="animate-live-dot h-2.5 w-2.5 rounded-full bg-red-500" />
                  <h2 className="news-headline text-2xl font-black leading-none text-white sm:text-3xl">עוד כותרות</h2>
                </div>
                <Link to={`/category/${Category.NEWS}`} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-black text-white/80 transition hover:bg-white/20">לכל המבזקים</Link>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-8">
                {latestPosts.map((post, idx) => (
                  <div key={`${post.id}-repeat`} className="animate-stagger-in" style={{ animationDelay: `${idx * 0.07}s` }}>
                    <PostCard post={post} />
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-16">
              <AdUnit ad={midPageAd} className="w-full rounded-lg overflow-hidden shadow-md border border-gray-100" />
            </div>

            <div className="space-y-14 sm:space-y-20">
              {categoriesToShow.map((cat, catIdx) => {
                const catPosts = posts.filter(p => p.category === cat).slice(0, 4);
                if (catPosts.length === 0) return null;
                const colorClass = CATEGORY_COLORS[cat] || 'bg-gray-600';
                const textColorClass = colorClass.replace('bg-', 'text-');
                const isDarkSection = catIdx % 3 === 2;
                return (
                  <section key={cat} className="category-section">
                    {isDarkSection ? (
                      /* Every 3rd category gets a dark header bar */
                      <div className="mb-6 flex items-center justify-between gap-3 overflow-hidden rounded-2xl bg-[#111827] px-5 py-4 shadow-xl sm:mb-8 sm:rounded-[1.5rem] sm:px-6 sm:py-5">
                        <div className="flex items-center gap-3">
                          <span className={`h-7 w-2 rounded-full sm:h-8 ${colorClass}`} />
                          <h2 className="news-headline text-xl font-black leading-none text-white sm:text-2xl">{cat}</h2>
                        </div>
                        <Link to={`/category/${cat}`} className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-black text-white/80 transition hover:bg-white/20 sm:px-4">
                          עוד ב{cat} <ArrowLeft size={16} className="mr-1 inline" />
                        </Link>
                      </div>
                    ) : (
                      <div className="mb-6 flex items-end justify-between gap-3 border-b border-gray-100 pb-3 sm:mb-8">
                        <div className="flex items-center gap-3">
                          <span className={`h-7 w-2 rounded-full sm:h-8 ${colorClass}`} />
                          <h2 className="news-headline text-xl font-black leading-none text-gray-900 sm:text-2xl">{cat}</h2>
                        </div>
                        <Link to={`/category/${cat}`} className={`${textColorClass} rounded-full bg-white px-3 py-2 text-sm font-black transition hover:opacity-80 sm:px-4`}>
                          עוד ב{cat} <ArrowLeft size={16} className="mr-1 inline" />
                        </Link>
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 sm:gap-8">
                      {catPosts.map((post, idx) => (
                        <div key={post.id} className="animate-stagger-in" style={{ animationDelay: `${idx * 0.07}s` }}>
                          <PostCard post={post} layout="list" />
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
            <div className="mt-16">
              <AdUnit ad={homeFeedAd} className="w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm" />
            </div>
          </div>

          <aside className="lg:w-1/3 flex flex-col gap-10">
            {/* Dark "הכי נקראים" card */}
            <div className="sticky top-24 overflow-hidden rounded-[1.5rem] bg-[#111827] shadow-2xl sm:top-28 sm:rounded-[2rem]">
              <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5">
                <div className="rounded-full bg-red-700/30 p-2 text-red-400"><TrendingUp size={20} /></div>
                <h3 className="text-xl font-black text-white">הכי נקראים</h3>
                <span className="animate-live-dot mr-auto h-2 w-2 rounded-full bg-red-500" />
              </div>
              <ul className="divide-y divide-white/5 px-4 py-2 sm:px-6">
                {[...posts].sort((a, b) => b.views - a.views).slice(0, 5).map((post, idx) => (
                  <li key={post.id} className="group py-4 first:pt-3 last:pb-3">
                    <Link to={`/article/${post.id}`} className="flex gap-4 items-start">
                      <span className={`text-3xl font-black leading-none ${idx === 0 ? 'text-red-500' : idx < 3 ? 'text-red-700/50' : 'text-white/15'}`}>0{idx + 1}</span>
                      <div>
                        <h4 className="text-sm font-black text-gray-200 transition group-hover:text-red-400 line-clamp-2">{post.title}</h4>
                        <span className="mt-1 block text-xs font-bold text-gray-500">{post.category}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center">
              <span className="mb-2 block text-[10px] uppercase tracking-widest text-gray-400">פרסומת</span>
              <AdUnit ad={sidebarAd} label={false} className="my-0 w-full" />
            </div>

            <div className="relative overflow-hidden rounded-[1.5rem] bg-[#111827] p-5 text-center text-white shadow-xl sm:rounded-[2rem] sm:p-8">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-red-600 blur-[70px] opacity-20" />
              <Mail size={40} className="mx-auto mb-4 text-red-500" />
              <h3 className="mb-2 text-xl font-black">חדשות עד הבית</h3>
              <p className="mb-5 text-sm leading-6 text-gray-300 sm:mb-6 sm:leading-7">הירשמו לניוזלטר שלנו וקבלו את כל העדכונים החמים ישירות למייל.</p>
              <div className="space-y-3 relative z-10">
                <input type="email" placeholder="האימייל שלך..." className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-500" />
                <button className="w-full rounded-xl bg-red-600 py-3 font-black text-white transition hover:bg-red-700">הרשמה</button>
              </div>
            </div>

            {sidebarVideoAd && sidebarVideoAd.isActive && (
              <div className="text-center">
                <span className="mb-2 block text-[10px] uppercase tracking-widest text-gray-400">תוכן מקודם</span>
                <AdUnit ad={sidebarVideoAd} label={false} className="my-0 w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200" />
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

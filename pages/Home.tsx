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
  const leaderboardAd = ads.find(a => a.area === 'leaderboard' && a.isActive);
  const sidebarAd = ads.find(a => a.area === 'sidebar' && a.isActive);
  const sidebarVideoAd = ads.find(a => a.area === 'sidebar_video' && a.isActive);
  const midPageAd = ads.find(a => a.area === 'homepage_mid' && a.isActive);
  const homeFeedAd = ads.find(a => a.area === 'homepage_feed' && a.isActive);
  const categoriesToShow = Object.values(Category).filter(c => c !== Category.NEWS);
  const leadPaper = weeklyPapers[0];
  const featuredListings = boardListings.slice(0, 2);

  return (
    <div className="animate-fade-in bg-[#f7f5f1] pb-20">
      <div className="mb-10 shadow-2xl">
        <HeroSlider posts={featuredPosts} />
      </div>

      <div className="container mx-auto px-4">
        <div className="mb-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="mb-3 inline-flex rounded-full bg-red-50 px-4 py-1 text-xs font-black text-red-700">מהדורה ראשית</div>
              <h2 className="news-headline text-3xl font-black text-gray-900">חדשות אחרונות מצפת והגליל</h2>
            </div>
            <div className="grid grid-cols-1 gap-8 p-6 sm:grid-cols-2">
              {latestPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {leadPaper && (
              <Link to="/weekly-paper" className="block overflow-hidden rounded-[2rem] bg-[#111827] p-6 text-white shadow-xl transition hover:-translate-y-1">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black text-white/80">
                  <Newspaper size={14} /> {formatWeekLabel(leadPaper.weekKey)}
                </div>
                <h3 className="news-headline text-3xl font-black leading-tight">העיתון השבועי</h3>
                <p className="mt-3 text-sm font-medium leading-7 text-white/75">עיון אונליין, הורדת PDF וחיפוש מהיר לפי שבוע.</p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-black text-red-300">
                  לפתיחת המהדורה <ArrowLeft size={16} />
                </div>
              </Link>
            )}
            <Link to="/board" className="block overflow-hidden rounded-[2rem] bg-gradient-to-l from-red-800 via-red-700 to-[#7f1116] p-6 text-white shadow-xl transition hover:-translate-y-1">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black text-white/85">
                <Building2 size={14} /> לוח בתנופה
              </div>
              <h3 className="news-headline text-3xl font-black leading-tight">מודעות נדל"ן בצפת</h3>
              <p className="mt-3 text-sm font-medium leading-7 text-white/80">דירות להשכרה ולמכירה עם יצירת קשר ישירה בוואטסאפ.</p>
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
          <section className="mb-16 rounded-[2rem] border border-red-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <p className="text-sm font-black text-red-700">לוח בתנופה</p>
                <h2 className="news-headline text-3xl font-black text-gray-900">דירות נבחרות השבוע</h2>
              </div>
              <Link to="/board" className="rounded-full border border-red-100 px-4 py-2 text-sm font-black text-red-700 transition hover:bg-red-50">לכל המודעות</Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {featuredListings.map((listing) => (
                <article key={listing.id} className="rounded-[1.75rem] border border-gray-100 bg-gray-50 p-5">
                  <div className="mb-4 aspect-[16/10] overflow-hidden rounded-[1.5rem]">
                    <img src={listing.imageUrl} alt={listing.title} className="h-full w-full object-cover" />
                  </div>
                  <h3 className="news-headline text-2xl font-black text-gray-900">{listing.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-7 text-gray-600">{listing.location} • ₪{listing.price.toLocaleString('he-IL')} • {listing.sizeSqm} מ"ר</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <div className="lg:w-2/3">
            <div className="mb-16">
              <div className="mb-8 flex items-end justify-between border-b-2 border-red-100 pb-3">
                <div className="relative">
                  <h2 className="news-headline text-3xl font-black text-gray-900 leading-none">עוד כותרות</h2>
                  <div className="absolute -bottom-4 right-0 h-1.5 w-24 rounded-full bg-red-700" />
                </div>
                <Link to={`/category/${Category.NEWS}`} className="rounded-full border border-red-100 px-4 py-2 text-sm font-black text-red-700 transition hover:bg-red-50">לכל המבזקים</Link>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                {latestPosts.map(post => (
                  <PostCard key={`${post.id}-repeat`} post={post} />
                ))}
              </div>
            </div>

            <div className="mb-16">
              <AdUnit ad={midPageAd} className="w-full rounded-lg overflow-hidden shadow-md border border-gray-100" />
            </div>

            <div className="space-y-20">
              {categoriesToShow.map((cat) => {
                const catPosts = posts.filter(p => p.category === cat).slice(0, 4);
                if (catPosts.length === 0) return null;
                const colorClass = CATEGORY_COLORS[cat] || 'bg-gray-600';
                const textColorClass = colorClass.replace('bg-', 'text-');
                return (
                  <section key={cat} className="category-section">
                    <div className="mb-8 flex items-end justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-3">
                        <span className={`h-8 w-2 rounded-full ${colorClass}`} />
                        <h2 className="news-headline text-2xl font-black text-gray-900 leading-none">{cat}</h2>
                      </div>
                      <Link to={`/category/${cat}`} className={`${textColorClass} rounded-full bg-white px-4 py-2 text-sm font-black transition hover:opacity-80`}>
                        עוד ב{cat} <ArrowLeft size={16} className="mr-1 inline" />
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                      {catPosts.map(post => <PostCard key={post.id} post={post} layout="list" />)}
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
            <div className="sticky top-28 rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                <div className="rounded-full bg-red-50 p-2 text-red-700"><TrendingUp size={20} /></div>
                <h3 className="text-xl font-black text-gray-900">הכי נקראים</h3>
              </div>
              <ul className="divide-y divide-gray-50">
                {[...posts].sort((a, b) => b.views - a.views).slice(0, 5).map((post, idx) => (
                  <li key={post.id} className="group py-4 first:pt-0 last:pb-0">
                    <Link to={`/article/${post.id}`} className="flex gap-4 items-start">
                      <span className={`text-3xl font-black leading-none ${idx < 3 ? 'text-red-700/20' : 'text-gray-200'}`}>0{idx + 1}</span>
                      <div>
                        <h4 className="text-sm font-black text-gray-800 transition group-hover:text-red-700 line-clamp-2">{post.title}</h4>
                        <span className="mt-1 block text-xs font-bold text-gray-400">{post.category}</span>
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

            <div className="relative overflow-hidden rounded-[2rem] bg-[#111827] p-8 text-center text-white shadow-xl">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-red-600 blur-[70px] opacity-20" />
              <Mail size={40} className="mx-auto mb-4 text-red-500" />
              <h3 className="text-xl font-black mb-2">חדשות עד הבית</h3>
              <p className="mb-6 text-sm leading-7 text-gray-300">הירשמו לניוזלטר שלנו וקבלו את כל העדכונים החמים ישירות למייל.</p>
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

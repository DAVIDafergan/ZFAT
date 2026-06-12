import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Category, Post, PostImage, Ad, AdSlide, AdArea, WeeklyPaper, Agent, BoardListing, BoardListingDealType, BoardListingCategory, DEAL_TYPE_LABELS, BOARD_LISTING_CATEGORY_LABELS } from '../types';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Layout,
  LogOut,
  Image as ImageIcon,
  Link as LinkIcon,
  Users,
  Mail,
  Trash2,
  Edit2,
  GripVertical,
  X as XIcon,
  Save,
  Video,
  Upload,
  Newspaper,
  Building2,
  Home,
  FileText,
  Download,
  MessageCircle,
  CheckCircle,
  Search,
} from 'lucide-react';
import { getWeeklyPaperDateLabel, normalizeShareCode } from '../services/siteConfig';
import { AD_PLACEMENTS, AD_PLACEMENT_MAP } from '../services/adPlacements';
import { api } from '../services/api';
import { formatGregorianDate } from '../services/dateUtils';
import { compressImage } from '../services/imageUtils';

type TabKey = 'posts' | 'ads' | 'weekly-paper' | 'board' | 'users' | 'messages' | 'newsletter' | 'comments';

const initialPaperForm = {
  title: '',
  hebrewDate: '',
  description: '',
  pdfUrl: '',
  coverImageUrl: '',
};

const initialBoardForm = {
  title: '',
  imageUrl: '',
  listingCategory: 'real_estate' as BoardListingCategory,
  location: '',
  dealType: 'rent' as BoardListingDealType,
  price: '',
  sizeSqm: '',
  details: '',
  hasBalcony: false,
  contactName: '',
  contactPhone: '',
};

const initialAdForm = {
  title: '',
  area: 'leaderboard' as AdArea,
  imageUrl: '',
  videoUrl: '',
  linkUrl: '',
  isActive: true,
};

const POSTS_PAGE_SIZE = 5;
type UploadState = 'idle' | 'uploading' | 'ready' | 'error';
type ArticleImageDraft = PostImage & {
  uploadName?: string;
  uploadState?: UploadState;
  uploadError?: string;
};
type UploadFeedback = {
  uploadName: string;
  uploadState: UploadState;
  uploadError?: string;
};

const HTML_TAG_REGEX = /<\/?[a-z][\s\S]*>/i;
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const normalizeArticleContent = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (HTML_TAG_REGEX.test(trimmed)) return trimmed;
  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
    .join('');
};

export const AdminDashboard: React.FC = () => {
  const {
    user,
    logout,
    posts,
    addPost,
    updatePost,
    deletePost,
    ads,
    updateAd,
    createAd,
    deleteAd,
    registeredUsers,
    contactMessages,
    newsletterSubscribers,
    weeklyPapers,
    agents,
    boardListings,
    createWeeklyPaper,
    deleteWeeklyPaper,
    createAgent,
    deleteAgent,
    createBoardListing,
    deleteBoardListing,
    pendingComments,
    fetchPendingComments,
    approveComment,
    deleteComment,
  } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('posts');
  const [newPost, setNewPost] = useState<Partial<Post>>({
    title: '',
    category: Category.NEWS,
    excerpt: '',
    content: '',
    imageUrl: '',
    tags: [],
    isFeatured: false,
  });
  const [tagsInput, setTagsInput] = useState('');
  const [mainImagePhotographer, setMainImagePhotographer] = useState('');
  const [mainImageFeedback, setMainImageFeedback] = useState<UploadFeedback>({ uploadName: '', uploadState: 'idle' });
  const [additionalPostImages, setAdditionalPostImages] = useState<ArticleImageDraft[]>([]);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postsPage, setPostsPage] = useState(1);
  const [postSearchQuery, setPostSearchQuery] = useState('');
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [editingAdMeta, setEditingAdMeta] = useState<Pick<Ad, 'title' | 'area' | 'isActive'> | null>(null);
  const [editingSlides, setEditingSlides] = useState<AdSlide[]>([]);
  const [draggedSlideIndex, setDraggedSlideIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [paperForm, setPaperForm] = useState(initialPaperForm);
  const [boardForm, setBoardForm] = useState(initialBoardForm);
  const [newAdForm, setNewAdForm] = useState(initialAdForm);
  const [agentForm, setAgentForm] = useState({ name: '', phone: '', imageUrl: '' });
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = window.setTimeout(() => setToastMessage(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (user.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const showToast = (message: string) => setToastMessage(message);
  const isDataUrl = (value: string) => value.trim().startsWith('data:');
  const displayUploadValue = (value: string) => (isDataUrl(value) ? '' : value);
  const normalizedPostSearch = postSearchQuery.trim().toLowerCase();
  const filteredPosts = useMemo(() => {
    if (!normalizedPostSearch) return posts;
    return posts.filter((post) => {
      const searchableContent = [
        post.title,
        post.excerpt,
        post.category,
        post.author,
        post.date,
        ...(post.tags || []),
      ]
        .join(' ')
        .toLowerCase();
      return searchableContent.includes(normalizedPostSearch);
    });
  }, [posts, normalizedPostSearch]);
  const totalPostsPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PAGE_SIZE));
  const paginatedPosts = useMemo(() => {
    const start = (postsPage - 1) * POSTS_PAGE_SIZE;
    return filteredPosts.slice(start, start + POSTS_PAGE_SIZE);
  }, [filteredPosts, postsPage]);

  useEffect(() => {
    if (postsPage > totalPostsPages) {
      setPostsPage(totalPostsPages);
    }
  }, [postsPage, totalPostsPages]);

  useEffect(() => {
    setPostsPage(1);
  }, [normalizedPostSearch]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (url: string) => void,
    folder = 'admin'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.currentTarget.value = '';

    try {
      if (file.type.startsWith('image/')) {
        const compressedUrl = await compressImage(file);
        callback(compressedUrl);
        showToast('התמונה נדחסה ונשמרה בהצלחה');
        return;
      }
      const uploadedUrl = await api.uploadFile(file, folder);
      callback(uploadedUrl);
      showToast('הקובץ הועלה ל-S3 בהצלחה');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'העלאת הקובץ נכשלה';
      showToast(`שגיאה בהעלאה: ${message}`);
    }
  };

  const handleServerImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (url: string) => void,
    folder = 'admin'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.currentTarget.value = '';

    try {
      const uploadedUrl = await api.uploadFile(file, folder);
      callback(uploadedUrl);
      showToast('התמונה הועלתה ונשמרה בשרת בהצלחה');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'העלאת התמונה נכשלה';
      showToast(`שגיאה בהעלאת תמונה: ${message}`);
    }
  };

  const buildUploadName = (value: string) => {
    if (!value.trim()) return '';
    if (isDataUrl(value)) return 'תמונה שהועלתה מהמחשב';
    try {
      const fileName = decodeURIComponent(new URL(value).pathname.split('/').pop() || '');
      return fileName || 'קישור לתמונה';
    } catch {
      return 'קישור לתמונה';
    }
  };

  const handleArticleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onUploaded: (url: string) => void,
    setFeedback: (feedback: UploadFeedback) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.currentTarget.value = '';
    setFeedback({ uploadName: file.name, uploadState: 'uploading' });

    try {
      const compressedUrl = await compressImage(file);
      onUploaded(compressedUrl);
      setFeedback({ uploadName: file.name, uploadState: 'ready' });
      showToast(`התמונה "${file.name}" נקלטה במערכת בהצלחה`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'העלאת התמונה נכשלה';
      setFeedback({ uploadName: file.name, uploadState: 'error', uploadError: message });
      showToast(`שגיאה בהעלאת התמונה "${file.name}": ${message}`);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedContent = normalizeArticleContent(newPost.content || '');
    if (!newPost.title || !normalizedContent) return;
    const normalizedExcerpt = (newPost.excerpt || '').trim() || stripHtml(normalizedContent).slice(0, 180);

    const primaryImageUrl = (newPost.imageUrl || '').trim();
    const normalizedAdditionalImages = additionalPostImages
      .map((image) => ({ url: image.url?.trim() || '', photographer: image.photographer?.trim() || '' }))
      .filter((image) => Boolean(image.url));
    const nextImages: PostImage[] = [
      { url: primaryImageUrl, photographer: mainImagePhotographer.trim() },
      ...normalizedAdditionalImages,
    ].filter((image) => Boolean(image.url));
    const nextTags = tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean);
    if (editingPostId) {
      const current = posts.find((post) => post.id === editingPostId);
      if (!current) return;
      await updatePost(editingPostId, {
        title: newPost.title,
        excerpt: normalizedExcerpt,
        content: normalizedContent,
        category: newPost.category as Category,
        author: current.author || user?.name || 'Admin',
        imageUrl: primaryImageUrl,
        images: nextImages,
        tags: nextTags,
        isFeatured: Boolean(newPost.isFeatured),
        featuredAt: newPost.isFeatured ? new Date().toISOString() : undefined,
        shortLinkCode: current.shortLinkCode || normalizeShareCode('', current.id),
      });
      showToast('הכתבה עודכנה בהצלחה');
    } else {
      const nowIso = new Date().toISOString();
      const post: Post = {
        id: Date.now().toString(),
        title: newPost.title,
        excerpt: normalizedExcerpt,
        content: normalizedContent,
        category: newPost.category as Category,
        author: user?.name || 'Admin',
        date: nowIso,
        publishedAt: nowIso,
        createdAt: nowIso,
        imageUrl: primaryImageUrl,
        images: nextImages,
        tags: nextTags,
        isFeatured: Boolean(newPost.isFeatured),
        featuredAt: newPost.isFeatured ? nowIso : undefined,
        views: 0,
        shortLinkCode: normalizeShareCode('', Date.now().toString()),
      };
      await addPost(post);
      showToast(`הכתבה פורסמה בהצלחה · קוד קצר ${post.shortLinkCode}`);
    }

    setNewPost({ title: '', category: Category.NEWS, excerpt: '', content: '', imageUrl: '', tags: [], isFeatured: false });
    setTagsInput('');
    setMainImagePhotographer('');
    setMainImageFeedback({ uploadName: '', uploadState: 'idle' });
    setAdditionalPostImages([]);
    setEditingPostId(null);
  };

  const startEditingPost = (post: Post) => {
    setNewPost({
      title: post.title,
      category: post.category,
      excerpt: post.excerpt,
      content: post.content,
      imageUrl: post.imageUrl,
      tags: post.tags,
      isFeatured: post.isFeatured,
    });
    const existingImages = Array.isArray(post.images) ? post.images.filter((image) => image.url) : [];
    const fallbackMain = post.imageUrl ? [{ url: post.imageUrl, photographer: '' }] : [];
    const normalizedImages = existingImages.length > 0 ? existingImages : fallbackMain;
    const firstImage = normalizedImages[0];
    setMainImagePhotographer(firstImage?.photographer || '');
    setMainImageFeedback(post.imageUrl ? { uploadName: buildUploadName(post.imageUrl), uploadState: 'ready' } : { uploadName: '', uploadState: 'idle' });
    setAdditionalPostImages(normalizedImages.slice(1).map((image) => ({
      ...image,
      uploadName: buildUploadName(image.url),
      uploadState: image.url ? 'ready' : 'idle',
      uploadError: '',
    })));
    setTagsInput(post.tags.join(', '));
    setEditingPostId(post.id);
    setActiveTab('posts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetPostForm = () => {
    setNewPost({ title: '', category: Category.NEWS, excerpt: '', content: '', imageUrl: '', tags: [], isFeatured: false });
    setTagsInput('');
    setMainImagePhotographer('');
    setMainImageFeedback({ uploadName: '', uploadState: 'idle' });
    setAdditionalPostImages([]);
    setEditingPostId(null);
  };

  const handleDeletePost = async (post: Post) => {
    const shouldDelete = window.confirm(`למחוק את הכתבה "${post.title}"?`);
    if (!shouldDelete) return;
    await deletePost(post.id);
    if (editingPostId === post.id) resetPostForm();
    showToast('הכתבה נמחקה בהצלחה');
  };

  const startEditingAd = (ad: Ad) => {
    setEditingAdId(ad.id);
    setEditingAdMeta({
      title: ad.title,
      area: ad.area,
      isActive: ad.isActive,
    });
    setEditingSlides([...ad.slides]);
  };

  const cancelEditingAd = () => {
    setEditingAdId(null);
    setEditingAdMeta(null);
    setEditingSlides([]);
  };

  const saveAdChanges = async () => {
    if (!editingAdId || !editingAdMeta) return;
    await updateAd(editingAdId, { ...editingAdMeta, slides: editingSlides });
    cancelEditingAd();
    showToast('הבאנר עודכן בהצלחה');
  };

  const handleDeleteAd = async (adId: string) => {
    const targetAd = ads.find((ad) => ad.id === adId);
    if (!targetAd) return;
    if (!window.confirm(`למחוק את הקמפיין "${targetAd.title}"?`)) return;
    await deleteAd(adId);
    if (editingAdId === adId) {
      cancelEditingAd();
    }
    showToast('הקמפיין הוסר בהצלחה');
  };

  const addAdditionalPostImage = () => {
    setAdditionalPostImages((prev) => [...prev, { url: '', photographer: '', uploadName: '', uploadState: 'idle', uploadError: '' }]);
  };

  const updateAdditionalPostImage = (index: number, updates: Partial<ArticleImageDraft>) => {
    setAdditionalPostImages((prev) => prev.map((image, imageIndex) => (imageIndex === index ? { ...image, ...updates } : image)));
  };

  const removeAdditionalPostImage = (index: number) => {
    setAdditionalPostImages((prev) => prev.filter((_, imageIndex) => imageIndex !== index));
  };

  const addSlide = () => {
    setEditingSlides((prev) => [...prev, { id: Date.now().toString(), imageUrl: 'https://via.placeholder.com/800x200', linkUrl: '' }]);
  };

  const removeSlide = (index: number) => {
    setEditingSlides((prev) => prev.filter((_, slideIndex) => slideIndex !== index));
  };

  const updateSlide = (index: number, field: keyof AdSlide, value: string) => {
    setEditingSlides((prev) => prev.map((slide, slideIndex) => slideIndex === index ? { ...slide, [field]: value } : slide));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedSlideIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedSlideIndex === null || draggedSlideIndex === targetIndex) return;
    const slides = [...editingSlides];
    const [draggedItem] = slides.splice(draggedSlideIndex, 1);
    slides.splice(targetIndex, 0, draggedItem);
    setEditingSlides(slides);
    setDraggedSlideIndex(null);
  };

  const handleWeeklyPaperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const paper: WeeklyPaper = {
      id: Date.now().toString(),
      title: paperForm.title,
      hebrewDate: paperForm.hebrewDate,
      description: paperForm.description,
      pdfUrl: paperForm.pdfUrl,
      coverImageUrl: paperForm.coverImageUrl,
      publishedAt: new Date().toISOString(),
      isActive: true,
    };
    try {
      await createWeeklyPaper(paper);
      setPaperForm(initialPaperForm);
      showToast('העיתון השבועי עלה לאתר');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'פרסום העיתון נכשל. נסו שוב.');
    }
  };

  const handleAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentForm.name.trim()) return;
    const agent: Agent = {
      id: Date.now().toString(),
      name: agentForm.name.trim(),
      phone: agentForm.phone.trim(),
      imageUrl: agentForm.imageUrl.trim() || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      createdAt: new Date().toISOString(),
    };
    await createAgent(agent);
    setAgentForm({ name: '', phone: '', imageUrl: '' });
    showToast('המתווך נוסף בהצלחה');
  };

  const handleBoardListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const listing: BoardListing = {
      id: Date.now().toString(),
      title: boardForm.title || 'מודעה ללא כותרת',
      imageUrl: boardForm.imageUrl || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200',
      listingCategory: boardForm.listingCategory,
      location: boardForm.location,
      dealType: boardForm.dealType,
      price: Number(boardForm.price || 0),
      sizeSqm: Number(boardForm.sizeSqm || 0),
      details: boardForm.details,
      hasBalcony: boardForm.hasBalcony,
      contactName: boardForm.contactName,
      contactPhone: boardForm.contactPhone,
      agentId: selectedAgentId || undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    await createBoardListing(listing);
    setBoardForm(initialBoardForm);
    setSelectedAgentId('');
    showToast('מודעת לוח בתנופה פורסמה בהצלחה');
  };

  const handleCreateAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdForm.title.trim()) return;
    if (!newAdForm.imageUrl.trim() && !newAdForm.videoUrl.trim()) return;

    const newAd: Ad = {
      id: Date.now().toString(),
      title: newAdForm.title.trim(),
      area: newAdForm.area,
      isActive: newAdForm.isActive,
      slides: [{
        id: `slide-${Date.now()}`,
        imageUrl: newAdForm.imageUrl.trim(),
        videoUrl: newAdForm.videoUrl.trim() || '',
        linkUrl: newAdForm.linkUrl.trim() || '',
      }],
    };

    await createAd(newAd);
    setNewAdForm(initialAdForm);
    showToast('קמפיין פרסומי חדש נוסף בהצלחה');
  };

  const exportNewsletterSubscribers = () => {
    if (newsletterSubscribers.length === 0) return;
    const headers = ['אימייל', 'תאריך הצטרפות', 'סטטוס'];
    const rows = newsletterSubscribers.map((subscriber) => [
      subscriber.email,
      subscriber.joinedDate,
      subscriber.isActive ? 'פעיל' : 'לא פעיל',
    ]);
    const escapeCsvValue = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => escapeCsvValue(String(cell ?? ''))).join(','))
      .join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const tabs: Array<{ key: TabKey; label: string; icon: React.ComponentType<{ size?: number }> }> = [
    { key: 'posts', label: 'הוספת כתבה', icon: Plus },
    { key: 'ads', label: 'באנרים', icon: Layout },
    { key: 'weekly-paper', label: 'העיתון השבועי', icon: Newspaper },
    { key: 'board', label: 'לוח בתנופה', icon: Home },
    { key: 'comments', label: `אישור תגובות${pendingComments.length > 0 ? ` (${pendingComments.length})` : ''}`, icon: MessageCircle },
    { key: 'users', label: 'משתמשים', icon: Users },
    { key: 'messages', label: 'הודעות', icon: Mail },
    { key: 'newsletter', label: 'ניוזלטר', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto flex min-h-16 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-lg font-black text-gray-800 sm:text-xl">מערכת ניהול - צפת בתנופה</h1>
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">שלום, {user?.name}</span>
          </div>
          <button onClick={handleLogout} className="inline-flex items-center gap-1 self-start rounded-full border border-gray-200 px-3 py-2 text-sm font-bold text-gray-500 transition hover:border-red-200 hover:text-red-600 sm:self-auto"><LogOut size={16} /> יציאה</button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-5 sm:py-8">
        <div className="mb-6 flex gap-3 overflow-x-auto pb-2 sm:mb-8">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition sm:px-6 sm:py-3 sm:text-base ${activeTab === key ? 'bg-red-700 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </div>

        {activeTab === 'posts' && (
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black text-gray-800 sm:text-2xl">{editingPostId ? 'עריכת כתבה' : 'יצירת כתבה חדשה'}</h2>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">המערכת תייצר קישור קצר ממוספר אוטומטית</span>
            </div>
            <form onSubmit={handlePostSubmit} className="max-w-5xl space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">כותרת הכתבה</label>
                  <input type="text" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" placeholder="הכנס כותרת ראשית..." required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">קטגוריה</label>
                  <select value={newPost.category} onChange={(e) => setNewPost({ ...newPost, category: e.target.value as Category })} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500">
                    {Object.values(Category).map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">תקציר</label>
                <textarea value={newPost.excerpt} onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })} className="h-20 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" placeholder="תקציר שיופיע בכרטיס הכתבה..." />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">תוכן הכתבה (אפשר טקסט רגיל או HTML)</label>
                <textarea value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} className="h-64 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500" placeholder={'אפשר להדביק טקסט רגיל מהנייד - המערכת תסדר פסקאות אוטומטית.\n\nאו להדביק HTML מלא.'} required />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">תמונה ראשית</label>
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <ImageIcon size={18} className="absolute right-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        value={newPost.imageUrl}
                        onChange={(e) => {
                          const value = e.target.value;
                          setNewPost({ ...newPost, imageUrl: value });
                          setMainImageFeedback({ uploadName: buildUploadName(value), uploadState: value ? 'ready' : 'idle' });
                        }}
                        className="w-full rounded-lg border border-gray-300 pl-4 pr-10 py-3 outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="הדבק קישור או העלה קובץ..."
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-100 px-4 py-3 text-sm font-black text-gray-700 transition hover:bg-gray-200">
                        <Upload size={16} /> גלריה
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleArticleImageUpload(e, (url) => setNewPost({ ...newPost, imageUrl: url }), setMainImageFeedback)} />
                      </label>
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-100 px-4 py-3 text-sm font-black text-gray-700 transition hover:bg-gray-200">
                        <Upload size={16} /> צילום מהמצלמה
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleArticleImageUpload(e, (url) => setNewPost({ ...newPost, imageUrl: url }), setMainImageFeedback)} />
                      </label>
                    </div>
                    {newPost.imageUrl && (
                      <div className={`rounded-2xl border p-3 ${mainImageFeedback.uploadState === 'error' ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50/70'}`}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className={`text-sm font-black ${mainImageFeedback.uploadState === 'error' ? 'text-red-700' : 'text-emerald-800'}`}>
                              {mainImageFeedback.uploadState === 'uploading' ? 'מעלה תמונה ראשית...' : mainImageFeedback.uploadState === 'error' ? 'העלאת התמונה נכשלה' : 'התמונה הראשית נקלטה במערכת'}
                            </p>
                            <p className={`text-xs font-bold ${mainImageFeedback.uploadState === 'error' ? 'text-red-600' : 'text-emerald-700'}`}>
                              {mainImageFeedback.uploadName || buildUploadName(newPost.imageUrl)}
                            </p>
                            {mainImageFeedback.uploadError && <p className="mt-1 text-xs font-bold text-red-600">{mainImageFeedback.uploadError}</p>}
                          </div>
                          {mainImageFeedback.uploadState === 'ready' && <CheckCircle size={20} className="text-emerald-600" />}
                        </div>
                        <div className="mt-3 h-40 overflow-hidden rounded-xl border border-white/70 bg-white">
                          <img src={newPost.imageUrl} alt="preview" loading="lazy" decoding="async" className="h-full w-full object-contain" />
                        </div>
                      </div>
                    )}
                    <input
                      type="text"
                      value={mainImagePhotographer}
                      onChange={(e) => setMainImagePhotographer(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="שם הצלם לתמונה הראשית (אופציונלי)"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">תגיות (מופרדות בפסיק)</label>
                  <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" placeholder="צפת, שלג, עירייה..." />
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <label className="block text-sm font-bold text-gray-700">תמונות נוספות לכתבה + קרדיט צילום</label>
                  <button type="button" onClick={addAdditionalPostImage} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-black text-gray-700 transition hover:border-red-200 hover:text-red-700">
                    <Plus size={14} /> הוסף תמונה
                  </button>
                </div>
                {additionalPostImages.length === 0 && (
                  <p className="text-xs font-bold text-gray-500">אין כרגע תמונות נוספות.</p>
                )}
                {additionalPostImages.map((image, index) => (
                  <div key={`${index}-${image.url}`} className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-3 md:grid-cols-[1fr_1fr_auto]">
                    <div>
                      <input
                        type="text"
                        value={image.url}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateAdditionalPostImage(index, {
                            url: value,
                            uploadName: buildUploadName(value),
                            uploadState: value ? 'ready' : 'idle',
                            uploadError: '',
                          });
                        }}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="קישור או העלאת תמונה"
                      />
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-100 px-4 py-2 text-xs font-black text-gray-700 transition hover:bg-gray-200">
                          <Upload size={14} /> העלאה מהגלריה
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleArticleImageUpload(
                              e,
                              (url) => updateAdditionalPostImage(index, { url }),
                              (feedback) => updateAdditionalPostImage(index, feedback),
                            )}
                          />
                        </label>
                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-100 px-4 py-2 text-xs font-black text-gray-700 transition hover:bg-gray-200">
                          <Upload size={14} /> צילום מהמצלמה
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => handleArticleImageUpload(
                              e,
                              (url) => updateAdditionalPostImage(index, { url }),
                              (feedback) => updateAdditionalPostImage(index, feedback),
                            )}
                          />
                        </label>
                      </div>
                      {image.url && (
                        <div className={`mt-2 rounded-xl border p-2.5 ${image.uploadState === 'error' ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50/70'}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className={`text-xs font-black ${image.uploadState === 'error' ? 'text-red-700' : 'text-emerald-800'}`}>
                                {image.uploadState === 'uploading' ? `מעלה תמונה ${index + 1}...` : image.uploadState === 'error' ? `תמונה ${index + 1} לא נקלטה` : `תמונה ${index + 1} נקלטה`}
                              </p>
                              <p className={`text-[11px] font-bold ${image.uploadState === 'error' ? 'text-red-600' : 'text-emerald-700'}`}>
                                {image.uploadName || buildUploadName(image.url)}
                              </p>
                              {image.uploadError && <p className="mt-1 text-[11px] font-bold text-red-600">{image.uploadError}</p>}
                            </div>
                            {image.uploadState === 'ready' && <CheckCircle size={16} className="shrink-0 text-emerald-600" />}
                          </div>
                          <div className="mt-2 h-24 overflow-hidden rounded-lg border border-white/80 bg-white">
                            <img src={image.url} alt={`preview-${index}`} loading="lazy" decoding="async" className="h-full w-full object-contain" />
                          </div>
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      value={image.photographer || ''}
                      onChange={(e) => updateAdditionalPostImage(index, { photographer: e.target.value })}
                      className="h-fit w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="שם הצלם"
                    />
                    <button type="button" onClick={() => removeAdditionalPostImage(index)} className="self-start rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-100">
                      הסר
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                <input type="checkbox" id="isFeatured" checked={newPost.isFeatured} onChange={(e) => setNewPost({ ...newPost, isFeatured: e.target.checked })} className="h-5 w-5 rounded text-red-600 focus:ring-red-500" />
                <label htmlFor="isFeatured" className="cursor-pointer font-black text-gray-700">הצג בסליידר הראשי</label>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className="flex items-center gap-2 rounded-lg bg-red-700 px-8 py-3 font-black text-white shadow-lg transition hover:bg-red-800">
                  <Save size={20} /> {editingPostId ? 'שמור שינויים' : 'פרסם כתבה'}
                </button>
                {editingPostId && (
                  <button type="button" onClick={resetPostForm} className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-black text-gray-700 transition hover:bg-gray-50">
                    בטל עריכה
                  </button>
                )}
              </div>
            </form>

            <div className="mt-10 border-t border-gray-200 pt-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-black text-gray-800">ניהול כתבות ({filteredPosts.length})</h3>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                  {normalizedPostSearch ? `מסונן מתוך ${posts.length} כתבות` : 'מוצגות 5 כתבות בכל דף'}
                </span>
              </div>
              <div className="mb-5">
                <div className="relative max-w-xl">
                  <Search size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={postSearchQuery}
                    onChange={(e) => setPostSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-4 pr-10 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="חיפוש כתבה לפי כותרת, תגית, קטגוריה או תאריך..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                {paginatedPosts.map((post) => {
                  const featuredMs = post.featuredAt ? new Date(post.featuredAt).getTime() : 0;
                  const msRemaining = post.isFeatured && featuredMs ? featuredMs + 24 * 60 * 60 * 1000 - Date.now() : 0;
                  const isActiveInSlider = msRemaining > 0;
                  const hoursLeft = isActiveInSlider ? Math.ceil(msRemaining / (60 * 60 * 1000)) : 0;
                  return (
                  <div key={post.id} className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="min-w-[220px] flex-1">
                      <p className="font-black text-gray-900">{post.title}</p>
                      <p className="mt-1 text-sm font-bold text-red-700">{post.category} · {formatGregorianDate(post.date)}</p>
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">{post.excerpt || 'ללא תקציר'}</p>
                      {isActiveInSlider && (
                        <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-black text-green-800">
                          ✦ בסליידר הראשי · {hoursLeft > 1 ? `נותרו ${hoursLeft} שעות` : 'פחות משעה'}
                        </p>
                      )}
                      {post.isFeatured && !isActiveInSlider && (
                        <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-black text-gray-600">
                          פג תוקף הסליידר (24 שעות)
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEditingPost(post)} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-black text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700">
                        <Edit2 size={15} /> ערוך
                      </button>
                      <button onClick={() => handleDeletePost(post)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-black text-red-700 transition hover:bg-red-100">
                        <Trash2 size={15} /> מחק
                      </button>
                    </div>
                  </div>
                  );
                })}
                {paginatedPosts.length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm font-bold text-gray-400">
                    {normalizedPostSearch ? 'לא נמצאו כתבות תואמות לחיפוש.' : 'אין כתבות להצגה.'}
                  </div>
                )}
              </div>

              {filteredPosts.length > POSTS_PAGE_SIZE && (
                <div className="mt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setPostsPage((prev) => Math.max(1, prev - 1))}
                    disabled={postsPage === 1}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-black text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    הדף הקודם
                  </button>
                  <span className="text-sm font-black text-gray-600">עמוד {postsPage} מתוך {totalPostsPages}</span>
                  <button
                    type="button"
                    onClick={() => setPostsPage((prev) => Math.min(totalPostsPages, prev + 1))}
                    disabled={postsPage === totalPostsPages}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-black text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    הדף הבא
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ads' && (
          <div className="space-y-8">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="mb-6 text-xl font-black text-gray-800 sm:text-2xl">ניהול באנרים ופרסומות</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {AD_PLACEMENTS.map((placement) => (
                  <div key={placement.area} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm font-black text-gray-900">{placement.label}</p>
                    <p className="mt-1 text-xs font-bold text-gray-500">{placement.page}</p>
                    <p className="mt-2 text-xs font-black text-red-700">מידה מומלצת: {placement.recommendedSize}px</p>
                    <p className="mt-1 text-xs font-bold text-gray-600">{placement.guidance}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
              <h3 className="mb-6 text-lg font-black text-gray-800 sm:text-xl">הוספת קמפיין חדש</h3>
              <form onSubmit={handleCreateAdSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">שם הקמפיין</label>
                  <input type="text" value={newAdForm.title} onChange={(e) => setNewAdForm({ ...newAdForm, title: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">מיקום פרסום</label>
                  <select value={newAdForm.area} onChange={(e) => setNewAdForm({ ...newAdForm, area: e.target.value as AdArea })} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500">
                    {AD_PLACEMENTS.map((placement) => (
                      <option key={placement.area} value={placement.area}>
                        {placement.label} ({placement.recommendedSize})
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs font-black text-red-700">מידה מומלצת: {AD_PLACEMENT_MAP[newAdForm.area].recommendedSize}px</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">קישור בלחיצה</label>
                  <input type="url" value={newAdForm.linkUrl} onChange={(e) => setNewAdForm({ ...newAdForm, linkUrl: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" placeholder="https://example.com (אופציונלי)" />
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                  <input type="checkbox" id="new-ad-active" checked={newAdForm.isActive} onChange={(e) => setNewAdForm({ ...newAdForm, isActive: e.target.checked })} className="h-5 w-5 rounded text-red-600 focus:ring-red-500" />
                  <label htmlFor="new-ad-active" className="cursor-pointer font-black text-gray-700">פרסום פעיל מיד לאחר השמירה</label>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">תמונה (חובה לתצוגה מיטבית)</label>
                  <div className="flex gap-2">
                    <input type="text" value={displayUploadValue(newAdForm.imageUrl)} onChange={(e) => setNewAdForm({ ...newAdForm, imageUrl: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" placeholder="קישור תמונה" />
                    <label className="flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-600 transition hover:bg-gray-50" title="העלה תמונה">
                      <Upload size={16} />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => setNewAdForm({ ...newAdForm, imageUrl: url }))} />
                    </label>
                  </div>
                  {isDataUrl(newAdForm.imageUrl) && <p className="mt-1 text-xs font-bold text-emerald-700">התמונה הועלתה מהמחשב ונשמרת כפי שהיא.</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">וידאו (אופציונלי)</label>
                  <div className="flex gap-2">
                    <input type="text" value={newAdForm.videoUrl} onChange={(e) => setNewAdForm({ ...newAdForm, videoUrl: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" placeholder="https://...mp4" />
                    <label className="flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-600 transition hover:bg-gray-50" title="העלה וידאו">
                      <Video size={16} />
                      <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => setNewAdForm({ ...newAdForm, videoUrl: url }))} />
                    </label>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <button type="submit" className="flex items-center gap-2 rounded-lg bg-red-700 px-6 py-3 font-black text-white shadow-lg transition hover:bg-red-800">
                    <Plus size={18} /> הוסף קמפיין פרסומי
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
              <h3 className="mb-6 text-lg font-black text-gray-800 sm:text-xl">קמפיינים קיימים ({ads.length})</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                {ads.map((ad) => (
                  <div key={ad.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:shadow-md sm:p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-black text-gray-900">{ad.title}</h3>
                        <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-bold uppercase text-gray-500">{AD_PLACEMENT_MAP[ad.area]?.label || ad.area}</span>
                      </div>
                      <div className={`h-3 w-3 rounded-full ${ad.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                    <p className="mb-3 text-xs font-black text-red-700">מידה מומלצת: {AD_PLACEMENT_MAP[ad.area]?.recommendedSize || '1200x250'}px</p>
                    <div className="relative mb-4 aspect-video overflow-hidden rounded-lg bg-gray-200">
                      {ad.slides.length > 0 && <img src={ad.slides[0].imageUrl} alt="preview" loading="lazy" decoding="async" className="h-full w-full bg-black object-contain opacity-70" />}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 font-black text-white">{ad.slides.length} שקופיות</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => startEditingAd(ad)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2 font-black text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"><Edit2 size={16} /> ערוך</button>
                      <button onClick={() => handleDeleteAd(ad.id)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-2 font-black text-red-700 transition hover:bg-red-100"><Trash2 size={16} /> מחק</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {editingAdId && editingAdMeta && (
              <div className="rounded-xl border-2 border-red-100 bg-white p-4 shadow-lg sm:p-6 lg:p-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl font-black text-gray-900 sm:text-2xl">עריכת קמפיין: {ads.find((ad) => ad.id === editingAdId)?.title}</h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <button onClick={addSlide} className="flex items-center gap-1 rounded-lg bg-gray-100 px-4 py-2 font-black text-gray-800 transition hover:bg-gray-200"><Plus size={16} /> הוסף שקופית</button>
                    <button onClick={saveAdChanges} className="flex items-center gap-1 rounded-lg bg-green-600 px-5 py-2 font-black text-white shadow-md transition hover:bg-green-700 sm:px-6"><Save size={16} /> שמור</button>
                    <button onClick={() => handleDeleteAd(editingAdId)} className="flex items-center gap-1 rounded-lg bg-red-50 px-4 py-2 font-black text-red-700 transition hover:bg-red-100"><Trash2 size={16} /> מחק</button>
                    <button onClick={cancelEditingAd} className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-4 py-2 font-black text-gray-700 transition hover:border-red-200 hover:text-red-700"><XIcon size={16} /> ביטול</button>
                  </div>
                </div>
                <p className="mb-6 rounded-lg bg-gray-50 px-4 py-3 text-sm font-bold text-gray-700">
                  מיקום: {AD_PLACEMENT_MAP[ads.find((ad) => ad.id === editingAdId)?.area || 'leaderboard'].label} · מידה מומלצת: {AD_PLACEMENT_MAP[ads.find((ad) => ad.id === editingAdId)?.area || 'leaderboard'].recommendedSize}px
                </p>

                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">שם הקמפיין</label>
                    <input type="text" value={editingAdMeta.title} onChange={(e) => setEditingAdMeta({ ...editingAdMeta, title: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">מיקום פרסום</label>
                    <select value={editingAdMeta.area} onChange={(e) => setEditingAdMeta({ ...editingAdMeta, area: e.target.value as AdArea })} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500">
                      {AD_PLACEMENTS.map((placement) => (
                        <option key={placement.area} value={placement.area}>
                          {placement.label} ({placement.recommendedSize})
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3 font-black text-gray-700">
                    <input type="checkbox" checked={editingAdMeta.isActive} onChange={(e) => setEditingAdMeta({ ...editingAdMeta, isActive: e.target.checked })} className="h-5 w-5 rounded text-red-600 focus:ring-red-500" />
                    קמפיין פעיל
                  </label>
                </div>

                <div className="space-y-4">
                  {editingSlides.map((slide, index) => (
                    <div key={slide.id} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index)} className={`flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all sm:flex-row sm:items-start sm:gap-6 sm:p-6 ${draggedSlideIndex === index ? 'ring-2 ring-red-300 opacity-50' : 'hover:border-red-200'}`}>
                      <div className="hidden cursor-grab text-gray-400 hover:text-gray-600 sm:mt-8 sm:block"><GripVertical size={24} /></div>
                      <div className="h-24 w-full shrink-0 overflow-hidden rounded-lg border border-gray-300 bg-gray-200 sm:w-32">
                        <img src={slide.imageUrl} alt="preview" loading="lazy" decoding="async" className="h-full w-full bg-black object-contain" />
                      </div>
                      <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-black text-gray-500">תמונה</label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <ImageIcon size={14} className="absolute right-3 top-3 text-gray-400" />
                              <input type="text" value={slide.imageUrl} onChange={(e) => updateSlide(index, 'imageUrl', e.target.value)} className="w-full rounded border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm outline-none focus:ring-1 focus:ring-red-500" />
                            </div>
                            <label className="flex cursor-pointer items-center justify-center rounded border border-gray-300 bg-white px-3 py-2 text-gray-600 transition hover:bg-gray-50" title="העלה תמונה">
                              <Upload size={16} />
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateSlide(index, 'imageUrl', url))} />
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-black text-gray-500">קישור</label>
                          <div className="relative">
                            <LinkIcon size={14} className="absolute right-3 top-3 text-gray-400" />
                            <input type="text" value={slide.linkUrl || ''} onChange={(e) => updateSlide(index, 'linkUrl', e.target.value)} className="w-full rounded border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm outline-none focus:ring-1 focus:ring-red-500" />
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-1 block text-xs font-black text-gray-500">וידאו (אופציונלי)</label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Video size={14} className="absolute right-3 top-3 text-gray-400" />
                              <input type="text" value={slide.videoUrl || ''} onChange={(e) => updateSlide(index, 'videoUrl', e.target.value)} placeholder="https://...mp4" className="w-full rounded border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm outline-none focus:ring-1 focus:ring-red-500" />
                            </div>
                            <label className="flex cursor-pointer items-center justify-center rounded border border-gray-300 bg-white px-3 py-2 text-gray-600 transition hover:bg-gray-50" title="העלה וידאו">
                              <Video size={16} />
                              <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateSlide(index, 'videoUrl', url))} />
                            </label>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => removeSlide(index)} className="self-end rounded-lg p-2 text-red-400 transition hover:bg-red-50 hover:text-red-700 sm:mt-6" title="מחק שקופית"><Trash2 size={20} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'weekly-paper' && (
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_1.1fr]">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-black text-gray-800 sm:text-2xl"><Newspaper size={24} className="text-red-700" /> העלאת העיתון השבועי</h2>
              <form onSubmit={handleWeeklyPaperSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">כותרת</label>
                  <input type="text" value={paperForm.title} onChange={(e) => setPaperForm({ ...paperForm, title: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" placeholder="העיתון השבועי - מהדורת סוף השבוע" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">תאריך עברי</label>
                  <input type="text" value={paperForm.hebrewDate} onChange={(e) => setPaperForm({ ...paperForm, hebrewDate: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" placeholder={'לדוגמה: י"ג בסיוון תשפ"ו'} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">תיאור קצר</label>
                  <textarea value={paperForm.description} onChange={(e) => setPaperForm({ ...paperForm, description: e.target.value })} className="h-24 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" placeholder="תוכן מרכזי במהדורה..." />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">קובץ PDF</label>
                  <div className="space-y-2">
                    <div className="relative">
                      <FileText size={18} className="absolute right-3 top-3 text-gray-400" />
                      <input type="text" value={displayUploadValue(paperForm.pdfUrl)} onChange={(e) => setPaperForm({ ...paperForm, pdfUrl: e.target.value })} className="w-full rounded-lg border border-gray-300 pl-4 pr-10 py-3 outline-none focus:ring-2 focus:ring-red-500" placeholder="קישור ישיר ל-PDF או קובץ שהועלה" />
                    </div>
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-100 px-4 py-3 text-sm font-black text-gray-700 transition hover:bg-gray-200">
                      <Upload size={16} /> העלה PDF מהמחשב
                      <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFileUpload(e, (url) => setPaperForm({ ...paperForm, pdfUrl: url }), 'weekly-paper')} />
                    </label>
                    {isDataUrl(paperForm.pdfUrl) && <p className="text-xs font-bold text-amber-700">קובץ מקומי זוהה. לפרסום יציב מומלץ להזין קישור ישיר ל-PDF.</p>}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">תמונת שער</label>
                  <div className="space-y-2">
                    <input type="text" value={displayUploadValue(paperForm.coverImageUrl)} onChange={(e) => setPaperForm({ ...paperForm, coverImageUrl: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" placeholder="קישור לתמונה או העלאה" />
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-100 px-4 py-3 text-sm font-black text-gray-700 transition hover:bg-gray-200">
                      <Upload size={16} /> העלה תמונת שער
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => setPaperForm({ ...paperForm, coverImageUrl: url }))} />
                    </label>
                    {isDataUrl(paperForm.coverImageUrl) && <p className="text-xs font-bold text-emerald-700">תמונת השער הועלתה ונשמרת כפי שהיא.</p>}
                  </div>
                </div>
                <button type="submit" className="flex items-center gap-2 rounded-lg bg-red-700 px-8 py-3 font-black text-white shadow-lg transition hover:bg-red-800"><Save size={18} /> פרסם מהדורה</button>
              </form>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
              <h3 className="mb-4 text-lg font-black text-gray-800 sm:text-xl">מהדורות פעילות ({weeklyPapers.length})</h3>
              <div className="space-y-4">
                {weeklyPapers.map((paper) => (
                  <div key={paper.id} className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                      <div className="h-20 w-16 overflow-hidden rounded-lg bg-gray-200">{paper.coverImageUrl ? <img src={paper.coverImageUrl} alt={paper.title} loading="lazy" decoding="async" className="h-full w-full object-cover" /> : null}</div>
                      <div>
                        <p className="font-black text-gray-900">{paper.title}</p>
                        <p className="text-sm font-bold text-red-700">{getWeeklyPaperDateLabel(paper)}</p>
                        <p className="mt-1 text-sm leading-6 text-gray-500">{paper.description}</p>
                      </div>
                    </div>
                    <button onClick={() => deleteWeeklyPaper(paper.id).then(() => showToast('המהדורה הוסרה'))} className="rounded-lg p-2 text-red-500 transition hover:bg-red-50" title="מחק מהדורה"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'board' && (
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_1.1fr]">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-black text-gray-800 sm:text-2xl"><Building2 size={24} className="text-red-700" /> העלאת מודעה ללוח בתנופה</h2>
              <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <h3 className="mb-4 text-lg font-black text-blue-900">מתווכים</h3>
                <form onSubmit={handleAgentSubmit} className="mb-5 grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-black text-gray-600">שם המתווך / עסק</label>
                    <input
                      type="text"
                      value={agentForm.name}
                      onChange={e => setAgentForm({ ...agentForm, name: e.target.value })}
                      placeholder="לדוגמה: משה כהן נדל״ן"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-black text-gray-600">טלפון</label>
                    <input
                      type="tel"
                      value={agentForm.phone}
                      onChange={e => setAgentForm({ ...agentForm, phone: e.target.value })}
                      placeholder="050-0000000"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-black text-gray-600">קישור לתמונה</label>
                    <input
                      type="text"
                      value={agentForm.imageUrl}
                      onChange={e => setAgentForm({ ...agentForm, imageUrl: e.target.value })}
                      placeholder="URL לתמונת פרופיל"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-blue-200 bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-black text-blue-900">או העלו תמונת מתווך מהמחשב</p>
                        <p className="text-xs font-bold text-blue-700">הקובץ יישמר בשרת ויוצג באתר אוטומטית</p>
                      </div>
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-blue-700 px-5 py-2.5 text-sm font-black text-white transition hover:bg-blue-800">
                        <Upload size={16} /> העלה תמונת מתווך
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleServerImageUpload(e, (url) => setAgentForm({ ...agentForm, imageUrl: url }), 'agents')} />
                      </label>
                    </div>
                  </div>
                  {agentForm.imageUrl && (
                    <div className="sm:col-span-3">
                      <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white p-3">
                        <img src={agentForm.imageUrl} alt="תצוגה מקדימה של המתווך" className="h-14 w-14 rounded-full object-cover" />
                        <div>
                          <p className="text-sm font-black text-gray-900">תמונת המתווך מוכנה לפרסום</p>
                          <p className="text-xs font-bold text-gray-500">{buildUploadName(agentForm.imageUrl)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="sm:col-span-3">
                    <button type="submit" className="rounded-full bg-blue-700 px-6 py-2.5 text-sm font-black text-white hover:bg-blue-800">
                      + הוסף מתווך
                    </button>
                  </div>
                </form>

                {agents.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {agents.map((agent) => (
                      <div
                        key={agent.id}
                        onClick={() => setSelectedAgentId(selectedAgentId === agent.id ? '' : agent.id)}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 transition ${
                          selectedAgentId === agent.id
                            ? 'border-blue-500 bg-blue-100'
                            : 'border-gray-200 bg-white hover:border-blue-300'
                        }`}
                      >
                        <img src={agent.imageUrl} alt={agent.name} className="h-10 w-10 rounded-full object-cover" />
                        <div>
                          <p className="text-sm font-black text-gray-900">{agent.name}</p>
                          <p className="text-xs text-gray-500" dir="ltr">{agent.phone}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void deleteAgent(agent.id).then(() => {
                              if (selectedAgentId === agent.id) setSelectedAgentId('');
                              showToast('המתווך הוסר');
                            });
                          }}
                          className="mr-2 rounded-full p-1 text-gray-400 hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {selectedAgentId && (
                  <p className="mt-3 text-sm font-bold text-blue-700">
                    ✓ המודעה הבאה תשויך למתווך: {agents.find(a => a.id === selectedAgentId)?.name}
                  </p>
                )}
              </div>
              <form onSubmit={handleBoardListingSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">קטגוריה להצגה באתר</label>
                    <select value={boardForm.listingCategory} onChange={(e) => setBoardForm({ ...boardForm, listingCategory: e.target.value as BoardListingCategory })} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500">
                      {Object.entries(BOARD_LISTING_CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">כותרת המודעה</label>
                    <input type="text" value={boardForm.title} onChange={(e) => setBoardForm({ ...boardForm, title: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">מיקום</label>
                    <input type="text" value={boardForm.location} onChange={(e) => setBoardForm({ ...boardForm, location: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" placeholder="שכונה / רחוב" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">סוג מודעה</label>
                    <select value={boardForm.dealType} onChange={(e) => setBoardForm({ ...boardForm, dealType: e.target.value as BoardListingDealType })} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500">
                      {Object.entries(DEAL_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">מחיר</label>
                    <input type="number" value={boardForm.price} onChange={(e) => setBoardForm({ ...boardForm, price: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">גודל במ"ר</label>
                    <input type="number" value={boardForm.sizeSqm} onChange={(e) => setBoardForm({ ...boardForm, sizeSqm: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">איש קשר</label>
                    <input type="text" value={boardForm.contactName} onChange={(e) => setBoardForm({ ...boardForm, contactName: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">טלפון / וואטסאפ</label>
                  <input type="tel" value={boardForm.contactPhone} onChange={(e) => setBoardForm({ ...boardForm, contactPhone: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">פרטים נוספים</label>
                  <textarea value={boardForm.details} onChange={(e) => setBoardForm({ ...boardForm, details: e.target.value })} className="h-28 w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" placeholder="קומה, חניה, שיפוץ, זמינות וכו'" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">תמונה</label>
                  <div className="space-y-2">
                    <input type="text" value={boardForm.imageUrl} onChange={(e) => setBoardForm({ ...boardForm, imageUrl: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500" placeholder="קישור לתמונה או העלאה" />
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-100 px-4 py-3 text-sm font-black text-gray-700 transition hover:bg-gray-200">
                      <Upload size={16} /> העלה תמונת דירה
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => setBoardForm({ ...boardForm, imageUrl: url }))} />
                    </label>
                  </div>
                </div>
                <label className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 font-black text-gray-700">
                  <input type="checkbox" checked={boardForm.hasBalcony} onChange={(e) => setBoardForm({ ...boardForm, hasBalcony: e.target.checked })} className="h-5 w-5 rounded text-red-600 focus:ring-red-500" />
                  יש מרפסת
                </label>
                <button type="submit" className="flex items-center gap-2 rounded-lg bg-red-700 px-8 py-3 font-black text-white shadow-lg transition hover:bg-red-800"><Save size={18} /> פרסם מודעה</button>
              </form>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
              <h3 className="mb-4 text-lg font-black text-gray-800 sm:text-xl">מודעות פעילות ({boardListings.length})</h3>
              <div className="space-y-4">
                {boardListings.map((listing) => (
                  <div key={listing.id} className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                      <div className="h-20 w-28 overflow-hidden rounded-lg bg-gray-200">{listing.imageUrl ? <img src={listing.imageUrl} alt={listing.title} loading="lazy" decoding="async" className="h-full w-full object-cover" /> : null}</div>
                      <div>
                        <p className="font-black text-gray-900">{listing.title}</p>
                        <p className="text-sm font-bold text-red-700">{BOARD_LISTING_CATEGORY_LABELS[listing.listingCategory]} · {DEAL_TYPE_LABELS[listing.dealType]} · {listing.location}</p>
                        <p className="mt-1 text-sm text-gray-500">₪{listing.price.toLocaleString('he-IL')} · {listing.sizeSqm} מ"ר · {listing.hasBalcony ? 'מרפסת' : 'ללא מרפסת'}</p>
                        {listing.agentId && (
                          <p className="mt-1 text-xs font-black text-blue-700">
                            מתווך משויך: {agents.find((agent) => agent.id === listing.agentId)?.name || 'המתווך הוסר'}
                          </p>
                        )}
                      </div>
                    </div>
                    <button onClick={() => deleteBoardListing(listing.id).then(() => showToast('המודעה הוסרה'))} className="rounded-lg p-2 text-red-500 transition hover:bg-red-50" title="מחק מודעה"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-xl font-black text-gray-800 sm:text-2xl">
                <MessageCircle size={24} className="text-red-700" /> תגובות ממתינות לאישור ({pendingComments.length})
              </h2>
              <button
                type="button"
                onClick={() => fetchPendingComments().then(() => showToast('הרשימה עודכנה'))}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
              >
                רענן רשימה
              </button>
            </div>
            {pendingComments.length > 0 ? (
              <div className="space-y-4">
                {pendingComments.map((comment) => (
                  <div key={comment.id} className="rounded-xl border border-yellow-100 bg-yellow-50 p-4 sm:p-5">
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <span className="block font-black text-gray-900">{comment.userName}</span>
                        <span className="text-xs font-bold text-gray-400">{comment.date}</span>
                        <span className="mr-3 text-xs font-bold text-gray-400">כתבה: {comment.postId}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveComment(comment.id).then(() => showToast('התגובה אושרה ופורסמה'))}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-black text-white transition hover:bg-green-700"
                        >
                          <CheckCircle size={16} /> אשר
                        </button>
                        <button
                          onClick={() => deleteComment(comment.id).then(() => showToast('התגובה נמחקה'))}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-black text-white transition hover:bg-red-700"
                        >
                          <Trash2 size={16} /> מחק
                        </button>
                      </div>
                    </div>
                    <p className="rounded-lg bg-white p-4 text-base leading-8 text-gray-700 border border-yellow-100">{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-16 text-center">
                <MessageCircle size={40} className="mx-auto mb-3 text-gray-200" />
                <p className="font-bold text-gray-500">אין תגובות הממתינות לאישור</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
            <h2 className="mb-6 text-xl font-black text-gray-800 sm:text-2xl">משתמשים רשומים ({registeredUsers.length})</h2>
            <div className="space-y-3 md:hidden">
              {registeredUsers.map((currentUser) => (
                <div key={currentUser.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-black text-gray-900">{currentUser.name}</p>
                      <p className="text-sm text-gray-600">{currentUser.email}</p>
                    </div>
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-black ${currentUser.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>{currentUser.role === 'admin' ? 'מנהל' : 'משתמש'}</span>
                  </div>
                  <p className="mt-2 text-xs font-bold text-gray-500">הצטרף: {currentUser.joinedDate || '-'}</p>
                </div>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-sm uppercase tracking-wider text-gray-600">
                    <th className="px-4 py-3 font-black">שם</th>
                    <th className="px-4 py-3 font-black">אימייל</th>
                    <th className="px-4 py-3 font-black">תפקיד</th>
                    <th className="px-4 py-3 font-black">תאריך הצטרפות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {registeredUsers.map((currentUser) => (
                    <tr key={currentUser.id} className="transition hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-gray-900">{currentUser.name}</td>
                      <td className="px-4 py-3 text-gray-600">{currentUser.email}</td>
                      <td className="px-4 py-3"><span className={`inline-block rounded px-2 py-0.5 text-xs font-black ${currentUser.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>{currentUser.role === 'admin' ? 'מנהל' : 'משתמש'}</span></td>
                      <td className="px-4 py-3 text-sm text-gray-500">{currentUser.joinedDate || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
            <h2 className="mb-6 text-xl font-black text-gray-800 sm:text-2xl">הודעות מהאתר ({contactMessages.length})</h2>
            <div className="space-y-4">
              {contactMessages.length > 0 ? contactMessages.map((message) => (
                <div key={message.id} className={`rounded-xl border p-4 sm:p-6 ${message.read ? 'border-gray-200 bg-gray-50' : 'border-red-100 border-r-4 border-r-red-500 bg-white shadow-sm'}`}>
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-black text-gray-900">{message.subject}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500 sm:gap-3">
                        <span>{message.name}</span>
                        <span>&bull;</span>
                        <span>{message.email}</span>
                        <span>&bull;</span>
                        <span>{message.phone || 'אין טלפון'}</span>
                      </div>
                    </div>
                    <span className="rounded border border-gray-100 bg-white px-2 py-1 text-xs font-bold text-gray-400">{message.date}</span>
                  </div>
                  <p className="rounded-lg bg-gray-50/50 p-4 text-sm leading-relaxed text-gray-700">{message.message}</p>
                </div>
              )) : <div className="py-20 text-center text-gray-400">אין הודעות חדשות.</div>}
            </div>
          </div>
        )}

        {activeTab === 'newsletter' && (
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black text-gray-800 sm:text-2xl">נרשמים לניוזלטר ({newsletterSubscribers.length})</h2>
              <button
                type="button"
                onClick={exportNewsletterSubscribers}
                disabled={newsletterSubscribers.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <Download size={16} />
                ייצוא לאקסל (CSV)
              </button>
            </div>

            {newsletterSubscribers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-sm uppercase tracking-wider text-gray-600">
                      <th className="px-4 py-3 font-black">אימייל</th>
                      <th className="px-4 py-3 font-black">תאריך הצטרפות</th>
                      <th className="px-4 py-3 font-black">סטטוס</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {newsletterSubscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="transition hover:bg-gray-50">
                        <td className="px-4 py-3 font-bold text-gray-900">{subscriber.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{subscriber.joinedDate}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded px-2 py-0.5 text-xs font-black ${subscriber.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {subscriber.isActive ? 'פעיל' : 'לא פעיל'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm font-bold text-gray-400">
                עדיין אין נרשמים לניוזלטר.
              </div>
            )}
          </div>
        )}

        {toastMessage && (
          <div className="fixed right-4 bottom-4 left-4 z-50 rounded-xl bg-green-600 px-4 py-3 text-center font-black text-white shadow-xl sm:left-auto sm:right-6 sm:bottom-6 sm:px-6" role="status" aria-live="polite">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};

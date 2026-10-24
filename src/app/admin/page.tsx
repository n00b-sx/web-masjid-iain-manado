'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AdminRole,
  CustomPage,
  FooterLayoutStyle,
  FundCategory,
  HeroSlide,
  IslamicQuote,
  ManualPrayerTimes,
  MenuItem,
  MosqueDatabase,
  MosqueEvent,
  MosqueService,
  NewsArticle,
  PrayerName,
} from '@/types/mosque';
import { formatRupiah, OBLIGATORY_PRAYERS, PRAYER_LIST } from '@/lib/prayer-times';
import ImageUploaderField from '@/components/ImageUploaderField';
import RichTextEditor from '@/components/RichTextEditor';
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu as MenuIcon,
  Newspaper,
  Plus,
  Save,
  Trash2,
  Tv,
  Wallet,
  Calendar,
  Clock,
  Briefcase,
  AlertCircle,
  Edit3,
} from 'lucide-react';

type AdminTab =
  | 'OVERVIEW'
  | 'HERO'
  | 'PRAYER'
  | 'EVENTS'
  | 'FINANCE'
  | 'SERVICES'
  | 'NEWS'
  | 'PAGES_MENUS'
  | 'TV_QUOTES';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function AdminDashboardPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Database State
  const [db, setDb] = useState<MosqueDatabase | null>(null);
  const [calculatedTimes, setCalculatedTimes] = useState<ManualPrayerTimes | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');

  // --- Form States for Adding/Editing Items ---
  // 1. New Hero Slide
  const [newSlide, setNewSlide] = useState<{
    title: string;
    subtitle: string;
    mediaType: 'IMAGE' | 'VIDEO';
    imageUrl: string;
    videoUrl: string;
    ctaText: string;
    ctaLink: string;
  }>({
    title: '',
    subtitle: '',
    mediaType: 'IMAGE',
    imageUrl: '',
    videoUrl: '',
    ctaText: 'Lihat Jadwal Sholat',
    ctaLink: '#jadwal-sholat',
  });

  // 2. New Event
  const [newEvent, setNewEvent] = useState<{
    title: string;
    speaker: string;
    dayLabel: string;
    time: string;
    location: string;
    category: MosqueEvent['category'];
    description: string;
    isToday: boolean;
  }>({
    title: '',
    speaker: '',
    dayLabel: 'Hari Ini (Ba’da Maghrib)',
    time: '18:15 - 19:15 WITA',
    location: "Ruang Utama Masjid Al Jami'ah",
    category: 'Kajian Rutin',
    description: '',
    isToday: true,
  });

  // 3. New Finance Transaction
  const [newTrx, setNewTrx] = useState<{
    date: string;
    description: string;
    category: FundCategory;
    type: 'IN' | 'OUT';
    amount: string;
    recordedBy: string;
  }>({
    date: new Date().toISOString().slice(0, 10),
    description: '',
    category: 'OPERASIONAL',
    type: 'IN',
    amount: '',
    recordedBy: 'Bendahara Takmir',
  });

  // 4. New Mosque Service
  const [newService, setNewService] = useState<{
    title: string;
    shortDescription: string;
    requirementsText: string;
    picName: string;
    picWhatsapp: string;
    iconName: MosqueService['iconName'];
  }>({
    title: '',
    shortDescription: '',
    requirementsText: '',
    picName: 'Bidang Kerumahtanggaan Takmir',
    picWhatsapp: '628114300000',
    iconName: 'Building2',
  });

  // 5. News Editor State (Create or Edit)
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsForm, setNewsForm] = useState<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: NewsArticle['category'];
    coverImageUrl: string;
    author: string;
    publishedAt: string;
    status: 'PUBLISHED' | 'DRAFT';
    seoTitle: string;
    seoDescription: string;
  }>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Kegiatan Masjid',
    coverImageUrl: '',
    author: "Humas Takmir Masjid Al Jami'ah",
    publishedAt: new Date().toISOString().slice(0, 10),
    status: 'PUBLISHED',
    seoTitle: '',
    seoDescription: '',
  });

  // 6. Custom Page Editor State (Create or Edit)
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [pageForm, setPageForm] = useState<{
    title: string;
    slug: string;
    subtitle: string;
    content: string;
    status: 'PUBLISHED' | 'DRAFT';
    seoTitle: string;
    seoDescription: string;
  }>({
    title: '',
    slug: '',
    subtitle: '',
    content: '',
    status: 'PUBLISHED',
    seoTitle: '',
    seoDescription: '',
  });

  // 7. New Menu & Sub-menu State
  const [newMenuLabel, setNewMenuLabel] = useState('');
  const [newMenuHref, setNewMenuHref] = useState('');
  const [subMenuParentId, setSubMenuParentId] = useState('');
  const [newSubMenuLabel, setNewSubMenuLabel] = useState('');
  const [newSubMenuHref, setNewSubMenuHref] = useState('');

  // 8. New Quote / Hadith for TV
  const [newQuote, setNewQuote] = useState({
    arabicText: '',
    translation: '',
    source: '',
  });
  const [newRunningText, setNewRunningText] = useState('');

  // 9. New Admin User Role
  const [newAdminUser, setNewAdminUser] = useState<{
    username: string;
    name: string;
    role: AdminRole;
  }>({
    username: '',
    name: '',
    role: 'HUMAS',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/mosque', { cache: 'no-store' });
      if (!res.ok) throw new Error('Gagal mengambil data CMS dari server.');
      const json = await res.json();
      setDb(json.db);
      setCalculatedTimes(json.prayerData?.times || null);
      if (json.db?.menus?.length > 0 && !subMenuParentId) {
        setSubMenuParentId(json.db.menus[0].id);
      }
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Gagal memuat database masjid.'
      );
    } finally {
      setLoading(false);
    }
  }, [subMenuParentId]);

  useEffect(() => {
    const savedSession =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('masjid_admin_auth')
        : null;
    if (savedSession === 'true') {
      setIsAuthenticated(true);
    }
    loadData();
  }, [loadData]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      usernameInput.trim().toLowerCase() === 'admin' &&
      passwordInput === 'aljamiah2026'
    ) {
      setIsAuthenticated(true);
      setAuthError(null);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('masjid_admin_auth', 'true');
      }
    } else {
      setAuthError(
        'Nama pengguna atau kata sandi tidak sesuai. Gunakan akun utama Takmir.'
      );
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('masjid_admin_auth');
    }
  };

  const persistDatabase = async (
    updatedDb: MosqueDatabase,
    customSuccessMsg = 'Perubahan berhasil disimpan dan langsung aktif di Website & TV Masjid.'
  ) => {
    setSaving(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      const res = await fetch('/api/mosque', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDb),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal menyimpan ke server.');
      }
      setDb(json.db);
      if (json.prayerData?.times) {
        setCalculatedTimes(json.prayerData.times);
      }
      setSaveMessage(customSuccessMsg);
      setTimeout(() => setSaveMessage(null), 5000);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan.'
      );
    } finally {
      setSaving(false);
    }
  };

  // --- LOGIN VIEW ---
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] text-[#1E1B18] flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-[#F2ECE1] border-2 border-[#1E1B18] rounded-xl p-6 sm:p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-lg bg-[#1E1B18] text-[#E8CFA0] flex items-center justify-center font-serif-heading font-bold text-xl">
              AJ
            </div>
            <div>
              <h1 className="font-serif-heading text-xl font-bold text-[#1E1B18]">
                Panel Admin Takmir
              </h1>
              <p className="text-xs text-[#524740]">
                Masjid Al Jami&apos;ah IAIN Manado
              </p>
            </div>
          </div>

          {authError && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-lg bg-[#A84A2E]/10 border border-[#A84A2E] text-xs font-semibold text-[#A84A2E] flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-user"
                className="block text-xs sm:text-sm font-semibold text-[#1E1B18] mb-1.5"
              >
                Username Admin
              </label>
              <input
                id="admin-user"
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Masukkan username (admin)..."
                className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm text-[#1E1B18]"
              />
            </div>

            <div>
              <label
                htmlFor="admin-pass"
                className="block text-xs sm:text-sm font-semibold text-[#1E1B18] mb-1.5"
              >
                Kata Sandi
              </label>
              <input
                id="admin-pass"
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Masukkan kata sandi..."
                className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm text-[#1E1B18]"
              />
            </div>

            <button
              type="submit"
              className="w-full px-5 py-3 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md bg-[#A84A2E] text-white font-semibold text-sm hover:bg-[#8E3B22] cursor-pointer"
            >
              <Lock className="w-4 h-4" aria-hidden="true" />
              <span>Masuk ke Dashboard CMS</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#DFD5C5] flex flex-col gap-2 text-xs text-[#524740]">
            <div className="flex items-center justify-between">
              <span>Akun Utama: <strong>admin</strong> / Sandi: <strong>aljamiah2026</strong></span>
              <button
                type="button"
                onClick={() => {
                  setUsernameInput('admin');
                  setPasswordInput('aljamiah2026');
                }}
                className="underline font-bold text-[#A84A2E] cursor-pointer py-1"
              >
                Isi Otomatis
              </button>
            </div>
            <Link
              href="/"
              className="text-center mt-2 py-2 rounded border border-[#1E1B18] text-[#1E1B18] font-semibold hover:bg-[#FAF7F2]"
            >
              Kembali ke Halaman Publik Masjid
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (loading || !db) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] text-[#1E1B18] flex items-center justify-center p-6">
        <p className="font-serif-heading text-xl font-bold">
          Memuat Data CMS Masjid Al Jami&apos;ah IAIN Manado...
        </p>
      </main>
    );
  }

  const pendingSubmissions = db.serviceSubmissions.filter(
    (s) => s.status === 'MENUNGGU'
  );
  const totalBalance = db.transactions.reduce(
    (acc, t) => (t.type === 'IN' ? acc + t.amount : acc - t.amount),
    0
  );

  // Navigation items for Admin Sidebar/Topbar
  const TABS: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'OVERVIEW',
      label: 'Verifikasi & Profil',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: pendingSubmissions.length > 0 ? pendingSubmissions.length : undefined,
    },
    {
      id: 'HERO',
      label: 'Hero Slideshow',
      icon: <ImageIcon className="w-4 h-4" />,
    },
    {
      id: 'PRAYER',
      label: 'Jadwal Sholat & Jumat',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: 'EVENTS',
      label: 'Kegiatan Masjid',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'FINANCE',
      label: 'Keuangan & QRIS',
      icon: <Wallet className="w-4 h-4" />,
    },
    {
      id: 'SERVICES',
      label: 'Layanan Masjid',
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      id: 'NEWS',
      label: 'Berita & Artikel',
      icon: <Newspaper className="w-4 h-4" />,
    },
    {
      id: 'PAGES_MENUS',
      label: 'Halaman & Menu',
      icon: <MenuIcon className="w-4 h-4" />,
    },
    {
      id: 'TV_QUOTES',
      label: 'Layar TV & Hadits',
      icon: <Tv className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E1B18] flex flex-col">
      {/* Admin Top Header */}
      <header className="bg-[#1E1B18] text-[#FAF7F2] border-b-2 border-[#A84A2E] px-4 sm:px-6 lg:px-8 py-4 dark-surface">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {db.mosqueProfile.logoUrl ? (
              <img
                src={db.mosqueProfile.logoUrl}
                alt={`Logo ${db.mosqueProfile.name}`}
                className="w-11 h-11 object-contain shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[#A84A2E] text-white flex items-center justify-center font-serif-heading font-bold text-lg">
                AJ
              </div>
            )}
            <div>
              <h1 className="font-serif-heading text-lg sm:text-xl font-bold text-[#FAF7F2]">
                CMS Admin Masjid Al Jami&apos;ah IAIN Manado
              </h1>
              <p className="text-xs text-[#E8CFA0]">
                Masuk sebagai: <strong>Admin Utama Takmir (SUPER_ADMIN)</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-2 min-h-[44px] inline-flex items-center gap-1.5 rounded-md bg-[#2C2520] border border-white/25 text-xs font-semibold text-[#FAF7F2] hover:border-[#E8CFA0]"
            >
              <span>Lihat Web Publik</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
            <Link
              href="/tv"
              target="_blank"
              className="px-3.5 py-2 min-h-[44px] inline-flex items-center gap-1.5 rounded-md bg-[#2C2520] border border-[#E8CFA0] text-xs font-semibold text-[#E8CFA0] hover:bg-[#E8CFA0] hover:text-[#1E1B18]"
            >
              <Tv className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Lihat Layar TV</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-2 min-h-[44px] inline-flex items-center gap-1.5 rounded-md bg-[#A84A2E] text-white text-xs font-semibold hover:bg-[#8E3B22] cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Module Selector Bar */}
      <div className="bg-[#F2ECE1] border-b border-[#DFD5C5] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-2 overflow-x-auto">
          {TABS.map((t) => {
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`px-3.5 py-2.5 min-h-[44px] inline-flex items-center gap-2 rounded-md text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#1E1B18] text-[#FAF7F2]'
                    : 'bg-[#FAF7F2] text-[#1E1B18] border border-[#DFD5C5] hover:border-[#1E1B18]'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
                {t.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#A84A2E] text-white">
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Save Feedback Banner */}
      {(saveMessage || saveError) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
          {saveMessage && (
            <div
              role="status"
              className="p-4 rounded-lg bg-[#3D4D33] text-white text-sm font-semibold flex items-center justify-between gap-3 shadow"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>{saveMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setSaveMessage(null)}
                className="text-xs underline cursor-pointer"
              >
                Tutup
              </button>
            </div>
          )}
          {saveError && (
            <div
              role="alert"
              className="p-4 rounded-lg bg-[#A84A2E] text-white text-sm font-semibold flex items-center justify-between gap-3 shadow"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>{saveError}</span>
              </div>
              <button
                type="button"
                onClick={() => setSaveError(null)}
                className="text-xs underline cursor-pointer"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* =========================================================
            TAB 1: OVERVIEW, SERVICE SUBMISSIONS & MOSQUE PROFILE
           ========================================================= */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-8">
            {/* Primary Decision Area: Incoming Online Service Requests */}
            <section className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="font-serif-heading text-xl font-bold text-[#1E1B18]">
                    Daftar Pengajuan Layanan Online Masuk ({db.serviceSubmissions.length})
                  </h2>
                  <p className="text-xs sm:text-sm text-[#524740]">
                    Tinjau permohonan peminjaman aula, konsultasi, atau layanan ZISWAF yang dikirim pengunjung dari halaman utama.
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-md bg-[#1E1B18] text-[#E8CFA0] text-xs font-bold">
                  Saldo Kas Aktif: {formatRupiah(totalBalance)}
                </span>
              </div>

              {db.serviceSubmissions.length === 0 ? (
                <div className="bg-[#FAF7F2] border border-[#DFD5C5] rounded-lg p-6 text-center">
                  <p className="text-sm font-bold text-[#1E1B18] mb-1">
                    Belum Ada Pengajuan Layanan Daring yang Masuk
                  </p>
                  <p className="text-xs text-[#524740]">
                    Setiap kali mahasiswa atau jamaah mengisi formulir pada seksi Layanan Masjid di halaman depan, datanya akan langsung muncul di tabel ini untuk disetujui.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto bg-[#FAF7F2] rounded-lg border border-[#DFD5C5]">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-[#DFD5C5] bg-[#F2ECE1] text-[#1E1B18] font-bold">
                        <th className="py-3 px-4">Tanggal Acara</th>
                        <th className="py-3 px-4">Layanan &amp; Keperluan</th>
                        <th className="py-3 px-4">Pemohon &amp; Unit</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Keputusan Takmir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DFD5C5]">
                      {db.serviceSubmissions.map((sub) => (
                        <tr key={sub.id}>
                          <td className="py-3 px-4 font-mono whitespace-nowrap">
                            {sub.requestedDate}
                          </td>
                          <td className="py-3 px-4">
                            <strong className="block text-[#1E1B18]">
                              {sub.serviceTitle}
                            </strong>
                            <span className="text-xs text-[#524740]">
                              {sub.notes || 'Tidak ada catatan tambahan'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <strong className="block text-[#1E1B18]">
                              {sub.applicantName}
                            </strong>
                            <span className="text-xs text-[#524740]">
                              {sub.applicantIdentity} &bull; WA: {sub.whatsapp}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded text-xs font-bold ${
                                sub.status === 'DISETUJUI'
                                  ? 'bg-[#3D4D33] text-white'
                                  : sub.status === 'DITOLAK'
                                  ? 'bg-[#A84A2E] text-white'
                                  : 'bg-[#1E1B18] text-[#E8CFA0]'
                              }`}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = {
                                  ...db,
                                  serviceSubmissions: db.serviceSubmissions.map((item) =>
                                    item.id === sub.id
                                      ? { ...item, status: 'DISETUJUI' as const }
                                      : item
                                  ),
                                };
                                persistDatabase(
                                  updated,
                                  `Pengajuan atas nama ${sub.applicantName} telah disetujui.`
                                );
                              }}
                              className="px-2.5 py-1.5 min-h-[36px] rounded bg-[#3D4D33] text-white text-xs font-semibold cursor-pointer"
                            >
                              Setujui
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = {
                                  ...db,
                                  serviceSubmissions: db.serviceSubmissions.map((item) =>
                                    item.id === sub.id
                                      ? { ...item, status: 'DITOLAK' as const }
                                      : item
                                  ),
                                };
                                persistDatabase(
                                  updated,
                                  `Status pengajuan ${sub.applicantName} diubah menjadi Ditolak.`
                                );
                              }}
                              className="px-2.5 py-1.5 min-h-[36px] rounded bg-[#A84A2E] text-white text-xs font-semibold cursor-pointer"
                            >
                              Tolak
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = {
                                  ...db,
                                  serviceSubmissions: db.serviceSubmissions.filter(
                                    (item) => item.id !== sub.id
                                  ),
                                };
                                persistDatabase(updated, 'Data pengajuan dihapus.');
                              }}
                              className="px-2.5 py-1.5 min-h-[36px] rounded border border-[#1E1B18] text-[#1E1B18] text-xs font-semibold cursor-pointer"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Mosque Identity & Multi-Role Ready Management */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <section className="lg:col-span-7 bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-6 space-y-4">
                <h2 className="font-serif-heading text-xl font-bold text-[#1E1B18]">
                  Identitas Resmi Masjid, Logo &amp; Kontak Sekretariat
                </h2>

                <div className="bg-[#FAF7F2] border border-[#DFD5C5] rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {db.mosqueProfile.logoUrl ? (
                        <img
                          src={db.mosqueProfile.logoUrl}
                          alt="Pratinjau Logo Masjid"
                          className="w-12 h-12 object-contain shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[#1E1B18] text-[#E8CFA0] flex items-center justify-center font-serif-heading font-bold text-xl shrink-0">
                          AJ
                        </div>
                      )}
                      <div>
                        <span className="block text-xs sm:text-sm font-bold text-[#1E1B18]">
                          Logo Resmi Masjid (Navbar, Footer &amp; Layar TV)
                        </span>
                        <span className="block text-xs text-[#524740]">
                          Unggah file logo (PNG transparan, JPG, WebP, atau SVG) atau kosongkan untuk memakai lencana inisial &ldquo;AJ&rdquo;.
                        </span>
                      </div>
                    </div>
                    {db.mosqueProfile.logoUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setDb({
                            ...db,
                            mosqueProfile: { ...db.mosqueProfile, logoUrl: '' },
                          })
                        }
                        className="px-3 py-1.5 rounded border border-[#A84A2E] text-[#A84A2E] text-xs font-semibold hover:bg-[#A84A2E] hover:text-white cursor-pointer shrink-0"
                      >
                        Reset ke &ldquo;AJ&rdquo;
                      </button>
                    )}
                  </div>

                  <ImageUploaderField
                    label="Unggah File Logo Baru atau Masukkan URL Logo"
                    mediaMode="IMAGE"
                    value={db.mosqueProfile.logoUrl || ''}
                    onChange={(newLogoUrl) =>
                      setDb({
                        ...db,
                        mosqueProfile: {
                          ...db.mosqueProfile,
                          logoUrl: newLogoUrl,
                        },
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                      Nama Masjid
                    </label>
                    <input
                      type="text"
                      value={db.mosqueProfile.name}
                      onChange={(e) =>
                        setDb({
                          ...db,
                          mosqueProfile: { ...db.mosqueProfile, name: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                      Institusi Kampus
                    </label>
                    <input
                      type="text"
                      value={db.mosqueProfile.institution}
                      onChange={(e) =>
                        setDb({
                          ...db,
                          mosqueProfile: {
                            ...db.mosqueProfile,
                            institution: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    Alamat Lengkap Kampus
                  </label>
                  <input
                    type="text"
                    value={db.mosqueProfile.address}
                    onChange={(e) =>
                      setDb({
                        ...db,
                        mosqueProfile: { ...db.mosqueProfile, address: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                      Nomor WhatsApp Sekretariat (Format 628...)
                    </label>
                    <input
                      type="text"
                      value={db.mosqueProfile.whatsapp}
                      onChange={(e) =>
                        setDb({
                          ...db,
                          mosqueProfile: {
                            ...db.mosqueProfile,
                            whatsapp: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                      Email Resmi Takmir
                    </label>
                    <input
                      type="email"
                      value={db.mosqueProfile.email}
                      onChange={(e) =>
                        setDb({
                          ...db,
                          mosqueProfile: { ...db.mosqueProfile, email: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    Deskripsi Singkat / Tagline SEO Masjid
                  </label>
                  <textarea
                    rows={2}
                    value={db.mosqueProfile.tagline}
                    onChange={(e) =>
                      setDb({
                        ...db,
                        mosqueProfile: { ...db.mosqueProfile, tagline: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-md bg-white border border-[#524740] text-sm"
                  />
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    persistDatabase(db, 'Identitas profil masjid berhasil disimpan.')
                  }
                  className="px-5 py-2.5 min-h-[44px] inline-flex items-center gap-2 rounded-md bg-[#A84A2E] text-white text-sm font-semibold hover:bg-[#8E3B22] cursor-pointer"
                >
                  <Save className="w-4 h-4" aria-hidden="true" />
                  <span>Simpan Profil Masjid</span>
                </button>
              </section>

              {/* Multi-Role Ready Admin User Registry */}
              <section className="lg:col-span-5 bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-6 space-y-4">
                <div>
                  <h2 className="font-serif-heading text-xl font-bold text-[#1E1B18]">
                    Manajemen Akun &amp; Role Pengurus
                  </h2>
                  <p className="text-xs text-[#524740]">
                    Saat ini aktif 1 akun Super Admin utama, dan siap ditambahkan role Bendahara atau Humas kapan saja.
                  </p>
                </div>

                <ul className="space-y-2">
                  {db.users.map((u) => (
                    <li
                      key={u.id}
                      className="bg-[#FAF7F2] border border-[#DFD5C5] rounded-lg p-3 flex items-center justify-between text-xs sm:text-sm"
                    >
                      <div>
                        <strong className="text-[#1E1B18] block">{u.name}</strong>
                        <span className="text-xs text-[#524740]">
                          Username: <code>{u.username}</code> &bull; Role:{' '}
                          <strong>{u.role}</strong>
                        </span>
                      </div>
                      {u.username !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = {
                              ...db,
                              users: db.users.filter((item) => item.id !== u.id),
                            };
                            persistDatabase(updated, 'Akun pengurus dihapus.');
                          }}
                          className="text-xs text-[#A84A2E] font-bold underline cursor-pointer"
                        >
                          Hapus
                        </button>
                      )}
                    </li>
                  ))}
                </ul>

                <div className="pt-3 border-t border-[#DFD5C5] space-y-3">
                  <span className="text-xs font-bold text-[#1E1B18] block">
                    Tambah Role Pengurus Baru (Pengembangan Tim Takmir):
                  </span>
                  <input
                    type="text"
                    value={newAdminUser.name}
                    onChange={(e) =>
                      setNewAdminUser({ ...newAdminUser, name: e.target.value })
                    }
                    placeholder="Nama Pengurus (contoh: Bendahara Kas)"
                    className="w-full px-3 py-2 min-h-[40px] rounded bg-white border border-[#524740] text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newAdminUser.username}
                      onChange={(e) =>
                        setNewAdminUser({ ...newAdminUser, username: e.target.value })
                      }
                      placeholder="Username login..."
                      className="px-3 py-2 min-h-[40px] rounded bg-white border border-[#524740] text-xs"
                    />
                    <select
                      value={newAdminUser.role}
                      onChange={(e) =>
                        setNewAdminUser({
                          ...newAdminUser,
                          role: e.target.value as AdminRole,
                        })
                      }
                      className="px-3 py-2 min-h-[40px] rounded bg-white border border-[#524740] text-xs"
                    >
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                      <option value="BENDAHARA">BENDAHARA</option>
                      <option value="HUMAS">HUMAS</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newAdminUser.username.trim() || !newAdminUser.name.trim())
                        return;
                      const updated: MosqueDatabase = {
                        ...db,
                        users: [
                          ...db.users,
                          {
                            id: `usr-${Date.now()}`,
                            username: newAdminUser.username.trim(),
                            name: newAdminUser.name.trim(),
                            role: newAdminUser.role,
                          },
                        ],
                      };
                      setNewAdminUser({ username: '', name: '', role: 'HUMAS' });
                      persistDatabase(updated, 'Role pengurus baru berhasil ditambahkan.');
                    }}
                    className="w-full px-4 py-2.5 min-h-[44px] rounded-md bg-[#1E1B18] text-[#FAF7F2] text-xs font-semibold cursor-pointer"
                  >
                    + Tambah Akun Role Pengurus
                  </button>
                </div>
              </section>
            </div>

            {/* Footer Model & Content Settings */}
            <section
              id="admin-footer-settings"
              className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-6 space-y-5"
            >
              <div>
                <h2 className="font-serif-heading text-xl font-bold text-[#1E1B18]">
                  Pengaturan Model &amp; Konten Footer Website
                </h2>
                <p className="text-xs sm:text-sm text-[#524740]">
                  Pilih model tata letak Footer (3 Kolom Lengkap, Simetris Rata Tengah, atau Ringkas Minimalis) serta atur elemen dan tautan yang ditampilkan di bagian bawah halaman.
                </p>
              </div>

              {/* 3 Visual Model Cards */}
              <div>
                <label className="block text-xs font-bold text-[#1E1B18] mb-2">
                  Pilih Model Tata Letak Footer:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      id: 'THREE_COLUMN' as FooterLayoutStyle,
                      title: 'Model 1: Klasik 3 Kolom Lengkap',
                      desc: 'Kolom kiri Identitas & Kontak, kolom tengah Halaman & Informasi, kolom kanan Akses Layar TV & Tautan Luar.',
                    },
                    {
                      id: 'CENTERED' as FooterLayoutStyle,
                      title: 'Model 2: Simetris Rata Tengah',
                      desc: 'Logo, Nama Masjid, Tagline, dan Kontak tersusun simetris di tengah layar dengan deretan menu horizontal.',
                    },
                    {
                      id: 'COMPACT' as FooterLayoutStyle,
                      title: 'Model 3: Ringkas Minimalis (2 Sisi)',
                      desc: 'Tampilan modern hemat ruang: Identitas masjid di kiri dan barisan navigasi horizontal di kanan.',
                    },
                  ].map((model) => {
                    const isSelected =
                      (db.footerSettings?.layoutStyle || 'THREE_COLUMN') ===
                      model.id;
                    return (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() =>
                          setDb({
                            ...db,
                            footerSettings: {
                              ...db.footerSettings,
                              layoutStyle: model.id,
                            },
                          })
                        }
                        className={`text-left p-4 rounded-xl border-2 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#1E1B18] text-[#FAF7F2] border-[#A84A2E]'
                            : 'bg-[#FAF7F2] text-[#1E1B18] border-[#DFD5C5] hover:border-[#1E1B18]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <strong className="font-serif-heading text-sm sm:text-base">
                            {model.title}
                          </strong>
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded bg-[#A84A2E] text-white text-[11px] font-bold">
                              Aktif
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs leading-relaxed ${
                            isSelected ? 'text-[#E8CFA0]' : 'text-[#524740]'
                          }`}
                        >
                          {model.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    Judul Kolom Navigasi Footer
                  </label>
                  <input
                    type="text"
                    value={db.footerSettings?.middleColumnTitle || ''}
                    onChange={(e) =>
                      setDb({
                        ...db,
                        footerSettings: {
                          ...db.footerSettings,
                          middleColumnTitle: e.target.value,
                        },
                      })
                    }
                    placeholder="Halaman & Informasi"
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    Judul Kolom Kanan (Model 3 Kolom)
                  </label>
                  <input
                    type="text"
                    value={db.footerSettings?.rightColumnTitle || ''}
                    onChange={(e) =>
                      setDb({
                        ...db,
                        footerSettings: {
                          ...db.footerSettings,
                          rightColumnTitle: e.target.value,
                        },
                      })
                    }
                    placeholder="Layar Informasi Masjid"
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    Teks Hak Cipta (Copyright)
                  </label>
                  <input
                    type="text"
                    value={db.footerSettings?.copyrightText || ''}
                    onChange={(e) =>
                      setDb({
                        ...db,
                        footerSettings: {
                          ...db.footerSettings,
                          copyrightText: e.target.value,
                        },
                      })
                    }
                    placeholder="Hak Cipta Dilindungi."
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  Deskripsi Kolom Kanan (Model 3 Kolom)
                </label>
                <textarea
                  rows={2}
                  value={db.footerSettings?.rightColumnDescription || ''}
                  onChange={(e) =>
                    setDb({
                      ...db,
                      footerSettings: {
                        ...db.footerSettings,
                        rightColumnDescription: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-md bg-white border border-[#524740] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    URL Website Kampus (Opsional)
                  </label>
                  <input
                    type="text"
                    value={db.footerSettings?.campusWebsiteUrl || ''}
                    onChange={(e) =>
                      setDb({
                        ...db,
                        footerSettings: {
                          ...db.footerSettings,
                          campusWebsiteUrl: e.target.value,
                        },
                      })
                    }
                    placeholder="https://iain-manado.ac.id"
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    URL Instagram Masjid (Opsional)
                  </label>
                  <input
                    type="text"
                    value={db.footerSettings?.instagramUrl || ''}
                    onChange={(e) =>
                      setDb({
                        ...db,
                        footerSettings: {
                          ...db.footerSettings,
                          instagramUrl: e.target.value,
                        },
                      })
                    }
                    placeholder="https://instagram.com/..."
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    URL YouTube Masjid (Opsional)
                  </label>
                  <input
                    type="text"
                    value={db.footerSettings?.youtubeUrl || ''}
                    onChange={(e) =>
                      setDb({
                        ...db,
                        footerSettings: {
                          ...db.footerSettings,
                          youtubeUrl: e.target.value,
                        },
                      })
                    }
                    placeholder="https://youtube.com/..."
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 bg-[#FAF7F2] p-4 rounded-lg border border-[#DFD5C5]">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#1E1B18] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={db.footerSettings?.showTvButton ?? true}
                    onChange={(e) =>
                      setDb({
                        ...db,
                        footerSettings: {
                          ...db.footerSettings,
                          showTvButton: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-[#A84A2E]"
                  />
                  <span>Tampilkan Tombol Layar Smart TV (/tv) di Footer</span>
                </label>

                <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#1E1B18] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={db.footerSettings?.showSitemapLink ?? true}
                    onChange={(e) =>
                      setDb({
                        ...db,
                        footerSettings: {
                          ...db.footerSettings,
                          showSitemapLink: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-[#A84A2E]"
                  />
                  <span>Tampilkan Tautan Peta Situs (Sitemap SEO) di Footer</span>
                </label>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  persistDatabase(
                    db,
                    'Model dan konfigurasi Footer berhasil disimpan.'
                  )
                }
                className="px-5 py-2.5 min-h-[44px] inline-flex items-center gap-2 rounded-md bg-[#A84A2E] text-white text-sm font-semibold hover:bg-[#8E3B22] cursor-pointer"
              >
                <Save className="w-4 h-4" aria-hidden="true" />
                <span>Simpan Pengaturan Footer</span>
              </button>
            </section>
          </div>
        )}

        {/* =========================================================
            TAB 2: HERO SLIDESHOW MANAGEMENT
           ========================================================= */}
        {activeTab === 'HERO' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Add New Hero Slide */}
            <section className="lg:col-span-5 bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-6 space-y-4 h-fit">
              <h2 className="font-serif-heading text-xl font-bold text-[#1E1B18]">
                Tambah Slide Hero Baru (Foto / Video)
              </h2>
              <p className="text-xs text-[#524740]">
                Pilih jenis media Foto atau Video Latar (seperti website Harvard). Anda dapat mengunggah file langsung dari perangkat maupun menempelkan tautan URL.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  Tipe Media Latar Belakang
                </label>
                <select
                  value={newSlide.mediaType}
                  onChange={(e) =>
                    setNewSlide({
                      ...newSlide,
                      mediaType: e.target.value as 'IMAGE' | 'VIDEO',
                    })
                  }
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm font-bold"
                >
                  <option value="IMAGE">Foto / Gambar (IMAGE)</option>
                  <option value="VIDEO">Video Latar Fullscreen (VIDEO)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  Judul Utama Slide
                </label>
                <input
                  type="text"
                  value={newSlide.title}
                  onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                  placeholder="Masukkan judul besar pada Hero..."
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  Subjudul / Keterangan Pendukung
                </label>
                <textarea
                  rows={3}
                  value={newSlide.subtitle}
                  onChange={(e) =>
                    setNewSlide({ ...newSlide, subtitle: e.target.value })
                  }
                  placeholder="Tuliskan penjelasan singkat di bawah judul..."
                  className="w-full px-3.5 py-2.5 rounded-md bg-white border border-[#524740] text-sm"
                />
              </div>

              {newSlide.mediaType === 'VIDEO' && (
                <ImageUploaderField
                  label="File Video Latar (.mp4 / .webm) atau URL Video *"
                  mediaMode="VIDEO"
                  value={newSlide.videoUrl}
                  onChange={(url) => setNewSlide({ ...newSlide, videoUrl: url })}
                />
              )}

              <ImageUploaderField
                label={
                  newSlide.mediaType === 'VIDEO'
                    ? 'Gambar Poster / Thumbnail Video (Opsional)'
                    : 'Gambar Background Slide (Upload atau URL) *'
                }
                mediaMode="IMAGE"
                value={newSlide.imageUrl}
                onChange={(url) => setNewSlide({ ...newSlide, imageUrl: url })}
              />

              <button
                type="button"
                onClick={() => {
                  if (!newSlide.title.trim()) {
                    setSaveError('Judul slide wajib diisi.');
                    return;
                  }
                  if (
                    newSlide.mediaType === 'VIDEO' &&
                    !newSlide.videoUrl.trim()
                  ) {
                    setSaveError('Mohon unggah atau masukkan URL Video terlebih dahulu.');
                    return;
                  }
                  if (
                    newSlide.mediaType === 'IMAGE' &&
                    !newSlide.imageUrl.trim()
                  ) {
                    setSaveError('Mohon unggah atau masukkan URL Gambar terlebih dahulu.');
                    return;
                  }
                  const created: HeroSlide = {
                    id: `slide-${Date.now()}`,
                    title: newSlide.title.trim(),
                    subtitle: newSlide.subtitle.trim(),
                    mediaType: newSlide.mediaType,
                    imageUrl:
                      newSlide.imageUrl.trim() ||
                      'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1920&q=85',
                    videoUrl: newSlide.videoUrl.trim(),
                    ctaText: newSlide.ctaText.trim() || 'Lihat Informasi',
                    ctaLink: newSlide.ctaLink.trim() || '#jadwal-sholat',
                    order: db.heroSlides.length + 1,
                    active: true,
                  };
                  const updated = {
                    ...db,
                    heroSlides: [...db.heroSlides, created],
                  };
                  setNewSlide({
                    title: '',
                    subtitle: '',
                    mediaType: 'IMAGE',
                    imageUrl: '',
                    videoUrl: '',
                    ctaText: 'Lihat Jadwal Sholat',
                    ctaLink: '#jadwal-sholat',
                  });
                  persistDatabase(updated, 'Slide Hero baru berhasil ditambahkan.');
                }}
                className="w-full px-5 py-3 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md bg-[#A84A2E] text-white text-sm font-semibold hover:bg-[#8E3B22] cursor-pointer"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Tambahkan ke Slideshow Hero</span>
              </button>
            </section>

            {/* Existing Slides List */}
            <section className="lg:col-span-7 space-y-4">
              <h2 className="font-serif-heading text-xl font-bold text-[#1E1B18]">
                Daftar Slide Hero Saat Ini ({db.heroSlides.length})
              </h2>

              {db.heroSlides.map((slide, idx) => {
                const isVideoSlide = slide.mediaType === 'VIDEO';
                return (
                  <div
                    key={slide.id}
                    className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-5 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {isVideoSlide && slide.videoUrl ? (
                        <video
                          src={slide.videoUrl}
                          poster={slide.imageUrl}
                          muted
                          controls
                          className="w-full sm:w-44 h-28 object-cover rounded-lg border border-[#DFD5C5] bg-[#1E1B18] shrink-0"
                        />
                      ) : (
                        <img
                          src={slide.imageUrl}
                          alt={slide.title}
                          className="w-full sm:w-44 h-28 object-cover rounded-lg border border-[#DFD5C5] bg-[#1E1B18] shrink-0"
                        />
                      )}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#A84A2E]">
                              Urutan Slide #{idx + 1}
                            </span>
                            <select
                              value={slide.mediaType || 'IMAGE'}
                              onChange={(e) =>
                                setDb({
                                  ...db,
                                  heroSlides: db.heroSlides.map((s) =>
                                    s.id === slide.id
                                      ? {
                                          ...s,
                                          mediaType: e.target.value as
                                            | 'IMAGE'
                                            | 'VIDEO',
                                        }
                                      : s
                                  ),
                                })
                              }
                              className="px-2 py-1 rounded bg-white border border-[#524740] text-xs font-bold"
                            >
                              <option value="IMAGE">Tipe: Foto</option>
                              <option value="VIDEO">Tipe: Video</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                              <input
                                type="checkbox"
                                checked={slide.active}
                                onChange={(e) => {
                                  const updated = {
                                    ...db,
                                    heroSlides: db.heroSlides.map((s) =>
                                      s.id === slide.id
                                        ? { ...s, active: e.target.checked }
                                        : s
                                    ),
                                  };
                                  persistDatabase(updated, 'Status slide diperbarui.');
                                }}
                              />
                              <span>Tampilkan</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = {
                                  ...db,
                                  heroSlides: db.heroSlides.filter(
                                    (s) => s.id !== slide.id
                                  ),
                                };
                                persistDatabase(updated, 'Slide Hero dihapus.');
                              }}
                              className="p-1.5 rounded text-[#A84A2E] hover:bg-[#FAF7F2] cursor-pointer"
                              aria-label={`Hapus slide ${slide.title}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) =>
                            setDb({
                              ...db,
                              heroSlides: db.heroSlides.map((s) =>
                                s.id === slide.id
                                  ? { ...s, title: e.target.value }
                                  : s
                              ),
                            })
                          }
                          className="w-full px-3 py-1.5 rounded bg-white border border-[#524740] text-sm font-bold"
                        />

                        <textarea
                          rows={2}
                          value={slide.subtitle}
                          onChange={(e) =>
                            setDb({
                              ...db,
                              heroSlides: db.heroSlides.map((s) =>
                                s.id === slide.id
                                  ? { ...s, subtitle: e.target.value }
                                  : s
                              ),
                            })
                          }
                          className="w-full px-3 py-1.5 rounded bg-white border border-[#524740] text-xs"
                        />
                      </div>
                    </div>

                    {isVideoSlide && (
                      <ImageUploaderField
                        label="File / URL Video Slide Ini (.mp4 / .webm)"
                        mediaMode="VIDEO"
                        value={slide.videoUrl || ''}
                        onChange={(newVideoUrl) =>
                          setDb({
                            ...db,
                            heroSlides: db.heroSlides.map((s) =>
                              s.id === slide.id
                                ? { ...s, videoUrl: newVideoUrl }
                                : s
                            ),
                          })
                        }
                      />
                    )}

                    <ImageUploaderField
                      label={
                        isVideoSlide
                          ? 'Gambar Poster / Thumbnail Video Slide Ini'
                          : 'Ubah Gambar Slide Ini (Upload File atau Ganti URL)'
                      }
                      mediaMode="IMAGE"
                      value={slide.imageUrl}
                      onChange={(newUrl) =>
                        setDb({
                          ...db,
                          heroSlides: db.heroSlides.map((s) =>
                            s.id === slide.id ? { ...s, imageUrl: newUrl } : s
                          ),
                        })
                      }
                    />

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          persistDatabase(
                            db,
                            'Perubahan slide Hero berhasil disimpan.'
                          )
                        }
                        className="px-4 py-2 min-h-[40px] inline-flex items-center gap-1.5 rounded bg-[#1E1B18] text-[#FAF7F2] text-xs font-semibold cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Simpan Perubahan Slide</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </section>
          </div>
        )}

        {/* =========================================================
            TAB 3: PRAYER SCHEDULE & JUMAT OFFICERS
           ========================================================= */}
        {activeTab === 'PRAYER' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <section className="lg:col-span-7 bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-6 space-y-5">
              <div>
                <h2 className="font-serif-heading text-xl font-bold text-[#1E1B18]">
                  Pengaturan Jadwal Sholat 5 Waktu (Kota Manado WITA)
                </h2>
                <p className="text-xs sm:text-sm text-[#524740]">
                  Sistem secara otomatis menarik jadwal Kemenag/Aladhan untuk koordinat Kota Manado. Anda dapat menambahkan koreksi menit, mengatur jeda Iqomah, atau mengaktifkan jadwal manual.
                </p>
              </div>

              <div className="bg-[#FAF7F2] p-4 rounded-lg border border-[#DFD5C5] flex items-center justify-between gap-4">
                <div>
                  <strong className="text-sm text-[#1E1B18] block">
                    Gunakan Override Jadwal Manual Sepenuhnya?
                  </strong>
                  <span className="text-xs text-[#524740]">
                    Jika dicentang, sistem tidak menggunakan API otomatis melainkan jam manual yang Anda ketik di bawah.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={db.prayerSettings.useManualOverride}
                  onChange={(e) =>
                    setDb({
                      ...db,
                      prayerSettings: {
                        ...db.prayerSettings,
                        useManualOverride: e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5 accent-[#A84A2E] cursor-pointer"
                />
              </div>

              {/* Table of 6 Prayer Times: Live Value, Offset Minutes, Iqomah Wait, Manual Time */}
              <div className="overflow-x-auto bg-[#FAF7F2] rounded-lg border border-[#DFD5C5]">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[#DFD5C5] bg-[#F2ECE1] font-bold text-[#1E1B18]">
                      <th className="py-3 px-3.5">Waktu</th>
                      <th className="py-3 px-3.5">Jam Tampil (WITA)</th>
                      <th className="py-3 px-3.5">Koreksi (+/- Menit)</th>
                      <th className="py-3 px-3.5">Jeda Iqomah (Menit)</th>
                      <th className="py-3 px-3.5">Jam Manual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFD5C5]">
                    {PRAYER_LIST.map((name) => {
                      const isObligatory = OBLIGATORY_PRAYERS.includes(name);
                      return (
                        <tr key={name}>
                          <td className="py-3 px-3.5 font-bold text-[#1E1B18]">
                            {name}
                          </td>
                          <td className="py-3 px-3.5 font-mono font-bold text-[#A84A2E]">
                            {calculatedTimes ? calculatedTimes[name] : db.prayerSettings.manualTimes[name]}
                          </td>
                          <td className="py-3 px-3.5">
                            <input
                              type="number"
                              min={-30}
                              max={30}
                              value={db.prayerSettings.offsets[name]}
                              onChange={(e) =>
                                setDb({
                                  ...db,
                                  prayerSettings: {
                                    ...db.prayerSettings,
                                    offsets: {
                                      ...db.prayerSettings.offsets,
                                      [name]: parseInt(e.target.value || '0', 10),
                                    },
                                  },
                                })
                              }
                              className="w-20 px-2.5 py-1.5 rounded bg-white border border-[#524740] font-mono text-xs"
                            />
                          </td>
                          <td className="py-3 px-3.5">
                            {isObligatory ? (
                              <input
                                type="number"
                                min={1}
                                max={45}
                                value={
                                  db.prayerSettings.iqomahMinutes[
                                    name as keyof typeof db.prayerSettings.iqomahMinutes
                                  ]
                                }
                                onChange={(e) =>
                                  setDb({
                                    ...db,
                                    prayerSettings: {
                                      ...db.prayerSettings,
                                      iqomahMinutes: {
                                        ...db.prayerSettings.iqomahMinutes,
                                        [name]: parseInt(e.target.value || '10', 10),
                                      },
                                    },
                                  })
                                }
                                className="w-20 px-2.5 py-1.5 rounded bg-white border border-[#524740] font-mono text-xs"
                              />
                            ) : (
                              <span className="text-xs text-[#524740]">-</span>
                            )}
                          </td>
                          <td className="py-3 px-3.5">
                            <input
                              type="time"
                              value={db.prayerSettings.manualTimes[name]}
                              onChange={(e) =>
                                setDb({
                                  ...db,
                                  prayerSettings: {
                                    ...db.prayerSettings,
                                    manualTimes: {
                                      ...db.prayerSettings.manualTimes,
                                      [name]: e.target.value,
                                    },
                                  },
                                })
                              }
                              className="px-2.5 py-1.5 rounded bg-white border border-[#524740] font-mono text-xs"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  persistDatabase(
                    db,
                    'Konfigurasi jadwal sholat & durasi Iqomah berhasil disimpan.'
                  )
                }
                className="px-5 py-3 min-h-[44px] inline-flex items-center gap-2 rounded-md bg-[#A84A2E] text-white text-sm font-semibold hover:bg-[#8E3B22] cursor-pointer"
              >
                <Save className="w-4 h-4" aria-hidden="true" />
                <span>Simpan Pengaturan Jadwal Sholat</span>
              </button>
            </section>

            {/* Right: Petugas Sholat Jumat */}
            <section className="lg:col-span-5 bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-6 space-y-4 h-fit">
              <h2 className="font-serif-heading text-xl font-bold text-[#1E1B18]">
                Jadwal Petugas Sholat Jumat
              </h2>
              <p className="text-xs text-[#524740]">
                Data petugas ini tampil di bagian bawah jadwal sholat Beranda dan pada Slide Agenda di Layar TV Masjid.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  Label Tanggal Jumat
                </label>
                <input
                  type="text"
                  value={db.prayerSettings.jumatOfficer.date}
                  onChange={(e) =>
                    setDb({
                      ...db,
                      prayerSettings: {
                        ...db.prayerSettings,
                        jumatOfficer: {
                          ...db.prayerSettings.jumatOfficer,
                          date: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="Contoh: Jumat, 25 Oktober 2026"
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  Judul / Tema Khutbah Jumat
                </label>
                <input
                  type="text"
                  value={db.prayerSettings.jumatOfficer.khatibTopic}
                  onChange={(e) =>
                    setDb({
                      ...db,
                      prayerSettings: {
                        ...db.prayerSettings,
                        jumatOfficer: {
                          ...db.prayerSettings.jumatOfficer,
                          khatibTopic: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  Nama Khatib
                </label>
                <input
                  type="text"
                  value={db.prayerSettings.jumatOfficer.khatib}
                  onChange={(e) =>
                    setDb({
                      ...db,
                      prayerSettings: {
                        ...db.prayerSettings,
                        jumatOfficer: {
                          ...db.prayerSettings.jumatOfficer,
                          khatib: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  Nama Imam Sholat Jumat
                </label>
                <input
                  type="text"
                  value={db.prayerSettings.jumatOfficer.imam}
                  onChange={(e) =>
                    setDb({
                      ...db,
                      prayerSettings: {
                        ...db.prayerSettings,
                        jumatOfficer: {
                          ...db.prayerSettings.jumatOfficer,
                          imam: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  Nama Muadzin &amp; Bilal
                </label>
                <input
                  type="text"
                  value={db.prayerSettings.jumatOfficer.muadzin}
                  onChange={(e) =>
                    setDb({
                      ...db,
                      prayerSettings: {
                        ...db.prayerSettings,
                        jumatOfficer: {
                          ...db.prayerSettings.jumatOfficer,
                          muadzin: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                />
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  persistDatabase(db, 'Data petugas Sholat Jumat berhasil diperbarui.')
                }
                className="w-full px-5 py-3 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md bg-[#1E1B18] text-[#FAF7F2] text-sm font-semibold cursor-pointer"
              >
                <Save className="w-4 h-4" aria-hidden="true" />
                <span>Simpan Petugas Jumat</span>
              </button>
            </section>
          </div>
        )}

        {/* =========================================================
            TAB 4: MOSQUE EVENTS MANAGEMENT
           ========================================================= */}
        {activeTab === 'EVENTS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <section className="lg:col-span-5 bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-6 space-y-4 h-fit">
              <h2 className="font-serif-heading text-xl font-bold text-[#1E1B18]">
                Tambah Jadwal Kegiatan Masjid
              </h2>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  Nama Kegiatan / Kajian *
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Contoh: Kajian Tafsir Jalalain..."
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  Nama Pemateri / Ustadz / Penyelenggara *
                </label>
                <input
                  type="text"
                  value={newEvent.speaker}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, speaker: e.target.value })
                  }
                  placeholder="Masukkan nama ustadz atau penyelenggara..."
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    Label Hari Pelaksanaan
                  </label>
                  <input
                    type="text"
                    value={newEvent.dayLabel}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, dayLabel: e.target.value })
                    }
                    placeholder="Hari Ini / Setiap Kamis Malam"
                    className="w-full px-3 py-2 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    Waktu (WITA)
                  </label>
                  <input
                    type="text"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    placeholder="18:15 - 19:15 WITA"
                    className="w-full px-3 py-2 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    Lokasi di Masjid
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, location: e.target.value })
                    }
                    className="w-full px-3 py-2 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    Kategori Kegiatan
                  </label>
                  <select
                    value={newEvent.category}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        category: e.target.value as MosqueEvent['category'],
                      })
                    }
                    className="w-full px-3 py-2 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                  >
                    <option value="Kajian Rutin">Kajian Rutin</option>
                    <option value="Kegiatan Kampus">Kegiatan Kampus</option>
                    <option value="Tahsin & Tahfidz">Tahsin &amp; Tahfidz</option>
                    <option value="Sosial & Ramadhan">Sosial &amp; Ramadhan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  Deskripsi Singkat Kegiatan
                </label>
                <textarea
                  rows={2}
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  placeholder="Jelaskan materi atau sasaran peserta..."
                  className="w-full px-3.5 py-2 rounded-md bg-white border border-[#524740] text-sm"
                />
              </div>

              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#1E1B18] cursor-pointer">
                <input
                  type="checkbox"
                  checked={newEvent.isToday}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, isToday: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#A84A2E]"
                />
                <span>Tandai sebagai &ldquo;Kegiatan Hari Ini&rdquo;</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  if (!newEvent.title.trim() || !newEvent.speaker.trim()) {
                    setSaveError('Nama kegiatan dan Pemateri wajib diisi.');
                    return;
                  }
                  const created: MosqueEvent = {
                    id: `evt-${Date.now()}`,
                    title: newEvent.title.trim(),
                    speaker: newEvent.speaker.trim(),
                    date: newEvent.isToday
                      ? new Date().toISOString().slice(0, 10)
                      : 'RUTIN',
                    dayLabel: newEvent.dayLabel.trim(),
                    time: newEvent.time.trim(),
                    location: newEvent.location.trim(),
                    category: newEvent.category,
                    description: newEvent.description.trim(),
                    isToday: newEvent.isToday,
                  };
                  const updated = {
                    ...db,
                    events: [created, ...db.events],
                  };
                  setNewEvent({
                    ...newEvent,
                    title: '',
                    speaker: '',
                    description: '',
                  });
                  persistDatabase(updated, 'Agenda kegiatan baru berhasil ditambahkan.');
                }}
                className="w-full px-5 py-3 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md bg-[#A84A2E] text-white text-sm font-semibold hover:bg-[#8E3B22] cursor-pointer"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Simpan Agenda Kegiatan</span>
              </button>
            </section>

            {/* List of Existing Events */}
            <section className="lg:col-span-7 space-y-4">
              <h2 className="font-serif-heading text-xl font-bold text-[#1E1B18]">
                Daftar Agenda Kegiatan Masjid ({db.events.length})
              </h2>

              {db.events.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          ev.isToday
                            ? 'bg-[#A84A2E] text-white'
                            : 'bg-[#1E1B18] text-[#E8CFA0]'
                        }`}
                      >
                        {ev.isToday ? 'Hari Ini' : 'Rutin Pekanan'}
                      </span>
                      <span className="text-xs font-semibold text-[#524740]">
                        {ev.dayLabel} &bull; {ev.time}
                      </span>
                    </div>
                    <h3 className="font-serif-heading text-lg font-bold text-[#1E1B18]">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-[#524740]">
                      Pemateri: <strong>{ev.speaker}</strong> &bull; Lokasi:{' '}
                      {ev.location}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = {
                          ...db,
                          events: db.events.map((item) =>
                            item.id === ev.id
                              ? { ...item, isToday: !item.isToday }
                              : item
                          ),
                        };
                        persistDatabase(updated, 'Status hari kegiatan diperbarui.');
                      }}
                      className="px-3 py-2 min-h-[40px] rounded border border-[#1E1B18] text-xs font-semibold cursor-pointer"
                    >
                      {ev.isToday ? 'Jadikan Rutin' : 'Jadikan Hari Ini'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = {
                          ...db,
                          events: db.events.filter((item) => item.id !== ev.id),
                        };
                        persistDatabase(updated, 'Agenda kegiatan dihapus.');
                      }}
                      className="p-2 min-h-[40px] rounded bg-[#A84A2E] text-white cursor-pointer"
                      aria-label={`Hapus kegiatan ${ev.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {/* =========================================================
            TAB 5: FINANCE & QRIS MANAGEMENT
           ========================================================= */}
        {activeTab === 'FINANCE' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Record New Transaction */}
              <section className="lg:col-span-5 bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-6 space-y-4">
                <h2 className="font-serif-heading text-xl font-bold text-[#1E1B18]">
                  Catat Transaksi Kas Baru
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                      Tanggal Transaksi
                    </label>
                    <input
                      type="date"
                      value={newTrx.date}
                      onChange={(e) => setNewTrx({ ...newTrx, date: e.target.value })}
                      className="w-full px-3 py-2 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                      Jenis Mutasi
                    </label>
                    <select
                      value={newTrx.type}
                      onChange={(e) =>
                        setNewTrx({
                          ...newTrx,
                          type: e.target.value as 'IN' | 'OUT',
                        })
                      }
                      className="w-full px-3 py-2 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm font-bold"
                    >
                      <option value="IN">Pemasukan (+)</option>
                      <option value="OUT">Pengeluaran (-)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    Kategori Pos Kas Masjid
                  </label>
                  <select
                    value={newTrx.category}
                    onChange={(e) =>
                      setNewTrx({
                        ...newTrx,
                        category: e.target.value as FundCategory,
                      })
                    }
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                  >
                    <option value="OPERASIONAL">
                      1. Kas Operasional &amp; Kemakmuran
                    </option>
                    <option value="PEMBANGUNAN">
                      2. Kas Pembangunan &amp; Inventaris
                    </option>
                    <option value="SOSIAL_ZISWAF">
                      3. Kas Sosial, ZISWAF &amp; Santunan
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    Nominal Rupiah (Tanpa Titik/Koma) *
                  </label>
                  <input
                    type="number"
                    min={1000}
                    value={newTrx.amount}
                    onChange={(e) => setNewTrx({ ...newTrx, amount: e.target.value })}
                    placeholder="Contoh: 2500000"
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    Uraian / Keterangan Transaksi *
                  </label>
                  <input
                    type="text"
                    value={newTrx.description}
                    onChange={(e) =>
                      setNewTrx({ ...newTrx, description: e.target.value })
                    }
                    placeholder="Contoh: Penerimaan Infaq Sholat Jumat Pekan Ke-4..."
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const nominal = parseInt(newTrx.amount, 10);
                    if (!newTrx.description.trim() || isNaN(nominal) || nominal <= 0) {
                      setSaveError(
                        'Mohon isi uraian transaksi dan nominal Rupiah yang valid.'
                      );
                      return;
                    }
                    const updated: MosqueDatabase = {
                      ...db,
                      transactions: [
                        {
                          id: `trx-${Date.now()}`,
                          date: newTrx.date,
                          description: newTrx.description.trim(),
                          category: newTrx.category,
                          type: newTrx.type,
                          amount: nominal,
                          recordedBy: newTrx.recordedBy,
                        },
                        ...db.transactions,
                      ],
                    };
                    setNewTrx({ ...newTrx, description: '', amount: '' });
                    persistDatabase(
                      updated,
                      'Transaksi kas berhasil dicatat dan saldo otomatis diperbarui.'
                    );
                  }}
                  className="w-full px-5 py-3 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md bg-[#A84A2E] text-white text-sm font-semibold hover:bg-[#8E3B22] cursor-pointer"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>Simpan Transaksi Kas</span>
                </button>
              </section>

              {/* Configure Bank Account & Upload QRIS */}
              <section className="lg:col-span-7 bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-6 space-y-4">
                <h2 className="font-serif-heading text-xl font-bold text-[#1E1B18]">
                  Pengaturan Rekening Infaq &amp; Gambar QRIS Masjid
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                      Nama Bank Syariah / Konvensional
                    </label>
                    <input
                      type="text"
                      value={db.donationInfo.bankName}
                      onChange={(e) =>
                        setDb({
                          ...db,
                          donationInfo: {
                            ...db.donationInfo,
                            bankName: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                      Nomor Rekening Resmi Masjid
                    </label>
                    <input
                      type="text"
                      value={db.donationInfo.accountNumber}
                      onChange={(e) =>
                        setDb({
                          ...db,
                          donationInfo: {
                            ...db.donationInfo,
                            accountNumber: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                      Atas Nama Rekening
                    </label>
                    <input
                      type="text"
                      value={db.donationInfo.accountHolder}
                      onChange={(e) =>
                        setDb({
                          ...db,
                          donationInfo: {
                            ...db.donationInfo,
                            accountHolder: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                      WhatsApp Konfirmasi Infaq
                    </label>
                    <input
                      type="text"
                      value={db.donationInfo.confirmationWhatsapp}
                      onChange={(e) =>
                        setDb({
                          ...db,
                          donationInfo: {
                            ...db.donationInfo,
                            confirmationWhatsapp: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                    />
                  </div>
                </div>

                <ImageUploaderField
                  label="Gambar Barcode QRIS Masjid (Tampil di Web & Layar TV)"
                  value={db.donationInfo.qrisImageUrl}
                  onChange={(url) =>
                    setDb({
                      ...db,
                      donationInfo: { ...db.donationInfo, qrisImageUrl: url },
                    })
                  }
                />

                <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#1E1B18] pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={db.donationInfo.isSampleDataNotice}
                    onChange={(e) =>
                      setDb({
                        ...db,
                        donationInfo: {
                          ...db.donationInfo,
                          isSampleDataNotice: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-[#A84A2E]"
                  />
                  <span>
                    Tampilkan pita pemberitahuan &ldquo;Catatan Data Simulasi Awal&rdquo; di halaman publik
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() =>
                    persistDatabase(
                      db,
                      'Informasi rekening dan QRIS masjid berhasil diperbarui.'
                    )
                  }
                  className="px-5 py-3 min-h-[44px] inline-flex items-center gap-2 rounded-md bg-[#1E1B18] text-[#FAF7F2] text-sm font-semibold cursor-pointer"
                >
                  <Save className="w-4 h-4" aria-hidden="true" />
                  <span>Simpan Info Rekening &amp; QRIS</span>
                </button>
              </section>
            </div>

            {/* Transaction Ledger Management Table */}
            <section className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-6">
              <h3 className="font-serif-heading text-lg font-bold text-[#1E1B18] mb-4">
                Daftar Riwayat Transaksi Kas ({db.transactions.length})
              </h3>
              <div className="overflow-x-auto bg-[#FAF7F2] rounded-lg border border-[#DFD5C5]">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[#DFD5C5] bg-[#F2ECE1] font-bold">
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Uraian</th>
                      <th className="py-3 px-4">Pos Kas</th>
                      <th className="py-3 px-4 text-right">Nominal</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFD5C5]">
                    {db.transactions.map((t) => (
                      <tr key={t.id}>
                        <td className="py-3 px-4 font-mono whitespace-nowrap">
                          {t.date}
                        </td>
                        <td className="py-3 px-4 font-medium">{t.description}</td>
                        <td className="py-3 px-4">{t.category}</td>
                        <td className="py-3 px-4 text-right font-bold whitespace-nowrap">
                          {t.type === 'IN' ? (
                            <span className="text-[#3D4D33]">
                              +{formatRupiah(t.amount)}
                            </span>
                          ) : (
                            <span className="text-[#A84A2E]">
                              -{formatRupiah(t.amount)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = {
                                ...db,
                                transactions: db.transactions.filter(
                                  (item) => item.id !== t.id
                                ),
                              };
                              persistDatabase(updated, 'Transaksi kas dihapus.');
                            }}
                            className="px-2.5 py-1 rounded bg-[#A84A2E] text-white text-xs font-semibold cursor-pointer"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* =========================================================
            TAB 6: MOSQUE SERVICES CATALOG MANAGEMENT
           ========================================================= */}
        {activeTab === 'SERVICES' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <section className="lg:col-span-5 bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-6 space-y-4 h-fit">
              <h2 className="font-serif-heading text-xl font-bold text-[#1E1B18]">
                Tambah Layanan Masjid Baru
              </h2>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  Nama Layanan *
                </label>
                <input
                  type="text"
                  value={newService.title}
                  onChange={(e) =>
                    setNewService({ ...newService, title: e.target.value })
                  }
                  placeholder="Contoh: Layanan Akad Nikah & Konseling..."
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  Deskripsi Layanan *
                </label>
                <textarea
                  rows={3}
                  value={newService.shortDescription}
                  onChange={(e) =>
                    setNewService({
                      ...newService,
                      shortDescription: e.target.value,
                    })
                  }
                  placeholder="Jelaskan fasilitas atau manfaat layanan..."
                  className="w-full px-3.5 py-2 rounded-md bg-white border border-[#524740] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  Daftar Syarat / Ketentuan (Pisahkan dengan baris baru Enter)
                </label>
                <textarea
                  rows={3}
                  value={newService.requirementsText}
                  onChange={(e) =>
                    setNewService({
                      ...newService,
                      requirementsText: e.target.value,
                    })
                  }
                  placeholder={'Mengisi formulir pengajuan\nMenyerahkan surat permohonan'}
                  className="w-full px-3.5 py-2 rounded-md bg-white border border-[#524740] text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    Nama Bidang / PIC Pengurus
                  </label>
                  <input
                    type="text"
                    value={newService.picName}
                    onChange={(e) =>
                      setNewService({ ...newService, picName: e.target.value })
                    }
                    className="w-full px-3 py-2 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    Nomor WA PIC (628...)
                  </label>
                  <input
                    type="text"
                    value={newService.picWhatsapp}
                    onChange={(e) =>
                      setNewService({ ...newService, picWhatsapp: e.target.value })
                    }
                    className="w-full px-3 py-2 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!newService.title.trim() || !newService.shortDescription.trim()) {
                    setSaveError('Nama layanan dan Deskripsi wajib diisi.');
                    return;
                  }
                  const reqs = newService.requirementsText
                    .split('\n')
                    .map((s) => s.trim())
                    .filter(Boolean);
                  const created: MosqueService = {
                    id: `srv-${Date.now()}`,
                    title: newService.title.trim(),
                    slug: slugify(newService.title),
                    shortDescription: newService.shortDescription.trim(),
                    requirements:
                      reqs.length > 0
                        ? reqs
                        : ['Mengisi formulir pengajuan layanan secara daring'],
                    picName: newService.picName.trim(),
                    picWhatsapp: newService.picWhatsapp.trim(),
                    iconName: newService.iconName,
                    active: true,
                  };
                  const updated = {
                    ...db,
                    services: [...db.services, created],
                  };
                  setNewService({
                    ...newService,
                    title: '',
                    shortDescription: '',
                    requirementsText: '',
                  });
                  persistDatabase(updated, 'Layanan masjid baru berhasil ditambahkan.');
                }}
                className="w-full px-5 py-3 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md bg-[#A84A2E] text-white text-sm font-semibold cursor-pointer"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Tambahkan Layanan Masjid</span>
              </button>
            </section>

            <section className="lg:col-span-7 space-y-4">
              <h2 className="font-serif-heading text-xl font-bold text-[#1E1B18]">
                Daftar Layanan Masjid Aktif ({db.services.length})
              </h2>
              {db.services.map((srv) => (
                <div
                  key={srv.id}
                  className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-serif-heading text-lg font-bold text-[#1E1B18]">
                      {srv.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#524740] mb-2">
                      {srv.shortDescription}
                    </p>
                    <span className="text-xs text-[#A84A2E] font-semibold">
                      PIC: {srv.picName} (+{srv.picWhatsapp})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...db,
                        services: db.services.filter((s) => s.id !== srv.id),
                      };
                      persistDatabase(updated, 'Layanan dihapus.');
                    }}
                    className="px-3 py-2 min-h-[40px] rounded bg-[#A84A2E] text-white text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    Hapus Layanan
                  </button>
                </div>
              ))}
            </section>
          </div>
        )}

        {/* =========================================================
            TAB 7: NEWS & ARTICLES (WORDPRESS-STYLE RICH TEXT + SEO)
           ========================================================= */}
        {activeTab === 'NEWS' && (
          <div className="space-y-8">
            <section className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-serif-heading text-xl font-bold text-[#1E1B18]">
                    {editingNewsId
                      ? 'Edit Berita / Artikel Masjid'
                      : 'Tulis & Publikasikan Berita Baru'}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#524740]">
                    Setiap berita berstatus PUBLISHED otomatis muncul di Beranda, halaman Arsip (/berita), halaman baca mandiri (/berita/[slug]), dan terdaftar di Sitemap SEO Google.
                  </p>
                </div>
                {editingNewsId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNewsId(null);
                      setNewsForm({
                        title: '',
                        slug: '',
                        excerpt: '',
                        content: '',
                        category: 'Kegiatan Masjid',
                        coverImageUrl: '',
                        author: "Humas Takmir Masjid Al Jami'ah",
                        publishedAt: new Date().toISOString().slice(0, 10),
                        status: 'PUBLISHED',
                        seoTitle: '',
                        seoDescription: '',
                      });
                    }}
                    className="px-3.5 py-2 rounded border border-[#1E1B18] text-xs font-semibold cursor-pointer"
                  >
                    Batal Edit (Buat Baru)
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    Judul Berita / Artikel *
                  </label>
                  <input
                    type="text"
                    value={newsForm.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewsForm({
                        ...newsForm,
                        title: val,
                        slug: editingNewsId ? newsForm.slug : slugify(val),
                      });
                    }}
                    placeholder="Masukkan judul berita..."
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm font-bold"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    URL Slug Ramah SEO
                  </label>
                  <input
                    type="text"
                    value={newsForm.slug}
                    onChange={(e) =>
                      setNewsForm({ ...newsForm, slug: slugify(e.target.value) })
                    }
                    placeholder="slug-judul-berita"
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    Kategori Berita
                  </label>
                  <select
                    value={newsForm.category}
                    onChange={(e) =>
                      setNewsForm({
                        ...newsForm,
                        category: e.target.value as NewsArticle['category'],
                      })
                    }
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                  >
                    <option value="Kegiatan Masjid">Kegiatan Masjid</option>
                    <option value="Pengumuman Takmir">Pengumuman Takmir</option>
                    <option value="Khutbah & Kajian">Khutbah &amp; Kajian</option>
                    <option value="Warta Kampus">Warta Kampus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    Penulis / Redaksi
                  </label>
                  <input
                    type="text"
                    value={newsForm.author}
                    onChange={(e) =>
                      setNewsForm({ ...newsForm, author: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    Status Publikasi
                  </label>
                  <select
                    value={newsForm.status}
                    onChange={(e) =>
                      setNewsForm({
                        ...newsForm,
                        status: e.target.value as 'PUBLISHED' | 'DRAFT',
                      })
                    }
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm font-bold"
                  >
                    <option value="PUBLISHED">PUBLISHED (Tayang Publik)</option>
                    <option value="DRAFT">DRAFT (Simpan Konsep)</option>
                  </select>
                </div>
              </div>

              <ImageUploaderField
                label="Gambar Sampul Utama Berita (Upload File atau URL)"
                value={newsForm.coverImageUrl}
                onChange={(url) =>
                  setNewsForm({ ...newsForm, coverImageUrl: url })
                }
              />

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  Ringkasan Singkat Berita (Excerpt) *
                </label>
                <textarea
                  rows={2}
                  value={newsForm.excerpt}
                  onChange={(e) =>
                    setNewsForm({ ...newsForm, excerpt: e.target.value })
                  }
                  placeholder="Tuliskan ringkasan 1-2 kalimat yang akan tampil pada kartu berita dan preview WhatsApp..."
                  className="w-full px-3.5 py-2 rounded-md bg-white border border-[#524740] text-sm"
                />
              </div>

              <RichTextEditor
                label="Editor Isi Berita Lengkap:"
                value={newsForm.content}
                onChange={(html) => setNewsForm({ ...newsForm, content: html })}
              />

              {/* Optional SEO Meta Box */}
              <div className="bg-[#FAF7F2] border border-[#DFD5C5] rounded-lg p-4 space-y-3">
                <span className="text-xs font-bold text-[#A84A2E] block">
                  Pengaturan Optimasi Mesin Pencari Google (SEO Meta - Opsional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                      SEO Meta Title
                    </label>
                    <input
                      type="text"
                      value={newsForm.seoTitle}
                      onChange={(e) =>
                        setNewsForm({ ...newsForm, seoTitle: e.target.value })
                      }
                      placeholder="Otomatis mengikuti judul jika dikosongkan..."
                      className="w-full px-3 py-2 min-h-[40px] rounded bg-white border border-[#524740] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                      SEO Meta Description
                    </label>
                    <input
                      type="text"
                      value={newsForm.seoDescription}
                      onChange={(e) =>
                        setNewsForm({
                          ...newsForm,
                          seoDescription: e.target.value,
                        })
                      }
                      placeholder="Otomatis mengikuti ringkasan jika dikosongkan..."
                      className="w-full px-3 py-2 min-h-[40px] rounded bg-white border border-[#524740] text-xs"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!newsForm.title.trim() || !newsForm.content.trim()) {
                    setSaveError('Judul dan Isi Berita wajib diisi.');
                    return;
                  }
                  const finalSlug =
                    newsForm.slug.trim() || slugify(newsForm.title);
                  const articleObj: NewsArticle = {
                    id: editingNewsId || `news-${Date.now()}`,
                    title: newsForm.title.trim(),
                    slug: finalSlug,
                    excerpt:
                      newsForm.excerpt.trim() ||
                      newsForm.title.trim(),
                    content: newsForm.content,
                    category: newsForm.category,
                    coverImageUrl:
                      newsForm.coverImageUrl.trim() ||
                      'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80',
                    author: newsForm.author.trim(),
                    publishedAt: newsForm.publishedAt,
                    status: newsForm.status,
                    seoTitle: newsForm.seoTitle.trim() || newsForm.title.trim(),
                    seoDescription:
                      newsForm.seoDescription.trim() ||
                      newsForm.excerpt.trim(),
                  };

                  const updatedNews = editingNewsId
                    ? db.news.map((n) =>
                        n.id === editingNewsId ? articleObj : n
                      )
                    : [articleObj, ...db.news];

                  setEditingNewsId(null);
                  setNewsForm({
                    title: '',
                    slug: '',
                    excerpt: '',
                    content: '',
                    category: 'Kegiatan Masjid',
                    coverImageUrl: '',
                    author: "Humas Takmir Masjid Al Jami'ah",
                    publishedAt: new Date().toISOString().slice(0, 10),
                    status: 'PUBLISHED',
                    seoTitle: '',
                    seoDescription: '',
                  });

                  persistDatabase(
                    { ...db, news: updatedNews },
                    `Berita "${articleObj.title}" berhasil disimpan di halaman /berita/${articleObj.slug}.`
                  );
                }}
                className="px-6 py-3 min-h-[44px] inline-flex items-center gap-2 rounded-md bg-[#A84A2E] text-white text-sm font-semibold hover:bg-[#8E3B22] cursor-pointer"
              >
                <Save className="w-4 h-4" aria-hidden="true" />
                <span>
                  {editingNewsId
                    ? 'Simpan Perubahan Berita'
                    : 'Publikasikan Berita Sekarang'}
                </span>
              </button>
            </section>

            {/* List of Existing News Articles */}
            <section className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-6 space-y-4">
              <h3 className="font-serif-heading text-lg font-bold text-[#1E1B18]">
                Daftar Berita &amp; Artikel Masjid ({db.news.length})
              </h3>
              <div className="space-y-3">
                {db.news.map((art) => (
                  <div
                    key={art.id}
                    className="bg-[#FAF7F2] border border-[#DFD5C5] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs mb-1">
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            art.status === 'PUBLISHED'
                              ? 'bg-[#3D4D33] text-white'
                              : 'bg-[#1E1B18] text-[#E8CFA0]'
                          }`}
                        >
                          {art.status}
                        </span>
                        <span className="font-semibold text-[#A84A2E]">
                          {art.category}
                        </span>
                        <span className="text-[#524740]">
                          &bull; {art.publishedAt} &bull; URL:{' '}
                          <code>/berita/{art.slug}</code>
                        </span>
                      </div>
                      <h4 className="font-serif-heading font-bold text-base text-[#1E1B18]">
                        {art.title}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Link
                        href={`/berita/${art.slug}`}
                        target="_blank"
                        className="px-3 py-1.5 min-h-[38px] inline-flex items-center gap-1 rounded border border-[#1E1B18] text-xs font-semibold"
                      >
                        <span>Lihat</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNewsId(art.id);
                          setNewsForm({
                            title: art.title,
                            slug: art.slug,
                            excerpt: art.excerpt,
                            content: art.content,
                            category: art.category,
                            coverImageUrl: art.coverImageUrl,
                            author: art.author,
                            publishedAt: art.publishedAt,
                            status: art.status,
                            seoTitle: art.seoTitle || '',
                            seoDescription: art.seoDescription || '',
                          });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-3 py-1.5 min-h-[38px] inline-flex items-center gap-1 rounded bg-[#1E1B18] text-[#FAF7F2] text-xs font-semibold cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = {
                            ...db,
                            news: db.news.filter((n) => n.id !== art.id),
                          };
                          persistDatabase(updated, 'Artikel berita dihapus.');
                        }}
                        className="px-3 py-1.5 min-h-[38px] inline-flex items-center rounded bg-[#A84A2E] text-white text-xs font-semibold cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* =========================================================
            TAB 8: DYNAMIC PAGES (/p/[slug]) & MENU / SUB-MENU MANAGER
           ========================================================= */}
        {activeTab === 'PAGES_MENUS' && (
          <div className="space-y-10">
            {/* Part A: Dynamic Pages Builder (/p/[slug]) */}
            <section className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-serif-heading text-xl font-bold text-[#1E1B18]">
                    {editingPageId
                      ? 'Edit Halaman Dinamis'
                      : 'Buat Halaman Website Baru (Otomatis Membuat Route /p/[slug])'}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#524740]">
                    Buat halaman baru seperti Sejarah Masjid, Struktur Takmir, SOP Peminjaman, atau Laporan Tahunan, lalu hubungkan ke Menu / Sub-Menu di bawah.
                  </p>
                </div>
                {editingPageId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPageId(null);
                      setPageForm({
                        title: '',
                        slug: '',
                        subtitle: '',
                        content: '',
                        status: 'PUBLISHED',
                        seoTitle: '',
                        seoDescription: '',
                      });
                    }}
                    className="px-3 py-1.5 rounded border border-[#1E1B18] text-xs font-semibold cursor-pointer"
                  >
                    Batal Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-7">
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    Judul Halaman Baru *
                  </label>
                  <input
                    type="text"
                    value={pageForm.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPageForm({
                        ...pageForm,
                        title: val,
                        slug: editingPageId ? pageForm.slug : slugify(val),
                      });
                    }}
                    placeholder="Contoh: Visi Misi & Sejarah Masjid..."
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm font-bold"
                  />
                </div>
                <div className="md:col-span-5">
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    Alamat URL Halaman (/p/[slug])
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-[#FAF7F2] border border-r-0 border-[#524740] rounded-l-md text-xs font-mono text-[#524740]">
                      /p/
                    </span>
                    <input
                      type="text"
                      value={pageForm.slug}
                      onChange={(e) =>
                        setPageForm({ ...pageForm, slug: slugify(e.target.value) })
                      }
                      placeholder="visi-misi-masjid"
                      className="w-full px-3 py-2.5 min-h-[44px] rounded-r-md bg-white border border-[#524740] text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  Subjudul / Deskripsi Singkat Halaman
                </label>
                <input
                  type="text"
                  value={pageForm.subtitle}
                  onChange={(e) =>
                    setPageForm({ ...pageForm, subtitle: e.target.value })
                  }
                  placeholder="Penjelasan singkat di bawah judul halaman..."
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                />
              </div>

              <RichTextEditor
                label="Isi Konten Halaman:"
                value={pageForm.content}
                onChange={(html) => setPageForm({ ...pageForm, content: html })}
              />

              <button
                type="button"
                onClick={() => {
                  if (!pageForm.title.trim() || !pageForm.content.trim()) {
                    setSaveError('Judul halaman dan Isi konten wajib diisi.');
                    return;
                  }
                  const finalSlug =
                    pageForm.slug.trim() || slugify(pageForm.title);
                  const newPageObj: CustomPage = {
                    id: editingPageId || `page-${Date.now()}`,
                    title: pageForm.title.trim(),
                    slug: finalSlug,
                    subtitle: pageForm.subtitle.trim(),
                    content: pageForm.content,
                    updatedAt: new Date().toISOString().slice(0, 10),
                    status: 'PUBLISHED',
                    seoTitle: pageForm.seoTitle || pageForm.title.trim(),
                    seoDescription:
                      pageForm.seoDescription || pageForm.subtitle.trim(),
                  };

                  const updatedPages = editingPageId
                    ? db.customPages.map((p) =>
                        p.id === editingPageId ? newPageObj : p
                      )
                    : [...db.customPages, newPageObj];

                  setEditingPageId(null);
                  setPageForm({
                    title: '',
                    slug: '',
                    subtitle: '',
                    content: '',
                    status: 'PUBLISHED',
                    seoTitle: '',
                    seoDescription: '',
                  });

                  persistDatabase(
                    { ...db, customPages: updatedPages },
                    `Halaman "/p/${newPageObj.slug}" berhasil diterbitkan.`
                  );
                }}
                className="px-6 py-3 min-h-[44px] inline-flex items-center gap-2 rounded-md bg-[#A84A2E] text-white text-sm font-semibold cursor-pointer"
              >
                <FileText className="w-4 h-4" aria-hidden="true" />
                <span>
                  {editingPageId
                    ? 'Simpan Perubahan Halaman'
                    : 'Terbitkan Halaman Baru'}
                </span>
              </button>

              {/* Existing Custom Pages List */}
              <div className="pt-4 border-t border-[#DFD5C5] space-y-2.5">
                <span className="text-xs font-bold text-[#1E1B18] block">
                  Halaman Dinamis yang Sudah Dibuat ({db.customPages.length}):
                </span>
                {db.customPages.map((pg) => (
                  <div
                    key={pg.id}
                    className="bg-[#FAF7F2] border border-[#DFD5C5] rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <strong className="text-sm text-[#1E1B18] block">
                        {pg.title}
                      </strong>
                      <span className="text-xs font-mono text-[#A84A2E]">
                        URL: /p/{pg.slug}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/p/${pg.slug}`}
                        target="_blank"
                        className="px-3 py-1.5 rounded border border-[#1E1B18] text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <span>Buka Halaman</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPageId(pg.id);
                          setPageForm({
                            title: pg.title,
                            slug: pg.slug,
                            subtitle: pg.subtitle,
                            content: pg.content,
                            status: pg.status,
                            seoTitle: pg.seoTitle || '',
                            seoDescription: pg.seoDescription || '',
                          });
                        }}
                        className="px-3 py-1.5 rounded bg-[#1E1B18] text-[#FAF7F2] text-xs font-semibold cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = {
                            ...db,
                            customPages: db.customPages.filter(
                              (item) => item.id !== pg.id
                            ),
                          };
                          persistDatabase(updated, 'Halaman dihapus.');
                        }}
                        className="px-3 py-1.5 rounded bg-[#A84A2E] text-white text-xs font-semibold cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Part B: Navbar Menu & Sub-Menu Manager */}
            <section className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-6 space-y-6">
              <div>
                <h2 className="font-serif-heading text-xl font-bold text-[#1E1B18]">
                  Menu &amp; Sub-Menu Manager (Navigasi Atas Website)
                </h2>
                <p className="text-xs sm:text-sm text-[#524740]">
                  Tambahkan Menu Utama atau Sub-Menu Dropdown di bawah menu tertentu seperti pada WordPress.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Add Top-Level Menu */}
                <div className="bg-[#FAF7F2] border border-[#DFD5C5] rounded-lg p-4 space-y-3">
                  <h3 className="font-bold text-sm text-[#1E1B18]">
                    1. Tambah Menu Utama Baru
                  </h3>
                  <input
                    type="text"
                    value={newMenuLabel}
                    onChange={(e) => setNewMenuLabel(e.target.value)}
                    placeholder="Nama Menu (contoh: Galeri / Unduhan)"
                    className="w-full px-3 py-2 min-h-[40px] rounded bg-white border border-[#524740] text-xs sm:text-sm"
                  />
                  <input
                    type="text"
                    value={newMenuHref}
                    onChange={(e) => setNewMenuHref(e.target.value)}
                    placeholder="Tujuan URL (contoh: /p/profil-masjid atau /#keuangan)"
                    className="w-full px-3 py-2 min-h-[40px] rounded bg-white border border-[#524740] text-xs sm:text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newMenuLabel.trim() || !newMenuHref.trim()) return;
                      const created: MenuItem = {
                        id: `menu-${Date.now()}`,
                        label: newMenuLabel.trim(),
                        href: newMenuHref.trim(),
                        order: db.menus.length + 1,
                        children: [],
                      };
                      setNewMenuLabel('');
                      setNewMenuHref('');
                      persistDatabase(
                        { ...db, menus: [...db.menus, created] },
                        'Menu utama baru berhasil ditambahkan ke Navbar.'
                      );
                    }}
                    className="w-full px-4 py-2.5 min-h-[42px] rounded bg-[#1E1B18] text-[#FAF7F2] text-xs font-semibold cursor-pointer"
                  >
                    + Tambah Menu Utama
                  </button>
                </div>

                {/* Add Sub-Menu Dropdown */}
                <div className="bg-[#FAF7F2] border border-[#DFD5C5] rounded-lg p-4 space-y-3">
                  <h3 className="font-bold text-sm text-[#1E1B18]">
                    2. Tambah Sub-Menu (Dropdown) di Bawah Menu Utama
                  </h3>
                  <select
                    value={subMenuParentId}
                    onChange={(e) => setSubMenuParentId(e.target.value)}
                    className="w-full px-3 py-2 min-h-[40px] rounded bg-white border border-[#524740] text-xs sm:text-sm font-semibold"
                  >
                    {db.menus.map((m) => (
                      <option key={m.id} value={m.id}>
                        Induk Menu: {m.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={newSubMenuLabel}
                    onChange={(e) => setNewSubMenuLabel(e.target.value)}
                    placeholder="Nama Sub-Menu (contoh: Struktur Takmir)"
                    className="w-full px-3 py-2 min-h-[40px] rounded bg-white border border-[#524740] text-xs sm:text-sm"
                  />

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubMenuHref}
                      onChange={(e) => setNewSubMenuHref(e.target.value)}
                      placeholder="URL tujuan (contoh: /p/struktur-takmir)"
                      className="flex-1 px-3 py-2 min-h-[40px] rounded bg-white border border-[#524740] text-xs font-mono"
                    />
                    <select
                      onChange={(e) => {
                        if (e.target.value) setNewSubMenuHref(e.target.value);
                      }}
                      value=""
                      className="px-2 py-2 rounded bg-[#F2ECE1] border border-[#524740] text-xs"
                    >
                      <option value="">Pilih Halaman...</option>
                      {db.customPages.map((p) => (
                        <option key={p.id} value={`/p/${p.slug}`}>
                          /p/{p.slug}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        !subMenuParentId ||
                        !newSubMenuLabel.trim() ||
                        !newSubMenuHref.trim()
                      )
                        return;
                      const updatedMenus = db.menus.map((m) => {
                        if (m.id !== subMenuParentId) return m;
                        return {
                          ...m,
                          children: [
                            ...m.children,
                            {
                              id: `sub-${Date.now()}`,
                              label: newSubMenuLabel.trim(),
                              href: newSubMenuHref.trim(),
                            },
                          ],
                        };
                      });
                      setNewSubMenuLabel('');
                      setNewSubMenuHref('');
                      persistDatabase(
                        { ...db, menus: updatedMenus },
                        'Sub-menu dropdown berhasil ditambahkan.'
                      );
                    }}
                    className="w-full px-4 py-2.5 min-h-[42px] rounded bg-[#A84A2E] text-white text-xs font-semibold cursor-pointer"
                  >
                    + Tambahkan ke Sub-Menu Dropdown
                  </button>
                </div>
              </div>

              {/* Current Menu Hierarchy Tree */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-[#1E1B18]">
                  Struktur Menu &amp; Sub-Menu Aktif di Navbar:
                </h3>
                {db.menus
                  .sort((a, b) => a.order - b.order)
                  .map((menu) => (
                    <div
                      key={menu.id}
                      className="bg-[#FAF7F2] border border-[#DFD5C5] rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <strong className="text-sm text-[#1E1B18]">
                            {menu.label}
                          </strong>{' '}
                          <code className="text-xs text-[#524740]">
                            ({menu.href})
                          </code>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = {
                              ...db,
                              menus: db.menus.filter((m) => m.id !== menu.id),
                            };
                            persistDatabase(updated, 'Menu utama dihapus.');
                          }}
                          className="text-xs font-bold text-[#A84A2E] underline cursor-pointer"
                        >
                          Hapus Menu
                        </button>
                      </div>

                      {menu.children.length > 0 && (
                        <ul className="mt-2.5 pl-4 border-l-2 border-[#A84A2E] space-y-1.5">
                          {menu.children.map((sub) => (
                            <li
                              key={sub.id}
                              className="flex items-center justify-between text-xs bg-[#F2ECE1] px-3 py-1.5 rounded"
                            >
                              <span>
                                &rarr; <strong>{sub.label}</strong>{' '}
                                <code>({sub.href})</code>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedMenus = db.menus.map((m) =>
                                    m.id === menu.id
                                      ? {
                                          ...m,
                                          children: m.children.filter(
                                            (c) => c.id !== sub.id
                                          ),
                                        }
                                      : m
                                  );
                                  persistDatabase(
                                    { ...db, menus: updatedMenus },
                                    'Sub-menu dihapus.'
                                  );
                                }}
                                className="text-[#A84A2E] font-bold underline cursor-pointer"
                              >
                                Hapus
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
              </div>

              <div className="pt-4 border-t border-[#DFD5C5]">
                <div className="bg-[#FAF7F2] border border-[#DFD5C5] rounded-lg p-4 space-y-2">
                  <strong className="block text-xs sm:text-sm font-bold text-[#1E1B18]">
                    Ingin Mengubah Model Tata Letak Footer atau Logo Masjid?
                  </strong>
                  <p className="text-xs text-[#524740]">
                    Anda dapat memilih 3 model tampilan Footer (3 Kolom Lengkap, Simetris Rata Tengah, atau Ringkas Minimalis) serta mengunggah Logo Masjid pada menu Verifikasi &amp; Profil.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('OVERVIEW');
                      setTimeout(() => {
                        document
                          .getElementById('admin-footer-settings')
                          ?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="w-full px-4 py-2.5 min-h-[40px] rounded-md bg-[#1E1B18] text-[#FAF7F2] text-xs font-semibold cursor-pointer"
                  >
                    Buka Pengaturan Model Footer &amp; Logo Masjid
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =========================================================
            TAB 9: SMART TV DISPLAY SETTINGS & ISLAMIC QUOTES / HADITH
           ========================================================= */}
        {activeTab === 'TV_QUOTES' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: TV Display Controls & Running Text */}
            <section className="lg:col-span-5 bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-6 space-y-5 h-fit">
              <div>
                <h2 className="font-serif-heading text-xl font-bold text-[#1E1B18]">
                  Pengaturan Layar Smart TV Masjid (/tv)
                </h2>
                <p className="text-xs text-[#524740]">
                  Atur durasi rotasi slide otomatis, saklar slide aktif, penanda bunyi beep Iqomah, serta pengumuman teks berjalan.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  Durasi Pergantian Tiap Slide di TV (Detik)
                </label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={db.tvSettings.slideDurationSeconds}
                  onChange={(e) =>
                    setDb({
                      ...db,
                      tvSettings: {
                        ...db.tvSettings,
                        slideDurationSeconds: parseInt(e.target.value || '12', 10),
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm font-mono"
                />
              </div>

              <div className="bg-[#FAF7F2] p-4 rounded-lg border border-[#DFD5C5] space-y-2.5 text-xs sm:text-sm font-semibold text-[#1E1B18]">
                <span className="block text-xs font-bold text-[#A84A2E]">
                  Pilih Slide yang Ditampilkan di Layar TV:
                </span>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={db.tvSettings.showFinanceSlide}
                    onChange={(e) =>
                      setDb({
                        ...db,
                        tvSettings: {
                          ...db.tvSettings,
                          showFinanceSlide: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-[#A84A2E]"
                  />
                  <span>Tampilkan Slide 1: Infografis Keuangan &amp; QRIS</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={db.tvSettings.showQuoteSlide}
                    onChange={(e) =>
                      setDb({
                        ...db,
                        tvSettings: {
                          ...db.tvSettings,
                          showQuoteSlide: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-[#A84A2E]"
                  />
                  <span>Tampilkan Slide 2: Kutipan Ayat Al-Qur&apos;an &amp; Hadits</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={db.tvSettings.showEventSlide}
                    onChange={(e) =>
                      setDb({
                        ...db,
                        tvSettings: {
                          ...db.tvSettings,
                          showEventSlide: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-[#A84A2E]"
                  />
                  <span>Tampilkan Slide 3: Kegiatan Hari Ini &amp; Petugas Jumat</span>
                </label>

                <hr className="border-[#DFD5C5] my-2" />

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={db.tvSettings.enableBeepSound}
                    onChange={(e) =>
                      setDb({
                        ...db,
                        tvSettings: {
                          ...db.tvSettings,
                          enableBeepSound: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-[#A84A2E]"
                  />
                  <span>Bunyikan Suara Beep Saat Waktu Adzan / Iqomah Tiba</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  Pesan Himbauan Luruskan Shaf (Saat Hitung Mundur Iqomah)
                </label>
                <textarea
                  rows={2}
                  value={db.tvSettings.shafWarningText}
                  onChange={(e) =>
                    setDb({
                      ...db,
                      tvSettings: {
                        ...db.tvSettings,
                        shafWarningText: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-md bg-white border border-[#524740] text-xs sm:text-sm"
                />
              </div>

              {/* Running Text Management */}
              <div className="space-y-2.5 pt-2 border-t border-[#DFD5C5]">
                <label className="block text-xs font-bold text-[#1E1B18]">
                  Teks Berjalan (Running Text Bawah TV):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRunningText}
                    onChange={(e) => setNewRunningText(e.target.value)}
                    placeholder="Tambahkan pengumuman singkat baru..."
                    className="flex-1 px-3 py-2 min-h-[40px] rounded bg-white border border-[#524740] text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newRunningText.trim()) return;
                      const updated = {
                        ...db,
                        tvSettings: {
                          ...db.tvSettings,
                          runningText: [
                            ...db.tvSettings.runningText,
                            newRunningText.trim(),
                          ],
                        },
                      };
                      setNewRunningText('');
                      persistDatabase(updated, 'Running text ditambahkan.');
                    }}
                    className="px-3.5 py-2 rounded bg-[#1E1B18] text-[#FAF7F2] text-xs font-semibold cursor-pointer"
                  >
                    + Tambah
                  </button>
                </div>

                <ul className="space-y-1.5">
                  {db.tvSettings.runningText.map((rt, i) => (
                    <li
                      key={i}
                      className="bg-[#FAF7F2] p-2.5 rounded border border-[#DFD5C5] flex items-center justify-between gap-2 text-xs"
                    >
                      <span>{rt}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = {
                            ...db,
                            tvSettings: {
                              ...db.tvSettings,
                              runningText: db.tvSettings.runningText.filter(
                                (_, idx) => idx !== i
                              ),
                            },
                          };
                          persistDatabase(updated, 'Item running text dihapus.');
                        }}
                        className="text-[#A84A2E] font-bold underline shrink-0 cursor-pointer"
                      >
                        Hapus
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() =>
                  persistDatabase(
                    db,
                    'Konfigurasi Layar Smart TV Masjid berhasil disimpan.'
                  )
                }
                className="w-full px-5 py-3 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md bg-[#A84A2E] text-white text-sm font-semibold cursor-pointer"
              >
                <Save className="w-4 h-4" aria-hidden="true" />
                <span>Simpan Pengaturan TV</span>
              </button>
            </section>

            {/* Right: Islamic Quotes / Hadith Management */}
            <section className="lg:col-span-7 space-y-6">
              <div className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-6 space-y-4">
                <h2 className="font-serif-heading text-xl font-bold text-[#1E1B18]">
                  Tambah Kutipan Ayat Al-Qur&apos;an / Hadits Layar TV
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    Teks Arab (Opsional / Disarankan)
                  </label>
                  <textarea
                    rows={2}
                    dir="rtl"
                    value={newQuote.arabicText}
                    onChange={(e) =>
                      setNewQuote({ ...newQuote, arabicText: e.target.value })
                    }
                    placeholder="Tuliskan teks ayat atau hadits dalam huruf Arab..."
                    className="w-full px-3.5 py-2 rounded-md bg-white border border-[#524740] font-arabic text-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    Terjemahan Bahasa Indonesia *
                  </label>
                  <textarea
                    rows={2}
                    value={newQuote.translation}
                    onChange={(e) =>
                      setNewQuote({ ...newQuote, translation: e.target.value })
                    }
                    placeholder="Masukkan arti ayat atau hadits..."
                    className="w-full px-3.5 py-2 rounded-md bg-white border border-[#524740] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                    Sumber Riwayat / Surat &amp; Nomor Ayat *
                  </label>
                  <input
                    type="text"
                    value={newQuote.source}
                    onChange={(e) =>
                      setNewQuote({ ...newQuote, source: e.target.value })
                    }
                    placeholder="Contoh: QS. Al-Mujadilah: 11 atau HR. Muslim"
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!newQuote.translation.trim() || !newQuote.source.trim()) {
                      setSaveError('Terjemahan dan Sumber kutipan wajib diisi.');
                      return;
                    }
                    const created: IslamicQuote = {
                      id: `qt-${Date.now()}`,
                      arabicText: newQuote.arabicText.trim(),
                      translation: newQuote.translation.trim(),
                      source: newQuote.source.trim(),
                      active: true,
                    };
                    setNewQuote({ arabicText: '', translation: '', source: '' });
                    persistDatabase(
                      { ...db, quotes: [...db.quotes, created] },
                      'Kutipan ayat/hadits berhasil ditambahkan ke rotasi TV.'
                    );
                  }}
                  className="px-5 py-2.5 min-h-[44px] inline-flex items-center gap-2 rounded-md bg-[#1E1B18] text-[#FAF7F2] text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>Tambahkan ke Daftar Kutipan TV</span>
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="font-serif-heading text-lg font-bold text-[#1E1B18]">
                  Daftar Kutipan Ayat &amp; Hadits Aktif ({db.quotes.length})
                </h3>
                {db.quotes.map((qt) => (
                  <div
                    key={qt.id}
                    className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-5 space-y-2"
                  >
                    {qt.arabicText && (
                      <p
                        dir="rtl"
                        className="font-arabic text-xl text-[#1E1B18] text-right"
                      >
                        {qt.arabicText}
                      </p>
                    )}
                    <p className="text-sm font-medium text-[#1E1B18]">
                      &ldquo;{qt.translation}&rdquo;
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-[#DFD5C5]">
                      <span className="text-xs font-bold text-[#A84A2E]">
                        Sumber: {qt.source}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = {
                            ...db,
                            quotes: db.quotes.filter((item) => item.id !== qt.id),
                          };
                          persistDatabase(updated, 'Kutipan dihapus.');
                        }}
                        className="text-xs font-bold text-[#A84A2E] underline cursor-pointer"
                      >
                        Hapus Kutipan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

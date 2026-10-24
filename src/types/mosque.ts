export type AdminRole = 'SUPER_ADMIN' | 'BENDAHARA' | 'HUMAS';

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: AdminRole;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  mediaType?: 'IMAGE' | 'VIDEO';
  imageUrl: string;
  videoUrl?: string;
  ctaText: string;
  ctaLink: string;
  order: number;
  active: boolean;
}

export type PrayerName = 'Subuh' | 'Syuruq' | 'Dzuhur' | 'Ashar' | 'Maghrib' | 'Isya';

export interface PrayerOffsets {
  Subuh: number;
  Syuruq: number;
  Dzuhur: number;
  Ashar: number;
  Maghrib: number;
  Isya: number;
}

export interface IqomahWaitMinutes {
  Subuh: number;
  Dzuhur: number;
  Ashar: number;
  Maghrib: number;
  Isya: number;
}

export interface ManualPrayerTimes {
  Subuh: string;
  Syuruq: string;
  Dzuhur: string;
  Ashar: string;
  Maghrib: string;
  Isya: string;
}

export interface JumatOfficer {
  date: string;
  khatib: string;
  khatibTopic: string;
  imam: string;
  muadzin: string;
  bilal: string;
}

export interface PrayerSettings {
  city: string;
  latitude: number;
  longitude: number;
  useManualOverride: boolean;
  manualTimes: ManualPrayerTimes;
  offsets: PrayerOffsets;
  iqomahMinutes: IqomahWaitMinutes;
  adzanDurationSeconds: number;
  jumatOfficer: JumatOfficer;
}

export interface MosqueEvent {
  id: string;
  title: string;
  speaker: string;
  date: string; // YYYY-MM-DD or 'RUTIN'
  dayLabel: string; // e.g., 'Hari Ini', 'Setiap Kamis Malam', 'Setiap Jumat Sore'
  time: string; // e.g., '18:30 - 19:45 WITA'
  location: string;
  category: 'Kajian Rutin' | 'Kegiatan Kampus' | 'Tahsin & Tahfidz' | 'Sosial & Ramadhan';
  description: string;
  isToday: boolean;
}

export type FundCategory = 'OPERASIONAL' | 'PEMBANGUNAN' | 'SOSIAL_ZISWAF';

export interface FinanceTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  category: FundCategory;
  type: 'IN' | 'OUT';
  amount: number;
  recordedBy: string;
}

export interface DonationInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrisImageUrl: string;
  confirmationWhatsapp: string;
  isSampleDataNotice: boolean;
}

export interface MosqueService {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  requirements: string[];
  picName: string;
  picWhatsapp: string;
  iconName: 'Building2' | 'BookOpen' | 'HeartHandshake' | 'Users' | 'GraduationCap' | 'CalendarCheck';
  active: boolean;
}

export interface ServiceSubmission {
  id: string;
  serviceId: string;
  serviceTitle: string;
  applicantName: string;
  applicantIdentity: string; // NIM / NIP / Unit / Instansi
  whatsapp: string;
  requestedDate: string;
  notes: string;
  status: 'MENUNGGU' | 'DISETUJUI' | 'DITOLAK';
  createdAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // HTML from Rich Text Editor
  category: 'Kegiatan Masjid' | 'Pengumuman Takmir' | 'Khutbah & Kajian' | 'Warta Kampus';
  coverImageUrl: string;
  author: string;
  publishedAt: string;
  status: 'PUBLISHED' | 'DRAFT';
  seoTitle?: string;
  seoDescription?: string;
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  content: string; // HTML from Rich Text Editor
  updatedAt: string;
  status: 'PUBLISHED' | 'DRAFT';
  seoTitle?: string;
  seoDescription?: string;
}

export interface SubMenuItem {
  id: string;
  label: string;
  href: string;
}

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  order: number;
  children: SubMenuItem[];
}

export interface IslamicQuote {
  id: string;
  arabicText: string;
  translation: string;
  source: string;
  active: boolean;
}

export interface TVSettings {
  slideDurationSeconds: number;
  showFinanceSlide: boolean;
  showQuoteSlide: boolean;
  showEventSlide: boolean;
  enableBeepSound: boolean;
  runningText: string[];
  shafWarningText: string;
}

export type FooterLayoutStyle = 'THREE_COLUMN' | 'CENTERED' | 'COMPACT';

export interface FooterSettings {
  layoutStyle: FooterLayoutStyle;
  middleColumnTitle: string;
  rightColumnTitle: string;
  rightColumnDescription: string;
  showTvButton: boolean;
  showSitemapLink: boolean;
  copyrightText: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  campusWebsiteUrl?: string;
}

export interface MosqueDatabase {
  mosqueProfile: {
    name: string;
    institution: string;
    logoUrl?: string;
    address: string;
    city: string;
    province: string;
    email: string;
    whatsapp: string;
    tagline: string;
  };
  footerSettings: FooterSettings;
  heroSlides: HeroSlide[];
  prayerSettings: PrayerSettings;
  events: MosqueEvent[];
  transactions: FinanceTransaction[];
  donationInfo: DonationInfo;
  services: MosqueService[];
  serviceSubmissions: ServiceSubmission[];
  news: NewsArticle[];
  customPages: CustomPage[];
  menus: MenuItem[];
  quotes: IslamicQuote[];
  tvSettings: TVSettings;
  users: AdminUser[];
}

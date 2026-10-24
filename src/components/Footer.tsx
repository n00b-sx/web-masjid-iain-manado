import React from 'react';
import Link from 'next/link';
import { CustomPage, FooterSettings, MosqueDatabase } from '@/types/mosque';
import { ExternalLink, Mail, MapPin, Phone, Tv } from 'lucide-react';

interface FooterProps {
  profile: MosqueDatabase['mosqueProfile'];
  customPages: CustomPage[];
  footerSettings?: FooterSettings;
}

const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
  layoutStyle: 'THREE_COLUMN',
  middleColumnTitle: 'Halaman & Informasi',
  rightColumnTitle: 'Layar Informasi Masjid',
  rightColumnDescription:
    'Buka mode layar informasi penuh 16:9 untuk ditampilkan pada Smart TV di dalam ruang utama masjid.',
  showTvButton: true,
  showSitemapLink: true,
  copyrightText: 'Hak Cipta Dilindungi.',
  instagramUrl: '',
  youtubeUrl: '',
  campusWebsiteUrl: 'https://iain-manado.ac.id',
};

export default function Footer({
  profile,
  customPages,
  footerSettings,
}: FooterProps) {
  const publishedPages = customPages.filter((p) => p.status === 'PUBLISHED');
  const settings: FooterSettings = {
    ...DEFAULT_FOOTER_SETTINGS,
    ...(footerSettings || {}),
  };

  const quickLinks = [
    { label: 'Jadwal Sholat 5 Waktu', href: '/#jadwal-sholat' },
    { label: 'Agenda Kegiatan Masjid', href: '/#kegiatan' },
    { label: 'Transparansi Kas Masjid', href: '/#keuangan' },
    { label: 'Arsip Berita & Artikel', href: '/berita' },
    ...publishedPages.map((pg) => ({
      label: pg.title,
      href: `/p/${pg.slug}`,
    })),
  ];

  const externalLinks = [
    settings.campusWebsiteUrl
      ? { label: 'Website Resmi IAIN Manado', url: settings.campusWebsiteUrl }
      : null,
    settings.instagramUrl
      ? { label: 'Instagram Masjid', url: settings.instagramUrl }
      : null,
    settings.youtubeUrl
      ? { label: 'YouTube Masjid', url: settings.youtubeUrl }
      : null,
  ].filter(Boolean) as { label: string; url: string }[];

  const renderBrandBadge = () =>
    profile.logoUrl ? (
      <img
        src={profile.logoUrl}
        alt={`Logo ${profile.name}`}
        className="w-11 h-11 sm:w-12 sm:h-12 object-contain shrink-0"
      />
    ) : (
      <div className="w-10 h-10 rounded-lg bg-[#A84A2E] text-white flex items-center justify-center font-serif-heading font-bold text-lg shrink-0">
        AJ
      </div>
    );

  // ============================================================================
  // MODEL 2: CENTERED (Simetris Rata Tengah)
  // ============================================================================
  if (settings.layoutStyle === 'CENTERED') {
    return (
      <footer className="bg-[#1E1B18] text-[#FAF7F2] border-t-4 border-[#A84A2E] dark-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <div className="flex flex-col items-center justify-center gap-3 mb-4">
            {renderBrandBadge()}
            <div>
              <h2 className="font-serif-heading text-xl sm:text-2xl font-bold text-[#FAF7F2]">
                {profile.name}
              </h2>
              <p className="text-xs sm:text-sm text-[#E8CFA0] font-medium">
                {profile.institution}
              </p>
            </div>
          </div>

          <p className="text-sm text-[#F2ECE1] leading-relaxed max-w-2xl mx-auto mb-6">
            {profile.tagline}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-[#E8CFA0] mb-8">
            <span className="inline-flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#A84A2E] shrink-0" aria-hidden="true" />
              <span>
                {profile.address}, {profile.city}, {profile.province}
              </span>
            </span>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 hover:underline text-[#FAF7F2]"
            >
              <Mail className="w-4 h-4 text-[#A84A2E] shrink-0" aria-hidden="true" />
              <span>{profile.email}</span>
            </a>
            <a
              href={`https://wa.me/${profile.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:underline text-[#FAF7F2]"
            >
              <Phone className="w-4 h-4 text-[#A84A2E] shrink-0" aria-hidden="true" />
              <span>+{profile.whatsapp}</span>
            </a>
          </div>

          {/* Horizontal Navigation Links */}
          <nav
            aria-label="Navigasi Footer"
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 py-5 border-t border-b border-white/15 text-xs sm:text-sm"
          >
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[#FAF7F2] hover:text-[#E8CFA0] font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
            {externalLinks.map((ext) => (
              <a
                key={ext.url}
                href={ext.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#E8CFA0] hover:underline font-medium"
              >
                <span>{ext.label}</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            ))}
          </nav>

          {settings.showTvButton && (
            <div className="mt-6 flex justify-center">
              <Link
                href="/tv"
                className="px-5 py-2.5 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md border border-[#E8CFA0] text-[#E8CFA0] text-xs font-semibold hover:bg-[#E8CFA0] hover:text-[#1E1B18] transition-colors"
              >
                <Tv className="w-4 h-4" aria-hidden="true" />
                <span>Layar Smart TV Masjid (/tv)</span>
              </Link>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E8CFA0]">
            <p>
              &copy; {new Date().getFullYear()} {profile.name} ({profile.institution}).{' '}
              {settings.copyrightText}
            </p>
            {settings.showSitemapLink && (
              <Link href="/sitemap.xml" className="hover:underline">
                Peta Situs (Sitemap SEO)
              </Link>
            )}
          </div>
        </div>
      </footer>
    );
  }

  // ============================================================================
  // MODEL 3: COMPACT (Ringkas Minimalis 2 Sisi)
  // ============================================================================
  if (settings.layoutStyle === 'COMPACT') {
    return (
      <footer className="bg-[#1E1B18] text-[#FAF7F2] border-t-4 border-[#A84A2E] dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/15">
            <div className="flex items-start sm:items-center gap-3.5">
              {renderBrandBadge()}
              <div>
                <h2 className="font-serif-heading text-lg sm:text-xl font-bold text-[#FAF7F2]">
                  {profile.name}
                </h2>
                <p className="text-xs text-[#E8CFA0]">
                  {profile.institution} &bull; {profile.city}, {profile.province}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[#FAF7F2] hover:text-[#E8CFA0] font-medium"
                >
                  {item.label}
                </Link>
              ))}
              {settings.showTvButton && (
                <Link
                  href="/tv"
                  className="px-3.5 py-2 min-h-[40px] inline-flex items-center gap-1.5 rounded-md border border-[#E8CFA0] text-[#E8CFA0] text-xs font-semibold hover:bg-[#E8CFA0] hover:text-[#1E1B18] transition-colors"
                >
                  <Tv className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Layar TV</span>
                </Link>
              )}
            </div>
          </div>

          <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E8CFA0]">
            <p>
              &copy; {new Date().getFullYear()} {profile.name} ({profile.institution}).{' '}
              {settings.copyrightText}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={`https://wa.me/${profile.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-[#FAF7F2]"
              >
                WA: +{profile.whatsapp}
              </a>
              <a
                href={`mailto:${profile.email}`}
                className="hover:underline text-[#FAF7F2]"
              >
                {profile.email}
              </a>
              {settings.showSitemapLink && (
                <Link href="/sitemap.xml" className="hover:underline">
                  Peta Situs (Sitemap SEO)
                </Link>
              )}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // ============================================================================
  // MODEL 1: THREE_COLUMN (Default 3 Kolom Lengkap)
  // ============================================================================
  return (
    <footer className="bg-[#1E1B18] text-[#FAF7F2] border-t-4 border-[#A84A2E] dark-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Identity & Campus Address (6 cols) */}
          <div className="md:col-span-6">
            <div className="flex items-center gap-3 mb-4">
              {renderBrandBadge()}
              <div>
                <h2 className="font-serif-heading text-xl font-bold text-[#FAF7F2]">
                  {profile.name}
                </h2>
                <p className="text-xs text-[#E8CFA0] font-medium">
                  {profile.institution}
                </p>
              </div>
            </div>

            <p className="text-sm text-[#F2ECE1] leading-relaxed mb-6 max-w-lg">
              {profile.tagline}
            </p>

            <div className="space-y-2.5 text-xs sm:text-sm text-[#E8CFA0]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 shrink-0 mt-1 text-[#A84A2E]" aria-hidden="true" />
                <span>
                  {profile.address}, {profile.city}, {profile.province}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 shrink-0 text-[#A84A2E]" aria-hidden="true" />
                <a
                  href={`mailto:${profile.email}`}
                  className="hover:underline text-[#FAF7F2]"
                >
                  {profile.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 shrink-0 text-[#A84A2E]" aria-hidden="true" />
                <a
                  href={`https://wa.me/${profile.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-[#FAF7F2]"
                >
                  +{profile.whatsapp} (Sekretariat Takmir)
                </a>
              </div>
            </div>
          </div>

          {/* Dynamic Pages & Quick Sections (3 cols) */}
          <div className="md:col-span-3">
            <h3 className="font-serif-heading text-base font-bold text-[#E8CFA0] mb-4">
              {settings.middleColumnTitle || 'Halaman & Informasi'}
            </h3>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="py-1 inline-block text-[#FAF7F2] hover:text-[#E8CFA0]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: TV Mode & External / Social Links (3 cols) */}
          <div className="md:col-span-3">
            <h3 className="font-serif-heading text-base font-bold text-[#E8CFA0] mb-4">
              {settings.rightColumnTitle || 'Layar Informasi Masjid'}
            </h3>
            {settings.rightColumnDescription && (
              <p className="text-xs text-[#F2ECE1] leading-relaxed mb-4">
                {settings.rightColumnDescription}
              </p>
            )}
            <div className="flex flex-col gap-3">
              {settings.showTvButton && (
                <Link
                  href="/tv"
                  className="px-4 py-3 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md border border-[#E8CFA0] text-[#E8CFA0] text-xs font-semibold hover:bg-[#E8CFA0] hover:text-[#1E1B18] transition-colors"
                >
                  <Tv className="w-4 h-4" aria-hidden="true" />
                  <span>Layar Smart TV Masjid (/tv)</span>
                </Link>
              )}

              {externalLinks.length > 0 && (
                <div className="pt-2 space-y-2">
                  {externalLinks.map((ext) => (
                    <a
                      key={ext.url}
                      href={ext.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3.5 py-2.5 min-h-[40px] rounded-md bg-white/5 border border-white/15 text-xs font-semibold text-[#FAF7F2] hover:border-[#E8CFA0] hover:text-[#E8CFA0] transition-colors"
                    >
                      <span>{ext.label}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E8CFA0]">
          <p>
            &copy; {new Date().getFullYear()} {profile.name} ({profile.institution}).{' '}
            {settings.copyrightText}
          </p>
          {settings.showSitemapLink && (
            <div className="flex items-center gap-4">
              <Link href="/sitemap.xml" className="hover:underline">
                Peta Situs (Sitemap SEO)
              </Link>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

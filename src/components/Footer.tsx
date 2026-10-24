import React from 'react';
import Link from 'next/link';
import { CustomPage, MosqueDatabase } from '@/types/mosque';
import { Mail, MapPin, Phone, Tv, ShieldCheck } from 'lucide-react';

interface FooterProps {
  profile: MosqueDatabase['mosqueProfile'];
  customPages: CustomPage[];
}

export default function Footer({ profile, customPages }: FooterProps) {
  const publishedPages = customPages.filter((p) => p.status === 'PUBLISHED');

  return (
    <footer className="bg-[#1E1B18] text-[#FAF7F2] border-t-4 border-[#A84A2E] dark-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Identity & Campus Address (6 cols) */}
          <div className="md:col-span-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#A84A2E] text-white flex items-center justify-center font-serif-heading font-bold text-lg">
                AJ
              </div>
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
              Halaman &amp; Informasi
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/#jadwal-sholat"
                  className="py-1 inline-block text-[#FAF7F2] hover:text-[#E8CFA0]"
                >
                  Jadwal Sholat 5 Waktu
                </Link>
              </li>
              <li>
                <Link
                  href="/#kegiatan"
                  className="py-1 inline-block text-[#FAF7F2] hover:text-[#E8CFA0]"
                >
                  Agenda Kegiatan Masjid
                </Link>
              </li>
              <li>
                <Link
                  href="/#keuangan"
                  className="py-1 inline-block text-[#FAF7F2] hover:text-[#E8CFA0]"
                >
                  Transparansi Kas Masjid
                </Link>
              </li>
              <li>
                <Link
                  href="/berita"
                  className="py-1 inline-block text-[#FAF7F2] hover:text-[#E8CFA0]"
                >
                  Arsip Berita &amp; Artikel
                </Link>
              </li>
              {publishedPages.map((pg) => (
                <li key={pg.id}>
                  <Link
                    href={`/p/${pg.slug}`}
                    className="py-1 inline-block text-[#FAF7F2] hover:text-[#E8CFA0]"
                  >
                    {pg.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Portal Sistem & Layar TV (3 cols) */}
          <div className="md:col-span-3">
            <h3 className="font-serif-heading text-base font-bold text-[#E8CFA0] mb-4">
              Akses Sistem Masjid
            </h3>
            <p className="text-xs text-[#F2ECE1] leading-relaxed mb-4">
              Buka mode layar informasi penuh 16:9 untuk ditampilkan pada Smart TV di dalam ruang utama masjid, atau masuk ke dashboard pengelola Takmir.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/tv"
                className="px-4 py-3 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md border border-[#E8CFA0] text-[#E8CFA0] text-xs font-semibold hover:bg-[#E8CFA0] hover:text-[#1E1B18] transition-colors"
              >
                <Tv className="w-4 h-4" aria-hidden="true" />
                <span>Layar Smart TV Masjid (/tv)</span>
              </Link>
              <Link
                href="/admin"
                className="px-4 py-3 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md bg-[#A84A2E] text-white text-xs font-semibold hover:bg-[#8E3B22] transition-colors"
              >
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                <span>Dashboard Admin CMS</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E8CFA0]">
          <p>
            &copy; {new Date().getFullYear()} {profile.name} ({profile.institution}). Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/sitemap.xml" className="hover:underline">
              Peta Situs (Sitemap SEO)
            </Link>
            <Link href="/admin" className="hover:underline">
              Pengelola Takmir
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

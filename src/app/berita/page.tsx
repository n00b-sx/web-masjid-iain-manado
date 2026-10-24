import React from 'react';
import { Metadata } from 'next';
import { readMosqueDb } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NewsArchiveClient from '@/components/NewsArchiveClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Arsip Berita, Pengumuman & Kajian',
  description:
    "Kumpulan berita kegiatan, pengumuman resmi Takmir, dan artikel kajian keislaman Masjid Al Jami'ah IAIN Manado.",
};

export default function BeritaIndexPage() {
  const db = readMosqueDb();
  const publishedArticles = db.news
    .filter((a) => a.status === 'PUBLISHED')
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <>
      <Navbar
        mosqueName={db.mosqueProfile.name}
        institution={db.mosqueProfile.institution}
        logoUrl={db.mosqueProfile.logoUrl}
        menus={db.menus}
      />

      <main id="main-content" className="flex-1">
        {/* Warm Dark Architectural Header Banner so transparent-to-white sticky navbar is always legible */}
        <section className="bg-[#1E1B18] text-[#FAF7F2] pt-28 pb-14 px-4 sm:px-6 lg:px-8 border-b-4 border-[#A84A2E] dark-surface">
          <div className="max-w-7xl mx-auto">
            <p className="text-xs sm:text-sm font-semibold text-[#E8CFA0] mb-2">
              Warta &amp; Dokumentasi Takmir
            </p>
            <h1
              style={{ fontSize: 'clamp(1.85rem, 3.8vw, 3rem)' }}
              className="font-serif-heading font-bold text-[#FAF7F2] leading-tight mb-3"
            >
              Indeks Berita &amp; Artikel Masjid Al Jami&apos;ah
            </h1>
            <p className="text-sm sm:text-base text-[#F2ECE1] max-w-2xl">
              Ikuti perkembangan kegiatan kemakmuran masjid, pengumuman jadwal ibadah, serta rangkuman materi kajian di lingkungan kampus IAIN Manado.
            </p>
          </div>
        </section>

        <NewsArchiveClient articles={publishedArticles} />
      </main>

      <Footer
        profile={db.mosqueProfile}
        customPages={db.customPages}
        footerSettings={db.footerSettings}
      />
    </>
  );
}

import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { readMosqueDb } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft, Calendar, Share2, User } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const db = readMosqueDb();
  const article = db.news.find((n) => n.slug === slug);

  if (!article) {
    return {
      title: 'Berita Tidak Ditemukan',
    };
  }

  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt;

  return {
    title,
    description,
    openGraph: {
      type: 'article',
      title,
      description,
      publishedTime: article.publishedAt,
      authors: [article.author],
      images: article.coverImageUrl ? [{ url: article.coverImageUrl }] : [],
    },
  };
}

export default async function BeritaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const db = readMosqueDb();
  const article = db.news.find((n) => n.slug === slug);

  if (!article) {
    return (
      <>
        <Navbar
          mosqueName={db.mosqueProfile.name}
          institution={db.mosqueProfile.institution}
          logoUrl={db.mosqueProfile.logoUrl}
          menus={db.menus}
        />
        <main id="main-content" className="flex-1 bg-[#FAF7F2]">
          <section className="bg-[#1E1B18] text-[#FAF7F2] pt-28 pb-14 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="font-serif-heading text-2xl sm:text-4xl font-bold text-[#FAF7F2]">
                Artikel Tidak Ditemukan
              </h1>
            </div>
          </section>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <p className="text-base text-[#524740] mb-6">
              Maaf, halaman berita yang Anda cari tidak tersedia atau alamat tautannya telah berubah.
            </p>
            <Link
              href="/berita"
              className="px-6 py-3 min-h-[44px] inline-flex items-center gap-2 rounded-md bg-[#A84A2E] text-white font-semibold text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Arsip Berita</span>
            </Link>
          </div>
        </main>
        <Footer
          profile={db.mosqueProfile}
          customPages={db.customPages}
        />
      </>
    );
  }

  const relatedNews = db.news
    .filter((n) => n.status === 'PUBLISHED' && n.id !== article.id)
    .slice(0, 3);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://masjid.iain-manado.ac.id';
  const articleUrl = `${siteUrl}/berita/${article.slug}`;

  // Schema.org NewsArticle JSON-LD for Google Search & News
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    image: article.coverImageUrl ? [article.coverImageUrl] : [],
    datePublished: article.publishedAt,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: db.mosqueProfile.name,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar
        mosqueName={db.mosqueProfile.name}
        institution={db.mosqueProfile.institution}
        logoUrl={db.mosqueProfile.logoUrl}
        menus={db.menus}
      />

      <main id="main-content" className="flex-1 bg-[#FAF7F2]">
        {/* Dark Warm Article Header */}
        <header className="bg-[#1E1B18] text-[#FAF7F2] pt-28 pb-12 px-4 sm:px-6 lg:px-8 border-b-4 border-[#A84A2E] dark-surface">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/berita"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#E8CFA0] hover:underline mb-4 min-h-[36px]"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Kembali ke Indeks Berita</span>
            </Link>

            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold mb-4">
              <span className="px-2.5 py-1 rounded bg-[#A84A2E] text-white">
                {article.category}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#E8CFA0]">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Diterbitkan: {article.publishedAt}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#E8CFA0]">
                <User className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Penulis: {article.author}</span>
              </span>
            </div>

            <h1
              style={{ fontSize: 'clamp(1.75rem, 3.6vw, 2.75rem)' }}
              className="font-serif-heading font-bold text-[#FAF7F2] leading-tight"
            >
              {article.title}
            </h1>
          </div>
        </header>

        {/* Article Body */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          {article.coverImageUrl && (
            <div className="rounded-xl overflow-hidden border border-[#DFD5C5] mb-8 bg-[#1E1B18]">
              <img
                src={article.coverImageUrl}
                alt={article.title}
                className="w-full max-h-[480px] object-cover"
              />
            </div>
          )}

          {/* Lead Excerpt */}
          <p className="text-base sm:text-lg font-medium text-[#1E1B18] bg-[#F2ECE1] p-5 rounded-lg border-l-4 border-[#A84A2E] mb-8">
            {article.excerpt}
          </p>

          {/* Rich Text HTML Content */}
          <div
            className="prose-masjid text-base sm:text-lg"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Share Bar */}
          <div className="mt-12 pt-6 border-t border-[#DFD5C5] flex flex-wrap items-center justify-between gap-4">
            <span className="text-sm font-semibold text-[#524740]">
              Sebarkan informasi ini kepada jamaah &amp; sivitas akademika:
            </span>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `${article.title} - ${db.mosqueProfile.name}\nBaca selengkapnya: ${articleUrl}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 min-h-[44px] inline-flex items-center gap-2 rounded-md bg-[#3D4D33] text-white text-xs sm:text-sm font-semibold hover:opacity-95"
            >
              <Share2 className="w-4 h-4" aria-hidden="true" />
              <span>Bagikan ke WhatsApp</span>
            </a>
          </div>
        </article>

        {/* Related News */}
        {relatedNews.length > 0 && (
          <section
            aria-labelledby="heading-related-news"
            className="bg-[#F2ECE1] border-t border-[#DFD5C5] py-12 px-4 sm:px-6 lg:px-8"
          >
            <div className="max-w-7xl mx-auto">
              <h2
                id="heading-related-news"
                className="font-serif-heading text-xl sm:text-2xl font-bold text-[#1E1B18] mb-6"
              >
                Berita &amp; Artikel Lainnya
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedNews.map((item) => (
                  <article
                    key={item.id}
                    className="bg-[#FAF7F2] border border-[#DFD5C5] rounded-xl p-5 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#A84A2E] block mb-1.5">
                        {item.category} &bull; {item.publishedAt}
                      </span>
                      <h3 className="font-serif-heading text-lg font-bold text-[#1E1B18] mb-2">
                        <Link
                          href={`/berita/${item.slug}`}
                          className="hover:text-[#A84A2E]"
                        >
                          {item.title}
                        </Link>
                      </h3>
                      <p className="text-xs sm:text-sm text-[#524740] mb-4 line-clamp-3">
                        {item.excerpt}
                      </p>
                    </div>
                    <Link
                      href={`/berita/${item.slug}`}
                      className="text-xs font-bold text-[#1E1B18] underline hover:text-[#A84A2E] py-1"
                    >
                      Baca Artikel
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer
        profile={db.mosqueProfile}
        customPages={db.customPages}
        footerSettings={db.footerSettings}
      />
    </>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { NewsArticle } from '@/types/mosque';
import { Calendar, User, Newspaper } from 'lucide-react';

interface NewsSectionProps {
  articles: NewsArticle[];
}

export default function NewsSection({ articles }: NewsSectionProps) {
  const published = articles
    .filter((a) => a.status === 'PUBLISHED')
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  const featuredArticle = published[0];
  const sideArticles = published.slice(1, 4);

  return (
    <section
      id="berita"
      aria-labelledby="heading-berita"
      className="py-14 sm:py-20 bg-[#FAF7F2] border-t border-[#DFD5C5]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2
              id="heading-berita"
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
              className="font-serif-heading font-bold text-[#1E1B18] leading-tight mb-2"
            >
              Berita, Pengumuman &amp; Artikel Kajian
            </h2>
            <p className="text-sm sm:text-base text-[#524740]">
              Dokumentasi kegiatan kemakmuran masjid, warta takmir, serta ringkasan materi khutbah dan halaqah keilmuan.
            </p>
          </div>

          <Link
            href="/berita"
            className="px-5 py-3 min-h-[44px] inline-flex items-center justify-center rounded-md border border-[#1E1B18] text-[#1E1B18] font-semibold text-sm hover:bg-[#1E1B18] hover:text-[#FAF7F2] transition-colors shrink-0"
          >
            Lihat Indeks Arsip Berita
          </Link>
        </div>

        {published.length === 0 ? (
          <div className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-10 text-center">
            <Newspaper className="w-10 h-10 text-[#A84A2E] mx-auto mb-3" aria-hidden="true" />
            <h3 className="font-serif-heading text-lg font-bold text-[#1E1B18] mb-2">
              Belum Ada Berita yang Dipublikasikan
            </h3>
            <p className="text-sm text-[#524740]">
              Warta kegiatan, pengumuman resmi, dan artikel kajian terbaru akan ditampilkan di bagian ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Featured Lead Story (Left 7 Columns) */}
            {featuredArticle && (
              <article className="lg:col-span-7 bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl overflow-hidden flex flex-col justify-between">
                <div>
                  <Link
                    href={`/berita/${featuredArticle.slug}`}
                    className="block aspect-[16/9] overflow-hidden bg-[#1E1B18]"
                  >
                    <img
                      src={featuredArticle.coverImageUrl}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold mb-3">
                      <span className="px-2.5 py-1 rounded bg-[#A84A2E] text-white">
                        {featuredArticle.category}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[#524740]">
                        <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{featuredArticle.publishedAt}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[#524740]">
                        <User className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{featuredArticle.author}</span>
                      </span>
                    </div>

                    <h3 className="font-serif-heading text-xl sm:text-2xl font-bold text-[#1E1B18] leading-snug mb-3">
                      <Link
                        href={`/berita/${featuredArticle.slug}`}
                        className="hover:text-[#A84A2E] transition-colors"
                      >
                        {featuredArticle.title}
                      </Link>
                    </h3>

                    <p className="text-sm sm:text-base text-[#524740] leading-relaxed mb-5">
                      {featuredArticle.excerpt}
                    </p>

                    <Link
                      href={`/berita/${featuredArticle.slug}`}
                      className="px-4 py-2.5 min-h-[44px] inline-flex items-center rounded-md bg-[#1E1B18] text-[#FAF7F2] text-xs sm:text-sm font-semibold hover:bg-[#2C2520] transition-colors"
                    >
                      Baca Selengkapnya
                    </Link>
                  </div>
                </div>
              </article>
            )}

            {/* Right Editorial Stack (Right 5 Columns) */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {sideArticles.map((art) => (
                <article
                  key={art.id}
                  className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 hover:border-[#1E1B18] transition-colors"
                >
                  <Link
                    href={`/berita/${art.slug}`}
                    className="sm:w-40 lg:w-full xl:w-36 h-40 sm:h-28 lg:h-40 xl:h-28 rounded-lg overflow-hidden bg-[#1E1B18] shrink-0 block"
                  >
                    <img
                      src={art.coverImageUrl}
                      alt={art.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs mb-1.5">
                        <span className="font-bold text-[#A84A2E]">
                          {art.category}
                        </span>
                        <span className="text-[#524740]">&bull; {art.publishedAt}</span>
                      </div>

                      <h3 className="font-serif-heading text-base sm:text-lg font-bold text-[#1E1B18] leading-snug mb-2">
                        <Link
                          href={`/berita/${art.slug}`}
                          className="hover:text-[#A84A2E] transition-colors"
                        >
                          {art.title}
                        </Link>
                      </h3>
                    </div>

                    <Link
                      href={`/berita/${art.slug}`}
                      className="text-xs font-bold text-[#1E1B18] underline hover:text-[#A84A2E] py-1 min-h-[32px] inline-flex items-center"
                    >
                      Baca Artikel Lengkap
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

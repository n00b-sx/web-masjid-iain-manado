'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { NewsArticle } from '@/types/mosque';
import { Calendar, Search, User, Newspaper } from 'lucide-react';

interface NewsArchiveClientProps {
  articles: NewsArticle[];
}

const CATEGORIES = [
  'Semua Kategori',
  'Kegiatan Masjid',
  'Pengumuman Takmir',
  'Khutbah & Kajian',
  'Warta Kampus',
] as const;

export default function NewsArchiveClient({ articles }: NewsArchiveClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua Kategori');

  const filtered = articles.filter((art) => {
    const matchCategory =
      selectedCategory === 'Semua Kategori' || art.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchQuery =
      !q ||
      art.title.toLowerCase().includes(q) ||
      art.excerpt.toLowerCase().includes(q) ||
      art.author.toLowerCase().includes(q);
    return matchCategory && matchQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Search & Category Filter Bar */}
      <div className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-5 sm:p-6 mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-5 relative">
            <label htmlFor="search-news" className="sr-only">
              Cari judul atau topik berita
            </label>
            <Search
              className="w-4 h-4 text-[#524740] absolute left-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              id="search-news"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul berita, kajian, atau pengumuman..."
              className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-md bg-[#FAF7F2] border border-[#524740] text-sm text-[#1E1B18]"
            />
          </div>

          <div
            className="lg:col-span-7 flex flex-wrap gap-2"
            role="tablist"
            aria-label="Filter kategori berita"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 min-h-[44px] rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#1E1B18] text-[#FAF7F2] border-[#1E1B18]'
                    : 'bg-[#FAF7F2] text-[#1E1B18] border-[#DFD5C5] hover:border-[#1E1B18]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Grid or Informative Empty State (R-27) */}
      {filtered.length === 0 ? (
        <div className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-10 text-center">
          <Newspaper className="w-10 h-10 text-[#A84A2E] mx-auto mb-3" aria-hidden="true" />
          <h2 className="font-serif-heading text-xl font-bold text-[#1E1B18] mb-2">
            Tidak Ada Berita yang Cocok dengan Pencarian
          </h2>
          <p className="text-sm text-[#524740] mb-5 max-w-md mx-auto">
            Kami tidak menemukan artikel dengan kata kunci &ldquo;{searchQuery}&rdquo; pada kategori{' '}
            <strong>{selectedCategory}</strong>. Silakan atur ulang filter pencarian.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Semua Kategori');
            }}
            className="px-5 py-2.5 min-h-[44px] rounded-md bg-[#A84A2E] text-white text-sm font-semibold cursor-pointer"
          >
            Tampilkan Semua Berita
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((art) => (
            <article
              key={art.id}
              className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl overflow-hidden flex flex-col justify-between hover:border-[#1E1B18] transition-colors"
            >
              <div>
                <Link
                  href={`/berita/${art.slug}`}
                  className="block aspect-[16/10] bg-[#1E1B18] overflow-hidden"
                >
                  <img
                    src={art.coverImageUrl}
                    alt={art.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold mb-2.5">
                    <span className="px-2.5 py-0.5 rounded bg-[#A84A2E] text-white">
                      {art.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#524740]">
                      <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{art.publishedAt}</span>
                    </span>
                  </div>

                  <h2 className="font-serif-heading text-lg sm:text-xl font-bold text-[#1E1B18] leading-snug mb-2.5">
                    <Link
                      href={`/berita/${art.slug}`}
                      className="hover:text-[#A84A2E] transition-colors"
                    >
                      {art.title}
                    </Link>
                  </h2>

                  <p className="text-sm text-[#524740] leading-relaxed mb-4">
                    {art.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-3 border-t border-[#DFD5C5] flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 text-[#524740]">
                  <User className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{art.author}</span>
                </span>
                <Link
                  href={`/berita/${art.slug}`}
                  className="font-bold text-[#A84A2E] underline py-1.5 min-h-[36px] inline-flex items-center"
                >
                  Baca Selengkapnya
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

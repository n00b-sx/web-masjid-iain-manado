'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { HeroSlide } from '@/types/mosque';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

interface HeroSlideshowProps {
  slides: HeroSlide[];
  mosqueAddress: string;
  hijriDate: string;
  masehiDate: string;
}

export default function HeroSlideshow({
  slides,
  mosqueAddress,
  hijriDate,
  masehiDate,
}: HeroSlideshowProps) {
  const activeSlides = slides
    .filter((s) => s.active)
    .sort((a, b) => a.order - b.order);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (activeSlides.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [activeSlides.length, isPaused]);

  if (activeSlides.length === 0) {
    return (
      <section className="relative bg-[#1E1B18] text-[#FAF7F2] pt-32 pb-20 px-4 sm:px-6 lg:px-8 dark-surface">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif-heading text-3xl sm:text-5xl font-bold text-[#FAF7F2] mb-4">
            Masjid Al Jami&apos;ah IAIN Manado
          </h1>
          <p className="text-base sm:text-lg text-[#E8CFA0] max-w-2xl mb-6">
            Belum ada slide gambar aktif. Silakan tambahkan gambar sampul pada Panel Admin di menu Hero Slideshow.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center px-6 py-3 min-h-[44px] rounded-md bg-[#A84A2E] text-white font-semibold text-sm hover:bg-[#8E3B22]"
          >
            Kelola Hero di Panel Admin
          </Link>
        </div>
      </section>
    );
  }

  const safeIndex = currentIndex % activeSlides.length;
  const currentSlide = activeSlides[safeIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  return (
    <section
      aria-label="Sorotan Utama Masjid Al Jami'ah IAIN Manado"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative min-h-[560px] sm:min-h-[620px] lg:min-h-[680px] flex items-center bg-[#1E1B18] text-[#FAF7F2] overflow-hidden dark-surface"
    >
      {/* Background Image Slideshow with Cross-Fade */}
      {activeSlides.map((slide, idx) => (
        <div
          key={slide.id}
          aria-hidden={idx !== safeIndex}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === safeIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'
          }`}
        >
          <img
            src={slide.imageUrl}
            alt={slide.title}
            className="w-full h-full object-cover object-center"
          />
          {/* High-contrast dark warm scrim so white text passes WCAG AA/AAA across the entire surface */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(22, 18, 15, 0.84) 0%, rgba(22, 18, 15, 0.78) 55%, rgba(22, 18, 15, 0.92) 100%)',
            }}
          />
        </div>
      ))}

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 sm:pt-32 sm:pb-24">
        <div className="max-w-3xl">
          <p className="text-sm sm:text-base font-medium text-[#E8CFA0] mb-3">
            {masehiDate} &bull; {hijriDate}
          </p>

          <h1
            style={{ fontSize: 'clamp(2rem, 4.2vw, 3.5rem)' }}
            className="font-serif-heading font-bold text-[#FAF7F2] leading-[1.15] tracking-tight mb-5"
          >
            {currentSlide.title}
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-[#F2ECE1] leading-relaxed mb-8 max-w-2xl">
            {currentSlide.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-8">
            <Link
              href={currentSlide.ctaLink || '#jadwal-sholat'}
              className="px-6 py-3.5 min-h-[44px] inline-flex items-center justify-center rounded-md bg-[#A84A2E] text-white font-semibold text-sm sm:text-base hover:bg-[#8E3B22] transition-colors"
            >
              {currentSlide.ctaText || 'Lihat Jadwal Sholat'}
            </Link>
            <Link
              href="#layanan"
              className="px-6 py-3.5 min-h-[44px] inline-flex items-center justify-center rounded-md border border-[#E8CFA0] bg-[#1E1B18]/75 text-[#FAF7F2] font-semibold text-sm sm:text-base hover:bg-[#FAF7F2] hover:text-[#1E1B18] transition-colors"
            >
              Ajukan Layanan Masjid
            </Link>
          </div>

          <div className="flex items-start sm:items-center gap-2 text-xs sm:text-sm text-[#E8CFA0]">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
            <span>{mosqueAddress}</span>
          </div>
        </div>

        {/* Slideshow Controls */}
        {activeSlides.length > 1 && (
          <div className="mt-10 pt-6 border-t border-white/20 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2" role="tablist" aria-label="Pilih slide utama">
              {activeSlides.map((slide, idx) => {
                const isSelected = idx === safeIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    aria-label={`Tampilkan slide ${idx + 1}: ${slide.title}`}
                    onClick={() => setCurrentIndex(idx)}
                    className={`min-h-[44px] px-3 inline-flex items-center gap-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#A84A2E] text-white'
                        : 'bg-[#1E1B18]/80 text-[#E8CFA0] border border-white/25 hover:bg-white/15'
                    }`}
                  >
                    <span>0{idx + 1}</span>
                    <span className="hidden md:inline max-w-[160px] truncate">
                      {slide.title}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Slide sebelumnya"
                className="min-h-[44px] min-w-[44px] px-3 inline-flex items-center justify-center rounded-md bg-[#1E1B18]/80 border border-white/30 text-[#FAF7F2] hover:bg-white/20 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Slide berikutnya"
                className="min-h-[44px] min-w-[44px] px-3 inline-flex items-center justify-center rounded-md bg-[#1E1B18]/80 border border-white/30 text-[#FAF7F2] hover:bg-white/20 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { HeroSlide } from '@/types/mosque';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Pause,
  Play,
} from 'lucide-react';

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
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const safeIndex =
    activeSlides.length > 0 ? currentIndex % activeSlides.length : 0;
  const currentSlide = activeSlides[safeIndex];
  const isCurrentVideo =
    currentSlide?.mediaType === 'VIDEO' && Boolean(currentSlide?.videoUrl);

  // Automatic rotation for IMAGE slides only.
  // For VIDEO slides, rotation happens via the <video onEnded> event after the full video finishes playing.
  useEffect(() => {
    if (activeSlides.length <= 1 || !isPlaying || isCurrentVideo) return;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 7500);
    return () => clearTimeout(timer);
  }, [activeSlides.length, isPlaying, safeIndex, isCurrentVideo]);

  // Reset video to 0:00 whenever a slide becomes the newly active slide
  useEffect(() => {
    const activeSlide = activeSlides[safeIndex];
    if (!activeSlide) return;
    const activeVid = videoRefs.current[activeSlide.id];
    if (activeVid) {
      activeVid.currentTime = 0;
    }
  }, [safeIndex, activeSlides]);

  // Synchronize HTML5 <video> play/pause state with active slide & Play/Pause toggle
  useEffect(() => {
    activeSlides.forEach((slide, idx) => {
      const vid = videoRefs.current[slide.id];
      if (!vid) return;
      if (idx === safeIndex && isPlaying) {
        vid.play().catch(() => {
          // Autoplay fallback if browser blocks un-interacted play
        });
      } else {
        vid.pause();
      }
    });
  }, [safeIndex, isPlaying, activeSlides]);

  if (activeSlides.length === 0) {
    return (
      <section className="relative min-h-screen h-dvh w-full flex items-center bg-[#1E1B18] text-[#FAF7F2] px-4 sm:px-6 lg:px-8 dark-surface">
        <div className="max-w-7xl mx-auto w-full">
          <h1 className="font-serif-heading text-3xl sm:text-5xl font-bold text-[#FAF7F2] mb-4">
            Masjid Al Jami&apos;ah IAIN Manado
          </h1>
          <p className="text-base sm:text-lg text-[#E8CFA0] max-w-2xl">
            Pusat Ibadah, Kajian Keislaman, dan Pemberdayaan Umat Kampus IAIN Manado.
          </p>
        </div>
      </section>
    );
  }

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + activeSlides.length) % activeSlides.length
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <section
      aria-label="Sorotan Utama Masjid Al Jami'ah IAIN Manado"
      className="relative w-full min-h-screen h-dvh flex flex-col justify-between bg-[#1E1B18] text-[#FAF7F2] overflow-hidden dark-surface"
    >
      {/* Background Media Layer (Supports Both Fullscreen Video & Image Slides) */}
      {activeSlides.map((slide, idx) => {
        const isSlideVideo =
          slide.mediaType === 'VIDEO' && Boolean(slide.videoUrl);
        return (
          <div
            key={slide.id}
            aria-hidden={idx !== safeIndex}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === safeIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'
            }`}
          >
            {isSlideVideo ? (
              <video
                ref={(el) => {
                  videoRefs.current[slide.id] = el;
                }}
                src={slide.videoUrl}
                poster={slide.imageUrl}
                autoPlay={idx === safeIndex}
                muted
                loop={activeSlides.length <= 1}
                playsInline
                onEnded={() => {
                  if (idx === safeIndex && isPlaying && activeSlides.length > 1) {
                    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
                  }
                }}
                onError={() => {
                  if (idx === safeIndex && isPlaying && activeSlides.length > 1) {
                    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
                  }
                }}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover object-center"
              />
            )}

            {/* High-contrast dark warm scrim so white text passes WCAG AA/AAA across every frame */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(22, 18, 15, 0.80) 0%, rgba(22, 18, 15, 0.68) 50%, rgba(22, 18, 15, 0.90) 100%)',
              }}
            />
          </div>
        );
      })}

      {/* Top Spacer for Sticky Transparent Navbar */}
      <div className="h-20 shrink-0" aria-hidden="true" />

      {/* Center Main Editorial Content (Vertically Centered in Any Viewport Size) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-auto py-6">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-medium text-[#E8CFA0] mb-3">
            <span>
              {masehiDate} &bull; {hijriDate}
            </span>
          </div>

          <h1
            style={{ fontSize: 'clamp(2.1rem, 4.5vw, 3.85rem)' }}
            className="font-serif-heading font-bold text-[#FAF7F2] leading-[1.12] tracking-tight mb-5"
          >
            {currentSlide.title}
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-[#F2ECE1] leading-relaxed mb-6 max-w-2xl">
            {currentSlide.subtitle}
          </p>

          <div className="flex items-start sm:items-center gap-2 text-xs sm:text-sm text-[#E8CFA0]">
            <MapPin
              className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0"
              aria-hidden="true"
            />
            <span>{mosqueAddress}</span>
          </div>
        </div>
      </div>

      {/* Bottom Right Control Bar (Harvard-Style Play/Pause + Prev/Next) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 shrink-0">
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={togglePlayPause}
            aria-pressed={!isPlaying}
            aria-label={
              isPlaying
                ? 'Jeda pemutaran video dan slideshow latar'
                : 'Putar kembali video dan slideshow latar'
            }
            className="min-h-[44px] px-4 inline-flex items-center gap-2 rounded-full bg-[#1E1B18]/85 border-2 border-[#E8CFA0] text-[#FAF7F2] text-xs font-bold hover:bg-[#E8CFA0] hover:text-[#1E1B18] transition-colors cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
                <span>{isCurrentVideo ? 'Pause Video' : 'Pause Slide'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                <span>{isCurrentVideo ? 'Play Video' : 'Play Slide'}</span>
              </>
            )}
          </button>

          {activeSlides.length > 1 && (
            <div className="flex items-center gap-1.5">
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
          )}
        </div>
      </div>
    </section>
  );
}

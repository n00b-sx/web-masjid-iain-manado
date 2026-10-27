'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import {
  ManualPrayerTimes,
  MosqueDatabase,
  PrayerName,
} from '@/types/mosque';
import {
  formatIndonesianDate,
  formatRupiah,
  getNextPrayerInfo,
  OBLIGATORY_PRAYERS,
  PRAYER_LIST,
} from '@/lib/prayer-times';
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Calendar,
  Maximize2,
  QrCode,
  Volume2,
  VolumeX,
  Wallet,
  RefreshCw,
} from 'lucide-react';

type SlideType = 'FINANCE' | 'QUOTE' | 'EVENT';

export default function MosqueTVPage() {
  const [db, setDb] = useState<MosqueDatabase | null>(null);
  const [times, setTimes] = useState<ManualPrayerTimes>({
    Subuh: '04:28',
    Syuruq: '05:44',
    Dzuhur: '11:51',
    Ashar: '15:08',
    Maghrib: '17:55',
    Isya: '19:05',
  });
  const [hijriDate, setHijriDate] = useState<string>('Kalender Hijriah WITA');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [now, setNow] = useState<Date>(new Date());
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);

  // Adzan Countdown Fullscreen Overlay State
  const [adzanMode, setAdzanMode] = useState<{
    active: boolean;
    prayerName: PrayerName;
    secondsLeft: number;
  }>({
    active: false,
    prayerName: 'Maghrib',
    secondsLeft: 0,
  });

  // Iqomah Countdown Overlay State
  const [iqomahMode, setIqomahMode] = useState<{
    active: boolean;
    prayerName: PrayerName;
    secondsLeft: number;
  }>({
    active: false,
    prayerName: 'Maghrib',
    secondsLeft: 0,
  });

  // Prayer In Progress State (Displayed in the middle area after Iqomah finishes)
  const [prayerInProgressMode, setPrayerInProgressMode] = useState<{
    active: boolean;
    prayerName: PrayerName;
    secondsLeft: number;
  }>({
    active: false,
    prayerName: 'Maghrib',
    secondsLeft: 0,
  });

  const getAdzanDurationSeconds = useCallback(
    (prayer: PrayerName) => {
      const configuredMin =
        db?.prayerSettings.adzanDurationMinutes?.[
          prayer as keyof typeof db.prayerSettings.iqomahMinutes
        ] ?? 4;
      return Math.max(1, configuredMin) * 60;
    },
    [db?.prayerSettings.adzanDurationMinutes]
  );

  const getPrayerDurationSeconds = useCallback(
    (prayer: PrayerName) => {
      const defaultMin = prayer === 'Isya' ? 15 : 12;
      const configuredMin =
        db?.prayerSettings.prayerDurationMinutes?.[
          prayer as keyof typeof db.prayerSettings.iqomahMinutes
        ] ?? defaultMin;
      return Math.max(1, configuredMin) * 60;
    },
    [db?.prayerSettings.prayerDurationMinutes]
  );

  // Web Audio Beep generator (no external MP3 dependency required)
  const playBeep = useCallback((enabled: boolean) => {
    if (!enabled || typeof window === 'undefined') return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Ignore audio block if user hasn't interacted yet
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/mosque', { cache: 'no-store' });
      if (!res.ok) throw new Error('Gagal memuat data layar TV masjid.');
      const json = await res.json();
      setDb(json.db);
      if (json.prayerData?.times) {
        setTimes(json.prayerData.times);
      }
      if (json.prayerData?.hijriDateString) {
        setHijriDate(json.prayerData.hijriDateString);
      }
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal terhubung ke server masjid.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + periodic auto-sync every 45 seconds so Admin changes appear automatically on TV
  useEffect(() => {
    fetchData();
    const syncTimer = setInterval(fetchData, 45000);
    return () => clearInterval(syncTimer);
  }, [fetchData]);

  // Real-time 1-second clock, automatic prayer time check, Adzan -> Iqomah -> Prayer In Progress tick
  useEffect(() => {
    const clockTimer = setInterval(() => {
      const current = new Date();
      setNow(current);

      // Check if current WITA time exactly matches an obligatory prayer time (HH:mm:00)
      const witaParts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Makassar',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(current);
      const [hh, mm, ss] = witaParts.split(':');
      const hhmm = `${hh}:${mm}`;

      if (ss === '00') {
        const matchedPrayer = OBLIGATORY_PRAYERS.find(
          (p) => times[p] === hhmm
        );
        if (matchedPrayer) {
          if (db?.tvSettings.enableBeepSound) {
            playBeep(true);
          }
          setPrayerInProgressMode((prev) => ({ ...prev, active: false, secondsLeft: 0 }));
          setIqomahMode((prev) => ({ ...prev, active: false, secondsLeft: 0 }));
          setAdzanMode({
            active: true,
            prayerName: matchedPrayer,
            secondsLeft: getAdzanDurationSeconds(matchedPrayer),
          });
        }
      }

      setAdzanMode((prev) => {
        if (!prev.active) return prev;
        if (prev.secondsLeft <= 1) {
          const waitMin =
            db?.prayerSettings.iqomahMinutes[
              prev.prayerName as keyof typeof db.prayerSettings.iqomahMinutes
            ] || 10;
          if (db?.tvSettings.enableBeepSound) {
            playBeep(true);
          }
          // Automatically transition from Adzan to Iqomah countdown
          setIqomahMode({
            active: true,
            prayerName: prev.prayerName,
            secondsLeft: waitMin * 60,
          });
          return { ...prev, active: false, secondsLeft: 0 };
        }
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });

      setIqomahMode((prev) => {
        if (!prev.active) return prev;
        if (prev.secondsLeft <= 1) {
          if (db?.tvSettings.enableBeepSound) {
            playBeep(true);
          }
          // Automatically transition to "Sholat (Nama Sholat) Sedang Berlangsung"
          setPrayerInProgressMode({
            active: true,
            prayerName: prev.prayerName,
            secondsLeft: getPrayerDurationSeconds(prev.prayerName),
          });
          return { ...prev, active: false, secondsLeft: 0 };
        }
        if (prev.secondsLeft <= 4 && db?.tvSettings.enableBeepSound) {
          playBeep(true);
        }
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });

      setPrayerInProgressMode((prev) => {
        if (!prev.active) return prev;
        if (prev.secondsLeft <= 1) {
          return { ...prev, active: false, secondsLeft: 0 };
        }
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(clockTimer);
  }, [
    db?.prayerSettings.iqomahMinutes,
    db?.tvSettings.enableBeepSound,
    getAdzanDurationSeconds,
    getPrayerDurationSeconds,
    playBeep,
    times,
  ]);

  // Enabled slides list based on Admin TV Settings
  const enabledSlides: SlideType[] = [];
  if (db?.tvSettings.showFinanceSlide !== false) enabledSlides.push('FINANCE');
  if (db?.tvSettings.showQuoteSlide !== false) enabledSlides.push('QUOTE');
  if (db?.tvSettings.showEventSlide !== false) enabledSlides.push('EVENT');
  if (enabledSlides.length === 0) enabledSlides.push('QUOTE');

  const slideDurationMs = Math.max(
    5,
    db?.tvSettings.slideDurationSeconds || 12
  ) * 1000;

  // Slide & Quote rotation timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % enabledSlides.length);
      setActiveQuoteIndex((prev) => prev + 1);
    }, slideDurationMs);
    return () => clearInterval(timer);
  }, [enabledSlides.length, slideDurationMs]);

  const handleToggleFullscreen = () => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const triggerSimulateAdzan = (prayer: PrayerName = 'Maghrib') => {
    const targetPrayer = prayer === 'Syuruq' ? 'Subuh' : prayer;
    if (db?.tvSettings.enableBeepSound) {
      playBeep(true);
    }
    setPrayerInProgressMode({ active: false, prayerName: targetPrayer, secondsLeft: 0 });
    setIqomahMode({ active: false, prayerName: targetPrayer, secondsLeft: 0 });
    setAdzanMode({
      active: true,
      prayerName: targetPrayer,
      secondsLeft: getAdzanDurationSeconds(targetPrayer),
    });
  };

  const triggerSimulateIqomah = (prayer: PrayerName = 'Maghrib') => {
    const targetPrayer = prayer === 'Syuruq' ? 'Subuh' : prayer;
    const waitMin =
      db?.prayerSettings.iqomahMinutes[
        targetPrayer as keyof typeof db.prayerSettings.iqomahMinutes
      ] || 10;
    if (db?.tvSettings.enableBeepSound) {
      playBeep(true);
    }
    setAdzanMode({ active: false, prayerName: targetPrayer, secondsLeft: 0 });
    setPrayerInProgressMode({ active: false, prayerName: targetPrayer, secondsLeft: 0 });
    setIqomahMode({
      active: true,
      prayerName: targetPrayer,
      secondsLeft: waitMin * 60,
    });
  };

  const triggerSimulatePrayerInProgress = (prayer: PrayerName = 'Maghrib') => {
    const targetPrayer = prayer === 'Syuruq' ? 'Subuh' : prayer;
    setAdzanMode({ active: false, prayerName: targetPrayer, secondsLeft: 0 });
    setIqomahMode({ active: false, prayerName: targetPrayer, secondsLeft: 0 });
    setPrayerInProgressMode({
      active: true,
      prayerName: targetPrayer,
      secondsLeft: getPrayerDurationSeconds(targetPrayer),
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#1E1B18] text-[#FAF7F2] flex flex-col items-center justify-center p-6 dark-surface">
        <RefreshCw className="w-10 h-10 text-[#E8CFA0] animate-spin mb-4" aria-hidden="true" />
        <h1 className="font-serif-heading text-2xl font-bold text-[#FAF7F2] mb-2">
          Memuat Layar Informasi Smart TV Masjid Al Jami&apos;ah...
        </h1>
        <p className="text-sm text-[#E8CFA0]">
          Menyinkronkan jadwal sholat Kota Manado (WITA), laporan kas, dan kutipan hadits.
        </p>
      </main>
    );
  }

  if (error || !db) {
    return (
      <main className="min-h-screen bg-[#1E1B18] text-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center dark-surface">
        <h1 className="font-serif-heading text-2xl font-bold text-[#FAF7F2] mb-2">
          Gangguan Koneksi Data Layar TV
        </h1>
        <p className="text-sm text-[#E8CFA0] mb-6 max-w-md">
          {error || 'Data sistem belum dapat dimuat.'} Pastikan perangkat TV terhubung ke jaringan server kampus.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={fetchData}
            className="px-5 py-2.5 min-h-[44px] rounded-md bg-[#A84A2E] text-white font-semibold text-sm cursor-pointer"
          >
            Muat Ulang Sekarang
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 min-h-[44px] inline-flex items-center rounded-md border border-[#E8CFA0] text-[#E8CFA0] font-semibold text-sm"
          >
            Kembali ke Beranda Web
          </Link>
        </div>
      </main>
    );
  }

  const nextInfo = getNextPrayerInfo(times, now);
  const witaClock = now.toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Makassar',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const masehiDate = formatIndonesianDate(now);

  const currentSlide = enabledSlides[activeSlideIndex % enabledSlides.length];
  const activeQuotes = db.quotes.filter((q) => q.active);
  const currentQuote =
    activeQuotes.length > 0
      ? activeQuotes[activeQuoteIndex % activeQuotes.length]
      : null;

  // Finance totals for TV infographic
  const totalIn = db.transactions
    .filter((t) => t.type === 'IN')
    .reduce((a, b) => a + b.amount, 0);
  const totalOut = db.transactions
    .filter((t) => t.type === 'OUT')
    .reduce((a, b) => a + b.amount, 0);
  const totalBalance = totalIn - totalOut;

  const getFundBalance = (cat: 'OPERASIONAL' | 'PEMBANGUNAN' | 'SOSIAL_ZISWAF') => {
    const fIn = db.transactions
      .filter((t) => t.category === cat && t.type === 'IN')
      .reduce((a, b) => a + b.amount, 0);
    const fOut = db.transactions
      .filter((t) => t.category === cat && t.type === 'OUT')
      .reduce((a, b) => a + b.amount, 0);
    return { fIn, fOut, bal: fIn - fOut };
  };

  const opFund = getFundBalance('OPERASIONAL');
  const devFund = getFundBalance('PEMBANGUNAN');
  const socFund = getFundBalance('SOSIAL_ZISWAF');

  const adzanMinutesPart = String(Math.floor(adzanMode.secondsLeft / 60)).padStart(
    2,
    '0'
  );
  const adzanSecondsPart = String(adzanMode.secondsLeft % 60).padStart(2, '0');

  const iqomahMinutesPart = String(Math.floor(iqomahMode.secondsLeft / 60)).padStart(
    2,
    '0'
  );
  const iqomahSecondsPart = String(iqomahMode.secondsLeft % 60).padStart(2, '0');

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#1E1B18] text-[#FAF7F2] flex flex-col justify-between select-none dark-surface">
      {/* FULL-SCREEN OVERLAYS: ADZAN & IQOMAH COUNTDOWN WITH MOTION FADE */}
      <AnimatePresence mode="wait">
        {adzanMode.active && (
          <motion.div
            key={`adzan-overlay-${adzanMode.prayerName}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeInOut' }}
            role="dialog"
            aria-modal="true"
            aria-label={`Waktunya Adzan Sholat ${adzanMode.prayerName}`}
            className="fixed inset-0 z-50 bg-[#1E1B18] flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="max-w-5xl w-full bg-[#2C2520] border-2 border-[#E8CFA0] rounded-2xl p-8 sm:p-14 shadow-2xl flex flex-col items-center">
              <span className="inline-block px-4 py-1.5 rounded bg-[#A84A2E] text-white text-sm sm:text-base font-bold mb-6">
                Panggilan Ibadah Sholat Wajib &bull; Kota Manado (WITA)
              </span>

              <h2 className="font-serif-heading font-bold tracking-tight flex flex-col items-center justify-center gap-2 sm:gap-4 mb-6">
                <span
                  style={{ fontSize: 'clamp(3.25rem, 7.5vw, 7.25rem)' }}
                  className="block text-[#E8CFA0] leading-[1.04]"
                >
                  Waktunya Adzan
                </span>
                <span
                  style={{ fontSize: 'clamp(4rem, 9vw, 8.75rem)' }}
                  className="block text-[#FAF7F2] leading-[1.02]"
                >
                  Sholat {adzanMode.prayerName}
                </span>
              </h2>

              <div className="my-4 sm:my-6 px-8 py-4 rounded-xl bg-[#1E1B18] border border-[#E8CFA0]/40">
                <span className="block text-xs sm:text-sm font-semibold text-[#E8CFA0] mb-1">
                  DURASI ADZAN BERLANGSUNG
                </span>
                <div className="font-mono text-5xl sm:text-7xl font-bold text-[#FAF7F2] tracking-wider">
                  {adzanMinutesPart}:{adzanSecondsPart}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => triggerSimulateIqomah(adzanMode.prayerName)}
                  className="px-6 py-3 min-h-[44px] rounded-md bg-[#A84A2E] text-white text-sm font-semibold hover:bg-[#8E3B22] cursor-pointer"
                >
                  Lanjut ke Hitung Mundur Iqomah
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAdzanMode({ active: false, prayerName: 'Maghrib', secondsLeft: 0 })
                  }
                  className="px-6 py-3 min-h-[44px] rounded-md border border-[#E8CFA0] text-[#E8CFA0] text-sm font-semibold hover:bg-[#E8CFA0] hover:text-[#1E1B18] cursor-pointer"
                >
                  Tutup Tampilan Adzan
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {iqomahMode.active && (
          <motion.div
            key={`iqomah-overlay-${iqomahMode.prayerName}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeInOut' }}
            role="dialog"
            aria-modal="true"
            aria-label="Hitung Mundur Waktu Iqomah"
            className="fixed inset-0 z-50 bg-[#1E1B18] flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="max-w-4xl w-full bg-[#2C2520] border-2 border-[#E8CFA0] rounded-2xl p-8 sm:p-12 shadow-2xl">
              <span className="inline-block px-4 py-1.5 rounded bg-[#A84A2E] text-white text-sm sm:text-base font-bold mb-4">
                Waktu Sholat {iqomahMode.prayerName} Telah Tiba
              </span>

              <h2 className="font-serif-heading text-2xl sm:text-4xl font-bold text-[#FAF7F2] mb-2">
                Hitung Mundur Menuju Iqomah {iqomahMode.prayerName}
              </h2>

              <div className="my-6 sm:my-8 font-mono text-6xl sm:text-8xl lg:text-9xl font-bold text-[#E8CFA0] tracking-wider">
                {iqomahMinutesPart}:{iqomahSecondsPart}
              </div>

              <div className="bg-[#1E1B18] border border-[#E8CFA0]/40 rounded-xl p-5 mb-6">
                <p className="font-arabic text-2xl sm:text-3xl text-[#E8CFA0] mb-2">
                  سَوُّوا صُفُوفَكُمْ فَإِنَّ تَسْوِيَةَ الصُّفُوفِ مِنْ إِقَامَةِ الصَّلَاةِ
                </p>
                <p className="text-base sm:text-xl font-semibold text-[#FAF7F2]">
                  {db.tvSettings.shafWarningText}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => triggerSimulatePrayerInProgress(iqomahMode.prayerName)}
                  className="px-6 py-3 min-h-[44px] rounded-md bg-[#A84A2E] text-white text-sm font-semibold hover:bg-[#8E3B22] cursor-pointer"
                >
                  Mulai Sholat Sekarang
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setIqomahMode({ active: false, prayerName: 'Maghrib', secondsLeft: 0 })
                  }
                  className="px-6 py-3 min-h-[44px] rounded-md border border-[#E8CFA0] text-[#E8CFA0] text-sm font-semibold hover:bg-[#E8CFA0] hover:text-[#1E1B18] cursor-pointer"
                >
                  Tutup Tampilan Iqomah
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TV TOP HEADER */}
      <header className="bg-[#2C2520] border-b-2 border-[#A84A2E] px-4 sm:px-8 py-3.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {db.mosqueProfile.logoUrl ? (
              <img
                src={db.mosqueProfile.logoUrl}
                alt={`Logo ${db.mosqueProfile.name}`}
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#A84A2E] text-white flex items-center justify-center font-serif-heading font-bold text-xl shrink-0">
                AJ
              </div>
            )}
            <div>
              <h1 className="font-serif-heading text-lg sm:text-2xl font-bold text-[#FAF7F2] leading-tight">
                {db.mosqueProfile.name}
              </h1>
              <p className="text-xs sm:text-sm text-[#E8CFA0]">
                {db.mosqueProfile.institution} &bull; {masehiDate} &bull; {hijriDate}
              </p>
            </div>
          </div>
        </div>

        {/* Right Controls & Real-time WITA Clock */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-3 py-2 min-h-[44px] inline-flex items-center gap-1.5 rounded-md bg-[#1E1B18] border border-white/25 text-xs font-semibold text-[#FAF7F2] hover:border-[#E8CFA0]"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Web Publik</span>
            </Link>

            <button
              type="button"
              onClick={() => triggerSimulateAdzan(nextInfo.nextPrayer)}
              className="px-3 py-2 min-h-[44px] inline-flex items-center gap-1.5 rounded-md bg-[#A84A2E] text-white text-xs font-semibold hover:bg-[#8E3B22] cursor-pointer"
              title="Uji tampilan layar penuh Waktunya Adzan"
            >
              <Bell className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Simulasi Adzan</span>
            </button>

            <button
              type="button"
              onClick={() => triggerSimulateIqomah(nextInfo.nextPrayer)}
              className="px-3 py-2 min-h-[44px] inline-flex items-center gap-1.5 rounded-md bg-[#1E1B18] border border-[#E8CFA0]/50 text-[#E8CFA0] text-xs font-semibold hover:border-[#E8CFA0] cursor-pointer"
              title="Uji tampilan hitung mundur Iqomah layar penuh"
            >
              <span>Simulasi Iqomah</span>
            </button>

            <button
              type="button"
              onClick={() =>
                prayerInProgressMode.active
                  ? setPrayerInProgressMode({
                      active: false,
                      prayerName: 'Maghrib',
                      secondsLeft: 0,
                    })
                  : triggerSimulatePrayerInProgress(nextInfo.nextPrayer)
              }
              className={`px-3 py-2 min-h-[44px] inline-flex items-center gap-1.5 rounded-md border text-xs font-semibold cursor-pointer ${
                prayerInProgressMode.active
                  ? 'bg-[#E8CFA0] text-[#1E1B18] border-[#E8CFA0]'
                  : 'bg-[#1E1B18] text-[#E8CFA0] border-[#E8CFA0]/50 hover:border-[#E8CFA0]'
              }`}
              title="Uji tampilan Sholat Sementara Berlangsung di area tengah"
            >
              <span>
                {prayerInProgressMode.active ? 'Selesai Sholat' : 'Simulasi Sholat'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="px-3 py-2 min-h-[44px] inline-flex items-center gap-1.5 rounded-md bg-[#1E1B18] border border-white/25 text-xs font-semibold text-[#E8CFA0] hover:border-[#E8CFA0] cursor-pointer"
              title="Tampilkan Layar Penuh di Smart TV"
            >
              <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Layar Penuh</span>
            </button>
          </div>

          <div className="bg-[#1E1B18] border border-[#E8CFA0]/40 rounded-lg px-4 py-2 flex items-center gap-3">
            <div className="text-right">
              <span className="block text-[11px] font-semibold text-[#E8CFA0]">
                WAKTU MANADO (WITA)
              </span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-[#FAF7F2] tracking-wider">
                {witaClock}
              </span>
            </div>
            {db.tvSettings.enableBeepSound ? (
              <Volume2
                className="w-4 h-4 text-[#E8CFA0]"
                aria-label="Penanda suara beep aktif"
              />
            ) : (
              <VolumeX
                className="w-4 h-4 text-[#FAF7F2]/50"
                aria-label="Penanda suara beep nonaktif"
              />
            )}
          </div>
        </div>
      </header>

      {/* 2. TV MAIN STAGE (PRAYER IN PROGRESS MODE OR DYNAMIC CAROUSEL) */}
      <main className="flex-1 px-4 sm:px-8 py-4 flex flex-col justify-between overflow-y-auto lg:overflow-hidden">
        <AnimatePresence mode="wait">
          {prayerInProgressMode.active ? (
            <motion.div
              key={`prayer-in-progress-${prayerInProgressMode.prayerName}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: 'easeInOut' }}
              className="flex-1 bg-[#2C2520] border border-white/15 rounded-xl p-6 sm:p-10 flex items-center justify-center text-center my-auto"
            >
              <h2 className="font-serif-heading font-bold tracking-tight flex flex-col items-center justify-center gap-3 sm:gap-5">
                <span
                  style={{ fontSize: 'clamp(4.25rem, 9.5vw, 9.5rem)' }}
                  className="block text-[#FAF7F2] leading-[1.02]"
                >
                  Sholat {prayerInProgressMode.prayerName}
                </span>
                <span
                  style={{ fontSize: 'clamp(3.25rem, 7.5vw, 7.5rem)' }}
                  className="block text-[#E8CFA0] leading-[1.06]"
                >
                  Sedang Berlangsung
                </span>
              </h2>
            </motion.div>
          ) : (
            <motion.div
              key="tv-slides-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="flex-1 flex flex-col justify-between"
            >
              {/* Next Prayer Countdown Bar (3 Slide Navigation Buttons Removed) */}
              <div className="flex items-center justify-end mb-3 shrink-0">
                <div className="text-xs font-semibold text-[#E8CFA0] bg-[#2C2520] px-3.5 py-1.5 rounded-md border border-white/15">
                  Sholat Berikutnya: <strong className="text-white">{nextInfo.nextPrayer}</strong> ({nextInfo.nextTimeStr} WITA) &bull; Hitung Mundur:{' '}
                  <strong className="font-mono text-white">-{nextInfo.countdownText}</strong>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {/* SLIDE 1: FINANCE INFOGRAPHIC & QRIS */}
                {currentSlide === 'FINANCE' && (
                  <motion.div
                    key="slide-finance"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch my-auto"
                  >
                    <div className="lg:col-span-8 bg-[#2C2520] border border-white/15 rounded-xl p-5 sm:p-6 flex flex-col justify-between">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-4 mb-4">
                        <div>
                          <span className="text-xs font-bold text-[#E8CFA0] flex items-center gap-1.5">
                            <Wallet className="w-4 h-4" aria-hidden="true" />
                            <span>TRANSPARANSI KEUANGAN MASJID AL JAMI&apos;AH</span>
                          </span>
                          <h2 className="font-serif-heading text-xl sm:text-2xl font-bold text-[#FAF7F2]">
                            Laporan Posisi Saldo &amp; Realisasi 3 Pos Kas Masjid
                          </h2>
                        </div>
                        <div className="bg-[#1E1B18] px-4 py-2.5 rounded-lg border border-[#E8CFA0]/40 text-right">
                          <span className="text-xs text-[#E8CFA0] block">Total Saldo Gabungan</span>
                          <span className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#FAF7F2]">
                            {formatRupiah(totalBalance)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-auto">
                        {[
                          {
                            name: '1. Kas Operasional',
                            desc: 'Kebersihan, listrik, air wudhu & kajian harian',
                            data: opFund,
                          },
                          {
                            name: '2. Kas Pembangunan',
                            desc: 'Inventaris tata suara, karpet & fasilitas',
                            data: devFund,
                          },
                          {
                            name: '3. Kas Sosial & ZISWAF',
                            desc: 'Santunan & beasiswa mahasiswa dhuafa',
                            data: socFund,
                          },
                        ].map((f) => (
                          <div
                            key={f.name}
                            className="bg-[#1E1B18] border border-white/15 rounded-xl p-4 flex flex-col justify-between"
                          >
                            <div>
                              <h3 className="font-serif-heading font-bold text-base sm:text-lg text-[#E8CFA0] mb-1">
                                {f.name}
                              </h3>
                              <p className="text-xs text-[#F2ECE1]/80 mb-3">{f.desc}</p>
                            </div>

                            <div className="space-y-1.5 pt-3 border-t border-white/15 text-xs">
                              <div className="flex justify-between text-[#8CD975]">
                                <span>Pemasukan:</span>
                                <strong className="font-mono">+{formatRupiah(f.data.fIn)}</strong>
                              </div>
                              <div className="flex justify-between text-[#F29C85]">
                                <span>Pengeluaran:</span>
                                <strong className="font-mono">-{formatRupiah(f.data.fOut)}</strong>
                              </div>
                              <div className="flex justify-between text-sm font-bold text-[#FAF7F2] pt-2 border-t border-white/15">
                                <span>Saldo Kas:</span>
                                <span className="text-[#E8CFA0]">{formatRupiah(f.data.bal)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs text-[#E8CFA0]">
                        <span>
                          Rekening Infaq: <strong className="text-white">{db.donationInfo.bankName}</strong> &bull; No. Rek:{' '}
                          <strong className="font-mono text-white">{db.donationInfo.accountNumber}</strong> a.n.{' '}
                          {db.donationInfo.accountHolder}
                        </span>
                        {db.donationInfo.isSampleDataNotice && (
                          <span className="px-2 py-0.5 rounded bg-[#A84A2E] text-white font-semibold">
                            Data Contoh Awal (Ubah di Admin)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right QRIS Card on TV */}
                    <div className="lg:col-span-4 bg-[#2C2520] border border-white/15 rounded-xl p-5 sm:p-6 flex flex-col items-center justify-between text-center">
                      <div>
                        <span className="inline-block px-3 py-1 rounded bg-[#A84A2E] text-white text-xs font-bold mb-2">
                          INFAQ DIGITAL QRIS
                        </span>
                        <h3 className="font-serif-heading text-lg sm:text-xl font-bold text-[#FAF7F2] mb-1">
                          Pindai QRIS dari Bangku Jamaah
                        </h3>
                        <p className="text-xs text-[#E8CFA0] mb-4">
                          Mendukung seluruh aplikasi Mobile Banking dan dompet digital.
                        </p>
                      </div>

                      <div className="w-full max-w-[220px] aspect-square bg-white rounded-xl p-3 flex flex-col items-center justify-center border-2 border-[#E8CFA0]">
                        {db.donationInfo.qrisImageUrl ? (
                          <img
                            src={db.donationInfo.qrisImageUrl}
                            alt="QRIS Masjid Al Jami'ah IAIN Manado"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-[#1E1B18] p-2">
                            <QrCode className="w-16 h-16 text-[#A84A2E] mx-auto mb-2" aria-hidden="true" />
                            <p className="text-xs font-bold mb-1">[QRIS BELUM DIUNGGAH]</p>
                            <p className="text-[11px] text-[#524740]">
                              Unggah gambar QRIS pada menu Keuangan di Panel Admin.
                            </p>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-[#F2ECE1] mt-3">
                        Konfirmasi WA Takmir: <strong className="text-[#E8CFA0]">+{db.donationInfo.confirmationWhatsapp}</strong>
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* SLIDE 2: ISLAMIC QUOTES / HADITH */}
                {currentSlide === 'QUOTE' && (
                  <motion.div
                    key={`slide-quote-${currentQuote?.id || activeQuoteIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="flex-1 bg-[#2C2520] border border-white/15 rounded-xl p-6 sm:p-10 flex flex-col items-center justify-center text-center my-auto"
                  >
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-[#1E1B18] border border-[#E8CFA0]/40 text-xs font-bold text-[#E8CFA0] mb-6">
                      <BookOpen className="w-4 h-4" aria-hidden="true" />
                      <span>UNTAIAN AYAT AL-QUR&apos;AN &amp; HADITS PILIHAN</span>
                    </div>

                    {currentQuote ? (
                      <div className="max-w-4xl mx-auto">
                        <p
                          dir="rtl"
                          lang="ar"
                          className="font-arabic text-2xl sm:text-4xl lg:text-5xl text-[#E8CFA0] leading-[2.1] mb-6"
                        >
                          {currentQuote.arabicText}
                        </p>

                        <blockquote className="font-serif-heading text-lg sm:text-2xl lg:text-3xl font-semibold text-[#FAF7F2] leading-relaxed mb-6">
                          &ldquo;{currentQuote.translation}&rdquo;
                        </blockquote>

                        <p className="inline-block px-4 py-1.5 rounded bg-[#A84A2E] text-white text-xs sm:text-sm font-bold">
                          Sumber: {currentQuote.source}
                        </p>
                      </div>
                    ) : (
                      <p className="text-base text-[#E8CFA0]">
                        Belum ada kutipan hadits aktif. Tambahkan melalui Panel Admin.
                      </p>
                    )}
                  </motion.div>
                )}

                {/* SLIDE 3: TODAY'S AGENDA & JUMAT OFFICERS */}
                {currentSlide === 'EVENT' && (
                  <motion.div
                    key="slide-event"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch my-auto"
                  >
                    <div className="lg:col-span-7 bg-[#2C2520] border border-white/15 rounded-xl p-5 sm:p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-[#E8CFA0] mb-1">
                          <Calendar className="w-4 h-4" aria-hidden="true" />
                          <span>AGENDA KEGIATAN &amp; KAJIAN MASJID</span>
                        </div>
                        <h2 className="font-serif-heading text-xl sm:text-2xl font-bold text-[#FAF7F2] mb-4">
                          Jadwal Kajian Hari Ini &amp; Rutin Pekanan
                        </h2>

                        <div className="space-y-3">
                          {db.events.slice(0, 3).map((ev) => (
                            <div
                              key={ev.id}
                              className="bg-[#1E1B18] border border-white/15 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                            >
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                      ev.isToday
                                        ? 'bg-[#A84A2E] text-white'
                                        : 'bg-[#2C2520] text-[#E8CFA0]'
                                    }`}
                                  >
                                    {ev.dayLabel}
                                  </span>
                                  <span className="text-xs font-mono text-[#E8CFA0]">
                                    {ev.time}
                                  </span>
                                </div>
                                <h3 className="font-bold text-sm sm:text-base text-[#FAF7F2]">
                                  {ev.title}
                                </h3>
                                <p className="text-xs text-[#E8CFA0]">
                                  Pemateri: {ev.speaker} &bull; {ev.location}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-5 bg-[#2C2520] border border-white/15 rounded-xl p-5 sm:p-6 flex flex-col justify-between">
                      <div>
                        <span className="inline-block px-3 py-1 rounded bg-[#A84A2E] text-white text-xs font-bold mb-2">
                          PETUGAS SHOLAT JUMAT
                        </span>
                        <h3 className="font-serif-heading text-xl font-bold text-[#FAF7F2] mb-1">
                          {db.prayerSettings.jumatOfficer.date}
                        </h3>
                        <p className="text-xs text-[#E8CFA0] mb-4">
                          Tema Khutbah: &ldquo;{db.prayerSettings.jumatOfficer.khatibTopic}&rdquo;
                        </p>

                        <div className="space-y-2.5 text-xs sm:text-sm">
                          <div className="bg-[#1E1B18] p-3 rounded-lg border border-white/15 flex justify-between">
                            <span className="text-[#E8CFA0]">Khatib Jumat:</span>
                            <strong className="text-[#FAF7F2]">
                              {db.prayerSettings.jumatOfficer.khatib}
                            </strong>
                          </div>
                          <div className="bg-[#1E1B18] p-3 rounded-lg border border-white/15 flex justify-between">
                            <span className="text-[#E8CFA0]">Imam Sholat:</span>
                            <strong className="text-[#FAF7F2]">
                              {db.prayerSettings.jumatOfficer.imam}
                            </strong>
                          </div>
                          <div className="bg-[#1E1B18] p-3 rounded-lg border border-white/15 flex justify-between">
                            <span className="text-[#E8CFA0]">Muadzin / Bilal:</span>
                            <strong className="text-[#FAF7F2]">
                              {db.prayerSettings.jumatOfficer.muadzin}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/15 text-xs text-[#E8CFA0]">
                        {db.tvSettings.shafWarningText}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 3. TV BOTTOM PRAYER TIMES BAR + RUNNING TEXT MARQUEE */}
      <footer className="shrink-0 bg-[#2C2520] border-t-2 border-[#E8CFA0]/40">
        {/* 6 Prayer Time Boxes */}
        <div className="px-4 sm:px-8 py-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {PRAYER_LIST.map((name) => {
            const isNext = nextInfo.nextPrayer === name;
            const iqomahMin =
              name !== 'Syuruq'
                ? db.prayerSettings.iqomahMinutes[
                    name as keyof typeof db.prayerSettings.iqomahMinutes
                  ]
                : null;

            return (
              <div
                key={name}
                className={`rounded-lg px-4 py-2.5 border flex flex-col justify-between ${
                  isNext
                    ? 'bg-[#A84A2E] text-white border-[#E8CFA0]'
                    : 'bg-[#1E1B18] text-[#FAF7F2] border-white/15'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs sm:text-sm font-bold ${
                      isNext ? 'text-white' : 'text-[#E8CFA0]'
                    }`}
                  >
                    {name}
                  </span>
                  {isNext && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1E1B18] text-[#E8CFA0]">
                      BERIKUTNYA
                    </span>
                  )}
                </div>

                <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight my-0.5">
                  {times[name]}
                </div>

                <div
                  className={`text-[11px] ${
                    isNext ? 'text-white' : 'text-[#E8CFA0]/80'
                  }`}
                >
                  {iqomahMin !== null ? `Iqomah +${iqomahMin} mnt` : 'Terbit Fajar'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Running Text Marquee */}
        <div className="bg-[#1E1B18] border-t border-white/15 py-2 px-4 overflow-hidden flex items-center">
          <span className="px-2.5 py-0.5 rounded bg-[#A84A2E] text-white text-xs font-bold shrink-0 mr-4">
            INFO TAKMIR
          </span>
          <div className="overflow-hidden whitespace-nowrap flex-1">
            <div className="animate-marquee-tv text-xs sm:text-sm font-medium text-[#E8CFA0]">
              {[...db.tvSettings.runningText, ...db.tvSettings.runningText].map(
                (txt, i) => (
                  <span key={i} className="mx-8 inline-block">
                    &bull; {txt}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

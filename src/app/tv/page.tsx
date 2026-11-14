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
  Eye,
  EyeOff,
  Maximize2,
  QrCode,
  RefreshCw,
  Tv,
  Volume2,
  VolumeX,
  Wallet,
} from 'lucide-react';

type SlideType = 'FINANCE' | 'QUOTE' | 'EVENT';

const STAGE_WIDTH = 1920;
const STAGE_HEIGHT = 1080;

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

  // Fixed 1920x1080 aspect-ratio auto-scaler state
  const [stageScale, setStageScale] = useState<number>(1);
  const [scaleReady, setScaleReady] = useState<boolean>(false);
  const [isTvApp, setIsTvApp] = useState<boolean>(false);
  const [kioskMode, setKioskMode] = useState<boolean>(false);

  // Detect viewport size and lock 1920x1080 canvas scale so TV browsers / Android TV DPI never break layout
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = window.navigator.userAgent || '';
    const params = new URLSearchParams(window.location.search);
    const fromTvApk = ua.includes('MasjidAlJamiahTV');
    const kioskParam = params.get('kiosk') === '1' || fromTvApk;

    setIsTvApp(fromTvApk);
    setKioskMode(kioskParam);

    const updateScale = () => {
      const vw = window.innerWidth || STAGE_WIDTH;
      const vh = window.innerHeight || STAGE_HEIGHT;
      const nextScale = Math.min(vw / STAGE_WIDTH, vh / STAGE_HEIGHT);
      setStageScale(nextScale > 0 ? nextScale : 1);
      setScaleReady(true);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    window.addEventListener('orientationchange', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
      window.removeEventListener('orientationchange', updateScale);
    };
  }, []);

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

  // Initial fetch + periodic auto-sync every 20 seconds so Admin & Bendahara changes appear automatically on TV
  useEffect(() => {
    fetchData();
    const syncTimer = setInterval(fetchData, 20000);
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
          setPrayerInProgressMode((prev) => ({
            ...prev,
            active: false,
            secondsLeft: 0,
          }));
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

  const slideDurationMs =
    Math.max(5, db?.tvSettings.slideDurationSeconds || 12) * 1000;

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
    setPrayerInProgressMode({
      active: false,
      prayerName: targetPrayer,
      secondsLeft: 0,
    });
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
    setPrayerInProgressMode({
      active: false,
      prayerName: targetPrayer,
      secondsLeft: 0,
    });
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
      <main className="fixed inset-0 bg-[#14110F] text-[#FAF7F2] flex flex-col items-center justify-center p-6 dark-surface">
        <RefreshCw
          className="w-12 h-12 text-[#E8CFA0] animate-spin mb-4"
          aria-hidden="true"
        />
        <h1 className="font-serif-heading text-2xl font-bold text-[#FAF7F2] mb-2 text-center">
          Memuat Layar Informasi Smart TV Masjid Al Jami&apos;ah...
        </h1>
        <p className="text-sm text-[#E8CFA0] text-center">
          Menyinkronkan jadwal sholat Kota Manado (WITA), laporan kas, dan kutipan hadits.
        </p>
      </main>
    );
  }

  if (error && !db) {
    return (
      <main className="fixed inset-0 bg-[#14110F] text-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center dark-surface">
        <Tv className="w-14 h-14 text-[#E8CFA0] mb-4" aria-hidden="true" />
        <h1 className="font-serif-heading text-2xl font-bold text-[#FAF7F2] mb-2">
          Menghubungkan ke Server Masjid Al Jami&apos;ah
        </h1>
        <p className="text-sm text-[#E8CFA0] mb-6 max-w-md">
          {error} Sistem akan otomatis menyinkronkan ulang saat jaringan aktif.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={fetchData}
            className="px-5 py-2.5 min-h-[44px] rounded-md bg-[#A84A2E] text-white font-semibold text-sm cursor-pointer"
          >
            Muat Ulang Sekarang
          </button>
          {!isTvApp && (
            <Link
              href="/"
              className="px-5 py-2.5 min-h-[44px] inline-flex items-center rounded-md border border-[#E8CFA0] text-[#E8CFA0] font-semibold text-sm"
            >
              Kembali ke Beranda Web
            </Link>
          )}
        </div>
      </main>
    );
  }

  if (!db) return null;

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
  const slideLabelMap: Record<SlideType, string> = {
    FINANCE: 'Transparansi Kas & Infaq QRIS',
    QUOTE: 'Untaian Ayat & Hadits Pilihan',
    EVENT: 'Agenda Kajian & Petugas Jumat',
  };

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

  const getFundBalance = (
    cat: 'OPERASIONAL' | 'PEMBANGUNAN' | 'SOSIAL_ZISWAF'
  ) => {
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

  const adzanMinutesPart = String(
    Math.floor(adzanMode.secondsLeft / 60)
  ).padStart(2, '0');
  const adzanSecondsPart = String(adzanMode.secondsLeft % 60).padStart(2, '0');

  const iqomahMinutesPart = String(
    Math.floor(iqomahMode.secondsLeft / 60)
  ).padStart(2, '0');
  const iqomahSecondsPart = String(iqomahMode.secondsLeft % 60).padStart(
    2,
    '0'
  );

  const marqueeItems =
    db.tvSettings.runningText && db.tvSettings.runningText.length > 0
      ? db.tvSettings.runningText
      : [
          `Selamat datang di ${db.mosqueProfile.name} (${db.mosqueProfile.institution})`,
          db.tvSettings.shafWarningText,
        ];

  return (
    <div className="fixed inset-0 bg-[#14110F] overflow-hidden flex items-center justify-center select-none dark-surface">
      {/* FIXED 1920x1080 STAGE SCALED PROPORTIONALLY TO ANY TV / MONITOR RESOLUTION */}
      <div
        style={{
          width: `${STAGE_WIDTH}px`,
          height: `${STAGE_HEIGHT}px`,
          transform: `scale(${stageScale})`,
          transformOrigin: 'center center',
          opacity: scaleReady ? 1 : 0,
        }}
        className="relative bg-[#1E1B18] text-[#FAF7F2] flex flex-col justify-between overflow-hidden shadow-2xl shrink-0 transition-opacity duration-200"
      >
        {/* FULL-SCREEN OVERLAYS: ADZAN & IQOMAH COUNTDOWN */}
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
              className="absolute inset-0 z-50 bg-[#1E1B18] flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="max-w-6xl w-full bg-[#2C2520] border-2 border-[#E8CFA0] rounded-3xl p-14 shadow-2xl flex flex-col items-center">
                <span className="inline-block px-5 py-2 rounded-lg bg-[#A84A2E] text-white text-xl font-bold mb-8">
                  Panggilan Ibadah Sholat Wajib &bull; Kota Manado (WITA)
                </span>

                <h2 className="font-serif-heading font-bold tracking-tight flex flex-col items-center justify-center gap-4 mb-8">
                  <span className="block text-[5.5rem] text-[#E8CFA0] leading-[1.05]">
                    Waktunya Adzan
                  </span>
                  <span className="block text-[7.25rem] text-[#FAF7F2] leading-[1.02]">
                    Sholat {adzanMode.prayerName}
                  </span>
                </h2>

                <div className="my-4 px-12 py-6 rounded-2xl bg-[#1E1B18] border border-[#E8CFA0]/40">
                  <span className="block text-base font-semibold text-[#E8CFA0] mb-1 tracking-wider">
                    DURASI ADZAN BERLANGSUNG
                  </span>
                  <div className="font-mono text-8xl font-bold text-[#FAF7F2] tracking-wider">
                    {adzanMinutesPart}:{adzanSecondsPart}
                  </div>
                </div>

                {!kioskMode && (
                  <div className="mt-6 flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => triggerSimulateIqomah(adzanMode.prayerName)}
                      className="px-6 py-3 rounded-lg bg-[#A84A2E] text-white text-base font-semibold hover:bg-[#8E3B22] cursor-pointer"
                    >
                      Lanjut ke Hitung Mundur Iqomah
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setAdzanMode({
                          active: false,
                          prayerName: 'Maghrib',
                          secondsLeft: 0,
                        })
                      }
                      className="px-6 py-3 rounded-lg border border-[#E8CFA0] text-[#E8CFA0] text-base font-semibold hover:bg-[#E8CFA0] hover:text-[#1E1B18] cursor-pointer"
                    >
                      Tutup Tampilan Adzan
                    </button>
                  </div>
                )}
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
              className="absolute inset-0 z-50 bg-[#1E1B18] flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="max-w-5xl w-full bg-[#2C2520] border-2 border-[#E8CFA0] rounded-3xl p-14 shadow-2xl">
                <span className="inline-block px-5 py-2 rounded-lg bg-[#A84A2E] text-white text-xl font-bold mb-5">
                  Waktu Sholat {iqomahMode.prayerName} Telah Tiba
                </span>

                <h2 className="font-serif-heading text-5xl font-bold text-[#FAF7F2] mb-4">
                  Hitung Mundur Menuju Iqomah {iqomahMode.prayerName}
                </h2>

                <div className="my-8 font-mono text-[9.5rem] leading-none font-bold text-[#E8CFA0] tracking-wider">
                  {iqomahMinutesPart}:{iqomahSecondsPart}
                </div>

                <div className="bg-[#1E1B18] border border-[#E8CFA0]/40 rounded-2xl p-6 mb-6">
                  <p className="font-arabic text-4xl text-[#E8CFA0] mb-3 leading-[1.8]">
                    سَوُّوا صُفُوفَكُمْ فَإِنَّ تَسْوِيَةَ الصُّفُوفِ مِنْ إِقَامَةِ الصَّلَاةِ
                  </p>
                  <p className="text-2xl font-semibold text-[#FAF7F2]">
                    {db.tvSettings.shafWarningText}
                  </p>
                </div>

                {!kioskMode && (
                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        triggerSimulatePrayerInProgress(iqomahMode.prayerName)
                      }
                      className="px-6 py-3 rounded-lg bg-[#A84A2E] text-white text-base font-semibold hover:bg-[#8E3B22] cursor-pointer"
                    >
                      Mulai Sholat Sekarang
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setIqomahMode({
                          active: false,
                          prayerName: 'Maghrib',
                          secondsLeft: 0,
                        })
                      }
                      className="px-6 py-3 rounded-lg border border-[#E8CFA0] text-[#E8CFA0] text-base font-semibold hover:bg-[#E8CFA0] hover:text-[#1E1B18] cursor-pointer"
                    >
                      Tutup Tampilan Iqomah
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. TV TOP HEADER (LOCKED HORIZONTAL ROW FOR 1920x1080) */}
        <header className="bg-[#2C2520] border-b-2 border-[#A84A2E] px-10 py-4 flex items-center justify-between gap-6 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            {db.mosqueProfile.logoUrl ? (
              <img
                src={db.mosqueProfile.logoUrl}
                alt={`Logo ${db.mosqueProfile.name}`}
                className="w-16 h-16 object-contain shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#A84A2E] text-white flex items-center justify-center font-serif-heading font-bold text-2xl shrink-0">
                AJ
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-serif-heading text-3xl font-bold text-[#FAF7F2] leading-tight truncate">
                {db.mosqueProfile.name}
              </h1>
              <p className="text-base text-[#E8CFA0] truncate mt-0.5">
                {db.mosqueProfile.institution} &bull; {masehiDate} &bull;{' '}
                {hijriDate}
              </p>
            </div>
          </div>

          {/* Right Controls & Real-time WITA Clock */}
          <div className="flex items-center gap-4 shrink-0">
            {!isTvApp && (
              <div className="flex items-center gap-2">
                {!kioskMode && (
                  <>
                    <Link
                      href="/"
                      className="px-3.5 py-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[#1E1B18] border border-white/25 text-sm font-semibold text-[#FAF7F2] hover:border-[#E8CFA0]"
                    >
                      <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                      <span>Web Publik</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => triggerSimulateAdzan(nextInfo.nextPrayer)}
                      className="px-3.5 py-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[#A84A2E] text-white text-sm font-semibold hover:bg-[#8E3B22] cursor-pointer"
                      title="Uji tampilan layar penuh Waktunya Adzan"
                    >
                      <Bell className="w-4 h-4" aria-hidden="true" />
                      <span>Simulasi Adzan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerSimulateIqomah(nextInfo.nextPrayer)}
                      className="px-3.5 py-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[#1E1B18] border border-[#E8CFA0]/50 text-[#E8CFA0] text-sm font-semibold hover:border-[#E8CFA0] cursor-pointer"
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
                      className={`px-3.5 py-2.5 inline-flex items-center gap-1.5 rounded-lg border text-sm font-semibold cursor-pointer ${
                        prayerInProgressMode.active
                          ? 'bg-[#E8CFA0] text-[#1E1B18] border-[#E8CFA0]'
                          : 'bg-[#1E1B18] text-[#E8CFA0] border-[#E8CFA0]/50 hover:border-[#E8CFA0]'
                      }`}
                      title="Uji tampilan Sholat Sedang Berlangsung"
                    >
                      <span>
                        {prayerInProgressMode.active
                          ? 'Selesai Sholat'
                          : 'Simulasi Sholat'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleFullscreen}
                      className="px-3.5 py-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[#1E1B18] border border-white/25 text-sm font-semibold text-[#E8CFA0] hover:border-[#E8CFA0] cursor-pointer"
                      title="Tampilkan Layar Penuh"
                    >
                      <Maximize2 className="w-4 h-4" aria-hidden="true" />
                      <span>Layar Penuh</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setKioskMode((prev) => !prev)}
                  className="px-3 py-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[#1E1B18]/80 border border-white/20 text-xs font-semibold text-[#E8CFA0]/80 hover:text-[#E8CFA0] hover:border-[#E8CFA0] cursor-pointer"
                  title={
                    kioskMode
                      ? 'Tampilkan tombol simulasi'
                      : 'Sembunyikan tombol (Mode Layar TV Murni)'
                  }
                >
                  {kioskMode ? (
                    <>
                      <Eye className="w-4 h-4" aria-hidden="true" />
                      <span>Panel Uji</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                      <span>Mode TV</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="bg-[#1E1B18] border border-[#E8CFA0]/40 rounded-xl px-6 py-2.5 flex items-center gap-4">
              <div className="text-right">
                <span className="block text-xs font-bold tracking-wider text-[#E8CFA0]">
                  WAKTU MANADO (WITA)
                </span>
                <span className="font-mono text-4xl font-bold text-[#FAF7F2] tracking-wider leading-none">
                  {witaClock}
                </span>
              </div>
              {db.tvSettings.enableBeepSound ? (
                <Volume2
                  className="w-5 h-5 text-[#E8CFA0]"
                  aria-label="Penanda suara beep aktif"
                />
              ) : (
                <VolumeX
                  className="w-5 h-5 text-[#FAF7F2]/50"
                  aria-label="Penanda suara beep nonaktif"
                />
              )}
            </div>
          </div>
        </header>

        {/* 2. TV MAIN STAGE (PRAYER IN PROGRESS MODE OR DYNAMIC CAROUSEL) */}
        <main className="flex-1 min-h-0 px-10 py-5 flex flex-col justify-between overflow-hidden">
          <AnimatePresence mode="wait">
            {prayerInProgressMode.active ? (
              <motion.div
                key={`prayer-in-progress-${prayerInProgressMode.prayerName}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.65, ease: 'easeInOut' }}
                className="flex-1 min-h-0 bg-[#2C2520] border border-white/15 rounded-2xl p-12 flex items-center justify-center text-center"
              >
                <h2 className="font-serif-heading font-bold tracking-tight flex flex-col items-center justify-center gap-5">
                  <span className="block text-[7.5rem] text-[#FAF7F2] leading-[1.02]">
                    Sholat {prayerInProgressMode.prayerName}
                  </span>
                  <span className="block text-[5.5rem] text-[#E8CFA0] leading-[1.06]">
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
                className="flex-1 min-h-0 flex flex-col justify-between"
              >
                {/* Status Bar: Active Slide Indicator & Next Prayer Countdown */}
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <div className="flex items-center gap-2.5 text-sm font-semibold text-[#E8CFA0]/90 bg-[#2C2520] px-4 py-2 rounded-lg border border-white/15">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#A84A2E]" />
                    <span>
                      {(activeSlideIndex % enabledSlides.length) + 1} /{' '}
                      {enabledSlides.length} &bull;{' '}
                      {slideLabelMap[currentSlide]}
                    </span>
                  </div>

                  <div className="text-base font-semibold text-[#E8CFA0] bg-[#2C2520] px-5 py-2 rounded-lg border border-[#E8CFA0]/30">
                    Sholat Berikutnya:{' '}
                    <strong className="text-white">
                      {nextInfo.nextPrayer}
                    </strong>{' '}
                    ({nextInfo.nextTimeStr} WITA) &bull; Hitung Mundur:{' '}
                    <strong className="font-mono text-lg text-white">
                      -{nextInfo.countdownText}
                    </strong>
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
                      className="flex-1 min-h-0 grid grid-cols-12 gap-6 items-stretch"
                    >
                      <div className="col-span-8 bg-[#2C2520] border border-white/15 rounded-2xl p-7 flex flex-col justify-between">
                        <div className="flex items-center justify-between gap-4 border-b border-white/15 pb-5">
                          <div>
                            <span className="text-sm font-bold text-[#E8CFA0] flex items-center gap-2 mb-1">
                              <Wallet className="w-5 h-5" aria-hidden="true" />
                              <span>
                                TRANSPARANSI KEUANGAN MASJID AL JAMI&apos;AH
                              </span>
                            </span>
                            <h2 className="font-serif-heading text-3xl font-bold text-[#FAF7F2]">
                              Laporan Posisi Saldo &amp; Realisasi 3 Pos Kas Masjid
                            </h2>
                          </div>
                          <div className="bg-[#1E1B18] px-6 py-3.5 rounded-xl border border-[#E8CFA0]/40 text-right shrink-0">
                            <span className="text-sm text-[#E8CFA0] block mb-0.5">
                              Total Saldo Gabungan
                            </span>
                            <span className="font-serif-heading text-4xl font-bold text-[#FAF7F2]">
                              {formatRupiah(totalBalance)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-5 my-auto py-4">
                          {[
                            {
                              name: '1. Kas Operasional',
                              desc: 'Kebersihan, listrik, air wudhu & kajian harian',
                              data: opFund,
                            },
                            {
                              name: '2. Kas Pembangunan',
                              desc: 'Inventaris tata suara, karpet & fasilitas fisik',
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
                              className="bg-[#1E1B18] border border-white/15 rounded-xl p-5 flex flex-col justify-between"
                            >
                              <div>
                                <h3 className="font-serif-heading font-bold text-xl text-[#E8CFA0] mb-1.5">
                                  {f.name}
                                </h3>
                                <p className="text-sm text-[#F2ECE1]/80 mb-5 leading-snug">
                                  {f.desc}
                                </p>
                              </div>

                              <div className="space-y-2.5 pt-4 border-t border-white/15 text-sm">
                                <div className="flex justify-between text-[#8CD975]">
                                  <span>Pemasukan:</span>
                                  <strong className="font-mono text-base">
                                    +{formatRupiah(f.data.fIn)}
                                  </strong>
                                </div>
                                <div className="flex justify-between text-[#F29C85]">
                                  <span>Pengeluaran:</span>
                                  <strong className="font-mono text-base">
                                    -{formatRupiah(f.data.fOut)}
                                  </strong>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-[#FAF7F2] pt-3 border-t border-white/15">
                                  <span>Saldo Kas:</span>
                                  <span className="text-[#E8CFA0] font-mono">
                                    {formatRupiah(f.data.bal)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-4 border-t border-white/15 flex items-center justify-between gap-4 text-sm text-[#E8CFA0]">
                          <span>
                            Rekening Infaq:{' '}
                            <strong className="text-white">
                              {db.donationInfo.bankName}
                            </strong>{' '}
                            &bull; No. Rek:{' '}
                            <strong className="font-mono text-base text-white">
                              {db.donationInfo.accountNumber}
                            </strong>{' '}
                            a.n. {db.donationInfo.accountHolder}
                          </span>
                          {db.donationInfo.isSampleDataNotice && (
                            <span className="px-3 py-1 rounded bg-[#A84A2E] text-white font-semibold">
                              Data Contoh Awal (Ubah di Admin)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right QRIS Card on TV */}
                      <div className="col-span-4 bg-[#2C2520] border border-white/15 rounded-2xl p-7 flex flex-col items-center justify-between text-center">
                        <div>
                          <span className="inline-block px-3.5 py-1 rounded bg-[#A84A2E] text-white text-xs font-bold mb-2.5 tracking-wider">
                            INFAQ DIGITAL QRIS
                          </span>
                          <h3 className="font-serif-heading text-2xl font-bold text-[#FAF7F2] mb-1.5">
                            Pindai QRIS dari Bangku Jamaah
                          </h3>
                          <p className="text-sm text-[#E8CFA0]">
                            Mendukung seluruh aplikasi Mobile Banking dan dompet digital.
                          </p>
                        </div>

                        <div className="w-[270px] h-[270px] bg-white rounded-2xl p-3.5 flex flex-col items-center justify-center border-2 border-[#E8CFA0] shrink-0">
                          {db.donationInfo.qrisImageUrl ? (
                            <img
                              src={db.donationInfo.qrisImageUrl}
                              alt="QRIS Masjid Al Jami'ah IAIN Manado"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="text-[#1E1B18] p-4">
                              <QrCode
                                className="w-20 h-20 text-[#A84A2E] mx-auto mb-3"
                                aria-hidden="true"
                              />
                              <p className="text-sm font-bold mb-1">
                                QRIS MASJID AL JAMI&apos;AH
                              </p>
                              <p className="text-xs text-[#524740]">
                                Unggah gambar QRIS resmi pada menu Keuangan di Panel Admin.
                              </p>
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-[#F2ECE1]">
                          Konfirmasi WA Takmir:{' '}
                          <strong className="text-[#E8CFA0] font-mono">
                            +{db.donationInfo.confirmationWhatsapp}
                          </strong>
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
                      className="flex-1 min-h-0 bg-[#2C2520] border border-white/15 rounded-2xl p-12 flex flex-col items-center justify-center text-center"
                    >
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E1B18] border border-[#E8CFA0]/40 text-sm font-bold text-[#E8CFA0] mb-8">
                        <BookOpen className="w-4 h-4" aria-hidden="true" />
                        <span>UNTAIAN AYAT AL-QUR&apos;AN &amp; HADITS PILIHAN</span>
                      </div>

                      {currentQuote ? (
                        <div className="max-w-5xl mx-auto">
                          <p
                            dir="rtl"
                            lang="ar"
                            className="font-arabic text-5xl text-[#E8CFA0] leading-[2.0] mb-8"
                          >
                            {currentQuote.arabicText}
                          </p>

                          <blockquote className="font-serif-heading text-3xl font-semibold text-[#FAF7F2] leading-relaxed mb-8">
                            &ldquo;{currentQuote.translation}&rdquo;
                          </blockquote>

                          <p className="inline-block px-5 py-2 rounded-lg bg-[#A84A2E] text-white text-base font-bold">
                            Sumber: {currentQuote.source}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xl text-[#E8CFA0]">
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
                      className="flex-1 min-h-0 grid grid-cols-12 gap-6 items-stretch"
                    >
                      <div className="col-span-7 bg-[#2C2520] border border-white/15 rounded-2xl p-7 flex flex-col justify-between">
                        <div className="flex-1 flex flex-col">
                          <div className="flex items-center gap-2 text-sm font-bold text-[#E8CFA0] mb-1">
                            <Calendar className="w-4 h-4" aria-hidden="true" />
                            <span>AGENDA KEGIATAN &amp; KAJIAN MASJID</span>
                          </div>
                          <h2 className="font-serif-heading text-3xl font-bold text-[#FAF7F2] mb-5">
                            Jadwal Kajian Hari Ini &amp; Rutin Pekanan
                          </h2>

                          {db.events.length === 0 ? (
                            <div className="flex-1 bg-[#1E1B18] border border-white/15 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                              <Calendar
                                className="w-12 h-12 text-[#E8CFA0]/60 mb-3"
                                aria-hidden="true"
                              />
                              <p className="font-serif-heading text-xl font-bold text-[#FAF7F2] mb-1">
                                Belum Ada Agenda Kajian Terjadwal Pekan Ini
                              </p>
                              <p className="text-sm text-[#E8CFA0]/80 max-w-md">
                                Informasi jadwal kajian ilmiah, taklim rutin, dan kegiatan kampus terbaru akan ditampilkan secara otomatis di layar ini.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3.5">
                              {db.events.slice(0, 3).map((ev) => (
                                <div
                                  key={ev.id}
                                  className="bg-[#1E1B18] border border-white/15 rounded-xl p-4 flex items-center justify-between gap-4"
                                >
                                  <div>
                                    <div className="flex items-center gap-2.5 mb-1.5">
                                      <span
                                        className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                                          ev.isToday
                                            ? 'bg-[#A84A2E] text-white'
                                            : 'bg-[#2C2520] text-[#E8CFA0]'
                                        }`}
                                      >
                                        {ev.dayLabel}
                                      </span>
                                      <span className="text-sm font-mono text-[#E8CFA0]">
                                        {ev.time}
                                      </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-[#FAF7F2]">
                                      {ev.title}
                                    </h3>
                                    <p className="text-sm text-[#E8CFA0]">
                                      Pemateri: {ev.speaker} &bull; {ev.location}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="col-span-5 bg-[#2C2520] border border-white/15 rounded-2xl p-7 flex flex-col justify-between">
                        <div>
                          <span className="inline-block px-3.5 py-1 rounded bg-[#A84A2E] text-white text-xs font-bold mb-2.5 tracking-wider">
                            PETUGAS SHOLAT JUMAT
                          </span>
                          <h3 className="font-serif-heading text-2xl font-bold text-[#FAF7F2] mb-1">
                            {db.prayerSettings.jumatOfficer.date}
                          </h3>
                          <p className="text-sm text-[#E8CFA0] mb-6">
                            Tema Khutbah: &ldquo;
                            {db.prayerSettings.jumatOfficer.khatibTopic}&rdquo;
                          </p>

                          <div className="space-y-3.5 text-base">
                            <div className="bg-[#1E1B18] p-4 rounded-xl border border-white/15 flex items-center justify-between gap-3">
                              <span className="text-[#E8CFA0]">
                                Khatib Jumat:
                              </span>
                              <strong className="text-[#FAF7F2] text-right">
                                {db.prayerSettings.jumatOfficer.khatib}
                              </strong>
                            </div>
                            <div className="bg-[#1E1B18] p-4 rounded-xl border border-white/15 flex items-center justify-between gap-3">
                              <span className="text-[#E8CFA0]">
                                Imam Sholat:
                              </span>
                              <strong className="text-[#FAF7F2] text-right">
                                {db.prayerSettings.jumatOfficer.imam}
                              </strong>
                            </div>
                            <div className="bg-[#1E1B18] p-4 rounded-xl border border-white/15 flex items-center justify-between gap-3">
                              <span className="text-[#E8CFA0]">
                                Muadzin / Bilal:
                              </span>
                              <strong className="text-[#FAF7F2] text-right">
                                {db.prayerSettings.jumatOfficer.muadzin}
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/15 text-sm text-[#E8CFA0]">
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

        {/* 3. TV BOTTOM PRAYER TIMES BAR (LOCKED 6 COLUMNS) + RUNNING TEXT MARQUEE */}
        <footer className="shrink-0 bg-[#2C2520] border-t-2 border-[#E8CFA0]/40">
          <div className="px-10 py-3.5 grid grid-cols-6 gap-4">
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
                  className={`rounded-xl px-5 py-3 border flex flex-col justify-between ${
                    isNext
                      ? 'bg-[#A84A2E] text-white border-[#E8CFA0] shadow-lg'
                      : 'bg-[#1E1B18] text-[#FAF7F2] border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-lg font-bold ${
                        isNext ? 'text-white' : 'text-[#E8CFA0]'
                      }`}
                    >
                      {name}
                    </span>
                    {isNext && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#1E1B18] text-[#E8CFA0]">
                        BERIKUTNYA
                      </span>
                    )}
                  </div>

                  <div className="font-mono text-4xl font-bold tracking-tight my-1">
                    {times[name]}
                  </div>

                  <div
                    className={`text-xs font-medium ${
                      isNext ? 'text-white' : 'text-[#E8CFA0]/80'
                    }`}
                  >
                    {iqomahMin !== null
                      ? `Iqomah +${iqomahMin} menit`
                      : 'Waktu Terbit Fajar'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Running Text Marquee */}
          <div className="bg-[#1E1B18] border-t border-white/15 py-2.5 px-8 overflow-hidden flex items-center">
            <span className="px-3 py-1 rounded bg-[#A84A2E] text-white text-xs font-bold shrink-0 mr-5 tracking-wider">
              INFO TAKMIR
            </span>
            <div className="overflow-hidden whitespace-nowrap flex-1">
              <div className="animate-marquee-tv text-base font-medium text-[#E8CFA0]">
                {[...marqueeItems, ...marqueeItems].map((txt, i) => (
                  <span key={i} className="mx-10 inline-block">
                    &bull; {txt}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

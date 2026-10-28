'use client';

import React, { useEffect, useState } from 'react';
import {
  ManualPrayerTimes,
  PrayerName,
  PrayerSettings,
} from '@/types/mosque';
import {
  formatMinutesToTimeString,
  getNextPrayerInfo,
  getSolarSkyState,
  getWitaMinutesOfDay,
   parseTimeStringToMinutes,
  PRAYER_LIST,
} from '@/lib/prayer-times';
import {
  Clock,
  Compass,
  Moon,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  UserCheck,
} from 'lucide-react';

interface PrayerScheduleSectionProps {
  times: ManualPrayerTimes;
  settings: PrayerSettings;
  sourceLabel: string;
}

const STAR_COORDINATES = [
  { cx: 85, cy: 48, r: 1.4, delay: '0s' },
  { cx: 145, cy: 92, r: 1.1, delay: '0.6s' },
  { cx: 215, cy: 38, r: 1.7, delay: '1.3s' },
  { cx: 290, cy: 76, r: 1.2, delay: '0.3s' },
  { cx: 365, cy: 34, r: 1.5, delay: '1.8s' },
  { cx: 430, cy: 88, r: 1.1, delay: '0.9s' },
  { cx: 515, cy: 28, r: 1.6, delay: '1.5s' },
  { cx: 590, cy: 70, r: 1.2, delay: '0.2s' },
  { cx: 665, cy: 42, r: 1.5, delay: '1.1s' },
  { cx: 745, cy: 84, r: 1.3, delay: '0.7s' },
  { cx: 825, cy: 36, r: 1.6, delay: '1.6s' },
  { cx: 905, cy: 66, r: 1.2, delay: '0.4s' },
];

export default function PrayerScheduleSection({
  times,
  settings,
  sourceLabel,
}: PrayerScheduleSectionProps) {
  const [now, setNow] = useState<Date | null>(null);
  const [simulatedMinutes, setSimulatedMinutes] = useState<number | null>(null);
  const [isAutoPlayingDemo, setIsAutoPlayingDemo] = useState(false);

  // Live 1-second WITA clock update
  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-play demo loop (smooth 60fps progression from dawn through sunset & night)
  useEffect(() => {
    if (!isAutoPlayingDemo) return;
    const interval = setInterval(() => {
      setSimulatedMinutes((prev) => {
        const base =
          prev !== null
            ? prev
            : now
            ? getWitaMinutesOfDay(now)
            : parseTimeStringToMinutes(times.Subuh);
        const next = base + 3.2; // Full 24h cycle in ~15 seconds
        return next >= 1440 ? next - 1440 : next;
      });
    }, 35);
    return () => clearInterval(interval);
  }, [isAutoPlayingDemo, now, times.Subuh]);

  const liveWitaMinutes = now ? getWitaMinutesOfDay(now) : 720;
  const isSimulationActive = simulatedMinutes !== null;
  const activeMinutes =
    simulatedMinutes !== null ? simulatedMinutes : liveWitaMinutes;

  const skyState = getSolarSkyState(times, activeMinutes);

  const nextInfo = now
    ? getNextPrayerInfo(times, now)
    : {
        nextPrayer: 'Dzuhur' as PrayerName,
        nextTimeStr: times.Dzuhur,
        countdownText: '--:--:--',
        secondsRemaining: 0,
        currentPrayerActive: null,
      };

  const witaClock = now
    ? now.toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Makassar',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    : '--:--:--';

  const handleSelectPrayerTime = (prayerName: PrayerName) => {
    setIsAutoPlayingDemo(false);
    setSimulatedMinutes(parseTimeStringToMinutes(times[prayerName]));
  };

  const handleStartSunriseSunsetDemo = () => {
    if (isAutoPlayingDemo) {
      setIsAutoPlayingDemo(false);
      return;
    }
    // Start slightly before Subuh so the user sees dawn -> sunrise -> noon -> afternoon -> sunset -> night
    if (simulatedMinutes === null) {
      const subuhMin = parseTimeStringToMinutes(times.Subuh);
      setSimulatedMinutes(Math.max(0, subuhMin - 15));
    }
    setIsAutoPlayingDemo(true);
  };

  const handleResetToLive = () => {
    setIsAutoPlayingDemo(false);
    setSimulatedMinutes(null);
  };

  // Compute Sun color depending on altitude (golden-orange near horizon, bright warm yellow at zenith)
  const isNearHorizon = skyState.sunAltitudeRatio < 0.28;
  const sunCoreColor = isNearHorizon ? '#FB923C' : '#FEF08A';
  const sunHaloColor = isNearHorizon ? '#EA580C' : '#F59E0B';

  return (
    <section
      id="jadwal-sholat"
      aria-labelledby="heading-jadwal-sholat"
      className="relative z-20 py-10 sm:py-14 overflow-hidden"
    >
      {/* Hybrid Ambient Sky Aura on Website Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-20 -top-24 -bottom-24 -z-10 transition-all duration-700"
        style={{ background: skyState.ambientAura }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF7F2] border-2 border-[#1E1B18] rounded-xl shadow-md overflow-hidden">
          {/* =========================================================
              1. INTERACTIVE REAL-TIME SOLAR & LUNAR HORIZON STAGE
             ========================================================= */}
          <div
            className="relative text-[#FAF7F2] transition-colors duration-700 overflow-hidden"
            style={{ background: skyState.skyGradient }}
          >
            {/* Dynamic Horizon Glow Overlay */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 transition-opacity duration-700"
              style={{ background: skyState.horizonGlow }}
            />

            {/* Top Header Row Inside Sky Stage */}
            <div className="relative z-10 px-5 pt-5 pb-2 sm:px-8 sm:pt-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-[#E8CFA0] mb-1">
                  <Compass className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{sourceLabel}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-black/35 border border-white/20 text-white backdrop-blur-xs">
                    Fase Langit: {skyState.phaseLabel}
                  </span>
                </div>
                <h2
                  id="heading-jadwal-sholat"
                  className="font-serif-heading text-xl sm:text-2xl font-bold text-white drop-shadow-xs"
                >
                  Jadwal Sholat &amp; Peredaran Matahari Wilayah {settings.city}
                </h2>
                <p className="text-xs sm:text-sm text-white/85 mt-0.5 max-w-2xl">
                  {skyState.phaseDescription}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="bg-black/35 backdrop-blur-xs border border-white/20 rounded-lg px-4 py-2.5">
                  <span className="block text-[11px] text-[#E8CFA0]">
                    {isSimulationActive
                      ? 'Waktu Simulasi (WITA)'
                      : 'Waktu Nyata Manado (WITA)'}
                  </span>
                  <span className="font-mono text-lg sm:text-xl font-bold text-white">
                    {isSimulationActive ? `${skyState.formattedTime}:00` : witaClock}
                  </span>
                </div>

                <div className="bg-[#A84A2E]/95 backdrop-blur-xs border border-white/20 text-white rounded-lg px-4 py-2.5 shadow-xs">
                  <span className="block text-[11px] font-medium text-white/90">
                    Menuju {nextInfo.nextPrayer} ({nextInfo.nextTimeStr} WITA)
                  </span>
                  <span className="font-mono text-lg sm:text-xl font-bold text-white">
                    -{nextInfo.countdownText}
                  </span>
                </div>
              </div>
            </div>

            {/* SVG Solar & Lunar Trajectory Panorama */}
            <div className="relative z-10 px-2 sm:px-6 pt-2">
              <svg
                viewBox="0 0 1000 300"
                className="w-full h-48 sm:h-64 lg:h-72 overflow-visible select-none"
                role="img"
                aria-label={`Visualisasi posisi ${
                  skyState.isDaytime ? 'matahari' : 'bulan sabit'
                } pada pukul ${skyState.formattedTime} WITA`}
              >
                <defs>
                  {/* Sun Corona Radial Gradient */}
                  <radialGradient id="sunCoronaGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={sunCoreColor} stopOpacity="0.95" />
                    <stop offset="40%" stopColor={sunHaloColor} stopOpacity="0.45" />
                    <stop offset="100%" stopColor={sunHaloColor} stopOpacity="0" />
                  </radialGradient>

                  {/* Moon Glow Radial Gradient */}
                  <radialGradient id="moonCoronaGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FEF9C3" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#E8CFA0" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#E8CFA0" stopOpacity="0" />
                  </radialGradient>

                  {/* Active Progress Clip from East up to current Sun X */}
                  <clipPath id="dayArcProgressClip">
                    <rect
                      x="0"
                      y="0"
                      width={Math.max(0, skyState.sunX)}
                      height="300"
                    />
                  </clipPath>

                  {/* Clip above horizon so setting sun dips naturally into the horizon */}
                  <clipPath id="aboveHorizonClip">
                    <rect x="0" y="0" width="1000" height="236" />
                  </clipPath>
                </defs>

                {/* 1. Night Stars Layer */}
                <g
                  style={{ opacity: skyState.starOpacity }}
                  className="transition-opacity duration-700"
                >
                  {STAR_COORDINATES.map((star, idx) => (
                    <circle
                      key={idx}
                      cx={star.cx}
                      cy={star.cy}
                      r={star.r}
                      fill="#FEF9C3"
                      className="animate-pulse"
                      style={{ animationDelay: star.delay }}
                    />
                  ))}
                </g>

                {/* 2. Daytime Soft Clouds Layer */}
                <g
                  style={{ opacity: skyState.cloudOpacity }}
                  className="transition-opacity duration-700"
                >
                  <g transform="translate(150, 78)" fill="rgba(255,255,255,0.22)">
                    <ellipse cx="35" cy="18" rx="36" ry="12" />
                    <ellipse cx="52" cy="12" rx="24" ry="14" />
                    <ellipse cx="20" cy="14" rx="20" ry="10" />
                  </g>
                  <g transform="translate(720, 62)" fill="rgba(255,255,255,0.18)">
                    <ellipse cx="42" cy="20" rx="44" ry="13" />
                    <ellipse cx="60" cy="13" rx="26" ry="15" />
                    <ellipse cx="24" cy="15" rx="22" ry="11" />
                  </g>
                </g>

                {/* 3. Sub-Horizon Twilight Extensions (Subuh -> Syuruq & Maghrib -> Isya) */}
                <line
                  x1={skyState.pins[0].x}
                  y1={skyState.pins[0].y}
                  x2={skyState.pins[1].x}
                  y2={skyState.pins[1].y}
                  stroke="rgba(255,255,255,0.28)"
                  strokeWidth="2"
                  strokeDasharray="4 5"
                />
                <line
                  x1={skyState.pins[4].x}
                  y1={skyState.pins[4].y}
                  x2={skyState.pins[5].x}
                  y2={skyState.pins[5].y}
                  stroke="rgba(255,255,255,0.28)"
                  strokeWidth="2"
                  strokeDasharray="4 5"
                />

                {/* 4. Main Daytime Solar Arc (Syuruq -> Dzuhur -> Ashar -> Maghrib) */}
                <path
                  d="M 200.8 232 Q 500 -104 799.2 232"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.32)"
                  strokeWidth="2.5"
                  strokeDasharray="7 7"
                />

                {/* 5. Illuminated Gold Trajectory Trail (From Syuruq to Current Sun Position) */}
                {skyState.targetMinutes >= parseTimeStringToMinutes(times.Syuruq) && (
                  <path
                    d="M 200.8 232 Q 500 -104 799.2 232"
                    fill="none"
                    stroke="#FDE047"
                    strokeWidth="3.5"
                    clipPath="url(#dayArcProgressClip)"
                    opacity={skyState.isDaytime ? 0.9 : 0.35}
                  />
                )}

                {/* 6. Active Celestial Body: Crescent Moon during Night (Maghrib -> Syuruq) */}
                {!skyState.isDaytime && (
                  <g
                    transform={`translate(${skyState.moonX}, ${skyState.moonY})`}
                  >
                    <circle r="44" fill="url(#moonCoronaGlow)" />
                    {/* Crescent Moon Vector */}
                    <path
                      d="M -6 -13 A 14 14 0 1 0 12 9 A 11 11 0 1 1 -6 -13 Z"
                      fill="#FEF08A"
                      stroke="#E8CFA0"
                      strokeWidth="1"
                    />
                    <text
                      y="30"
                      textAnchor="middle"
                      fill="#FEF08A"
                      fontSize="11"
                      fontWeight="700"
                    >
                      Bulan Malam ({skyState.formattedTime})
                    </text>
                  </g>
                )}

                {/* 7. Active Celestial Body: The Sun (Clipped at Horizon Line so Sunrise/Sunset looks natural) */}
                <g clipPath="url(#aboveHorizonClip)">
                  <g
                    transform={`translate(${skyState.sunX}, ${skyState.sunY})`}
                  >
                    {/* Large Corona Glow */}
                    <circle r="58" fill="url(#sunCoronaGlow)" />

                    {/* Sun Rays Ring */}
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
                      (deg) => (
                        <line
                          key={deg}
                          x1="0"
                          y1="-22"
                          x2="0"
                          y2="-30"
                          stroke={sunCoreColor}
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          transform={`rotate(${deg})`}
                          opacity="0.85"
                        />
                      )
                    )}

                    {/* Outer Warm Halo */}
                    <circle
                      r="18"
                      fill={sunHaloColor}
                      opacity="0.55"
                    />

                    {/* Core Solar Disc */}
                    <circle
                      r="13"
                      fill={sunCoreColor}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                  </g>
                </g>

                {/* Sun Sub-Horizon Twilight Indicator when below horizon (Subuh / Isya) */}
                {!skyState.isDaytime && (
                  <g
                    transform={`translate(${skyState.sunX}, ${skyState.sunY})`}
                    opacity="0.75"
                  >
                    <circle
                      r="8"
                      fill="#FB923C"
                      stroke="#FDE047"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                  </g>
                )}

                {/* 8. Horizon Line & Mosque Architectural Silhouette */}
                {/* Horizon Base Fill */}
                <path
                  d="M 0 232 L 1000 232 L 1000 300 L 0 300 Z"
                  fill="rgba(18, 15, 13, 0.72)"
                />
                {/* Mosque Silhouette in Center-Left & Distant Hills */}
                <path
                  d="M 0 232 Q 90 218 180 232 T 390 232 L 425 232 L 425 212 L 430 202 L 435 212 L 435 232 L 455 232 Q 500 188 545 232 L 565 232 L 565 206 L 570 195 L 575 206 L 575 232 Q 710 220 830 232 T 1000 232 Z"
                  fill="#14110F"
                />
                {/* Glowing Horizon Border Line */}
                <line
                  x1="0"
                  y1="232"
                  x2="1000"
                  y2="232"
                  stroke="#E8CFA0"
                  strokeWidth="1.5"
                  strokeOpacity="0.65"
                />

                {/* East & West Cardinal Labels */}
                <text
                  x="24"
                  y="222"
                  fill="#E8CFA0"
                  fontSize="11"
                  fontWeight="700"
                  letterSpacing="0.06em"
                >
                  TIMUR (TERBIT)
                </text>
                <text
                  x="976"
                  y="222"
                  textAnchor="end"
                  fill="#E8CFA0"
                  fontSize="11"
                  fontWeight="700"
                  letterSpacing="0.06em"
                >
                  BARAT (TENGGELAM)
                </text>

                {/* 9. Six Interactive Prayer Time Landmark Pins along the Arc */}
                {skyState.pins.map((pin) => {
                  const isNextPin = nextInfo.nextPrayer === pin.name;
                  const isNearSelected =
                    Math.abs(skyState.targetMinutes - pin.minutes) <= 18;
                  const labelYOffset = pin.isHorizonOrAbove ? -26 : 24;
                  const timeYOffset = pin.isHorizonOrAbove ? -12 : 38;

                  return (
                    <g
                      key={pin.name}
                      transform={`translate(${pin.x}, ${pin.y})`}
                      onClick={() => handleSelectPrayerTime(pin.name)}
                      className="cursor-pointer group"
                    >
                      {/* Outer Hover/Active Ring */}
                      <circle
                        r={isNearSelected || isNextPin ? 11 : 7}
                        fill={
                          isNearSelected
                            ? '#FDE047'
                            : isNextPin
                            ? '#A84A2E'
                            : 'rgba(30, 27, 24, 0.85)'
                        }
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                      <circle
                        r="3"
                        fill={isNearSelected ? '#1E1B18' : '#FAF7F2'}
                      />

                      {/* Pin Label Pill */}
                      <rect
                        x="-42"
                        y={pin.isHorizonOrAbove ? -42 : 10}
                        width="84"
                        height="34"
                        rx="6"
                        fill={
                          isNearSelected
                            ? 'rgba(253, 224, 71, 0.95)'
                            : 'rgba(20, 17, 15, 0.82)'
                        }
                        stroke={
                          isNearSelected
                            ? '#1E1B18'
                            : 'rgba(232, 207, 160, 0.45)'
                        }
                        strokeWidth="1"
                      />
                      <text
                        y={labelYOffset}
                        textAnchor="middle"
                        fill={isNearSelected ? '#1E1B18' : '#FAF7F2'}
                        fontSize="11"
                        fontWeight="700"
                      >
                        {pin.name}
                      </text>
                      <text
                        y={timeYOffset}
                        textAnchor="middle"
                        fill={isNearSelected ? '#78350F' : '#E8CFA0'}
                        fontSize="10.5"
                        fontWeight="700"
                      >
                        {pin.timeStr}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* =========================================================
                2. INTERACTIVE SIMULATION SLIDER BAR (DEMO FOR LEADERSHIP)
               ========================================================= */}
            <div className="relative z-10 bg-[#14110F]/90 border-t border-white/15 px-5 py-3.5 sm:px-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E8CFA0]">
                  <SlidersHorizontal className="w-4 h-4 text-[#FDE047]" aria-hidden="true" />
                  <span>Simulasi Perjalanan Matahari:</span>
                </div>

                {isSimulationActive ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-200 border border-amber-300/40">
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    Mode Simulasi ({skyState.formattedTime} WITA)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Real-Time Aktif ({skyState.formattedTime} WITA)
                  </span>
                )}
              </div>

              {/* Time Scrubbing Slider (00:00 to 23:59) */}
              <div className="flex-1 max-w-xl flex items-center gap-3">
                <span className="text-[11px] font-mono text-[#E8CFA0] shrink-0 inline-flex items-center gap-1">
                  <Sunrise className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
                  00:00
                </span>
                <input
                  type="range"
                  min={0}
                  max={1439}
                  step={1}
                  value={Math.round(skyState.targetMinutes)}
                  onChange={(e) => {
                    setIsAutoPlayingDemo(false);
                    setSimulatedMinutes(Number(e.target.value));
                  }}
                  aria-label="Geser waktu simulasi perjalanan matahari dari 00:00 sampai 23:59 WITA"
                  className="w-full accent-[#FDE047] h-2 bg-white/20 rounded-lg cursor-pointer"
                />
                <span className="text-[11px] font-mono text-[#E8CFA0] shrink-0 inline-flex items-center gap-1">
                  23:59
                  <Sunset className="w-3.5 h-3.5 text-orange-400" aria-hidden="true" />
                </span>
              </div>

              {/* Action Buttons: Auto-Play Sunrise-Sunset Demo & Reset to Live */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleStartSunriseSunsetDemo}
                  className={`px-3.5 py-2 min-h-[38px] inline-flex items-center gap-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    isAutoPlayingDemo
                      ? 'bg-[#FDE047] text-[#1E1B18]'
                      : 'bg-[#A84A2E] text-white hover:bg-[#8E3B22]'
                  }`}
                >
                  {isAutoPlayingDemo ? (
                    <>
                      <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Jeda Simulasi</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Putar Demo Terbit - Tenggelam</span>
                    </>
                  )}
                </button>

                {isSimulationActive && (
                  <button
                    type="button"
                    onClick={handleResetToLive}
                    className="px-3 py-2 min-h-[38px] inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/25 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Kembali ke Waktu Nyata</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* =========================================================
              3. SIX PRAYER TIME CARDS (CLICK TO JUMP SOLAR POSITION)
             ========================================================= */}
          <div className="p-5 sm:p-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 bg-[#FAF7F2]">
            {PRAYER_LIST.map((name) => {
              const isNext = nextInfo.nextPrayer === name;
              const timeVal = times[name];
              const prayerMinutes = parseTimeStringToMinutes(timeVal);
              const isSimulatedFocus =
                isSimulationActive &&
                Math.abs(skyState.targetMinutes - prayerMinutes) <= 20;
              const iqomahMin =
                name !== 'Syuruq'
                  ? settings.iqomahMinutes[
                      name as keyof typeof settings.iqomahMinutes
                    ]
                  : null;

              const isDayCard =
                name === 'Syuruq' ||
                name === 'Dzuhur' ||
                name === 'Ashar' ||
                name === 'Maghrib';

              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSelectPrayerTime(name)}
                  title={`Klik untuk melihat posisi matahari saat waktu ${name} (${timeVal} WITA)`}
                  className={`text-left rounded-lg p-4 border transition-all flex flex-col justify-between cursor-pointer ${
                    isSimulatedFocus
                      ? 'bg-[#1E1B18] text-[#FAF7F2] border-[#A84A2E] ring-2 ring-[#A84A2E] shadow-sm'
                      : isNext
                      ? 'bg-[#A84A2E] text-white border-[#1E1B18] shadow-sm'
                      : 'bg-[#F2ECE1] text-[#1E1B18] border-[#DFD5C5] hover:border-[#1E1B18]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2 w-full">
                    <span
                      className={`text-sm font-bold inline-flex items-center gap-1.5 ${
                        isSimulatedFocus || isNext ? 'text-white' : 'text-[#1E1B18]'
                      }`}
                    >
                      {isDayCard ? (
                        <Sun
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSimulatedFocus || isNext
                              ? 'text-[#FDE047]'
                              : 'text-[#A84A2E]'
                          }`}
                          aria-hidden="true"
                        />
                      ) : (
                        <Moon
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSimulatedFocus || isNext
                              ? 'text-[#E8CFA0]'
                              : 'text-[#524740]'
                          }`}
                          aria-hidden="true"
                        />
                      )}
                      {name}
                    </span>
                    {isSimulatedFocus ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FDE047] text-[#1E1B18]">
                        Disimulasikan
                      </span>
                    ) : (
                      isNext && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1E1B18] text-[#E8CFA0]">
                          Berikutnya
                        </span>
                      )
                    )}
                  </div>

                  <div className="my-1">
                    <span
                      className={`font-serif-heading text-2xl sm:text-3xl font-bold tracking-tight ${
                        isSimulatedFocus || isNext ? 'text-white' : 'text-[#1E1B18]'
                      }`}
                    >
                      {timeVal}
                    </span>
                    <span
                      className={`text-xs ml-1 font-medium ${
                        isSimulatedFocus || isNext
                          ? 'text-white/85'
                          : 'text-[#524740]'
                      }`}
                    >
                      WITA
                    </span>
                  </div>

                  <div
                    className={`mt-2 pt-2 border-t text-xs font-medium flex items-center gap-1.5 w-full ${
                      isSimulatedFocus || isNext
                        ? 'border-white/25 text-white/90'
                        : 'border-[#DFD5C5] text-[#524740]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    {iqomahMin !== null ? (
                      <span>Iqomah +{iqomahMin} menit</span>
                    ) : (
                      <span>Terbit Matahari</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* =========================================================
              4. BOTTOM PANEL: PETUGAS SHOLAT JUMAT
             ========================================================= */}
          <div className="bg-[#F2ECE1] border-t border-[#DFD5C5] px-5 py-4 sm:px-8 sm:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1E1B18] text-[#E8CFA0] flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#A84A2E] block">
                  Jadwal Petugas Sholat Jumat ({settings.jumatOfficer.date})
                </span>
                <p className="text-sm font-semibold text-[#1E1B18]">
                  Tema Khutbah: &ldquo;{settings.jumatOfficer.khatibTopic}&rdquo;
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
              <div className="bg-[#FAF7F2] px-3.5 py-2 rounded-md border border-[#DFD5C5]">
                <span className="text-[#524740] block text-xs">Khatib</span>
                <strong className="text-[#1E1B18] font-semibold">
                  {settings.jumatOfficer.khatib}
                </strong>
              </div>
              <div className="bg-[#FAF7F2] px-3.5 py-2 rounded-md border border-[#DFD5C5]">
                <span className="text-[#524740] block text-xs">Imam</span>
                <strong className="text-[#1E1B18] font-semibold">
                  {settings.jumatOfficer.imam}
                </strong>
              </div>
              <div className="bg-[#FAF7F2] px-3.5 py-2 rounded-md border border-[#DFD5C5]">
                <span className="text-[#524740] block text-xs">Muadzin &amp; Bilal</span>
                <strong className="text-[#1E1B18] font-semibold">
                  {settings.jumatOfficer.muadzin}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

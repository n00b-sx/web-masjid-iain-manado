'use client';

import React, { useEffect, useState } from 'react';
import {
  ManualPrayerTimes,
  PrayerName,
  PrayerSettings,
} from '@/types/mosque';
import { getNextPrayerInfo, PRAYER_LIST } from '@/lib/prayer-times';
import { Clock, Compass, UserCheck } from 'lucide-react';

interface PrayerScheduleSectionProps {
  times: ManualPrayerTimes;
  settings: PrayerSettings;
  sourceLabel: string;
}

export default function PrayerScheduleSection({
  times,
  settings,
  sourceLabel,
}: PrayerScheduleSectionProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <section
      id="jadwal-sholat"
      aria-labelledby="heading-jadwal-sholat"
      className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14"
    >
      <div className="bg-[#FAF7F2] border-2 border-[#1E1B18] rounded-xl shadow-md overflow-hidden">
        {/* Top Bar: Location, Live WITA Clock, Next Prayer Countdown */}
        <div className="bg-[#1E1B18] text-[#FAF7F2] px-5 py-5 sm:px-8 sm:py-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#E8CFA0] mb-1">
              <Compass className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{sourceLabel}</span>
            </div>
            <h2
              id="heading-jadwal-sholat"
              className="font-serif-heading text-xl sm:text-2xl font-bold text-[#FAF7F2]"
            >
              Jadwal Sholat 5 Waktu Wilayah {settings.city}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <div className="bg-[#2C2520] border border-[#E8CFA0]/30 rounded-lg px-4 py-2.5">
              <span className="block text-xs text-[#E8CFA0]">Waktu Manado (WITA)</span>
              <span className="font-mono text-lg sm:text-xl font-bold text-[#FAF7F2]">
                {witaClock}
              </span>
            </div>

            <div className="bg-[#A84A2E] text-white rounded-lg px-4 py-2.5">
              <span className="block text-xs font-medium text-white">
                Menuju {nextInfo.nextPrayer} ({nextInfo.nextTimeStr} WITA)
              </span>
              <span className="font-mono text-lg sm:text-xl font-bold text-white">
                -{nextInfo.countdownText}
              </span>
            </div>
          </div>
        </div>

        {/* 6 Prayer Time Columns (5 Obligatory + Syuruq) */}
        <div className="p-5 sm:p-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 bg-[#FAF7F2]">
          {PRAYER_LIST.map((name) => {
            const isNext = nextInfo.nextPrayer === name;
            const timeVal = times[name];
            const iqomahMin =
              name !== 'Syuruq'
                ? settings.iqomahMinutes[name as keyof typeof settings.iqomahMinutes]
                : null;

            return (
              <div
                key={name}
                className={`rounded-lg p-4 border transition-colors flex flex-col justify-between ${
                  isNext
                    ? 'bg-[#A84A2E] text-white border-[#1E1B18] shadow-sm'
                    : 'bg-[#F2ECE1] text-[#1E1B18] border-[#DFD5C5]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm font-bold ${
                      isNext ? 'text-white' : 'text-[#1E1B18]'
                    }`}
                  >
                    {name}
                  </span>
                  {isNext && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#1E1B18] text-[#E8CFA0]">
                      Berikutnya
                    </span>
                  )}
                </div>

                <div className="my-1">
                  <span
                    className={`font-serif-heading text-2xl sm:text-3xl font-bold tracking-tight ${
                      isNext ? 'text-white' : 'text-[#1E1B18]'
                    }`}
                  >
                    {timeVal}
                  </span>
                  <span
                    className={`text-xs ml-1 font-medium ${
                      isNext ? 'text-white' : 'text-[#524740]'
                    }`}
                  >
                    WITA
                  </span>
                </div>

                <div
                  className={`mt-2 pt-2 border-t text-xs font-medium flex items-center gap-1.5 ${
                    isNext
                      ? 'border-white/30 text-white'
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
              </div>
            );
          })}
        </div>

        {/* Bottom Panel: Petugas Sholat Jumat */}
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
    </section>
  );
}

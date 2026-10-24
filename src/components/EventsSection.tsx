'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MosqueEvent } from '@/types/mosque';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

interface EventsSectionProps {
  events: MosqueEvent[];
}

export default function EventsSection({ events }: EventsSectionProps) {
  const [filter, setFilter] = useState<'ALL' | 'TODAY' | 'RUTIN'>('ALL');

  const filteredEvents = events.filter((evt) => {
    if (filter === 'TODAY') return evt.isToday;
    if (filter === 'RUTIN') return !evt.isToday;
    return true;
  });

  const todayCount = events.filter((e) => e.isToday).length;
  const routineCount = events.filter((e) => !e.isToday).length;

  return (
    <section
      id="kegiatan"
      aria-labelledby="heading-kegiatan"
      className="py-12 sm:py-16 bg-[#F2ECE1] border-y border-[#DFD5C5]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Asymmetric Editorial Header & Filter Controls */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <h2
              id="heading-kegiatan"
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)' }}
              className="font-serif-heading font-bold text-[#1E1B18] leading-tight mb-4"
            >
              Jadwal Kegiatan Masjid Hari Ini &amp; Agenda Rutin
            </h2>
            <p className="text-sm sm:text-base text-[#524740] leading-relaxed mb-6">
              Daftar halaqah keilmuan, kajian ba&apos;da sholat, tahsin Al-Qur&apos;an mahasiswa, serta kegiatan kemakmuran Masjid Al Jami&apos;ah IAIN Manado.
            </p>

            {/* Filter Tabs */}
            <div
              role="tablist"
              aria-label="Filter jadwal kegiatan masjid"
              className="flex flex-col gap-2 mb-6"
            >
              <button
                type="button"
                role="tab"
                aria-selected={filter === 'ALL'}
                onClick={() => setFilter('ALL')}
                className={`w-full px-4 py-3 min-h-[44px] rounded-lg text-left text-sm font-semibold flex items-center justify-between border transition-colors cursor-pointer ${
                  filter === 'ALL'
                    ? 'bg-[#1E1B18] text-[#FAF7F2] border-[#1E1B18]'
                    : 'bg-[#FAF7F2] text-[#1E1B18] border-[#DFD5C5] hover:border-[#1E1B18]'
                }`}
              >
                <span>Semua Agenda Masjid</span>
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    filter === 'ALL'
                      ? 'bg-[#A84A2E] text-white'
                      : 'bg-[#F2ECE1] text-[#1E1B18]'
                  }`}
                >
                  {events.length}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={filter === 'TODAY'}
                onClick={() => setFilter('TODAY')}
                className={`w-full px-4 py-3 min-h-[44px] rounded-lg text-left text-sm font-semibold flex items-center justify-between border transition-colors cursor-pointer ${
                  filter === 'TODAY'
                    ? 'bg-[#1E1B18] text-[#FAF7F2] border-[#1E1B18]'
                    : 'bg-[#FAF7F2] text-[#1E1B18] border-[#DFD5C5] hover:border-[#1E1B18]'
                }`}
              >
                <span>Kegiatan Hari Ini</span>
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    filter === 'TODAY'
                      ? 'bg-[#A84A2E] text-white'
                      : 'bg-[#F2ECE1] text-[#1E1B18]'
                  }`}
                >
                  {todayCount}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={filter === 'RUTIN'}
                onClick={() => setFilter('RUTIN')}
                className={`w-full px-4 py-3 min-h-[44px] rounded-lg text-left text-sm font-semibold flex items-center justify-between border transition-colors cursor-pointer ${
                  filter === 'RUTIN'
                    ? 'bg-[#1E1B18] text-[#FAF7F2] border-[#1E1B18]'
                    : 'bg-[#FAF7F2] text-[#1E1B18] border-[#DFD5C5] hover:border-[#1E1B18]'
                }`}
              >
                <span>Kajian &amp; Kegiatan Rutin Pekanan</span>
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    filter === 'RUTIN'
                      ? 'bg-[#A84A2E] text-white'
                      : 'bg-[#F2ECE1] text-[#1E1B18]'
                  }`}
                >
                  {routineCount}
                </span>
              </button>
            </div>

            <div className="p-4 rounded-lg bg-[#FAF7F2] border border-[#DFD5C5]">
              <p className="text-xs sm:text-sm text-[#524740] mb-3">
                Ingin mendaftarkan jadwal kajian UKM, HMJ, atau kegiatan akademik di Masjid Al Jami&apos;ah?
              </p>
              <Link
                href="#layanan"
                className="inline-flex items-center justify-center w-full px-4 py-2.5 min-h-[44px] rounded-md bg-[#A84A2E] text-white text-xs sm:text-sm font-semibold hover:bg-[#8E3B22] transition-colors"
              >
                Ajukan Jadwal Penggunaan Ruang
              </Link>
            </div>
          </div>

          {/* Right Column: Chronological Vertical Timeline */}
          <div className="lg:col-span-8">
            {filteredEvents.length === 0 ? (
              <div className="bg-[#FAF7F2] border border-[#DFD5C5] rounded-xl p-8 text-center">
                <Calendar className="w-10 h-10 text-[#A84A2E] mx-auto mb-3" aria-hidden="true" />
                <h3 className="font-serif-heading text-lg font-bold text-[#1E1B18] mb-2">
                  Belum Ada Jadwal pada Kategori Ini
                </h3>
                <p className="text-sm text-[#524740] mb-5 max-w-md mx-auto">
                  Saat ini belum ada agenda yang tercatat untuk filter yang dipilih. Silakan tampilkan seluruh agenda kegiatan masjid.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFilter('ALL')}
                    className="px-4 py-2.5 min-h-[44px] rounded-md bg-[#1E1B18] text-[#FAF7F2] text-sm font-semibold cursor-pointer"
                  >
                    Tampilkan Semua Agenda
                  </button>
                </div>
              </div>
            ) : (
              <ol
                aria-label="Alur Waktu Kegiatan Masjid"
                className="relative space-y-6"
              >
                {filteredEvents.map((evt, index) => {
                  const isLast = index === filteredEvents.length - 1;

                  return (
                    <li
                      key={evt.id}
                      className="relative grid grid-cols-1 sm:grid-cols-[175px_36px_1fr] gap-0 sm:gap-2 items-start"
                    >
                      {/* Left Column of Timeline (Desktop/Tablet): Time & Day Label */}
                      <div className="hidden sm:flex flex-col items-end text-right pr-3 pt-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold mb-1.5 ${
                            evt.isToday
                              ? 'bg-[#A84A2E] text-white'
                              : 'bg-[#1E1B18] text-[#E8CFA0]'
                          }`}
                        >
                          {evt.isToday ? 'Agenda Hari Ini' : 'Rutin Pekanan'}
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-[#1E1B18] leading-snug">
                          {evt.dayLabel}
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#A84A2E] mt-0.5">
                          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span>{evt.time}</span>
                        </span>
                      </div>

                      {/* Center Axis: Vertical Connector Line + Node Dot */}
                      <div
                        className="hidden sm:flex flex-col items-center h-full relative"
                        aria-hidden="true"
                      >
                        {/* Vertical Connector Line */}
                        {!isLast && (
                          <div
                            className="w-0.5 bg-[#1E1B18]/25 absolute top-5 bottom-[-28px] left-1/2 -translate-x-1/2"
                          />
                        )}
                        {/* Timeline Node Circle */}
                        <div
                          className={`relative z-10 mt-1.5 w-4 h-4 rounded-full border-2 transition-transform ${
                            evt.isToday
                              ? 'bg-[#A84A2E] border-[#FAF7F2] ring-4 ring-[#A84A2E]/25'
                              : 'bg-[#1E1B18] border-[#FAF7F2] ring-4 ring-[#1E1B18]/15'
                          }`}
                        />
                      </div>

                      {/* Right Column: Compact Event Card */}
                      <div className="relative pl-6 sm:pl-0">
                        {/* Mobile Vertical Line & Node */}
                        <div
                          className="sm:hidden absolute left-0 top-0 bottom-0 flex flex-col items-center"
                          aria-hidden="true"
                        >
                          {!isLast && (
                            <div className="w-0.5 bg-[#1E1B18]/25 absolute top-4 bottom-[-24px] left-1.5" />
                          )}
                          <div
                            className={`relative z-10 mt-2 w-3.5 h-3.5 rounded-full border-2 ${
                              evt.isToday
                                ? 'bg-[#A84A2E] border-[#FAF7F2] ring-2 ring-[#A84A2E]/30'
                                : 'bg-[#1E1B18] border-[#FAF7F2]'
                            }`}
                          />
                        </div>

                        <article
                          className={`bg-[#FAF7F2] rounded-xl p-4 sm:p-5 border transition-colors ${
                            evt.isToday
                              ? 'border-[#A84A2E] shadow-sm'
                              : 'border-[#DFD5C5] hover:border-[#1E1B18]'
                          }`}
                        >
                          {/* Mobile Time Header */}
                          <div className="flex sm:hidden flex-wrap items-center justify-between gap-2 mb-2.5 pb-2 border-b border-[#DFD5C5]">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                evt.isToday
                                  ? 'bg-[#A84A2E] text-white'
                                  : 'bg-[#1E1B18] text-[#E8CFA0]'
                              }`}
                            >
                              {evt.isToday ? 'Agenda Hari Ini' : 'Rutin Pekanan'}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#A84A2E]">
                              <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                              <span>
                                {evt.dayLabel} &bull; {evt.time}
                              </span>
                            </span>
                          </div>

                          {/* Card Top Row: Title + Category Pill */}
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <h3 className="font-serif-heading text-base sm:text-lg font-bold text-[#1E1B18] leading-snug">
                              {evt.title}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-[#F2ECE1] text-[#1E1B18] border border-[#DFD5C5] shrink-0">
                              {evt.category}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-[#524740] leading-relaxed mb-3.5">
                            {evt.description}
                          </p>

                          <div className="pt-2.5 border-t border-[#DFD5C5] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#1E1B18]">
                            <div className="flex items-start gap-1.5">
                              <User
                                className="w-3.5 h-3.5 text-[#A84A2E] shrink-0 mt-0.5"
                                aria-hidden="true"
                              />
                              <span>
                                <strong className="font-semibold">Pemateri:</strong>{' '}
                                {evt.speaker}
                              </span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <MapPin
                                className="w-3.5 h-3.5 text-[#A84A2E] shrink-0 mt-0.5"
                                aria-hidden="true"
                              />
                              <span>
                                <strong className="font-semibold">Lokasi:</strong>{' '}
                                {evt.location}
                              </span>
                            </div>
                          </div>
                        </article>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

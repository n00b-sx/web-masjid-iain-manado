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
          <div className="lg:col-span-4">
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

          {/* Right Column: Structured Event Timeline List */}
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
              <div className="flex flex-col gap-4">
                {filteredEvents.map((evt) => (
                  <article
                    key={evt.id}
                    className="bg-[#FAF7F2] border border-[#DFD5C5] rounded-xl p-5 sm:p-6 transition-colors hover:border-[#1E1B18]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {evt.isToday ? (
                          <span className="px-2.5 py-1 rounded text-xs font-bold bg-[#A84A2E] text-white">
                            Agenda Hari Ini
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded text-xs font-bold bg-[#1E1B18] text-[#E8CFA0]">
                            Rutin Pekanan
                          </span>
                        )}
                        <span className="px-2.5 py-1 rounded text-xs font-semibold bg-[#F2ECE1] text-[#1E1B18] border border-[#DFD5C5]">
                          {evt.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#A84A2E]">
                        <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>
                          {evt.dayLabel} &bull; {evt.time}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-serif-heading text-lg sm:text-xl font-bold text-[#1E1B18] mb-2">
                      {evt.title}
                    </h3>

                    <p className="text-sm text-[#524740] leading-relaxed mb-4">
                      {evt.description}
                    </p>

                    <div className="pt-3 border-t border-[#DFD5C5] grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-[#1E1B18]">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#A84A2E] shrink-0" aria-hidden="true" />
                        <span>
                          <strong className="font-semibold">Pemateri:</strong> {evt.speaker}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#A84A2E] shrink-0" aria-hidden="true" />
                        <span>
                          <strong className="font-semibold">Lokasi:</strong> {evt.location}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

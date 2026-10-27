import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { readMosqueDb } from '@/lib/db';
import { formatRupiah } from '@/lib/prayer-times';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ArrowLeft,
  Hammer,
  CheckCircle2,
  Clock,
  Calendar,
  Wallet,
  PackageCheck,
  QrCode,
  Phone,
  Image as ImageIcon,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const db = readMosqueDb();
  return {
    title: `${db.rehabSettings.pageTitle} | ${db.mosqueProfile.name}`,
    description: db.rehabSettings.pageSubtitle,
  };
}

export default async function RehabilitasiPage() {
  const db = readMosqueDb();
  const rehab = db.rehabSettings;

  // Calculate Development Fund real-time totals from Finance ledger
  const devIn = db.transactions
    .filter((t) => t.category === 'PEMBANGUNAN' && t.type === 'IN')
    .reduce((acc, t) => acc + t.amount, 0);
  const devOut = db.transactions
    .filter((t) => t.category === 'PEMBANGUNAN' && t.type === 'OUT')
    .reduce((acc, t) => acc + t.amount, 0);
  const devBalance = devIn - devOut;

  const activeProjects = rehab.projects.filter((p) => p.status === 'BERJALAN');
  const plannedProjects = rehab.projects.filter(
    (p) => p.status === 'DIRENCANAKAN'
  );
  const completedProjects = rehab.projects.filter(
    (p) => p.status === 'SELESAI'
  );

  return (
    <>
      <Navbar
        mosqueName={db.mosqueProfile.name}
        institution={db.mosqueProfile.institution}
        logoUrl={db.mosqueProfile.logoUrl}
        menus={db.menus}
      />

      <main id="main-content" className="flex-1 bg-[#FAF7F2] text-[#1E1B18]">
        {/* TOP HERO BANNER */}
        <header className="bg-[#1E1B18] text-[#FAF7F2] pt-28 pb-14 px-4 sm:px-6 lg:px-8 border-b-4 border-[#A84A2E] dark-surface">
          <div className="max-w-7xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#E8CFA0] hover:underline mb-4 min-h-[36px]"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Kembali ke Beranda Utama</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#A84A2E] text-white text-xs font-bold">
                <Hammer className="w-3.5 h-3.5" aria-hidden="true" />
                <span>TRANSPARANSI FISIK &amp; PENGEMBANGAN FASILITAS</span>
              </span>
              <span className="text-xs font-semibold text-[#E8CFA0]">
                {db.mosqueProfile.name} &bull; {db.mosqueProfile.institution}
              </span>
            </div>

            <h1 className="font-serif-heading text-3xl sm:text-5xl font-bold text-[#FAF7F2] leading-tight mb-4 max-w-4xl">
              {rehab.pageTitle}
            </h1>

            <p className="text-sm sm:text-lg text-[#F2ECE1] max-w-3xl leading-relaxed">
              {rehab.pageSubtitle}
            </p>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
          {/* 1. RINGKASAN POSISI DANA KAS PEMBANGUNAN & STATUS PROYEK */}
          <section aria-label="Ringkasan Status Pembangunan dan Dana">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-[#1E1B18] text-[#FAF7F2] rounded-xl p-5 border border-[#1E1B18] flex flex-col justify-between dark-surface">
                <span className="text-xs font-bold text-[#E8CFA0] flex items-center gap-1.5">
                  <Wallet className="w-4 h-4" aria-hidden="true" />
                  <span>SALDO KAS PEMBANGUNAN</span>
                </span>
                <div className="my-2">
                  <span className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#FAF7F2] block">
                    {formatRupiah(devBalance)}
                  </span>
                  <span className="text-xs text-[#E8CFA0]">
                    Terkumpul: +{formatRupiah(devIn)} &bull; Terpakai: -{formatRupiah(devOut)}
                  </span>
                </div>
                <Link
                  href="/#keuangan"
                  className="text-xs font-semibold text-[#E8CFA0] underline hover:text-white"
                >
                  Lihat Rincian Mutasi Kas &rarr;
                </Link>
              </div>

              <div className="bg-[#F2ECE1] rounded-xl p-5 border border-[#DFD5C5] flex flex-col justify-between">
                <span className="text-xs font-bold text-[#A84A2E]">
                  PEKERJAAN SEDANG BERJALAN
                </span>
                <div className="my-2">
                  <span className="font-serif-heading text-3xl font-bold text-[#1E1B18] block">
                    {activeProjects.length} Proyek
                  </span>
                  <span className="text-xs text-[#524740]">
                    Fokus pengerjaan fisik saat ini di lapangan
                  </span>
                </div>
              </div>

              <div className="bg-[#F2ECE1] rounded-xl p-5 border border-[#DFD5C5] flex flex-col justify-between">
                <span className="text-xs font-bold text-[#524740]">
                  RENCANA FASILITAS BARU
                </span>
                <div className="my-2">
                  <span className="font-serif-heading text-3xl font-bold text-[#1E1B18] block">
                    {plannedProjects.length} Program
                  </span>
                  <span className="text-xs text-[#524740]">
                    Tahap pengembangan fasilitas berikutnya
                  </span>
                </div>
              </div>

              <div className="bg-[#F2ECE1] rounded-xl p-5 border border-[#DFD5C5] flex flex-col justify-between">
                <span className="text-xs font-bold text-[#3D4D33]">
                  TAHAPAN PROYEK SELESAI
                </span>
                <div className="my-2">
                  <span className="font-serif-heading text-3xl font-bold text-[#1E1B18] block">
                    {completedProjects.length} Arsip
                  </span>
                  <span className="text-xs text-[#524740]">
                    Rekam jejak rehabilitasi &amp; fasilitas tuntas
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 2. DAFTAR PROYEK YANG SEDANG BERJALAN */}
          <section className="space-y-8" aria-labelledby="active-rehab-heading">
            <div className="border-b-2 border-[#DFD5C5] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-xs font-bold tracking-wider uppercase text-[#A84A2E] block mb-1">
                  FOKUS UTAMA SAAT INI
                </span>
                <h2
                  id="active-rehab-heading"
                  className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1E1B18]"
                >
                  Progres Pekerjaan Fisik yang Sedang Berlangsung
                </h2>
              </div>
              <span className="text-xs text-[#524740]">
                Penanggung Jawab: <strong>{rehab.picName}</strong>
              </span>
            </div>

            {activeProjects.length === 0 ? (
              <div className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-8 text-center">
                <p className="text-base font-semibold text-[#1E1B18] mb-1">
                  Tidak ada pekerjaan fisik yang sedang berjalan saat ini.
                </p>
                <p className="text-xs sm:text-sm text-[#524740]">
                  Silakan lihat rencana pengembangan fasilitas baru atau riwayat pekerjaan yang telah selesai di bawah.
                </p>
              </div>
            ) : (
              activeProjects.map((project) => (
                <article
                  key={project.id}
                  className="bg-[#F2ECE1] border-2 border-[#1E1B18] rounded-2xl p-6 sm:p-8 space-y-8"
                >
                  {/* Top Project Header & Progress Bar */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-8 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded bg-[#A84A2E] text-white text-xs font-bold">
                          SEDANG DIKERJAKAN
                        </span>
                        <span className="px-3 py-1 rounded bg-[#FAF7F2] border border-[#DFD5C5] text-xs font-bold text-[#1E1B18]">
                          {project.category}
                        </span>
                        <span className="text-xs font-medium text-[#524740] inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>
                            Mulai: {project.startDate} &bull; Target: {project.targetDate}
                          </span>
                        </span>
                      </div>

                      <h3 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1E1B18]">
                        {project.title}
                      </h3>

                      <p className="text-sm sm:text-base text-[#524740] leading-relaxed">
                        {project.summary}
                      </p>
                    </div>

                    {/* Progress & Target Budget Box */}
                    <div className="lg:col-span-4 bg-[#FAF7F2] border border-[#DFD5C5] rounded-xl p-5 space-y-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#524740] block">
                            CAPAIAN PROGRES FISIK
                          </span>
                          <span className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#A84A2E]">
                            {project.overallProgress}%
                          </span>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#3D4D33] text-white">
                          On Progress
                        </span>
                      </div>

                      <div
                        className="w-full h-3.5 bg-[#DFD5C5] rounded-full overflow-hidden"
                        role="progressbar"
                        aria-valuenow={project.overallProgress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className="h-full bg-[#A84A2E] rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.max(0, project.overallProgress))}%`,
                          }}
                        />
                      </div>

                      {project.estimatedBudget > 0 && (
                        <div className="pt-3 border-t border-[#DFD5C5] flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-[#524740] font-medium">
                            Estimasi Kebutuhan Dana:
                          </span>
                          <strong className="font-mono text-[#1E1B18]">
                            {formatRupiah(project.estimatedBudget)}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Two Columns: Stages Timeline (Left) & Material Needs (Right) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 border-t border-[#DFD5C5]">
                    {/* Left: Vertical Timeline of Stages */}
                    <div className="lg:col-span-7 space-y-4">
                      <h4 className="font-serif-heading text-lg sm:text-xl font-bold text-[#1E1B18]">
                        Rincian Tahapan Pekerjaan ({project.stages.length} Tahap)
                      </h4>

                      {project.stages.length === 0 ? (
                        <p className="text-xs text-[#524740]">
                          Belum ada rincian tahapan untuk proyek ini.
                        </p>
                      ) : (
                        <div className="relative pl-6 border-l-2 border-[#A84A2E]/40 space-y-6">
                          {project.stages.map((stg) => {
                            const isDone = stg.status === 'SELESAI';
                            const isRunning = stg.status === 'BERJALAN';
                            return (
                              <div key={stg.id} className="relative">
                                <span
                                  aria-hidden="true"
                                  className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 ${
                                    isDone
                                      ? 'bg-[#3D4D33] border-[#3D4D33]'
                                      : isRunning
                                      ? 'bg-[#A84A2E] border-[#FAF7F2] ring-2 ring-[#A84A2E]'
                                      : 'bg-[#FAF7F2] border-[#524740]'
                                  }`}
                                />

                                <div className="bg-[#FAF7F2] border border-[#DFD5C5] rounded-xl p-4 space-y-2">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold ${
                                        isDone
                                          ? 'bg-[#3D4D33] text-white'
                                          : isRunning
                                          ? 'bg-[#A84A2E] text-white'
                                          : 'bg-[#F2ECE1] text-[#524740]'
                                      }`}
                                    >
                                      {isDone ? (
                                        <>
                                          <CheckCircle2 className="w-3 h-3" />
                                          <span>SELESAI (100%)</span>
                                        </>
                                      ) : isRunning ? (
                                        <>
                                          <Clock className="w-3 h-3" />
                                          <span>SEDANG BERJALAN ({stg.progressPercent}%)</span>
                                        </>
                                      ) : (
                                        <span>TAHAP BERIKUTNYA ({stg.progressPercent}%)</span>
                                      )}
                                    </span>

                                    <span className="text-xs font-mono font-semibold text-[#524740]">
                                      {stg.dateLabel}
                                    </span>
                                  </div>

                                  <h5 className="font-serif-heading font-bold text-base text-[#1E1B18]">
                                    {stg.title}
                                  </h5>

                                  <p className="text-xs sm:text-sm text-[#524740] leading-relaxed">
                                    {stg.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Right: Material / Waqf Needs */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="bg-[#FAF7F2] border border-[#DFD5C5] rounded-xl p-5 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#A84A2E]">
                          <PackageCheck className="w-4 h-4" aria-hidden="true" />
                          <span>DAFTAR KEBUTUHAN MATERIAL &amp; WAKAF</span>
                        </div>

                        <h4 className="font-serif-heading text-lg font-bold text-[#1E1B18]">
                          Kebutuhan Material Fisik Saat Ini
                        </h4>

                        <p className="text-xs text-[#524740]">
                          Jamaah dan donatur dapat berpartisipasi melalui infaq dana maupun wakaf material langsung sesuai kebutuhan di bawah ini:
                        </p>

                        {project.materialNeeds.length > 0 ? (
                          <ul className="space-y-2 text-xs sm:text-sm">
                            {project.materialNeeds.map((item, idx) => (
                              <li
                                key={idx}
                                className="p-2.5 rounded-lg bg-[#F2ECE1] border border-[#DFD5C5] font-medium text-[#1E1B18] flex items-start gap-2"
                              >
                                <span className="w-5 h-5 rounded-full bg-[#1E1B18] text-[#E8CFA0] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-[#524740]">
                            Daftar kebutuhan material sedang diperbarui oleh panitia.
                          </p>
                        )}

                        <a
                          href={`https://wa.me/${rehab.picWhatsapp.replace(
                            /[^0-9]/g,
                            ''
                          )}?text=${encodeURIComponent(
                            `Assalamu'alaikum Panitia Pembangunan Masjid Al Jami'ah IAIN Manado, saya ingin berkonsultasi / menyalurkan wakaf untuk: ${project.title}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full px-4 py-3 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md bg-[#A84A2E] text-white text-xs sm:text-sm font-semibold hover:bg-[#8E3B22]"
                        >
                          <Phone className="w-4 h-4" aria-hidden="true" />
                          <span>Konfirmasi Wakaf Material / Dana via WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Project Photo Gallery */}
                  {project.gallery.length > 0 && (
                    <div className="pt-6 border-t border-[#DFD5C5] space-y-4">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[#A84A2E]" aria-hidden="true" />
                        <h4 className="font-serif-heading text-lg font-bold text-[#1E1B18]">
                          Dokumentasi Visual Lapangan &amp; Rencana Desain
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {project.gallery.map((photo) => (
                          <figure
                            key={photo.id}
                            className="bg-[#FAF7F2] border border-[#DFD5C5] rounded-xl overflow-hidden flex flex-col justify-between"
                          >
                            <div className="relative h-52 bg-[#1E1B18]">
                              <img
                                src={photo.imageUrl}
                                alt={photo.caption}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-[#1E1B18]/85 text-[#E8CFA0] text-[11px] font-bold">
                                {photo.tag === 'DESAIN_TARGET'
                                  ? 'Target Desain'
                                  : photo.tag === 'SEBELUM'
                                  ? 'Kondisi Awal'
                                  : photo.tag === 'SELESAI'
                                  ? 'Selesai 100%'
                                  : 'Progres Lapangan'}
                              </span>
                            </div>
                            <figcaption className="p-3.5">
                              <p className="text-xs sm:text-sm font-semibold text-[#1E1B18] mb-1">
                                {photo.caption}
                              </p>
                              <span className="text-[11px] font-mono text-[#524740]">
                                Diperbarui: {photo.date}
                              </span>
                            </figcaption>
                          </figure>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              ))
            )}
          </section>

          {/* 3. RENCANA PENGEMBANGAN FASILITAS BARU BERIKUTNYA */}
          {plannedProjects.length > 0 && (
            <section className="space-y-6" aria-labelledby="planned-rehab-heading">
              <div className="border-b border-[#DFD5C5] pb-3">
                <span className="text-xs font-bold tracking-wider uppercase text-[#524740] block mb-1">
                  AGENDA PENGEMBANGAN BERIKUTNYA
                </span>
                <h2
                  id="planned-rehab-heading"
                  className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1E1B18]"
                >
                  Rencana Penambahan &amp; Pembangunan Fasilitas Baru Masjid
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {plannedProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-6 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded bg-[#1E1B18] text-[#E8CFA0] text-xs font-bold">
                          TAHAP PERENCANAAN
                        </span>
                        <span className="text-xs font-mono text-[#524740]">
                          Jadwal: {proj.startDate} - {proj.targetDate}
                        </span>
                      </div>

                      <h3 className="font-serif-heading text-xl font-bold text-[#1E1B18]">
                        {proj.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#524740] leading-relaxed">
                        {proj.summary}
                      </p>

                      {proj.stages.length > 0 && (
                        <div className="pt-2 space-y-1.5">
                          <span className="text-xs font-bold text-[#1E1B18] block">
                            Tahapan yang Direncanakan:
                          </span>
                          <ul className="space-y-1 text-xs text-[#524740] list-disc list-inside">
                            {proj.stages.map((s) => (
                              <li key={s.id}>
                                <strong>{s.title}</strong> ({s.dateLabel})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {proj.estimatedBudget > 0 && (
                      <div className="pt-3 border-t border-[#DFD5C5] flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-[#524740]">Estimasi Anggaran:</span>
                        <strong className="font-mono text-[#A84A2E]">
                          {formatRupiah(proj.estimatedBudget)}
                        </strong>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4. ARSIP RIWAYAT REHABILITASI & FASILITAS YANG TELAH SELESAI */}
          {completedProjects.length > 0 && (
            <section className="space-y-6" aria-labelledby="completed-rehab-heading">
              <div className="border-b border-[#DFD5C5] pb-3">
                <span className="text-xs font-bold tracking-wider uppercase text-[#3D4D33] block mb-1">
                  REKAM JEJAK AKUNTABILITAS TAKMIR
                </span>
                <h2
                  id="completed-rehab-heading"
                  className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1E1B18]"
                >
                  Riwayat Rehabilitasi &amp; Pembangunan Fasilitas yang Telah Selesai
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completedProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="bg-[#FAF7F2] border border-[#DFD5C5] rounded-xl p-6 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#3D4D33] text-white text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>SELESAI 100%</span>
                      </span>
                      <span className="text-xs font-mono text-[#524740]">
                        Tuntas: {proj.targetDate}
                      </span>
                    </div>

                    <h3 className="font-serif-heading text-xl font-bold text-[#1E1B18]">
                      {proj.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#524740]">
                      {proj.summary}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 5. KOTAK SALURAN INFAQ & WAKAF PEMBANGUNAN MASJID */}
          <section className="bg-[#1E1B18] text-[#FAF7F2] rounded-2xl p-6 sm:p-10 border-2 border-[#E8CFA0]/40 dark-surface">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <span className="inline-block px-3 py-1 rounded bg-[#A84A2E] text-white text-xs font-bold">
                  WAKAF &amp; INFAQ JARIYAH PEMBANGUNAN MASJID
                </span>
                <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#FAF7F2]">
                  Mari Bersama Memakmurkan &amp; Membangun Fasilitas Masjid Al Jami&apos;ah
                </h2>
                <p className="text-sm sm:text-base text-[#F2ECE1] leading-relaxed">
                  Setiap kontribusi infaq dan wakaf yang disalurkan untuk rehabilitasi maupun penambahan fasilitas baru dicatat secara terbuka pada Pos Kas Pembangunan Masjid.
                </p>

                <div className="bg-[#2C2520] border border-white/15 rounded-xl p-4 space-y-1 text-xs sm:text-sm">
                  <span className="text-[#E8CFA0] block font-semibold">
                    Rekening Resmi Kas Masjid:
                  </span>
                  <p className="text-base sm:text-lg font-bold text-[#FAF7F2]">
                    {db.donationInfo.bankName} &bull;{' '}
                    <span className="font-mono text-[#E8CFA0]">
                      {db.donationInfo.accountNumber}
                    </span>
                  </p>
                  <p className="text-xs text-[#F2ECE1]">
                    a.n. {db.donationInfo.accountHolder}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-4 bg-[#FAF7F2] text-[#1E1B18] rounded-xl p-5 text-center flex flex-col items-center">
                <span className="text-xs font-bold text-[#A84A2E] mb-2">
                  PINDAI QRIS MASJID AL JAMI&apos;AH
                </span>
                <div className="w-44 h-44 bg-white border border-[#DFD5C5] rounded-lg p-2 flex items-center justify-center mb-3">
                  {db.donationInfo.qrisImageUrl ? (
                    <img
                      src={db.donationInfo.qrisImageUrl}
                      alt="QRIS Infaq Pembangunan Masjid"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-2">
                      <QrCode className="w-12 h-12 text-[#A84A2E] mx-auto mb-1" />
                      <span className="text-[11px] font-bold block">
                        QRIS Masjid
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-[#524740]">
                  Konfirmasi WA: <strong>+{rehab.picWhatsapp}</strong>
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer
        profile={db.mosqueProfile}
        footerSettings={db.footerSettings}
        customPages={db.customPages}
      />
    </>
  );
}

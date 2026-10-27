import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { readMosqueDb } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MualafInteractiveClient from '@/components/MualafInteractiveClient';
import {
  ArrowLeft,
  HeartHandshake,
  CheckCircle2,
  BookOpen,
  Users,
  Phone,
  FileCheck2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const db = readMosqueDb();
  return {
    title: `${db.mualafCenter.pageTitle} | ${db.mosqueProfile.name}`,
    description: db.mualafCenter.pageSubtitle,
  };
}

export default async function MualafCenterPage() {
  const db = readMosqueDb();
  const mc = db.mualafCenter;

  return (
    <>
      <Navbar
        mosqueName={db.mosqueProfile.name}
        institution={db.mosqueProfile.institution}
        logoUrl={db.mosqueProfile.logoUrl}
        menus={db.menus}
      />

      <main id="main-content" className="flex-1 bg-[#FAF7F2] text-[#1E1B18]">
        {/* TOP HERO HEADER */}
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
                <HeartHandshake className="w-3.5 h-3.5" aria-hidden="true" />
                <span>LAYANAN RESMI PEMBINAAN &amp; SYAHADAT</span>
              </span>
              <span className="text-xs font-semibold text-[#E8CFA0]">
                {db.mosqueProfile.name} &bull; {db.mosqueProfile.institution}
              </span>
            </div>

            <h1 className="font-serif-heading text-3xl sm:text-5xl font-bold text-[#FAF7F2] leading-tight mb-4 max-w-4xl">
              {mc.pageTitle}
            </h1>

            <p className="text-sm sm:text-lg text-[#F2ECE1] max-w-3xl leading-relaxed">
              {mc.pageSubtitle}
            </p>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
          {/* 1. PESAN PENGANTAR & KALIMAT SYAHADAT */}
          <section className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-2xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A84A2E] block">
                SAMBUTAN PERSAUDARAAN
              </span>
              <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1E1B18]">
                Pendampingan Keislaman yang Ramah, Resmi &amp; Penuh Kekeluargaan
              </h2>
              <p className="text-sm sm:text-base text-[#524740] leading-relaxed">
                {mc.welcomeMessage}
              </p>
            </div>

            <div className="lg:col-span-5 bg-[#1E1B18] text-[#FAF7F2] rounded-xl p-6 text-center space-y-3 border border-[#E8CFA0]/40 dark-surface">
              <span className="text-xs font-bold text-[#E8CFA0] block">
                DUA KALIMAT SYAHADAT
              </span>
              <p
                dir="rtl"
                lang="ar"
                className="font-arabic text-2xl sm:text-3xl text-[#E8CFA0] leading-[2.0]"
              >
                أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ
              </p>
              <p className="text-xs sm:text-sm text-[#F2ECE1] italic">
                &ldquo;Aku bersaksi bahwa tidak ada Tuhan yang berhak disembah selain Allah, dan aku bersaksi bahwa Nabi Muhammad adalah utusan Allah.&rdquo;
              </p>
            </div>
          </section>

          {/* 2. ALUR 4 LANGKAH PROSESI IKRAR SYAHADAT */}
          <section className="space-y-6" aria-labelledby="mualaf-steps-heading">
            <div className="border-b border-[#DFD5C5] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A84A2E] block mb-1">
                PROSEDUR PELAYANAN
              </span>
              <h2
                id="mualaf-steps-heading"
                className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1E1B18]"
              >
                Alur Pendampingan &amp; Prosesi Ikrar Syahadat
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {mc.steps.map((step) => (
                <div
                  key={step.id}
                  className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-5 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    <span className="w-9 h-9 rounded-lg bg-[#1E1B18] text-[#E8CFA0] font-serif-heading font-bold text-lg flex items-center justify-center">
                      {step.stepNumber}
                    </span>
                    <h3 className="font-serif-heading text-lg font-bold text-[#1E1B18]">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#524740] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. DUA KOLOM: SYARAT BERKAS & PROGRAM PEMBINAAN + TIM PEMBINA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Requirements, Programs, and Mentors */}
            <div className="lg:col-span-6 space-y-8">
              {/* Persyaratan Administrasi */}
              <section className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#A84A2E]">
                  <FileCheck2 className="w-4 h-4" aria-hidden="true" />
                  <span>PERSYARATAN ADMINISTRASI SYAHADAT</span>
                </div>

                <h3 className="font-serif-heading text-xl font-bold text-[#1E1B18]">
                  Kelengkapan Berkas Ikrar Syahadat Resmi
                </h3>

                <ul className="space-y-2.5 text-xs sm:text-sm text-[#1E1B18]">
                  {mc.requirements.map((req, idx) => (
                    <li
                      key={idx}
                      className="bg-[#FAF7F2] border border-[#DFD5C5] rounded-lg p-3 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#3D4D33] shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Program Pembinaan Pasca-Syahadat */}
              <section className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#A84A2E]">
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                  <span>KURIKULUM PENDAMPINGAN</span>
                </div>

                <h3 className="font-serif-heading text-xl font-bold text-[#1E1B18]">
                  Program Pembinaan Rutin Pasca-Syahadat
                </h3>

                <div className="space-y-3">
                  {mc.programs.map((prog) => (
                    <div
                      key={prog.id}
                      className="bg-[#FAF7F2] border border-[#DFD5C5] rounded-xl p-4 space-y-1.5"
                    >
                      <span className="inline-block px-2.5 py-0.5 rounded bg-[#1E1B18] text-[#E8CFA0] text-[11px] font-bold">
                        {prog.schedule}
                      </span>
                      <h4 className="font-serif-heading font-bold text-base text-[#1E1B18]">
                        {prog.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-[#524740]">
                        {prog.description}
                      </p>
                      <p className="text-xs font-semibold text-[#A84A2E] pt-1">
                        Pembimbing: {prog.mentor}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Tim Pembina */}
              {mc.mentors.length > 0 && (
                <section className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#A84A2E]">
                    <Users className="w-4 h-4" aria-hidden="true" />
                    <span>TIM PEMBIMBING PUTRA &amp; PUTRI</span>
                  </div>

                  <h3 className="font-serif-heading text-xl font-bold text-[#1E1B18]">
                    Ustadz &amp; Ustadzah Pembina Mualaf Center
                  </h3>

                  <div className="space-y-3">
                    {mc.mentors.map((mentor) => (
                      <div
                        key={mentor.id}
                        className="bg-[#FAF7F2] border border-[#DFD5C5] rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <strong className="block text-sm text-[#1E1B18]">
                            {mentor.name}
                          </strong>
                          <span className="text-xs text-[#524740]">
                            {mentor.role}
                          </span>
                        </div>
                        {mentor.whatsapp && (
                          <a
                            href={`https://wa.me/${mentor.whatsapp.replace(
                              /[^0-9]/g,
                              ''
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 min-h-[38px] inline-flex items-center gap-1.5 rounded bg-[#1E1B18] text-[#FAF7F2] text-xs font-semibold shrink-0"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#E8CFA0]" />
                            <span>Hubungi</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column: Interactive Consultation & Registration Form */}
            <div className="lg:col-span-6 lg:sticky lg:top-24">
              <MualafInteractiveClient
                hotlineName={mc.hotlineName}
                hotlineWhatsapp={mc.hotlineWhatsapp}
              />
            </div>
          </div>
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

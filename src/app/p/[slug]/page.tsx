import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { readMosqueDb } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft, Calendar, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const db = readMosqueDb();
  const page = db.customPages.find((p) => p.slug === slug);

  if (!page) {
    return {
      title: 'Halaman Tidak Ditemukan',
    };
  }

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || page.subtitle,
  };
}

export default async function DynamicCustomPage({ params }: PageProps) {
  const { slug } = await params;
  const db = readMosqueDb();
  const page = db.customPages.find((p) => p.slug === slug);

  if (!page) {
    return (
      <>
        <Navbar
          mosqueName={db.mosqueProfile.name}
          institution={db.mosqueProfile.institution}
          menus={db.menus}
        />
        <main id="main-content" className="flex-1 bg-[#FAF7F2]">
          <section className="bg-[#1E1B18] text-[#FAF7F2] pt-28 pb-14 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="font-serif-heading text-2xl sm:text-4xl font-bold text-[#FAF7F2]">
                Halaman Tidak Ditemukan
              </h1>
            </div>
          </section>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <p className="text-base text-[#524740] mb-6">
              Halaman informasi dengan alamat <code>/p/{slug}</code> belum tersedia atau telah dipindahkan.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/"
                className="px-5 py-3 min-h-[44px] inline-flex items-center gap-2 rounded-md bg-[#1E1B18] text-[#FAF7F2] text-sm font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Beranda</span>
              </Link>
            </div>
          </div>
        </main>
        <Footer
          profile={db.mosqueProfile}
          customPages={db.customPages}
        />
      </>
    );
  }

  const otherPages = db.customPages.filter(
    (p) => p.status === 'PUBLISHED' && p.id !== page.id
  );

  return (
    <>
      <Navbar
        mosqueName={db.mosqueProfile.name}
        institution={db.mosqueProfile.institution}
        menus={db.menus}
      />

      <main id="main-content" className="flex-1 bg-[#FAF7F2]">
        <header className="bg-[#1E1B18] text-[#FAF7F2] pt-28 pb-14 px-4 sm:px-6 lg:px-8 border-b-4 border-[#A84A2E] dark-surface">
          <div className="max-w-5xl mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#E8CFA0] hover:underline mb-4 min-h-[36px]"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Kembali ke Beranda Utama</span>
            </Link>

            <h1
              style={{ fontSize: 'clamp(1.85rem, 3.8vw, 3rem)' }}
              className="font-serif-heading font-bold text-[#FAF7F2] leading-tight mb-3"
            >
              {page.title}
            </h1>

            {page.subtitle && (
              <p className="text-base sm:text-lg text-[#F2ECE1] max-w-3xl mb-3">
                {page.subtitle}
              </p>
            )}

            <div className="flex items-center gap-2 text-xs text-[#E8CFA0]">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Terakhir diperbarui: {page.updatedAt}</span>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <article className="lg:col-span-8 bg-[#FAF7F2]">
            <div
              className="prose-masjid text-base sm:text-lg"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </article>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-6">
              <div className="flex items-center gap-2 font-serif-heading font-bold text-lg text-[#1E1B18] mb-3">
                <FileText className="w-5 h-5 text-[#A84A2E]" aria-hidden="true" />
                <h2>Halaman Informasi Lainnya</h2>
              </div>
              <ul className="space-y-2 text-sm">
                {otherPages.map((op) => (
                  <li key={op.id}>
                    <Link
                      href={`/p/${op.slug}`}
                      className="block px-3.5 py-2.5 min-h-[44px] rounded-md bg-[#FAF7F2] border border-[#DFD5C5] font-semibold text-[#1E1B18] hover:border-[#A84A2E] hover:text-[#A84A2E] transition-colors"
                    >
                      {op.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#1E1B18] text-[#FAF7F2] rounded-xl p-6 dark-surface">
              <h2 className="font-serif-heading text-lg font-bold text-[#E8CFA0] mb-2">
                Butuh Bantuan Pengurus?
              </h2>
              <p className="text-xs sm:text-sm text-[#F2ECE1] leading-relaxed mb-4">
                Silakan ajukan permohonan layanan secara daring atau hubungi Sekretariat Takmir Masjid Al Jami&apos;ah IAIN Manado.
              </p>
              <Link
                href="/#layanan"
                className="w-full px-4 py-2.5 min-h-[44px] inline-flex items-center justify-center rounded-md bg-[#A84A2E] text-white text-xs sm:text-sm font-semibold hover:bg-[#8E3B22]"
              >
                Buka Layanan Masjid
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <Footer
        profile={db.mosqueProfile}
        customPages={db.customPages}
      />
    </>
  );
}

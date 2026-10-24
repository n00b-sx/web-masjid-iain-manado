import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://masjid.iain-manado.ac.id'
  ),
  title: {
    default: "Masjid Al Jami'ah IAIN Manado | Jadwal Sholat, Kajian & Layanan Umat",
    template: "%s | Masjid Al Jami'ah IAIN Manado",
  },
  description:
    "Portal resmi Masjid Al Jami'ah Institut Agama Islam Negeri (IAIN) Manado. Informasi jadwal sholat 5 waktu Kota Manado (WITA), kegiatan kajian hari ini, laporan transparansi kas masjid, layanan peminjaman aula, dan berita kampus.",
  keywords: [
    "Masjid Al Jami'ah IAIN Manado",
    'Masjid Kampus IAIN Manado',
    'Jadwal Sholat Manado WITA',
    'Kajian Islam IAIN Manado',
    'Takmir Masjid Al Jamiah Manado',
    'IAIN Manado',
  ],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: "Masjid Al Jami'ah IAIN Manado",
    title: "Masjid Al Jami'ah IAIN Manado | Pusat Ibadah & Keilmuan Kampus",
    description:
      "Informasi jadwal sholat 5 waktu Manado WITA, agenda kegiatan masjid hari ini, transparansi kas, dan layanan sivitas akademika IAIN Manado.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1E1B18] antialiased selection:bg-[#A84A2E] selection:text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-[#1E1B18] focus:text-[#FAF7F2] focus:rounded-md focus:font-semibold"
        >
          Lewati ke konten utama
        </a>
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: "Aplikasi Bendahara | Masjid Al Jami'ah IAIN Manado",
  description:
    "Aplikasi smartphone pencatatan cepat kas masuk dan keluar khusus Bendahara Masjid Al Jami'ah IAIN Manado",
  manifest: '/manifest-bendahara.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Bendahara Masjid',
  },
};

export const viewport: Viewport = {
  themeColor: '#1E1B18',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function BendaharaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[#14110F] text-[#1E1B18]">{children}</div>;
}

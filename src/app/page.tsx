import React from 'react';
import { readMosqueDb } from '@/lib/db';
import {
  fetchManadoPrayerTimes,
  formatIndonesianDate,
} from '@/lib/prayer-times';
import Navbar from '@/components/Navbar';
import HeroSlideshow from '@/components/HeroSlideshow';
import PrayerScheduleSection from '@/components/PrayerScheduleSection';
import EventsSection from '@/components/EventsSection';
import FinanceInfographicSection from '@/components/FinanceInfographicSection';
import ServicesSection from '@/components/ServicesSection';
import NewsSection from '@/components/NewsSection';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const db = readMosqueDb();
  const prayerData = await fetchManadoPrayerTimes(db.prayerSettings);
  const masehiDate = formatIndonesianDate(new Date());

  // Schema.org JSON-LD for Mosque & PlaceOfWorship (SEO Standard)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Mosque',
    name: db.mosqueProfile.name,
    alternateName: 'Masjid Kampus IAIN Manado',
    description: db.mosqueProfile.tagline,
    address: {
      '@type': 'PostalAddress',
      streetAddress: db.mosqueProfile.address,
      addressLocality: db.mosqueProfile.city,
      addressRegion: db.mosqueProfile.province,
      addressCountry: 'ID',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: db.prayerSettings.latitude,
      longitude: db.prayerSettings.longitude,
    },
    parentOrganization: {
      '@type': 'CollegeOrUniversity',
      name: db.mosqueProfile.institution,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar
        mosqueName={db.mosqueProfile.name}
        institution={db.mosqueProfile.institution}
        logoUrl={db.mosqueProfile.logoUrl}
        menus={db.menus}
      />

      <main id="main-content" className="flex-1">
        <HeroSlideshow
          slides={db.heroSlides}
          mosqueAddress={`${db.mosqueProfile.address}, ${db.mosqueProfile.city}`}
          hijriDate={prayerData.hijriDateString}
          masehiDate={masehiDate}
        />

        <PrayerScheduleSection
          times={prayerData.times}
          settings={db.prayerSettings}
          sourceLabel={prayerData.sourceLabel}
        />

        <EventsSection events={db.events} />

        <FinanceInfographicSection
          transactions={db.transactions}
          donationInfo={db.donationInfo}
        />

        <ServicesSection services={db.services} />

        <NewsSection articles={db.news} />
      </main>

      <Footer
        profile={db.mosqueProfile}
        customPages={db.customPages}
        footerSettings={db.footerSettings}
      />
    </>
  );
}

import { ManualPrayerTimes, PrayerName, PrayerSettings } from '@/types/mosque';

export const PRAYER_LIST: PrayerName[] = [
  'Subuh',
  'Syuruq',
  'Dzuhur',
  'Ashar',
  'Maghrib',
  'Isya',
];

export const OBLIGATORY_PRAYERS: PrayerName[] = [
  'Subuh',
  'Dzuhur',
  'Ashar',
  'Maghrib',
  'Isya',
];

export function addMinutesToTime(timeStr: string, offsetMinutes: number): string {
  const clean = timeStr.trim().slice(0, 5);
  const parts = clean.split(':');
  if (parts.length !== 2) return '00:00';
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return '00:00';

  const totalMinutes = ((h * 60 + m + offsetMinutes) % 1440 + 1440) % 1440;
  const newH = Math.floor(totalMinutes / 60);
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

export function applyOffsetsToTimes(
  rawTimes: ManualPrayerTimes,
  settings: PrayerSettings
): ManualPrayerTimes {
  if (settings.useManualOverride) {
    return settings.manualTimes;
  }
  return {
    Subuh: addMinutesToTime(rawTimes.Subuh, settings.offsets.Subuh),
    Syuruq: addMinutesToTime(rawTimes.Syuruq, settings.offsets.Syuruq),
    Dzuhur: addMinutesToTime(rawTimes.Dzuhur, settings.offsets.Dzuhur),
    Ashar: addMinutesToTime(rawTimes.Ashar, settings.offsets.Ashar),
    Maghrib: addMinutesToTime(rawTimes.Maghrib, settings.offsets.Maghrib),
    Isya: addMinutesToTime(rawTimes.Isya, settings.offsets.Isya),
  };
}

export async function fetchManadoPrayerTimes(
  settings: PrayerSettings
): Promise<{
  times: ManualPrayerTimes;
  hijriDateString: string;
  sourceLabel: string;
}> {
  if (settings.useManualOverride) {
    return {
      times: settings.manualTimes,
      hijriDateString: getFallbackHijriDate(new Date()),
      sourceLabel: 'Jadwal Manual Takmir Masjid (WITA)',
    };
  }

  try {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();

    // Method 20 = Kementerian Agama Republik Indonesia
    const url = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${settings.latitude}&longitude=${settings.longitude}&method=20`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      throw new Error('Failed to fetch Aladhan API');
    }
    const json = await res.json();
    const timings = json?.data?.timings;
    const hijri = json?.data?.date?.hijri;

    if (!timings) {
      throw new Error('Invalid timings payload');
    }

    const raw: ManualPrayerTimes = {
      Subuh: (timings.Fajr || '04:28').slice(0, 5),
      Syuruq: (timings.Sunrise || '05:44').slice(0, 5),
      Dzuhur: (timings.Dhuhr || '11:51').slice(0, 5),
      Ashar: (timings.Asr || '15:08').slice(0, 5),
      Maghrib: (timings.Maghrib || '17:55').slice(0, 5),
      Isya: (timings.Isha || '19:05').slice(0, 5),
    };

    const hijriStr = hijri
      ? `${hijri.day} ${hijri.month?.en || ''} ${hijri.year} H`
      : getFallbackHijriDate(now);

    return {
      times: applyOffsetsToTimes(raw, settings),
      hijriDateString: hijriStr,
      sourceLabel: 'Kemenag RI / Koordinat Kota Manado (WITA)',
    };
  } catch {
    return {
      times: applyOffsetsToTimes(settings.manualTimes, settings),
      hijriDateString: getFallbackHijriDate(new Date()),
      sourceLabel: 'Jadwal Standar Kota Manado (WITA)',
    };
  }
}

export function getFallbackHijriDate(date: Date): string {
  try {
    const formatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Makassar',
    });
    return formatter.format(date);
  } catch {
    return 'Kalender Hijriah WITA';
  }
}

export function formatIndonesianDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Makassar',
    }).format(date);
  } catch {
    return date.toLocaleDateString('id-ID');
  }
}

export function getNextPrayerInfo(
  times: ManualPrayerTimes,
  now: Date
): {
  nextPrayer: PrayerName;
  nextTimeStr: string;
  countdownText: string;
  secondsRemaining: number;
  currentPrayerActive: PrayerName | null;
} {
  // Get current WITA hours, minutes, seconds
  const witaString = now.toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Makassar',
    hour12: false,
  });
  const [curH, curM, curS] = witaString.split(':').map((n) => parseInt(n, 10));
  const currentTotalSeconds = (curH || 0) * 3600 + (curM || 0) * 60 + (curS || 0);

  const scheduleEntries: { name: PrayerName; seconds: number; timeStr: string }[] =
    OBLIGATORY_PRAYERS.map((name) => {
      const t = times[name] || '00:00';
      const [h, m] = t.split(':').map((n) => parseInt(n, 10));
      return {
        name,
        timeStr: t,
        seconds: (h || 0) * 3600 + (m || 0) * 60,
      };
    });

  let nextEntry = scheduleEntries.find((item) => item.seconds > currentTotalSeconds);
  let secondsRemaining = 0;

  // Determine which prayer window we are currently in
  let currentPrayerActive: PrayerName | null = null;
  for (let i = scheduleEntries.length - 1; i >= 0; i--) {
    if (currentTotalSeconds >= scheduleEntries[i].seconds) {
      currentPrayerActive = scheduleEntries[i].name;
      break;
    }
  }

  if (nextEntry) {
    secondsRemaining = nextEntry.seconds - currentTotalSeconds;
  } else {
    // Next prayer is tomorrow's Subuh
    nextEntry = scheduleEntries[0];
    secondsRemaining = 86400 - currentTotalSeconds + nextEntry.seconds;
  }

  const hrs = Math.floor(secondsRemaining / 3600);
  const mins = Math.floor((secondsRemaining % 3600) / 60);
  const secs = secondsRemaining % 60;

  const countdownText = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(
    2,
    '0'
  )}:${String(secs).padStart(2, '0')}`;

  return {
    nextPrayer: nextEntry.name,
    nextTimeStr: nextEntry.timeStr,
    countdownText,
    secondsRemaining,
    currentPrayerActive,
  };
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

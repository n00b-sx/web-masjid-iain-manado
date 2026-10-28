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

export type SolarSkyPhase =
  | 'FAJAR'
  | 'DHUHA'
  | 'DZUHUR'
  | 'ASHAR'
  | 'MAGHRIB'
  | 'ISYA';

export interface SolarPinPoint {
  name: PrayerName;
  timeStr: string;
  minutes: number;
  t: number;
  x: number;
  y: number;
  isHorizonOrAbove: boolean;
}

export interface SolarSkyState {
  phase: SolarSkyPhase;
  phaseLabel: string;
  phaseDescription: string;
  isDaytime: boolean;
  celestialBody: 'SUN' | 'MOON';
  targetMinutes: number;
  formattedTime: string;
  /** Normalized progress along the 24h prayer cycle */
  sunT: number;
  sunX: number;
  sunY: number;
  /** Moon position along the main sky arc during night (Maghrib -> Syuruq) */
  moonX: number;
  moonY: number;
  moonAltitudeRatio: number;
  /** Sun altitude ratio (0 at horizon, 1 at Dzuhur zenith, < 0 below horizon) */
  sunAltitudeRatio: number;
  /** Sky gradient CSS for the PrayerScheduleSection panorama stage */
  skyGradient: string;
  /** Horizon glow color for sunrise/sunset/twilight */
  horizonGlow: string;
  /** Ambient background aura CSS for the hybrid page background */
  ambientAura: string;
  /** Star opacity (0 during day, up to 0.95 at night) */
  starOpacity: number;
  /** Cloud opacity */
  cloudOpacity: number;
  pins: SolarPinPoint[];
}

export function parseTimeStringToMinutes(timeStr: string): number {
  const clean = (timeStr || '00:00').trim().slice(0, 5);
  const [hStr, mStr] = clean.split(':');
  const h = parseInt(hStr || '0', 10);
  const m = parseInt(mStr || '0', 10);
  if (isNaN(h) || isNaN(m)) return 0;
  return Math.max(0, Math.min(1439, h * 60 + m));
}

export function formatMinutesToTimeString(totalMinutes: number): string {
  const normalized = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getWitaMinutesOfDay(date: Date): number {
  const witaString = date.toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Makassar',
    hour12: false,
  });
  const [h, m, s] = witaString.split(':').map((n) => parseInt(n, 10));
  return (h || 0) * 60 + (m || 0) + (s || 0) / 60;
}

/**
 * Computes SVG (x, y) on viewBox 0 0 1000 310 where:
 * - Horizon line is at y = 232
 * - t = 0.16 (Syuruq) -> (200.8, 232)
 * - t = 0.50 (Dzuhur) -> (500, 64)
 * - t = 0.84 (Maghrib) -> (799.2, 232)
 * Between t = 0.16 and t = 0.84, points lie strictly on the quadratic Bezier:
 * M 200.8 232 Q 500 -104 799.2 232
 */
export function getArcCoordinates(t: number): { x: number; y: number } {
  const clampedT = Math.max(0.02, Math.min(0.98, t));
  const x = 60 + clampedT * 880;
  const u = (clampedT - 0.5) / 0.34;
  if (Math.abs(u) <= 1) {
    const y = 64 + 168 * u * u;
    return { x, y };
  }
  const excess = Math.abs(u) - 1;
  const y = 232 + excess * 115;
  return { x, y };
}

export function getSolarSkyState(
  times: ManualPrayerTimes,
  rawTargetMinutes: number
): SolarSkyState {
  const targetMinutes = ((rawTargetMinutes % 1440) + 1440) % 1440;

  const mSubuh = parseTimeStringToMinutes(times.Subuh);
  const mSyuruq = parseTimeStringToMinutes(times.Syuruq);
  const mDzuhur = parseTimeStringToMinutes(times.Dzuhur);
  const mAshar = parseTimeStringToMinutes(times.Ashar);
  const mMaghrib = parseTimeStringToMinutes(times.Maghrib);
  const mIsya = parseTimeStringToMinutes(times.Isya);

  // Fixed landmark t-values along the horizon trajectory
  const T_SUBUH = 0.07;
  const T_SYURUQ = 0.16;
  const T_DZUHUR = 0.5;
  const T_ASHAR = 0.68;
  const T_MAGHRIB = 0.84;
  const T_ISYA = 0.93;

  const pinDefs: { name: PrayerName; min: number; t: number; above: boolean }[] = [
    { name: 'Subuh', min: mSubuh, t: T_SUBUH, above: false },
    { name: 'Syuruq', min: mSyuruq, t: T_SYURUQ, above: true },
    { name: 'Dzuhur', min: mDzuhur, t: T_DZUHUR, above: true },
    { name: 'Ashar', min: mAshar, t: T_ASHAR, above: true },
    { name: 'Maghrib', min: mMaghrib, t: T_MAGHRIB, above: true },
    { name: 'Isya', min: mIsya, t: T_ISYA, above: false },
  ];

  const pins: SolarPinPoint[] = pinDefs.map((p) => {
    const coords = getArcCoordinates(p.t);
    return {
      name: p.name,
      timeStr: times[p.name],
      minutes: p.min,
      t: p.t,
      x: coords.x,
      y: coords.y,
      isHorizonOrAbove: p.above,
    };
  });

  // Piecewise linear interpolation for sunT
  let sunT = T_DZUHUR;
  if (targetMinutes >= mSubuh && targetMinutes < mSyuruq) {
    const ratio = (targetMinutes - mSubuh) / Math.max(1, mSyuruq - mSubuh);
    sunT = T_SUBUH + ratio * (T_SYURUQ - T_SUBUH);
  } else if (targetMinutes >= mSyuruq && targetMinutes < mDzuhur) {
    const ratio = (targetMinutes - mSyuruq) / Math.max(1, mDzuhur - mSyuruq);
    sunT = T_SYURUQ + ratio * (T_DZUHUR - T_SYURUQ);
  } else if (targetMinutes >= mDzuhur && targetMinutes < mAshar) {
    const ratio = (targetMinutes - mDzuhur) / Math.max(1, mAshar - mDzuhur);
    sunT = T_DZUHUR + ratio * (T_ASHAR - T_DZUHUR);
  } else if (targetMinutes >= mAshar && targetMinutes <= mMaghrib) {
    const ratio = (targetMinutes - mAshar) / Math.max(1, mMaghrib - mAshar);
    sunT = T_ASHAR + ratio * (T_MAGHRIB - T_ASHAR);
  } else if (targetMinutes > mMaghrib && targetMinutes <= mIsya) {
    const ratio = (targetMinutes - mMaghrib) / Math.max(1, mIsya - mMaghrib);
    sunT = T_MAGHRIB + ratio * (T_ISYA - T_MAGHRIB);
  } else if (targetMinutes > mIsya) {
    const nightAfterIsya = targetMinutes - mIsya;
    const totalLateNight = Math.max(1, 1440 - mIsya + mSubuh);
    const ratio = nightAfterIsya / totalLateNight;
    sunT =
      ratio < 0.5
        ? T_ISYA + (ratio * 2) * (0.98 - T_ISYA)
        : 0.02 + ((ratio - 0.5) * 2) * (T_SUBUH - 0.02);
  } else {
    // 00:00 to Subuh
    const totalLateNight = Math.max(1, 1440 - mIsya + mSubuh);
    const elapsedSinceIsya = 1440 - mIsya + targetMinutes;
    const ratio = elapsedSinceIsya / totalLateNight;
    sunT =
      ratio < 0.5
        ? T_ISYA + (ratio * 2) * (0.98 - T_ISYA)
        : 0.02 + ((ratio - 0.5) * 2) * (T_SUBUH - 0.02);
  }

  const sunCoords = getArcCoordinates(sunT);
  const isDaytime = targetMinutes >= mSyuruq && targetMinutes <= mMaghrib;
  const sunAltitudeRatio = Math.max(
    -0.35,
    Math.min(1, (232 - sunCoords.y) / 168)
  );

  // Calculate Moon progression during night (Maghrib -> Syuruq next day)
  const nightDuration = Math.max(1, 1440 - mMaghrib + mSyuruq);
  let elapsedNight = 0;
  if (targetMinutes >= mMaghrib) {
    elapsedNight = targetMinutes - mMaghrib;
  } else if (targetMinutes <= mSyuruq) {
    elapsedNight = 1440 - mMaghrib + targetMinutes;
  }
  const nightRatio = Math.max(0, Math.min(1, elapsedNight / nightDuration));
  const moonT = T_SYURUQ + nightRatio * (T_MAGHRIB - T_SYURUQ);
  const moonCoords = getArcCoordinates(moonT);
  const moonAltitudeRatio = Math.max(0, Math.min(1, (232 - moonCoords.y) / 168));

  // Determine Atmospheric Phase & Palettes
  let phase: SolarSkyPhase = 'ISYA';
  let phaseLabel = 'Malam & Waktu Isya';
  let phaseDescription =
    'Matahari telah tenggelam sepenuhnya. Langit malam dinaungi bulan sabit hingga terbit fajar Subuh.';
  let skyGradient =
    'linear-gradient(180deg, #090D16 0%, #111A2E 52%, #1E293B 84%, #262220 100%)';
  let horizonGlow =
    'radial-gradient(circle at 50% 100%, rgba(232, 207, 160, 0.14) 0%, transparent 70%)';
  let ambientAura =
    'radial-gradient(circle at 50% 0%, rgba(30, 58, 138, 0.14) 0%, rgba(15, 23, 42, 0.05) 55%, transparent 80%)';
  let starOpacity = 0.9;
  let cloudOpacity = 0.12;

  if (targetMinutes >= mSubuh && targetMinutes < mSyuruq) {
    phase = 'FAJAR';
    phaseLabel = 'Waktu Fajar (Subuh Menuju Syuruq)';
    phaseDescription =
      'Cahaya fajar shadiq menyingsing di ufuk timur. Bintang memudar menyambut terbitnya matahari (Syuruq).';
    skyGradient =
      'linear-gradient(180deg, #131836 0%, #2E2B5F 42%, #7C3F58 76%, #D97742 100%)';
    horizonGlow =
      'radial-gradient(circle at 20% 92%, rgba(251, 146, 60, 0.55) 0%, rgba(168, 74, 46, 0.2) 45%, transparent 75%)';
    ambientAura =
      'radial-gradient(circle at 25% 15%, rgba(124, 63, 88, 0.16) 0%, rgba(217, 119, 66, 0.12) 45%, transparent 80%)';
    starOpacity = 0.45;
    cloudOpacity = 0.25;
  } else if (targetMinutes >= mSyuruq && targetMinutes < mDzuhur - 45) {
    phase = 'DHUHA';
    phaseLabel = 'Matahari Terbit & Waktu Dhuha';
    phaseDescription =
      'Matahari terbit dari ufuk timur (Syuruq) dan bergerak naik menyinari pagi dengan cahaya keemasan.';
    skyGradient =
      'linear-gradient(180deg, #1D4ED8 0%, #38BDF8 48%, #93C5FD 78%, #FDE68A 100%)';
    horizonGlow =
      'radial-gradient(circle at 25% 88%, rgba(253, 224, 71, 0.65) 0%, rgba(251, 146, 60, 0.25) 45%, transparent 75%)';
    ambientAura =
      'radial-gradient(circle at 30% 10%, rgba(56, 189, 248, 0.16) 0%, rgba(251, 191, 36, 0.14) 50%, transparent 82%)';
    starOpacity = 0;
    cloudOpacity = 0.65;
  } else if (targetMinutes >= mDzuhur - 45 && targetMinutes < mAshar) {
    phase = 'DZUHUR';
    phaseLabel = 'Puncak Kulminasi & Waktu Dzuhur';
    phaseDescription =
      'Matahari berada di titik tertinggi (istiwa) lalu tergelincir sedikit ke arah barat memasuki waktu Dzuhur.';
    skyGradient =
      'linear-gradient(180deg, #0369A1 0%, #0EA5E9 45%, #7DD3FC 82%, #E0F2FE 100%)';
    horizonGlow =
      'radial-gradient(circle at 50% 35%, rgba(254, 249, 195, 0.55) 0%, rgba(186, 230, 253, 0.25) 55%, transparent 80%)';
    ambientAura =
      'radial-gradient(circle at 50% 0%, rgba(14, 165, 233, 0.16) 0%, rgba(253, 224, 71, 0.10) 50%, transparent 82%)';
    starOpacity = 0;
    cloudOpacity = 0.8;
  } else if (targetMinutes >= mAshar && targetMinutes < mMaghrib - 20) {
    phase = 'ASHAR';
    phaseLabel = 'Condong Barat & Waktu Ashar';
    phaseDescription =
      'Matahari bergerak turun di langit barat dengan bayangan benda yang memanjang dan cahaya hangat keemasan.';
    skyGradient =
      'linear-gradient(180deg, #1E3A8A 0%, #3B82F6 38%, #F59E0B 78%, #FDE047 100%)';
    horizonGlow =
      'radial-gradient(circle at 72% 85%, rgba(251, 191, 36, 0.65) 0%, rgba(217, 119, 6, 0.3) 50%, transparent 80%)';
    ambientAura =
      'radial-gradient(circle at 70% 15%, rgba(245, 158, 11, 0.18) 0%, rgba(168, 74, 46, 0.10) 55%, transparent 85%)';
    starOpacity = 0;
    cloudOpacity = 0.6;
  } else if (targetMinutes >= mMaghrib - 20 && targetMinutes <= mIsya) {
    phase = 'MAGHRIB';
    phaseLabel = 'Matahari Terbenam & Waktu Maghrib';
    phaseDescription =
      'Bulatan matahari tenggelam di ufuk barat meninggalkan mega merah senja (syafaq) hingga menjelang Isya.';
    skyGradient =
      'linear-gradient(180deg, #1E1B4B 0%, #4C1D95 34%, #9A3412 68%, #EA580C 90%, #FBBF24 100%)';
    horizonGlow =
      'radial-gradient(circle at 80% 92%, rgba(249, 115, 22, 0.75) 0%, rgba(168, 74, 46, 0.4) 48%, transparent 80%)';
    ambientAura =
      'radial-gradient(circle at 75% 15%, rgba(234, 88, 12, 0.20) 0%, rgba(154, 52, 18, 0.12) 52%, transparent 85%)';
    starOpacity = 0.35;
    cloudOpacity = 0.35;
  }

  return {
    phase,
    phaseLabel,
    phaseDescription,
    isDaytime,
    celestialBody: isDaytime ? 'SUN' : 'MOON',
    targetMinutes,
    formattedTime: formatMinutesToTimeString(targetMinutes),
    sunT,
    sunX: sunCoords.x,
    sunY: sunCoords.y,
    moonX: moonCoords.x,
    moonY: moonCoords.y,
    moonAltitudeRatio,
    sunAltitudeRatio,
    skyGradient,
    horizonGlow,
    ambientAura,
    starOpacity,
    cloudOpacity,
    pins,
  };
}

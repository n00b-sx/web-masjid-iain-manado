'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FinanceTransaction, FundCategory } from '@/types/mosque';
import { formatRupiah } from '@/lib/prayer-times';
import ImageUploaderField from '@/components/ImageUploaderField';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Camera,
  CheckCircle2,
  Delete,
  Download,
  ExternalLink,
  FileSpreadsheet,
  History,
  Lock,
  LogOut,
  PlusCircle,
  RefreshCw,
  Search,
  Share2,
  ShieldCheck,
  Smartphone,
  Trash2,
  Wallet,
  AlertCircle,
  Eye,
  X,
} from 'lucide-react';

type MobileTab = 'INPUT' | 'HISTORY' | 'REPORT';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const CATEGORY_LABELS: Record<FundCategory, string> = {
  OPERASIONAL: 'Kas Operasional',
  PEMBANGUNAN: 'Kas Pembangunan & Rehab',
  SOSIAL_ZISWAF: 'Kas Sosial & ZISWAF',
};

const QUICK_DESCRIPTIONS_IN: Record<FundCategory, string[]> = {
  OPERASIONAL: [
    'Penerimaan Kotak Infaq Sholat Jumat',
    'Infaq Harian Kotak Amal Masjid',
    'Infaq Jamaah via QRIS Masjid',
    'Donasi Operasional Takmir Masjid',
  ],
  PEMBANGUNAN: [
    'Wakaf & Infaq Rehabilitasi Masjid',
    'Donasi Khusus Pembangunan Fasilitas Baru',
    'Sumbangan Material / Semen / Keramik',
    'Infaq Jumat untuk Pembangunan Masjid',
  ],
  SOSIAL_ZISWAF: [
    'Penerimaan Zakat / Infaq / Sedekah (ZISWAF)',
    'Donasi Beasiswa & Santunan Mahasiswa',
    'Infaq Buka Puasa & Kegiatan Sosial',
    'Donasi Pembinaan Mualaf Center',
  ],
};

const QUICK_DESCRIPTIONS_OUT: Record<FundCategory, string[]> = {
  OPERASIONAL: [
    'Biaya Kebersihan & Perlengkapan Masjid',
    'Tagihan Listrik, Air Wudhu & Internet',
    'Honorarium Khatib / Imam / Muadzin',
    'Konsumsi Kajian Rutin & Rapat Takmir',
  ],
  PEMBANGUNAN: [
    'Pembelian Material Semen, Pasir & Cat',
    'Upah Tukang Pekerjaan Rehabilitasi',
    'Pembelian Keramik & Instalasi Pipa Wudhu',
    'Peremajaan Sound System & Lampu Ruang Sholat',
  ],
  SOSIAL_ZISWAF: [
    'Penyaluran Santunan Mahasiswa Dhuafa',
    'Bantuan Sosial & Sembako Jamaah',
    'Paket Pembinaan & Al-Quran Mualaf Center',
    'Konsumsi Buka Puasa Sunnah / Ramadhan',
  ],
};

const QUICK_AMOUNTS = [50000, 100000, 250000, 500000, 1000000, 5000000];

export default function BendaharaMobileAppPage() {
  // Authentication & Session State
  const [pin, setPin] = useState('');
  const [savedPin, setSavedPin] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Mosque & Finance Data State
  const [mosqueName, setMosqueName] = useState("Masjid Al Jami'ah");
  const [institution, setInstitution] = useState('IAIN Manado');
  const [logoUrl, setLogoUrl] = useState('');
  const [treasurerName, setTreasurerName] = useState('Bendahara Takmir Masjid');
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);

  // UI Navigation State
  const [activeTab, setActiveTab] = useState<MobileTab>('INPUT');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  // Quick Entry Form State
  const [txType, setTxType] = useState<'IN' | 'OUT'>('IN');
  const [txCategory, setTxCategory] = useState<FundCategory>('OPERASIONAL');
  const [txAmount, setTxAmount] = useState<number>(0);
  const [txDescription, setTxDescription] = useState('');
  const [txDate, setTxDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [txReceiptUrl, setTxReceiptUrl] = useState('');
  const [showReceiptUploader, setShowReceiptUploader] = useState(false);

  // History Filter State
  const [filterCategory, setFilterCategory] = useState<'ALL' | FundCategory>(
    'ALL'
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Register Service Worker & Capture PWA Install Prompt
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw-bendahara.js')
        .catch(() => undefined);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const verifyPinWithServer = useCallback(async (targetPin: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'VERIFY_PIN',
          pin: targetPin,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setAuthError(data.error || 'PIN Bendahara tidak valid.');
        setPin('');
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('bendahara_pin');
        }
        return false;
      }

      setMosqueName(data.mosqueName || "Masjid Al Jami'ah");
      setInstitution(data.institution || 'IAIN Manado');
      setLogoUrl(data.logoUrl || '');
      setTreasurerName(data.treasurerName || 'Bendahara Takmir Masjid');
      setTransactions(data.transactions || []);
      setSavedPin(targetPin);
      setIsUnlocked(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('bendahara_pin', targetPin);
      }
      return true;
    } catch {
      setAuthError('Gagal terhubung ke server masjid. Periksa koneksi internet.');
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Restore session PIN on mount if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem('bendahara_pin');
      if (cached && cached.length >= 4) {
        verifyPinWithServer(cached);
      }
    }
  }, [verifyPinWithServer]);

  // Auto-submit when 6 digits entered on PIN pad
  useEffect(() => {
    if (!isUnlocked && pin.length === 6 && !authLoading) {
      verifyPinWithServer(pin);
    }
  }, [pin, isUnlocked, authLoading, verifyPinWithServer]);

  // Computed Balances
  const balances = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    const byCategory: Record<FundCategory, { in: number; out: number; net: number }> = {
      OPERASIONAL: { in: 0, out: 0, net: 0 },
      PEMBANGUNAN: { in: 0, out: 0, net: 0 },
      SOSIAL_ZISWAF: { in: 0, out: 0, net: 0 },
    };

    for (const t of transactions) {
      const cat = byCategory[t.category] ? t.category : 'OPERASIONAL';
      if (t.type === 'IN') {
        totalIn += t.amount;
        byCategory[cat].in += t.amount;
        byCategory[cat].net += t.amount;
      } else {
        totalOut += t.amount;
        byCategory[cat].out += t.amount;
        byCategory[cat].net -= t.amount;
      }
    }

    return {
      totalBalance: totalIn - totalOut,
      totalIn,
      totalOut,
      byCategory,
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterCategory !== 'ALL' && t.category !== filterCategory) {
        return false;
      }
      if (
        searchQuery.trim() &&
        !t.description.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [transactions, filterCategory, searchQuery]);

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!savedPin) return;

    if (txAmount <= 0) {
      setToastError('Mohon masukkan nominal lebih dari Rp 0.');
      return;
    }
    if (!txDescription.trim()) {
      setToastError('Mohon pilih atau ketik keterangan transaksi.');
      return;
    }

    setSubmitting(true);
    setToastError(null);
    setToastMessage(null);

    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_TRANSACTION',
          pin: savedPin,
          type: txType,
          category: txCategory,
          amount: txAmount,
          description: txDescription.trim(),
          date: txDate,
          recordedBy: treasurerName,
          receiptImageUrl: txReceiptUrl.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setToastError(data.error || 'Gagal menyimpan transaksi.');
        return;
      }

      setTransactions(data.transactions || []);
      setToastMessage(
        `${
          txType === 'IN' ? 'Kas Masuk' : 'Kas Keluar'
        } ${formatRupiah(txAmount)} berhasil dicatat!`
      );
      // Reset form for next entry
      setTxAmount(0);
      setTxDescription('');
      setTxReceiptUrl('');
      setShowReceiptUploader(false);
    } catch {
      setToastError('Koneksi terputus saat menyimpan transaksi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (tx: FinanceTransaction) => {
    if (!savedPin) return;
    const confirmed = window.confirm(
      `Hapus transaksi "${tx.description}" (${formatRupiah(tx.amount)})?`
    );
    if (!confirmed) return;

    setSubmitting(true);
    setToastError(null);
    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE_TRANSACTION',
          pin: savedPin,
          transactionId: tx.id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setTransactions(data.transactions || []);
        setToastMessage('Transaksi berhasil dihapus.');
      } else {
        setToastError(data.error || 'Gagal menghapus transaksi.');
      }
    } catch {
      setToastError('Gagal menghubungi server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShareWhatsAppReport = () => {
    const todayStr = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Makassar',
    });

    const latestFive = transactions.slice(0, 5);
    const latestLines = latestFive
      .map(
        (t, idx) =>
          `${idx + 1}. [${t.date}] ${t.type === 'IN' ? '(+)' : '(-)'} ${formatRupiah(
            t.amount
          )} - ${t.description}`
      )
      .join('\n');

    const reportText = `*LAPORAN POSISI KAS ${mosqueName.toUpperCase()} (${institution.toUpperCase()})*
📅 Tanggal: ${todayStr}

*SALDO KAS AKTIF: ${formatRupiah(balances.totalBalance)}*
• Kas Operasional: ${formatRupiah(balances.byCategory.OPERASIONAL.net)}
• Kas Pembangunan & Rehab: ${formatRupiah(balances.byCategory.PEMBANGUNAN.net)}
• Kas Sosial & ZISWAF: ${formatRupiah(balances.byCategory.SOSIAL_ZISWAF.net)}

*Ringkasan Akumulasi:*
• Total Pemasukan: ${formatRupiah(balances.totalIn)}
• Total Pengeluaran: ${formatRupiah(balances.totalOut)}

*5 Mutasi Terakhir:*
${latestLines || '- Belum ada transaksi'}

_Dicatat melalui Aplikasi Mobile Bendahara (${treasurerName})_`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(reportText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      setDeferredPrompt(null);
    } else {
      setShowInstallGuide(true);
    }
  };

  // =========================================================
  // VIEW 1: MOBILE PIN NUMPAD LOCK SCREEN
  // =========================================================
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#14110F] text-[#FAF7F2] flex flex-col justify-between max-w-md mx-auto px-6 py-8 select-none">
        {/* Top Identity */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A84A2E]/25 border border-[#A84A2E] text-[#E8CFA0] text-[11px] font-bold">
            <Smartphone className="w-3.5 h-3.5" />
            <span>APLIKASI MOBILE BENDAHARA</span>
          </div>
          <h1 className="font-serif-heading text-2xl font-bold text-white">
            Kas Masjid Al Jami&apos;ah
          </h1>
          <p className="text-xs text-[#E8CFA0]">
            Masukkan 6 Digit Kode PIN Khusus Bendahara
          </p>
        </div>

        {/* PIN Dots Indicator */}
        <div className="my-6 space-y-4">
          <div className="flex items-center justify-center gap-3.5">
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              const filled = idx < pin.length;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-150 ${
                    filled
                      ? 'bg-[#E8CFA0] scale-110 shadow-[0_0_12px_rgba(232,207,160,0.8)]'
                      : 'bg-white/15 border border-white/30'
                  }`}
                />
              );
            })}
          </div>

          {authLoading && (
            <p className="text-center text-xs text-[#E8CFA0] animate-pulse">
              Memverifikasi PIN Bendahara...
            </p>
          )}

          {authError && (
            <div className="p-3 rounded-xl bg-[#A84A2E]/30 border border-[#A84A2E] text-center text-xs text-white font-semibold">
              {authError}
            </div>
          )}
        </div>

        {/* Large Touch Numpad (0-9) */}
        <div className="grid grid-cols-3 gap-3.5 max-w-xs mx-auto w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={authLoading}
              onClick={() => {
                setAuthError(null);
                if (pin.length < 6) setPin((p) => p + digit);
              }}
              className="h-16 rounded-2xl bg-[#241F1C] hover:bg-[#332B27] active:scale-95 border border-white/10 text-2xl font-bold text-white flex items-center justify-center transition-all cursor-pointer"
            >
              {digit}
            </button>
          ))}

          <button
            type="button"
            onClick={() => {
              setAuthError(null);
              setPin('');
            }}
            className="h-16 rounded-2xl bg-[#241F1C]/60 hover:bg-[#332B27] active:scale-95 border border-white/10 text-xs font-bold text-[#E8CFA0] flex items-center justify-center transition-all cursor-pointer"
          >
            Reset
          </button>

          <button
            type="button"
            disabled={authLoading}
            onClick={() => {
              setAuthError(null);
              if (pin.length < 6) setPin((p) => p + '0');
            }}
            className="h-16 rounded-2xl bg-[#241F1C] hover:bg-[#332B27] active:scale-95 border border-white/10 text-2xl font-bold text-white flex items-center justify-center transition-all cursor-pointer"
          >
            0
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthError(null);
              setPin((p) => p.slice(0, -1));
            }}
            aria-label="Hapus 1 angka"
            className="h-16 rounded-2xl bg-[#241F1C]/60 hover:bg-[#332B27] active:scale-95 border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <Delete className="w-6 h-6 text-[#E8CFA0]" />
          </button>
        </div>

        {/* Footer Info */}
        <div className="pt-6 text-center space-y-2">
          <p className="text-[11px] text-white/55">
            PIN Default Awal: <strong className="text-[#E8CFA0]">123456</strong> (Dapat diubah di CMS Admin &rarr; Keuangan)
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#E8CFA0] hover:underline"
          >
            <span>Kembali ke Beranda Masjid</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================
  // VIEW 2: UNLOCKED MOBILE TREASURER WORKSPACE
  // =========================================================
  const quickTemplates =
    txType === 'IN'
      ? QUICK_DESCRIPTIONS_IN[txCategory]
      : QUICK_DESCRIPTIONS_OUT[txCategory];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E1B18] max-w-md mx-auto flex flex-col shadow-2xl relative pb-24">
      {/* 1. Top Mobile App Header & Real-Time Balance Card */}
      <header className="bg-[#1E1B18] text-[#FAF7F2] px-4 pt-4 pb-5 rounded-b-3xl shadow-md space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={mosqueName}
                className="w-9 h-9 object-contain rounded-lg bg-white/10 p-1 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-[#A84A2E] text-white flex items-center justify-center font-serif-heading font-bold text-sm shrink-0">
                AJ
              </div>
            )}
            <div className="min-w-0">
              <p className="font-serif-heading text-sm font-bold text-white truncate">
                {mosqueName}
              </p>
              <p className="text-[11px] text-[#E8CFA0] truncate">
                {treasurerName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleTriggerInstall}
              title="Pasang Aplikasi di HP"
              className="p-2 rounded-lg bg-[#2C2520] text-[#E8CFA0] hover:bg-white/15 border border-[#E8CFA0]/30 cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => savedPin && verifyPinWithServer(savedPin)}
              title="Muat Ulang Data Server"
              className="p-2 rounded-lg bg-[#2C2520] text-white hover:bg-white/15 border border-white/15 cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 ${authLoading ? 'animate-spin' : ''}`}
              />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsUnlocked(false);
                setPin('');
                setSavedPin(null);
                if (typeof window !== 'undefined') {
                  sessionStorage.removeItem('bendahara_pin');
                }
              }}
              title="Kunci Aplikasi"
              className="p-2 rounded-lg bg-[#A84A2E] text-white hover:bg-[#8E3B22] cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Total Balance Display */}
        <div className="bg-gradient-to-br from-[#2C2520] to-[#1A1614] border border-[#E8CFA0]/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#E8CFA0]">
              Total Saldo Kas Masjid
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <ShieldCheck className="w-3 h-3" />
              Sinkron Server
            </span>
          </div>

          <div className="font-serif-heading text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {formatRupiah(balances.totalBalance)}
          </div>

          {/* 3 Fund Category Mini Pills */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-[11px]">
            <div className="bg-black/25 rounded-lg p-2">
              <span className="text-white/65 block text-[10px] truncate">
                Operasional
              </span>
              <strong className="text-[#E8CFA0] font-bold block truncate">
                {formatRupiah(balances.byCategory.OPERASIONAL.net)}
              </strong>
            </div>
            <div className="bg-black/25 rounded-lg p-2">
              <span className="text-white/65 block text-[10px] truncate">
                Pembangunan
              </span>
              <strong className="text-[#E8CFA0] font-bold block truncate">
                {formatRupiah(balances.byCategory.PEMBANGUNAN.net)}
              </strong>
            </div>
            <div className="bg-black/25 rounded-lg p-2">
              <span className="text-white/65 block text-[10px] truncate">
                ZISWAF
              </span>
              <strong className="text-[#E8CFA0] font-bold block truncate">
                {formatRupiah(balances.byCategory.SOSIAL_ZISWAF.net)}
              </strong>
            </div>
          </div>
        </div>
      </header>

      {/* Feedback Banner */}
      {(toastMessage || toastError) && (
        <div className="px-4 pt-3">
          {toastMessage && (
            <div className="p-3.5 rounded-xl bg-[#3D4D33] text-white text-xs font-semibold flex items-center justify-between gap-2 shadow">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{toastMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="underline text-[11px] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          )}
          {toastError && (
            <div className="p-3.5 rounded-xl bg-[#A84A2E] text-white text-xs font-semibold flex items-center justify-between gap-2 shadow">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{toastError}</span>
              </div>
              <button
                type="button"
                onClick={() => setToastError(null)}
                className="underline text-[11px] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 1: CATAT CEPAT (KAS MASUK / KAS KELUAR)
         ========================================================= */}
      {activeTab === 'INPUT' && (
        <form onSubmit={handleSaveTransaction} className="p-4 space-y-4 flex-1">
          {/* 1. Giant Toggle: Kas Masuk vs Kas Keluar */}
          <div className="grid grid-cols-2 gap-2.5 bg-[#F2ECE1] p-1.5 rounded-2xl border border-[#DFD5C5]">
            <button
              type="button"
              onClick={() => setTxType('IN')}
              className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                txType === 'IN'
                  ? 'bg-[#3D4D33] text-white shadow-sm'
                  : 'text-[#524740] hover:text-[#1E1B18]'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4 shrink-0" />
              <span>+ KAS MASUK</span>
            </button>

            <button
              type="button"
              onClick={() => setTxType('OUT')}
              className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                txType === 'OUT'
                  ? 'bg-[#A84A2E] text-white shadow-sm'
                  : 'text-[#524740] hover:text-[#1E1B18]'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 shrink-0" />
              <span>- KAS KELUAR</span>
            </button>
          </div>

          {/* 2. Select Fund Category (Pos Dana) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#1E1B18]">
              1. Pilih Pos Kas Masjid
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['OPERASIONAL', 'PEMBANGUNAN', 'SOSIAL_ZISWAF'] as FundCategory[]).map(
                (cat) => {
                  const selected = txCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setTxCategory(cat)}
                      className={`py-2.5 px-2 rounded-xl text-[11px] font-bold border text-center transition-all cursor-pointer ${
                        selected
                          ? 'bg-[#1E1B18] text-[#E8CFA0] border-[#1E1B18]'
                          : 'bg-[#F2ECE1] text-[#1E1B18] border-[#DFD5C5]'
                      }`}
                    >
                      {cat === 'OPERASIONAL'
                        ? 'Operasional'
                        : cat === 'PEMBANGUNAN'
                        ? 'Pembangunan'
                        : 'ZISWAF & Sosial'}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* 3. Nominal Amount Input & Instant Nominal Buttons */}
          <div className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="mobile-tx-amount"
                className="text-xs font-bold text-[#1E1B18]"
              >
                2. Nominal Rupiah ({txType === 'IN' ? 'Pemasukan' : 'Pengeluaran'})
              </label>
              {txAmount > 0 && (
                <button
                  type="button"
                  onClick={() => setTxAmount(0)}
                  className="text-[11px] font-bold text-[#A84A2E] underline cursor-pointer"
                >
                  Reset Rp 0
                </button>
              )}
            </div>

            <div className="relative">
              <input
                id="mobile-tx-amount"
                type="number"
                inputMode="numeric"
                min={0}
                step={1000}
                value={txAmount || ''}
                onChange={(e) => setTxAmount(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl bg-white border-2 border-[#1E1B18] font-serif-heading text-2xl font-bold text-[#1E1B18]"
              />
              <div className="mt-1 text-xs font-bold text-[#524740]">
                Terbaca: <span className="text-[#1E1B18]">{formatRupiah(txAmount)}</span>
              </div>
            </div>

            {/* Instant Add Chips */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTxAmount((prev) => prev + amt)}
                  className="py-2 px-2 rounded-lg bg-white hover:bg-[#1E1B18] hover:text-white border border-[#DFD5C5] text-xs font-bold text-[#1E1B18] transition-colors cursor-pointer"
                >
                  +{amt >= 1000000 ? `${amt / 1000000} Jt` : `${amt / 1000} Rb`}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Description Input + 1-Tap Templates */}
          <div className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-2xl p-4 space-y-2.5">
            <label
              htmlFor="mobile-tx-desc"
              className="block text-xs font-bold text-[#1E1B18]"
            >
              3. Keterangan Transaksi
            </label>

            <input
              id="mobile-tx-desc"
              type="text"
              value={txDescription}
              onChange={(e) => setTxDescription(e.target.value)}
              placeholder="Ketik atau pilih template di bawah..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#524740] text-sm font-medium text-[#1E1B18]"
            />

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#524740] block">
                Pilih Cepat Keterangan:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickTemplates.map((tpl) => (
                  <button
                    key={tpl}
                    type="button"
                    onClick={() => setTxDescription(tpl)}
                    className={`text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      txDescription === tpl
                        ? 'bg-[#1E1B18] text-[#E8CFA0] border-[#1E1B18]'
                        : 'bg-white text-[#1E1B18] border-[#DFD5C5]'
                    }`}
                  >
                    {tpl}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Optional Receipt Camera Toggle */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#DFD5C5]">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="mobile-tx-date"
                  className="text-xs font-semibold text-[#524740]"
                >
                  Tanggal:
                </label>
                <input
                  id="mobile-tx-date"
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-[#524740] text-xs font-semibold"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowReceiptUploader((v) => !v)}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#524740] text-xs font-bold text-[#1E1B18] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-[#A84A2E]" />
                <span>{txReceiptUrl ? 'Nota Terlampir' : 'Foto Nota'}</span>
              </button>
            </div>

            {showReceiptUploader && (
              <div className="pt-2">
                <ImageUploaderField
                  label="Foto Kwitansi / Bukti Transfer (Opsional)"
                  value={txReceiptUrl}
                  onChange={setTxReceiptUrl}
                  placeholder="Unggah foto nota atau bukti transfer..."
                />
              </div>
            )}
          </div>

          {/* 5. Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-4 rounded-2xl font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              txType === 'IN'
                ? 'bg-[#3D4D33] hover:bg-[#2F3C27]'
                : 'bg-[#A84A2E] hover:bg-[#8E3B22]'
            } disabled:opacity-60`}
          >
            <PlusCircle className="w-5 h-5" />
            <span>
              {submitting
                ? 'Menyimpan ke Server Masjid...'
                : `Simpan ${
                    txType === 'IN' ? 'Kas Masuk' : 'Kas Keluar'
                  } (${formatRupiah(txAmount)})`}
            </span>
          </button>
        </form>
      )}

      {/* =========================================================
          TAB 2: RIWAYAT TRANSAKSI & KOREKSI CEPAT
         ========================================================= */}
      {activeTab === 'HISTORY' && (
        <div className="p-4 space-y-4 flex-1">
          <div className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-2xl p-3.5 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#524740] absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari keterangan transaksi..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#DFD5C5] text-xs font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {(['ALL', 'OPERASIONAL', 'PEMBANGUNAN', 'SOSIAL_ZISWAF'] as const).map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer ${
                      filterCategory === cat
                        ? 'bg-[#1E1B18] text-[#E8CFA0]'
                        : 'bg-white text-[#524740] border border-[#DFD5C5]'
                    }`}
                  >
                    {cat === 'ALL'
                      ? `Semua (${transactions.length})`
                      : CATEGORY_LABELS[cat]}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-10 text-xs text-[#524740]">
                Tidak ada transaksi yang sesuai filter.
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-white border border-[#DFD5C5] rounded-2xl p-3.5 flex items-start justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.type === 'IN'
                            ? 'bg-[#3D4D33]/15 text-[#3D4D33]'
                            : 'bg-[#A84A2E]/15 text-[#A84A2E]'
                        }`}
                      >
                        {tx.type === 'IN' ? '+ MASUK' : '- KELUAR'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F2ECE1] text-[#524740]">
                        {CATEGORY_LABELS[tx.category]}
                      </span>
                      <span className="text-[10px] text-[#524740]">
                        {tx.date}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-[#1E1B18] break-words">
                      {tx.description}
                    </p>

                    <p
                      className={`font-serif-heading text-base font-bold ${
                        tx.type === 'IN' ? 'text-[#3D4D33]' : 'text-[#A84A2E]'
                      }`}
                    >
                      {tx.type === 'IN' ? '+' : '-'}
                      {formatRupiah(tx.amount)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {tx.receiptImageUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewReceiptUrl(tx.receiptImageUrl || null)
                        }
                        title="Lihat Foto Nota"
                        className="p-2 rounded-lg bg-[#F2ECE1] text-[#1E1B18] hover:bg-[#DFD5C5] cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteTransaction(tx)}
                      title="Hapus Transaksi"
                      className="p-2 rounded-lg bg-[#A84A2E]/10 text-[#A84A2E] hover:bg-[#A84A2E] hover:text-white transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: REKAP LAPORAN & BAGIKAN KE WHATSAPP
         ========================================================= */}
      {activeTab === 'REPORT' && (
        <div className="p-4 space-y-4 flex-1">
          <div className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-2xl p-4 space-y-4">
            <h2 className="font-serif-heading text-lg font-bold text-[#1E1B18]">
              Rekapitulasi Buku Kas Masjid
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-[#DFD5C5] rounded-xl p-3">
                <span className="text-[11px] text-[#524740] block">
                  Total Pemasukan
                </span>
                <strong className="font-serif-heading text-base font-bold text-[#3D4D33]">
                  {formatRupiah(balances.totalIn)}
                </strong>
              </div>
              <div className="bg-white border border-[#DFD5C5] rounded-xl p-3">
                <span className="text-[11px] text-[#524740] block">
                  Total Pengeluaran
                </span>
                <strong className="font-serif-heading text-base font-bold text-[#A84A2E]">
                  {formatRupiah(balances.totalOut)}
                </strong>
              </div>
            </div>

            <div className="space-y-2.5">
              {(
                ['OPERASIONAL', 'PEMBANGUNAN', 'SOSIAL_ZISWAF'] as FundCategory[]
              ).map((cat) => {
                const info = balances.byCategory[cat];
                return (
                  <div
                    key={cat}
                    className="bg-white border border-[#DFD5C5] rounded-xl p-3.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1E1B18]">
                        {CATEGORY_LABELS[cat]}
                      </span>
                      <span className="font-serif-heading text-sm font-bold text-[#1E1B18]">
                        {formatRupiah(info.net)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#524740]">
                      <span>Masuk: {formatRupiah(info.in)}</span>
                      <span>Keluar: {formatRupiah(info.out)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleShareWhatsAppReport}
              className="w-full py-3.5 px-4 rounded-xl bg-[#3D4D33] hover:bg-[#2F3C27] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Bagikan Laporan Kas ke WhatsApp Pimpinan / Takmir</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: RECEIPT PHOTO PREVIEW
         ========================================================= */}
      {previewReceiptUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewReceiptUrl(null)}
        >
          <div
            className="bg-[#FAF7F2] rounded-2xl max-w-sm w-full p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1E1B18]">
                Bukti Nota / Kwitansi Transaksi
              </h3>
              <button
                type="button"
                onClick={() => setPreviewReceiptUrl(null)}
                className="p-1 rounded-lg bg-[#F2ECE1] text-[#1E1B18]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={previewReceiptUrl}
              alt="Bukti Nota Transaksi"
              className="w-full max-h-96 object-contain rounded-xl border border-[#DFD5C5] bg-black"
            />
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: PANDUAN INSTALASI APK / WEBAPP DI ANDROID
         ========================================================= */}
      {showInstallGuide && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          onClick={() => setShowInstallGuide(false)}
        >
          <div
            className="bg-[#FAF7F2] rounded-2xl max-w-sm w-full p-5 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif-heading text-base font-bold text-[#1E1B18]">
                Pasang Aplikasi Bendahara di HP Android
              </h3>
              <button
                type="button"
                onClick={() => setShowInstallGuide(false)}
                className="p-1 rounded-lg bg-[#F2ECE1]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ol className="text-xs text-[#524740] space-y-2 list-decimal pl-4">
              <li>
                <strong>Melalui File .APK Android:</strong> Unduh dan pasang file{' '}
                <code>bendahara-masjid-al-jamiah.apk</code> dari hasil build GitHub Actions repositori masjid.
              </li>
              <li>
                <strong>Langsung dari Chrome Android (WebAPK):</strong> Ketuk ikon titik tiga (<strong>&#8942;</strong>) di pojok kanan atas browser Chrome, lalu pilih{' '}
                <strong>&ldquo;Tambahkan ke Layar Utama / Install Aplikasi&rdquo;</strong>.
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* =========================================================
          FIXED BOTTOM NAVIGATION BAR (MOBILE APP SHELL)
         ========================================================= */}
      <nav
        aria-label="Navigasi Bawah Aplikasi Bendahara"
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#1E1B18] text-[#FAF7F2] border-t-2 border-[#A84A2E] px-4 py-2 grid grid-cols-3 gap-2 z-40"
      >
        <button
          type="button"
          onClick={() => setActiveTab('INPUT')}
          className={`py-2 rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors cursor-pointer ${
            activeTab === 'INPUT'
              ? 'bg-[#A84A2E] text-white'
              : 'text-[#E8CFA0]/75 hover:text-white'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Catat Cepat</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HISTORY')}
          className={`py-2 rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors cursor-pointer ${
            activeTab === 'HISTORY'
              ? 'bg-[#A84A2E] text-white'
              : 'text-[#E8CFA0]/75 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Riwayat ({transactions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('REPORT')}
          className={`py-2 rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors cursor-pointer ${
            activeTab === 'REPORT'
              ? 'bg-[#A84A2E] text-white'
              : 'text-[#E8CFA0]/75 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Rekap &amp; WA</span>
        </button>
      </nav>
    </div>
  );
}

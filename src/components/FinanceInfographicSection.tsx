'use client';

import React, { useEffect, useState } from 'react';
import {
  DonationInfo,
  FinanceTransaction,
  FundCategory,
} from '@/types/mosque';
import { formatRupiah } from '@/lib/prayer-times';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Check,
  QrCode,
  Wallet,
  X,
  Info,
} from 'lucide-react';

interface FinanceInfographicSectionProps {
  transactions: FinanceTransaction[];
  donationInfo: DonationInfo;
}

const FUND_META: Record<
  FundCategory,
  { title: string; shortLabel: string; subtitle: string }
> = {
  OPERASIONAL: {
    title: 'Kas Operasional & Kemakmuran',
    shortLabel: 'Kas Operasional',
    subtitle: 'Kebersihan ruang sujud, air wudhu, listrik, dan kajian rutin harian',
  },
  PEMBANGUNAN: {
    title: 'Kas Pembangunan & Inventaris',
    shortLabel: 'Kas Pembangunan',
    subtitle: 'Peremajaan tata suara, karpet shaf, AC, dan renovasi fisik masjid',
  },
  SOSIAL_ZISWAF: {
    title: 'Kas Sosial, ZISWAF & Santunan',
    shortLabel: 'Kas Sosial & ZISWAF',
    subtitle: 'Bantuan pendidikan mahasiswa dhuafa, zakat, dan santunan umat',
  },
};

export default function FinanceInfographicSection({
  transactions,
  donationInfo,
}: FinanceInfographicSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | FundCategory>('ALL');
  const [qrisModalOpen, setQrisModalOpen] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setQrisModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Compute totals from real transactions array
  const totalIn = transactions
    .filter((t) => t.type === 'IN')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalOut = transactions
    .filter((t) => t.type === 'OUT')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalBalance = totalIn - totalOut;

  const categories: FundCategory[] = ['OPERASIONAL', 'PEMBANGUNAN', 'SOSIAL_ZISWAF'];
  const categoryBreakdown = categories.map((cat) => {
    const catIn = transactions
      .filter((t) => t.category === cat && t.type === 'IN')
      .reduce((acc, t) => acc + t.amount, 0);
    const catOut = transactions
      .filter((t) => t.category === cat && t.type === 'OUT')
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      category: cat,
      title: FUND_META[cat].title,
      shortLabel: FUND_META[cat].shortLabel,
      subtitle: FUND_META[cat].subtitle,
      inAmount: catIn,
      outAmount: catOut,
      balance: catIn - catOut,
    };
  });

  const maxCategoryValue = Math.max(
    1,
    ...categoryBreakdown.map((c) => Math.max(c.inAmount, c.outAmount))
  );

  const filteredTransactions = [...transactions]
    .filter((t) => (selectedCategory === 'ALL' ? true : t.category === selectedCategory))
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleCopyAccount = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(donationInfo.accountNumber);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2500);
    }
  };

  return (
    <section
      id="keuangan"
      aria-labelledby="heading-keuangan"
      className="py-14 sm:py-20 bg-[#FAF7F2]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header + Primary Action */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <h2
              id="heading-keuangan"
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
              className="font-serif-heading font-bold text-[#1E1B18] leading-tight mb-3"
            >
              Infografis &amp; Transparansi Keuangan Masjid
            </h2>
            <p className="text-sm sm:text-base text-[#524740]">
              Laporan terbuka posisi saldo, penerimaan infaq jamaah, serta realisasi pengeluaran pada tiga pos kas Masjid Al Jami&apos;ah IAIN Manado.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setQrisModalOpen(true)}
              className="px-5 py-3 min-h-[44px] inline-flex items-center gap-2.5 rounded-md bg-[#A84A2E] text-white font-semibold text-sm hover:bg-[#8E3B22] transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4" aria-hidden="true" />
              <span>Salurkan Infaq / Lihat QRIS</span>
            </button>
          </div>
        </div>

        {/* Honest Sample Data Notice when initial seed records are active (R-17, R-38) */}
        {donationInfo.isSampleDataNotice && (
          <div className="mb-8 p-4 rounded-lg bg-[#F2ECE1] border border-[#1E1B18]/25 flex items-start gap-3 text-xs sm:text-sm text-[#1E1B18]">
            <Info className="w-5 h-5 text-[#A84A2E] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <strong className="font-bold">Catatan Data Simulasi Awal:</strong> Angka mutasi di bawah ini merupakan data contoh awal struktur 3 kas masjid yang dikelola oleh Bendahara Takmir Masjid Al Jami&apos;ah IAIN Manado.
            </div>
          </div>
        )}

        {/* 2-Column Desktop Layout with 3 : 1 Ratio (lg:col-span-9 vs lg:col-span-3) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT COLUMN (3 Parts / 75% Width): Total Balance + Embedded Transaction Ledger + Summary Totals */}
          <div className="lg:col-span-9 bg-[#1E1B18] text-[#FAF7F2] rounded-xl p-5 sm:p-8 flex flex-col justify-between border border-[#1E1B18] dark-surface">
            {/* Top: Consolidated Balance Header */}
            <div className="pb-5 border-b border-white/15">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#E8CFA0] mb-1.5">
                <Wallet className="w-4 h-4" aria-hidden="true" />
                <span>Total Saldo Gabungan Seluruh Kas</span>
              </div>
              <div
                style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)' }}
                className="font-serif-heading font-bold text-[#FAF7F2] tracking-tight"
              >
                {formatRupiah(totalBalance)}
              </div>
            </div>

            {/* Middle: Embedded Rincian Riwayat Mutasi Kas Masjid */}
            <div className="my-5 flex-1 flex flex-col">
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-serif-heading text-base sm:text-lg font-bold text-[#FAF7F2]">
                    Rincian Riwayat Mutasi Kas Masjid
                  </h3>
                  <p className="text-xs text-[#E8CFA0]">
                    Pilih kategori pos kas untuk memfilter riwayat transaksi pemasukan dan pengeluaran.
                  </p>
                </div>

                <div
                  className="flex flex-wrap gap-1.5"
                  role="tablist"
                  aria-label="Filter kategori mutasi kas"
                >
                  {(
                    [
                      { id: 'ALL', label: 'Semua Kas' },
                      { id: 'OPERASIONAL', label: 'Kas Operasional' },
                      { id: 'PEMBANGUNAN', label: 'Kas Pembangunan' },
                      { id: 'SOSIAL_ZISWAF', label: 'Kas Sosial & ZISWAF' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={selectedCategory === tab.id}
                      onClick={() => setSelectedCategory(tab.id)}
                      className={`px-3 py-1.5 min-h-[38px] rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                        selectedCategory === tab.id
                          ? 'bg-[#A84A2E] text-white border-[#A84A2E]'
                          : 'bg-[#2C2520] text-[#E8CFA0] border-white/20 hover:border-[#E8CFA0]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="bg-[#2C2520] border border-white/10 rounded-lg p-6 text-center my-auto">
                  <p className="text-sm font-semibold text-[#FAF7F2] mb-1">
                    Belum Ada Transaksi Tercatat pada Kategori Ini
                  </p>
                  <p className="text-xs text-[#E8CFA0]">
                    Silakan pilih kategori kas lainnya untuk melihat riwayat mutasi.
                  </p>
                </div>
              ) : (
                <div className="bg-[#2C2520] border border-white/15 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto max-h-[340px] overflow-y-auto">
                    <table className="w-full text-left border-collapse table-fixed min-w-[540px]">
                      <thead>
                        <tr className="border-b border-white/15 bg-[#1E1B18]/60 text-xs font-bold text-[#E8CFA0]">
                          <th className="py-3 px-4 w-[115px] sm:w-[125px]">Tanggal</th>
                          <th className="py-3 px-4">Uraian Transaksi</th>
                          <th className="py-3 px-4 w-[170px] sm:w-[195px] text-right">
                            Jenis &amp; Nominal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10 text-xs sm:text-sm">
                        {filteredTransactions.map((trx) => (
                          <tr
                            key={trx.id}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="py-3 px-4 font-mono text-[#E8CFA0] whitespace-nowrap align-middle">
                              {trx.date}
                            </td>
                            <td className="py-3 px-4 align-middle overflow-hidden">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#1E1B18] text-[#E8CFA0] border border-[#E8CFA0]/35 whitespace-nowrap shrink-0">
                                  {FUND_META[trx.category]?.shortLabel || trx.category}
                                </span>
                                <span
                                  title={trx.description}
                                  className="font-medium text-[#FAF7F2] truncate block"
                                >
                                  {trx.description}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap font-bold align-middle">
                              {trx.type === 'IN' ? (
                                <span className="text-[#8CD975]">
                                  + {formatRupiah(trx.amount)} (Masuk)
                                </span>
                              ) : (
                                <span className="text-[#F29C85]">
                                  - {formatRupiah(trx.amount)} (Keluar)
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom: Total Income & Total Expense Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5 border-t border-white/15">
              <div className="bg-[#2C2520] p-3.5 rounded-lg border border-white/10">
                <div className="flex items-center gap-1.5 text-xs text-[#E8CFA0] mb-1">
                  <ArrowDownLeft className="w-4 h-4 text-[#8CD975]" aria-hidden="true" />
                  <span>Total Pemasukan Tercatat</span>
                </div>
                <span className="font-bold text-base sm:text-lg text-[#FAF7F2]">
                  {formatRupiah(totalIn)}
                </span>
              </div>

              <div className="bg-[#2C2520] p-3.5 rounded-lg border border-white/10">
                <div className="flex items-center gap-1.5 text-xs text-[#E8CFA0] mb-1">
                  <ArrowUpRight className="w-4 h-4 text-[#F29C85]" aria-hidden="true" />
                  <span>Total Pengeluaran Tercatat</span>
                </div>
                <span className="font-bold text-base sm:text-lg text-[#FAF7F2]">
                  {formatRupiah(totalOut)}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (1 Part / 25% Width): Comparative Chart per Fund Category */}
          <div className="lg:col-span-3 bg-[#F2ECE1] border border-[#DFD5C5] rounded-xl p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-serif-heading text-base sm:text-lg font-bold text-[#1E1B18] leading-snug mb-1.5">
                Perbandingan Pemasukan &amp; Pengeluaran Tiap Pos Kas
              </h3>
              <p className="text-xs text-[#524740] mb-4">
                Proporsi dana masuk, dana keluar, dan sisa saldo aktif per pos kas.
              </p>
            </div>

            <div className="flex flex-col gap-3.5 my-auto">
              {categoryBreakdown.map((item) => {
                const inPct = Math.round((item.inAmount / maxCategoryValue) * 100);
                const outPct = Math.round((item.outAmount / maxCategoryValue) * 100);

                return (
                  <div
                    key={item.category}
                    className="bg-[#FAF7F2] p-3.5 rounded-lg border border-[#DFD5C5]"
                  >
                    <div className="mb-2">
                      <h4 className="font-bold text-xs sm:text-sm text-[#1E1B18] leading-snug">
                        {item.title}
                      </h4>
                      <div className="flex items-baseline justify-between gap-2 mt-1">
                        <span className="text-[11px] font-medium text-[#524740]">
                          Saldo Aktif
                        </span>
                        <span className="font-serif-heading font-bold text-sm sm:text-base text-[#1E1B18]">
                          {formatRupiah(item.balance)}
                        </span>
                      </div>
                    </div>

                    {/* Visual Bars with High-Contrast Borders and Labels */}
                    <div className="space-y-2 pt-2 border-t border-[#DFD5C5]/70">
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#3D4D33] mb-1">
                          <span>Masuk (+)</span>
                          <span>{formatRupiah(item.inAmount)}</span>
                        </div>
                        <div className="w-full h-2.5 bg-[#F2ECE1] rounded-sm overflow-hidden border border-[#1E1B18]/20">
                          <div
                            style={{ width: `${Math.max(4, inPct)}%` }}
                            className="h-full bg-[#3D4D33]"
                            role="progressbar"
                            aria-label={`Pemasukan ${item.title}`}
                            aria-valuenow={inPct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#A84A2E] mb-1">
                          <span>Keluar (-)</span>
                          <span>{formatRupiah(item.outAmount)}</span>
                        </div>
                        <div className="w-full h-2.5 bg-[#F2ECE1] rounded-sm overflow-hidden border border-[#1E1B18]/20">
                          <div
                            style={{ width: `${item.outAmount > 0 ? Math.max(4, outPct) : 0}%` }}
                            className="h-full bg-[#A84A2E]"
                            role="progressbar"
                            aria-label={`Pengeluaran ${item.title}`}
                            aria-valuenow={outPct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Donasi & QRIS */}
      {qrisModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-qris-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E1B18]/80"
          onClick={() => setQrisModalOpen(false)}
        >
          <div
            className="bg-[#FAF7F2] text-[#1E1B18] border-2 border-[#1E1B18] rounded-xl max-w-lg w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3
                  id="modal-qris-title"
                  className="font-serif-heading text-xl font-bold text-[#1E1B18]"
                >
                  Salurkan Infaq &amp; Wakaf Masjid Al Jami&apos;ah
                </h3>
                <p className="text-xs sm:text-sm text-[#524740]">
                  Dukung operasional ibadah, kajian mahasiswa, dan pemeliharaan masjid kampus.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQrisModalOpen(false)}
                aria-label="Tutup dialog infaq"
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-md border border-[#DFD5C5] text-[#1E1B18] hover:bg-[#F2ECE1] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#F2ECE1] border border-[#DFD5C5] rounded-lg p-4 mb-5">
              <span className="text-xs font-semibold text-[#524740] block mb-1">
                Bank Tujuan Transfer
              </span>
              <p className="font-bold text-base text-[#1E1B18] mb-2">
                {donationInfo.bankName}
              </p>

              <span className="text-xs font-semibold text-[#524740] block mb-1">
                Nomor Rekening
              </span>
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#FAF7F2] p-3 rounded border border-[#DFD5C5] mb-2">
                <span className="font-mono font-bold text-sm sm:text-base text-[#1E1B18]">
                  {donationInfo.accountNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="px-3 py-1.5 min-h-[38px] inline-flex items-center gap-1.5 rounded bg-[#1E1B18] text-[#FAF7F2] text-xs font-semibold cursor-pointer"
                >
                  {copiedAccount ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>

              <span className="text-xs text-[#524740]">
                Atas Nama: <strong className="text-[#1E1B18]">{donationInfo.accountHolder}</strong>
              </span>
            </div>

            {/* QRIS Image or Honest Placeholder */}
            <div className="border border-[#DFD5C5] rounded-lg p-5 text-center bg-white mb-5">
              <span className="text-xs font-bold text-[#1E1B18] block mb-3">
                Kode QRIS Masjid Al Jami&apos;ah IAIN Manado
              </span>
              {donationInfo.qrisImageUrl ? (
                <img
                  src={donationInfo.qrisImageUrl}
                  alt="Kode QRIS Infaq Masjid Al Jami'ah IAIN Manado"
                  className="max-h-64 mx-auto rounded border border-[#DFD5C5]"
                />
              ) : (
                <div className="py-8 px-4 bg-[#FAF7F2] rounded border border-dashed border-[#524740]">
                  <QrCode className="w-12 h-12 text-[#A84A2E] mx-auto mb-2" aria-hidden="true" />
                  <p className="text-xs sm:text-sm font-semibold text-[#1E1B18] mb-1">
                    [GAMBAR QRIS BELUM DIUNGGAH]
                  </p>
                  <p className="text-xs text-[#524740]">
                    Bendahara Takmir dapat mengunggah gambar barcode QRIS resmi melalui Panel Admin pada tab Keuangan Masjid.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <a
                href={`https://wa.me/${donationInfo.confirmationWhatsapp}?text=${encodeURIComponent(
                  "Assalamu'alaikum Pengurus Takmir Masjid Al Jami'ah IAIN Manado, saya ingin mengonfirmasi penyaluran infaq masjid."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 min-h-[44px] inline-flex items-center justify-center rounded-md bg-[#3D4D33] text-white text-xs sm:text-sm font-semibold hover:opacity-95"
              >
                Konfirmasi Infaq via WhatsApp
              </a>
              <button
                type="button"
                onClick={() => setQrisModalOpen(false)}
                className="px-4 py-2.5 min-h-[44px] inline-flex items-center justify-center rounded-md border border-[#1E1B18] text-[#1E1B18] text-xs sm:text-sm font-semibold hover:bg-[#F2ECE1] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

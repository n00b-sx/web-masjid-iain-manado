'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Send,
  Phone,
  ShieldCheck,
} from 'lucide-react';

interface MualafInteractiveClientProps {
  hotlineName: string;
  hotlineWhatsapp: string;
}

export default function MualafInteractiveClient({
  hotlineName,
  hotlineWhatsapp,
}: MualafInteractiveClientProps) {
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'LAKI_LAKI' | 'PEREMPUAN'>('LAKI_LAKI');
  const [whatsapp, setWhatsapp] = useState('');
  const [requestType, setRequestType] = useState<
    | 'IKRAR_SYAHADAT'
    | 'KONSULTASI_ISLAM'
    | 'PEMBINAAN_MUALAF'
    | 'SERTIFIKAT_MUALAF'
  >('KONSULTASI_ISLAM');
  const [preferredDate, setPreferredDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastSubmittedName, setLastSubmittedName] = useState<string>('');

  const requestTypeLabel: Record<typeof requestType, string> = {
    IKRAR_SYAHADAT: 'Pendaftaran Prosesi Ikrar Syahadat',
    KONSULTASI_ISLAM: 'Konsultasi & Pengenalan Dasar Islam (Privat)',
    PEMBINAAN_MUALAF: 'Pendaftaran Kelas Bimbingan Sholat & Al-Qur’an Mualaf',
    SERTIFIKAT_MUALAF: 'Pengurusan Surat Keterangan / Piagam Mualaf',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/mosque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SUBMIT_MUALAF',
          fullName,
          gender,
          whatsapp,
          requestType,
          preferredDate,
          notes,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal mengirim pendaftaran.');
      }

      setLastSubmittedName(fullName);
      setSuccessMsg(
        json.message ||
          'Data Anda telah diterima dengan aman oleh Sekretariat Mualaf Center.'
      );
      setFullName('');
      setWhatsapp('');
      setNotes('');
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat mengirim formulir.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const cleanWa = hotlineWhatsapp.replace(/[^0-9]/g, '');
  const waQuickLink = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
    `Assalamu'alaikum ${hotlineName}, saya ${
      lastSubmittedName || fullName || 'Calon Mualaf / Jamaah'
    } ingin berkonsultasi mengenai layanan Mualaf Center Masjid Al Jami'ah IAIN Manado.`
  )}`;

  return (
    <div className="bg-[#F2ECE1] border-2 border-[#1E1B18] rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#3D4D33] text-white text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
          <span>PRIVASI TERJAGA &amp; TANPA BIAYA</span>
        </div>

        <h3 className="font-serif-heading text-2xl font-bold text-[#1E1B18]">
          Formulir Konsultasi &amp; Pendaftaran Layanan Mualaf Center
        </h3>

        <p className="text-xs sm:text-sm text-[#524740]">
          Silakan isi formulir di bawah ini untuk menjadwalkan konsultasi privat, pendaftaran ikrar syahadat, maupun kelas bimbingan ibadah. Data Anda hanya diakses oleh tim pembina resmi Mualaf Center.
        </p>
      </div>

      {successMsg && (
        <div
          role="status"
          className="p-4 rounded-xl bg-[#3D4D33] text-white text-xs sm:text-sm space-y-3"
        >
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#E8CFA0]" />
            <div>
              <strong className="block font-bold mb-0.5">
                Permohonan Berhasil Terkirim
              </strong>
              <p>{successMsg}</p>
            </div>
          </div>

          <a
            href={waQuickLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-md bg-[#FAF7F2] text-[#1E1B18] font-bold text-xs hover:bg-[#E8CFA0]"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Hubungi Langsung Pembina via WhatsApp Sekarang</span>
          </a>
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-[#A84A2E]/10 border border-[#A84A2E] text-xs sm:text-sm font-semibold text-[#A84A2E] flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="mualaf-name"
              className="block text-xs sm:text-sm font-semibold text-[#1E1B18] mb-1"
            >
              Nama Lengkap *
            </label>
            <input
              id="mualaf-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masukkan nama lengkap Anda..."
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm text-[#1E1B18]"
            />
          </div>

          <div>
            <label
              htmlFor="mualaf-gender"
              className="block text-xs sm:text-sm font-semibold text-[#1E1B18] mb-1"
            >
              Jenis Kelamin (Untuk Penyesuaian Pembina) *
            </label>
            <select
              id="mualaf-gender"
              value={gender}
              onChange={(e) =>
                setGender(e.target.value as 'LAKI_LAKI' | 'PEREMPUAN')
              }
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm font-semibold text-[#1E1B18]"
            >
              <option value="LAKI_LAKI">Laki-laki (Dibimbing Ustadz Pembina)</option>
              <option value="PEREMPUAN">
                Perempuan (Dibimbing Ustadzah Pembina Muslimah)
              </option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="mualaf-wa"
              className="block text-xs sm:text-sm font-semibold text-[#1E1B18] mb-1"
            >
              Nomor WhatsApp Aktif *
            </label>
            <input
              id="mualaf-wa"
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm text-[#1E1B18]"
            />
          </div>

          <div>
            <label
              htmlFor="mualaf-date"
              className="block text-xs sm:text-sm font-semibold text-[#1E1B18] mb-1"
            >
              Rencana Tanggal Pertemuan / Konsultasi
            </label>
            <input
              id="mualaf-date"
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm font-mono text-[#1E1B18]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="mualaf-type"
            className="block text-xs sm:text-sm font-semibold text-[#1E1B18] mb-1"
          >
            Jenis Layanan yang Dibutuhkan *
          </label>
          <select
            id="mualaf-type"
            value={requestType}
            onChange={(e) =>
              setRequestType(e.target.value as typeof requestType)
            }
            className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm font-semibold text-[#1E1B18]"
          >
            {Object.entries(requestTypeLabel).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="mualaf-notes"
            className="block text-xs sm:text-sm font-semibold text-[#1E1B18] mb-1"
          >
            Pesan / Pertanyaan Awal (Opsional)
          </label>
          <textarea
            id="mualaf-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tuliskan jika ada hal khusus yang ingin ditanyakan atau waktu pertemuan yang diinginkan..."
            className="w-full px-3.5 py-2 rounded-md bg-white border border-[#524740] text-sm text-[#1E1B18]"
          />
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-5 py-3 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md bg-[#A84A2E] text-white font-semibold text-sm hover:bg-[#8E3B22] cursor-pointer"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span>
              {submitting
                ? 'Mengirim Permohonan...'
                : 'Kirim Permohonan Pendampingan'}
            </span>
          </button>

          <a
            href={waQuickLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md bg-[#1E1B18] text-[#FAF7F2] font-semibold text-xs sm:text-sm hover:bg-[#2C2520]"
          >
            <Phone className="w-4 h-4 text-[#E8CFA0]" aria-hidden="true" />
            <span>Chat WhatsApp Hotline</span>
          </a>
        </div>
      </form>
    </div>
  );
}

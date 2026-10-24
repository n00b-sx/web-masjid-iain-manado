'use client';

import React, { useEffect, useState } from 'react';
import { MosqueService } from '@/types/mosque';
import {
  BookOpen,
  Building2,
  CalendarCheck,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
  MessageCircle,
  Send,
  Users,
  X,
  AlertCircle,
} from 'lucide-react';

interface ServicesSectionProps {
  services: MosqueService[];
}

function getServiceIcon(iconName: MosqueService['iconName']) {
  switch (iconName) {
    case 'Building2':
      return <Building2 className="w-6 h-6" aria-hidden="true" />;
    case 'BookOpen':
      return <BookOpen className="w-6 h-6" aria-hidden="true" />;
    case 'HeartHandshake':
      return <HeartHandshake className="w-6 h-6" aria-hidden="true" />;
    case 'GraduationCap':
      return <GraduationCap className="w-6 h-6" aria-hidden="true" />;
    case 'Users':
      return <Users className="w-6 h-6" aria-hidden="true" />;
    default:
      return <CalendarCheck className="w-6 h-6" aria-hidden="true" />;
  }
}

export default function ServicesSection({ services }: ServicesSectionProps) {
  const activeServices = services.filter((s) => s.active);
  const [selectedService, setSelectedService] = useState<MosqueService | null>(null);

  // Form states
  const [applicantName, setApplicantName] = useState('');
  const [applicantIdentity, setApplicantIdentity] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedService(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const openModalForService = (srv: MosqueService) => {
    setSelectedService(srv);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    if (!applicantName.trim() || !whatsapp.trim() || !requestedDate.trim()) {
      setSubmitError('Mohon isi Nama Lengkap, Nomor WhatsApp, dan Tanggal Pengajuan.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/mosque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SUBMIT_SERVICE',
          serviceId: selectedService.id,
          serviceTitle: selectedService.title,
          applicantName,
          applicantIdentity,
          whatsapp,
          requestedDate,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirim pengajuan layanan.');
      }

      setSubmitSuccess(true);
      setApplicantName('');
      setApplicantIdentity('');
      setWhatsapp('');
      setRequestedDate('');
      setNotes('');
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Terjadi gangguan jaringan saat mengirim formulir.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const primaryService = activeServices[0];
  const secondaryServices = activeServices.slice(1);

  return (
    <section
      id="layanan"
      aria-labelledby="heading-layanan"
      className="py-14 sm:py-20 bg-[#F2ECE1] border-t border-[#DFD5C5]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <h2
            id="heading-layanan"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}
            className="font-serif-heading font-bold text-[#1E1B18] leading-tight mb-3"
          >
            Layanan Terpadu Masjid Al Jami&apos;ah
          </h2>
          <p className="text-sm sm:text-base text-[#524740]">
            Ajukan peminjaman aula diskusi, konsultasi keislaman, penyaluran ZISWAF, atau pemanfaatan perpustakaan masjid secara daring maupun melalui WhatsApp pengurus.
          </p>
        </div>

        {activeServices.length === 0 ? (
          <div className="bg-[#FAF7F2] border border-[#DFD5C5] rounded-xl p-8 text-center">
            <p className="text-base font-bold text-[#1E1B18] mb-1">
              Daftar Layanan Belum Tersedia
            </p>
            <p className="text-sm text-[#524740]">
              Admin Takmir dapat mengaktifkan layanan masjid melalui Panel Admin.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Flagship Service (Hierarchical Emphasis - R-14) */}
            {primaryService && (
              <div className="bg-[#1E1B18] text-[#FAF7F2] rounded-xl p-6 sm:p-8 lg:p-10 border border-[#1E1B18] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-[#E8CFA0] mb-3">
                    {getServiceIcon(primaryService.iconName)}
                    <span>Layanan Utama Sivitas Akademika &amp; UKM</span>
                  </div>
                  <h3 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#FAF7F2] mb-3">
                    {primaryService.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#F2ECE1] leading-relaxed mb-5">
                    {primaryService.shortDescription}
                  </p>

                  <div className="bg-[#2C2520] rounded-lg p-4 border border-white/15 mb-4">
                    <span className="text-xs font-bold text-[#E8CFA0] block mb-2">
                      Ketentuan &amp; Persyaratan Pengajuan:
                    </span>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-[#FAF7F2] list-disc pl-5">
                      {primaryService.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-xs text-[#E8CFA0]">
                    Penanggung Jawab: <strong>{primaryService.picName}</strong>
                  </p>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-3 bg-[#2C2520] p-5 rounded-xl border border-white/15">
                  <span className="text-xs font-semibold text-[#E8CFA0]">
                    Pilih Metode Pengajuan:
                  </span>
                  <button
                    type="button"
                    onClick={() => openModalForService(primaryService)}
                    className="w-full px-5 py-3.5 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md bg-[#A84A2E] text-white font-semibold text-sm hover:bg-[#8E3B22] transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" aria-hidden="true" />
                    <span>Isi Formulir Pengajuan Online</span>
                  </button>
                  <a
                    href={`https://wa.me/${primaryService.picWhatsapp}?text=${encodeURIComponent(
                      `Assalamu'alaikum ${primaryService.picName}, saya ingin berkonsultasi terkait layanan ${primaryService.title} di Masjid Al Jami'ah IAIN Manado.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-5 py-3.5 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md border border-[#E8CFA0] text-[#FAF7F2] font-semibold text-sm hover:bg-white/10 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    <span>Hubungi Pengurus via WhatsApp</span>
                  </a>
                </div>
              </div>
            )}

            {/* Supporting Services Grid */}
            {secondaryServices.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {secondaryServices.map((srv) => (
                  <article
                    key={srv.id}
                    className="bg-[#FAF7F2] border border-[#DFD5C5] rounded-xl p-6 flex flex-col justify-between hover:border-[#1E1B18] transition-colors"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-lg bg-[#F2ECE1] text-[#A84A2E] border border-[#DFD5C5] flex items-center justify-center mb-4">
                        {getServiceIcon(srv.iconName)}
                      </div>

                      <h3 className="font-serif-heading text-xl font-bold text-[#1E1B18] mb-2">
                        {srv.title}
                      </h3>

                      <p className="text-sm text-[#524740] leading-relaxed mb-4">
                        {srv.shortDescription}
                      </p>

                      {srv.requirements.length > 0 && (
                        <div className="mb-5 pt-3 border-t border-[#DFD5C5]">
                          <span className="text-xs font-bold text-[#1E1B18] block mb-1.5">
                            Syarat &amp; Prosedur:
                          </span>
                          <ul className="text-xs text-[#524740] space-y-1 list-disc pl-4">
                            {srv.requirements.map((r, idx) => (
                              <li key={idx}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-[#DFD5C5] flex flex-col gap-2.5">
                      <span className="text-xs text-[#524740]">
                        PIC: <strong className="text-[#1E1B18]">{srv.picName}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => openModalForService(srv)}
                        className="w-full px-4 py-2.5 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md bg-[#1E1B18] text-[#FAF7F2] text-xs sm:text-sm font-semibold hover:bg-[#2C2520] transition-colors cursor-pointer"
                      >
                        <Send className="w-4 h-4" aria-hidden="true" />
                        <span>Ajukan Layanan Online</span>
                      </button>
                      <a
                        href={`https://wa.me/${srv.picWhatsapp}?text=${encodeURIComponent(
                          `Assalamu'alaikum, saya ingin menanyakan layanan ${srv.title} di Masjid Al Jami'ah IAIN Manado.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-4 py-2.5 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md border border-[#1E1B18] text-[#1E1B18] text-xs sm:text-sm font-semibold hover:bg-[#F2ECE1] transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" aria-hidden="true" />
                        <span>Chat WhatsApp Pengurus</span>
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Formulir Pengajuan Layanan Online */}
      {selectedService && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-service-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E1B18]/80"
          onClick={() => setSelectedService(null)}
        >
          <div
            className="bg-[#FAF7F2] text-[#1E1B18] border-2 border-[#1E1B18] rounded-xl max-w-xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <span className="text-xs font-bold text-[#A84A2E] block mb-1">
                  Formulir Pengajuan Daring
                </span>
                <h3
                  id="modal-service-title"
                  className="font-serif-heading text-xl font-bold text-[#1E1B18]"
                >
                  {selectedService.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                aria-label="Tutup formulir pengajuan"
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-md border border-[#DFD5C5] text-[#1E1B18] hover:bg-[#F2ECE1] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="bg-[#F2ECE1] border border-[#3D4D33] rounded-lg p-6 text-center">
                <CheckCircle2
                  className="w-12 h-12 text-[#3D4D33] mx-auto mb-3"
                  aria-hidden="true"
                />
                <h4 className="font-serif-heading text-lg font-bold text-[#1E1B18] mb-2">
                  Pengajuan Berhasil Diterima Sistem Takmir
                </h4>
                <p className="text-xs sm:text-sm text-[#524740] mb-5">
                  Data permohonan Anda telah masuk ke daftar verifikasi di Panel Admin Takmir Masjid Al Jami&apos;ah. Anda juga dapat langsung meneruskan pesan konfirmasi ke WhatsApp pengurus.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <a
                    href={`https://wa.me/${selectedService.picWhatsapp}?text=${encodeURIComponent(
                      `Assalamu'alaikum ${selectedService.picName}, saya telah mengisi formulir pengajuan online untuk layanan: ${selectedService.title}. Mohon arahan tindak lanjutnya.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 min-h-[44px] inline-flex items-center gap-2 rounded-md bg-[#3D4D33] text-white text-xs sm:text-sm font-semibold"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Konfirmasi Cepat via WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedService(null)}
                    className="px-5 py-2.5 min-h-[44px] inline-flex items-center rounded-md border border-[#1E1B18] text-[#1E1B18] text-xs sm:text-sm font-semibold cursor-pointer"
                  >
                    Selesai &amp; Tutup
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {submitError && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-lg bg-[#A84A2E]/10 border border-[#A84A2E] text-[#A84A2E] text-xs sm:text-sm font-semibold flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="applicant-name"
                    className="block text-xs sm:text-sm font-semibold text-[#1E1B18] mb-1.5"
                  >
                    Nama Lengkap Pemohon *
                  </label>
                  <input
                    id="applicant-name"
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Masukkan nama lengkap Anda..."
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-[#1E1B18] text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="applicant-identity"
                    className="block text-xs sm:text-sm font-semibold text-[#1E1B18] mb-1.5"
                  >
                    Asal Fakultas / UKM / HMJ / Instansi (Opsional)
                  </label>
                  <input
                    id="applicant-identity"
                    type="text"
                    value={applicantIdentity}
                    onChange={(e) => setApplicantIdentity(e.target.value)}
                    placeholder="Contoh: Fakultas Syariah / UKM LDK..."
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-[#1E1B18] text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="applicant-wa"
                      className="block text-xs sm:text-sm font-semibold text-[#1E1B18] mb-1.5"
                    >
                      Nomor WhatsApp Aktif *
                    </label>
                    <input
                      id="applicant-wa"
                      type="tel"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="Contoh: 0812xxxxxxxx"
                      className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-[#1E1B18] text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="applicant-date"
                      className="block text-xs sm:text-sm font-semibold text-[#1E1B18] mb-1.5"
                    >
                      Rencana Tanggal Pelaksanaan *
                    </label>
                    <input
                      id="applicant-date"
                      type="date"
                      required
                      value={requestedDate}
                      onChange={(e) => setRequestedDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-[#1E1B18] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="applicant-notes"
                    className="block text-xs sm:text-sm font-semibold text-[#1E1B18] mb-1.5"
                  >
                    Rincian Keperluan / Waktu Acara
                  </label>
                  <textarea
                    id="applicant-notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Jelaskan keperluan layanan, jam pelaksanaan, atau jumlah peserta..."
                    className="w-full px-3.5 py-2.5 rounded-md bg-white border border-[#524740] text-[#1E1B18] text-sm"
                  />
                </div>

                <div className="pt-3 flex flex-wrap items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedService(null)}
                    className="px-4 py-2.5 min-h-[44px] rounded-md border border-[#1E1B18] text-[#1E1B18] text-xs sm:text-sm font-semibold hover:bg-[#F2ECE1] cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 min-h-[44px] inline-flex items-center gap-2 rounded-md bg-[#A84A2E] text-white text-xs sm:text-sm font-semibold hover:bg-[#8E3B22] disabled:opacity-60 cursor-pointer"
                  >
                    <Send className="w-4 h-4" aria-hidden="true" />
                    <span>
                      {submitting ? 'Mengirim Permohonan...' : 'Kirim Pengajuan Layanan'}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

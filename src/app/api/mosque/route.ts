import { NextRequest, NextResponse } from 'next/server';
import { readMosqueDb, writeMosqueDb } from '@/lib/db';
import { fetchManadoPrayerTimes } from '@/lib/prayer-times';
import {
  MosqueDatabase,
  MualafSubmission,
  ServiceSubmission,
} from '@/types/mosque';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = readMosqueDb();
    const prayerData = await fetchManadoPrayerTimes(db.prayerSettings);
    return NextResponse.json({
      db,
      prayerData,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal memuat data sistem masjid', details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<MosqueDatabase>;
    const currentDb = readMosqueDb();
    const updatedDb: MosqueDatabase = {
      ...currentDb,
      ...body,
    };
    writeMosqueDb(updatedDb);
    const prayerData = await fetchManadoPrayerTimes(updatedDb.prayerSettings);
    return NextResponse.json({
      message: 'Perubahan berhasil disimpan ke server.',
      db: updatedDb,
      prayerData,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal menyimpan pembaruan data.', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    if (payload.action === 'SUBMIT_SERVICE') {
      const {
        serviceId,
        serviceTitle,
        applicantName,
        applicantIdentity,
        whatsapp,
        requestedDate,
        notes,
      } = payload;

      if (!applicantName || !whatsapp || !serviceId) {
        return NextResponse.json(
          { error: 'Mohon lengkapi nama pemohon, nomor WhatsApp, dan jenis layanan.' },
          { status: 400 }
        );
      }

      const currentDb = readMosqueDb();
      const newSubmission: ServiceSubmission = {
        id: `sub-${Date.now()}`,
        serviceId,
        serviceTitle: serviceTitle || 'Layanan Masjid',
        applicantName: String(applicantName).trim(),
        applicantIdentity: String(applicantIdentity || '-').trim(),
        whatsapp: String(whatsapp).trim(),
        requestedDate: String(requestedDate || new Date().toISOString().slice(0, 10)),
        notes: String(notes || '').trim(),
        status: 'MENUNGGU',
        createdAt: new Date().toISOString(),
      };

      currentDb.serviceSubmissions = [newSubmission, ...(currentDb.serviceSubmissions || [])];
      writeMosqueDb(currentDb);

      return NextResponse.json({
        message: 'Pengajuan layanan berhasil dikirim dan tercatat di sistem Takmir.',
        submission: newSubmission,
      });
    }

    if (payload.action === 'SUBMIT_MUALAF') {
      const {
        fullName,
        gender,
        whatsapp,
        requestType,
        preferredDate,
        notes,
      } = payload;

      if (!fullName || !whatsapp) {
        return NextResponse.json(
          { error: 'Mohon lengkapi nama lengkap dan nomor WhatsApp aktif Anda.' },
          { status: 400 }
        );
      }

      const currentDb = readMosqueDb();
      const newMualafSub: MualafSubmission = {
        id: `mualaf-${Date.now()}`,
        fullName: String(fullName).trim(),
        gender: gender === 'PEREMPUAN' ? 'PEREMPUAN' : 'LAKI_LAKI',
        whatsapp: String(whatsapp).trim(),
        requestType: requestType || 'KONSULTASI_ISLAM',
        preferredDate: String(
          preferredDate || new Date().toISOString().slice(0, 10)
        ),
        notes: String(notes || '').trim(),
        status: 'MENUNGGU',
        createdAt: new Date().toISOString(),
      };

      currentDb.mualafCenter = {
        ...currentDb.mualafCenter,
        submissions: [
          newMualafSub,
          ...(currentDb.mualafCenter?.submissions || []),
        ],
      };
      writeMosqueDb(currentDb);

      return NextResponse.json({
        message:
          'Permohonan pendampingan Mualaf Center berhasil dikirim dan diterima oleh Sekretariat Takmir.',
        submission: newMualafSub,
      });
    }

    return NextResponse.json({ error: 'Aksi tidak dikenali.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses pengajuan.', details: String(error) },
      { status: 500 }
    );
  }
}

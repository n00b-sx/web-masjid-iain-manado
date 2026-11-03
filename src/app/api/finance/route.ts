import { NextRequest, NextResponse } from 'next/server';
import { readMosqueDb, writeMosqueDb } from '@/lib/db';
import { FinanceTransaction, FundCategory } from '@/types/mosque';

export const dynamic = 'force-dynamic';

const VALID_CATEGORIES: FundCategory[] = [
  'OPERASIONAL',
  'PEMBANGUNAN',
  'SOSIAL_ZISWAF',
];

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const action = String(payload?.action || '');
    const pinInput = String(payload?.pin || '').trim();

    const currentDb = readMosqueDb();
    const configuredPin = (currentDb.donationInfo.treasurerPin || '123456').trim();

    if (!pinInput || pinInput !== configuredPin) {
      return NextResponse.json(
        { error: 'Kode PIN Bendahara tidak sesuai. Silakan coba kembali.' },
        { status: 401 }
      );
    }

    if (action === 'VERIFY_PIN') {
      return NextResponse.json({
        ok: true,
        mosqueName: currentDb.mosqueProfile.name,
        institution: currentDb.mosqueProfile.institution,
        logoUrl: currentDb.mosqueProfile.logoUrl || '',
        treasurerName:
          currentDb.donationInfo.treasurerName || 'Bendahara Takmir Masjid',
        transactions: currentDb.transactions,
      });
    }

    if (action === 'ADD_TRANSACTION') {
      const type = payload.type === 'OUT' ? 'OUT' : 'IN';
      const category: FundCategory = VALID_CATEGORIES.includes(payload.category)
        ? payload.category
        : 'OPERASIONAL';
      const amount = Math.round(Number(payload.amount || 0));
      const description = String(payload.description || '').trim();
      const date = String(
        payload.date || new Date().toISOString().slice(0, 10)
      ).slice(0, 10);
      const recordedBy =
        String(
          payload.recordedBy ||
            currentDb.donationInfo.treasurerName ||
            'Bendahara Takmir Masjid'
        ).trim();
      const receiptImageUrl = payload.receiptImageUrl
        ? String(payload.receiptImageUrl).trim()
        : undefined;

      if (!amount || amount <= 0) {
        return NextResponse.json(
          { error: 'Nominal transaksi harus lebih besar dari Rp 0.' },
          { status: 400 }
        );
      }

      if (!description) {
        return NextResponse.json(
          { error: 'Keterangan transaksi wajib diisi.' },
          { status: 400 }
        );
      }

      const newTransaction: FinanceTransaction = {
        id: `trx-${Date.now()}`,
        date,
        description,
        category,
        type,
        amount,
        recordedBy,
        ...(receiptImageUrl ? { receiptImageUrl } : {}),
      };

      const updatedTransactions = [newTransaction, ...currentDb.transactions];
      const updatedDb = writeMosqueDb({
        ...currentDb,
        transactions: updatedTransactions,
      });

      return NextResponse.json({
        ok: true,
        message: `Transaksi ${
          type === 'IN' ? 'Kas Masuk' : 'Kas Keluar'
        } berhasil disimpan ke sistem masjid.`,
        transaction: newTransaction,
        transactions: updatedDb.transactions,
      });
    }

    if (action === 'DELETE_TRANSACTION') {
      const transactionId = String(payload.transactionId || '').trim();
      if (!transactionId) {
        return NextResponse.json(
          { error: 'ID transaksi tidak ditemukan.' },
          { status: 400 }
        );
      }

      const updatedTransactions = currentDb.transactions.filter(
        (t) => t.id !== transactionId
      );
      const updatedDb = writeMosqueDb({
        ...currentDb,
        transactions: updatedTransactions,
      });

      return NextResponse.json({
        ok: true,
        message: 'Transaksi berhasil dihapus dari buku kas masjid.',
        transactions: updatedDb.transactions,
      });
    }

    return NextResponse.json(
      { error: 'Aksi API keuangan tidak dikenali.' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Terjadi kesalahan saat memproses data keuangan bendahara.',
        details: String(error),
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    const safeFilename = path.basename(filename);
    const filepath = path.join(process.cwd(), 'public', 'uploads', safeFilename);

    if (!fs.existsSync(filepath)) {
      return NextResponse.json(
        { error: 'File media tidak ditemukan.' },
        { status: 404 }
      );
    }

    const ext = path.extname(safeFilename).toLowerCase();
    const contentType = MIME_BY_EXT[ext] || 'application/octet-stream';
    const fileBuffer = fs.readFileSync(filepath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal memuat file media.', details: String(error) },
      { status: 500 }
    );
  }
}

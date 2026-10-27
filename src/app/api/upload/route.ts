import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/x-png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'video/ogg',
];

const ALLOWED_EXTS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.svg',
  '.mp4',
  '.webm',
  '.ogg',
];

function ensureUploadDir(): string {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Mode 1: Chunked JSON Upload (Bypasses Cloudflare WAF 403 on multipart/form-data & 100MB limits)
    if (contentType.includes('application/json')) {
      const body = (await req.json()) as {
        fileName?: string;
        fileType?: string;
        chunkBase64?: string;
        chunkIndex?: number;
        totalChunks?: number;
        targetFilename?: string;
      };

      const originalName = body.fileName || 'media.png';
      const ext = (path.extname(originalName) || '.png').toLowerCase();
      if (
        !ALLOWED_TYPES.includes(body.fileType || '') &&
        !ALLOWED_EXTS.includes(ext)
      ) {
        return NextResponse.json(
          {
            error:
              'Format file harus berupa gambar (JPG, PNG, WEBP, GIF, SVG) atau video (MP4, WEBM, OGG).',
          },
          { status: 400 }
        );
      }

      if (!body.chunkBase64) {
        return NextResponse.json(
          { error: 'Data potongan file kosong.' },
          { status: 400 }
        );
      }

      const uploadDir = ensureUploadDir();
      const chunkIndex = body.chunkIndex ?? 0;

      let filename = body.targetFilename ? path.basename(body.targetFilename) : '';
      if (!filename || chunkIndex === 0) {
        const safeBase =
          path
            .basename(originalName, path.extname(originalName))
            .toLowerCase()
            .replace(/[^a-z0-9-_]/g, '-')
            .slice(0, 40) || 'media';
        filename = `${Date.now()}-${safeBase}${ext}`;
      }

      const filepath = path.join(uploadDir, filename);
      const buffer = Buffer.from(body.chunkBase64, 'base64');

      if (chunkIndex === 0) {
        fs.writeFileSync(filepath, buffer);
      } else {
        fs.appendFileSync(filepath, buffer);
      }

      return NextResponse.json({
        url: `/api/uploads/${filename}`,
        filename,
        chunkIndex,
        totalChunks: body.totalChunks ?? 1,
        message: 'Potongan file berhasil disimpan.',
      });
    }

    // Mode 2: Standard multipart/form-data fallback
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Tidak ada file gambar yang dipilih.' },
        { status: 400 }
      );
    }

    const ext = (path.extname(file.name) || '.png').toLowerCase();
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTS.includes(ext)) {
      return NextResponse.json(
        {
          error:
            'Format file harus berupa gambar (JPG, PNG, WEBP, GIF, SVG) atau video (MP4, WEBM, OGG).',
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = ensureUploadDir();

    const safeBase =
      path
        .basename(file.name, path.extname(file.name))
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-')
        .slice(0, 40) || 'media';
    const filename = `${Date.now()}-${safeBase}${ext}`;
    const filepath = path.join(uploadDir, filename);

    fs.writeFileSync(filepath, buffer);

    return NextResponse.json({
      url: `/api/uploads/${filename}`,
      filename,
      message: 'Gambar berhasil diunggah ke server.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal mengunggah gambar ke server.', details: String(error) },
      { status: 500 }
    );
  }
}

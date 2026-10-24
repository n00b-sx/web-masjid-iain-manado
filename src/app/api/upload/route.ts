import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Tidak ada file gambar yang dipilih.' },
        { status: 400 }
      );
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'video/mp4',
      'video/webm',
      'video/ogg',
    ];
    if (!allowedTypes.includes(file.type)) {
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

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.name) || '.jpg';
    const safeBase = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .slice(0, 40);
    const filename = `${Date.now()}-${safeBase}${ext}`;
    const filepath = path.join(uploadDir, filename);

    fs.writeFileSync(filepath, buffer);

    return NextResponse.json({
      url: `/uploads/${filename}`,
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

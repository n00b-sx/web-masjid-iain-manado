'use client';

import React, { useState } from 'react';
import {
  Bold,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Eye,
  Edit3,
} from 'lucide-react';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (html: string) => void;
}

export default function RichTextEditor({
  label,
  value,
  onChange,
}: RichTextEditorProps) {
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);

  const insertBlock = (snippet: string) => {
    onChange(`${value}\n${snippet}`);
  };

  const handleInlineImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingInline(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        insertBlock(
          `<img src="${data.url}" alt="${file.name.replace(/\.[^/.]+$/, '')}" />`
        );
      }
    } finally {
      setUploadingInline(false);
      e.target.value = '';
    }
  };

  const handleInsertImageUrl = () => {
    const url = window.prompt('Masukkan URL Gambar (https://...):');
    if (url && url.trim()) {
      const alt =
        window.prompt('Masukkan keterangan gambar (Alt Text SEO):') ||
        'Dokumentasi Masjid Al Jamiah IAIN Manado';
      insertBlock(`<img src="${url.trim()}" alt="${alt.trim()}" />`);
    }
  };

  const handleInsertLink = () => {
    const url = window.prompt('Masukkan alamat URL tujuan (https://...):');
    if (url && url.trim()) {
      const text = window.prompt('Masukkan teks tautan:') || url.trim();
      insertBlock(`<p><a href="${url.trim()}">${text.trim()}</a></p>`);
    }
  };

  return (
    <div className="border border-[#524740] rounded-lg overflow-hidden bg-white">
      {/* Editor Header & Toolbar */}
      <div className="bg-[#F2ECE1] border-b border-[#DFD5C5] p-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-[#1E1B18] mr-2 px-1">
            {label}
          </span>

          <button
            type="button"
            onClick={() => insertBlock('<h2>Subjudul Bagian Baru</h2>')}
            title="Sisipkan Subjudul Besar (H2)"
            className="px-2.5 py-1.5 min-h-[38px] inline-flex items-center gap-1 rounded bg-[#FAF7F2] border border-[#DFD5C5] text-xs font-semibold text-[#1E1B18] hover:border-[#1E1B18] cursor-pointer"
          >
            <Heading2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>H2</span>
          </button>

          <button
            type="button"
            onClick={() => insertBlock('<h3>Subjudul Kecil (H3)</h3>')}
            title="Sisipkan Subjudul Kecil (H3)"
            className="px-2.5 py-1.5 min-h-[38px] inline-flex items-center gap-1 rounded bg-[#FAF7F2] border border-[#DFD5C5] text-xs font-semibold text-[#1E1B18] hover:border-[#1E1B18] cursor-pointer"
          >
            <Heading3 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>H3</span>
          </button>

          <button
            type="button"
            onClick={() => insertBlock('<p><strong>Teks tebal penting</strong></p>')}
            title="Sisipkan Paragraf Tebal"
            className="px-2.5 py-1.5 min-h-[38px] inline-flex items-center gap-1 rounded bg-[#FAF7F2] border border-[#DFD5C5] text-xs font-semibold text-[#1E1B18] hover:border-[#1E1B18] cursor-pointer"
          >
            <Bold className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Tebal</span>
          </button>

          <button
            type="button"
            onClick={() => insertBlock('<p><em>Teks cetak miring</em></p>')}
            title="Sisipkan Teks Miring"
            className="px-2.5 py-1.5 min-h-[38px] inline-flex items-center gap-1 rounded bg-[#FAF7F2] border border-[#DFD5C5] text-xs font-semibold text-[#1E1B18] hover:border-[#1E1B18] cursor-pointer"
          >
            <Italic className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Miring</span>
          </button>

          <button
            type="button"
            onClick={() =>
              insertBlock(
                '<ul>\n  <li>Butir poin pertama</li>\n  <li>Butir poin kedua</li>\n</ul>'
              )
            }
            title="Sisipkan Daftar Poin"
            className="px-2.5 py-1.5 min-h-[38px] inline-flex items-center gap-1 rounded bg-[#FAF7F2] border border-[#DFD5C5] text-xs font-semibold text-[#1E1B18] hover:border-[#1E1B18] cursor-pointer"
          >
            <List className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Poin</span>
          </button>

          <button
            type="button"
            onClick={() =>
              insertBlock(
                '<ol>\n  <li>Langkah pertama</li>\n  <li>Langkah kedua</li>\n</ol>'
              )
            }
            title="Sisipkan Daftar Bernomor"
            className="px-2.5 py-1.5 min-h-[38px] inline-flex items-center gap-1 rounded bg-[#FAF7F2] border border-[#DFD5C5] text-xs font-semibold text-[#1E1B18] hover:border-[#1E1B18] cursor-pointer"
          >
            <ListOrdered className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Nomor</span>
          </button>

          <button
            type="button"
            onClick={() =>
              insertBlock(
                '<blockquote>"Tuliskan kutipan ayat, hadits, atau pernyataan narasumber di sini."</blockquote>'
              )
            }
            title="Sisipkan Blok Kutipan / Ayat"
            className="px-2.5 py-1.5 min-h-[38px] inline-flex items-center gap-1 rounded bg-[#FAF7F2] border border-[#DFD5C5] text-xs font-semibold text-[#1E1B18] hover:border-[#1E1B18] cursor-pointer"
          >
            <Quote className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Kutipan</span>
          </button>

          <label
            title="Unggah Gambar ke Dalam Isi Artikel"
            className="px-2.5 py-1.5 min-h-[38px] inline-flex items-center gap-1 rounded bg-[#FAF7F2] border border-[#DFD5C5] text-xs font-semibold text-[#1E1B18] hover:border-[#1E1B18] cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{uploadingInline ? 'Mengunggah...' : 'Upload Foto'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleInlineImageUpload}
              className="sr-only"
            />
          </label>

          <button
            type="button"
            onClick={handleInsertImageUrl}
            title="Sisipkan Gambar dari URL"
            className="px-2.5 py-1.5 min-h-[38px] inline-flex items-center gap-1 rounded bg-[#FAF7F2] border border-[#DFD5C5] text-xs font-semibold text-[#1E1B18] hover:border-[#1E1B18] cursor-pointer"
          >
            <span>URL Foto</span>
          </button>

          <button
            type="button"
            onClick={handleInsertLink}
            title="Sisipkan Tautan Link"
            className="px-2.5 py-1.5 min-h-[38px] inline-flex items-center gap-1 rounded bg-[#FAF7F2] border border-[#DFD5C5] text-xs font-semibold text-[#1E1B18] hover:border-[#1E1B18] cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Tautan</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setPreviewMode(!previewMode)}
          className={`px-3 py-1.5 min-h-[38px] inline-flex items-center gap-1.5 rounded text-xs font-bold cursor-pointer ${
            previewMode
              ? 'bg-[#A84A2E] text-white'
              : 'bg-[#1E1B18] text-[#FAF7F2]'
          }`}
        >
          {previewMode ? (
            <>
              <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Kembali ke Mode Tulis</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Pratinjau Tampilan Artikel</span>
            </>
          )}
        </button>
      </div>

      {/* Editor Area or Live Visual Preview */}
      {previewMode ? (
        <div className="p-5 sm:p-6 bg-[#FAF7F2] min-h-[260px]">
          <span className="text-xs font-bold text-[#A84A2E] block mb-3">
            Pratinjau Hasil Tampilan di Halaman Publik:
          </span>
          <div
            className="prose-masjid text-sm sm:text-base"
            dangerouslySetInnerHTML={{
              __html:
                value ||
                '<p><em>Belum ada isi konten. Klik Kembali ke Mode Tulis untuk mulai mengetik.</em></p>',
            }}
          />
        </div>
      ) : (
        <textarea
          rows={10}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tulis isi berita atau halaman di sini. Gunakan tombol blok di atas untuk menambahkan Subjudul (H2/H3), Kutipan Ayat/Hadits, Daftar Poin, atau Foto..."
          className="w-full p-4 text-sm text-[#1E1B18] font-sans leading-relaxed focus:outline-none"
        />
      )}
    </div>
  );
}

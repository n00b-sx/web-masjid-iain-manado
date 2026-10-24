'use client';

import React, { useState } from 'react';
import { Upload, Link as LinkIcon, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImageUploaderFieldProps {
  label: string;
  value: string;
  onChange: (newUrl: string) => void;
  placeholder?: string;
}

export default function ImageUploaderField({
  label,
  value,
  onChange,
  placeholder = 'Tempel URL gambar (https://...) atau unggah file dari perangkat...',
}: ImageUploaderFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadMsg(null);
    setUploadErr(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengunggah gambar.');
      }

      onChange(data.url);
      setUploadMsg(`Berhasil diunggah: ${data.filename}`);
    } catch (err) {
      setUploadErr(
        err instanceof Error ? err.message : 'Gagal mengunggah gambar.'
      );
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs sm:text-sm font-semibold text-[#1E1B18]">
        {label}
      </label>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <LinkIcon
            className="w-4 h-4 text-[#524740] absolute left-3.5 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-3.5 py-2.5 min-h-[44px] rounded-md bg-white border border-[#524740] text-sm text-[#1E1B18]"
          />
        </div>

        <label className="px-4 py-2.5 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md bg-[#1E1B18] text-[#FAF7F2] text-xs sm:text-sm font-semibold hover:bg-[#2C2520] cursor-pointer shrink-0">
          <Upload className="w-4 h-4" aria-hidden="true" />
          <span>{uploading ? 'Mengunggah...' : 'Upload File Gambar'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="sr-only"
          />
        </label>
      </div>

      {uploadMsg && (
        <p className="text-xs font-semibold text-[#3D4D33] flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{uploadMsg}</span>
        </p>
      )}

      {uploadErr && (
        <p className="text-xs font-semibold text-[#A84A2E] flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{uploadErr}</span>
        </p>
      )}

      {value && (
        <div className="mt-2 p-2 rounded-lg bg-[#F2ECE1] border border-[#DFD5C5] inline-block">
          <img
            src={value}
            alt="Pratinjau Gambar"
            className="h-24 w-auto object-cover rounded border border-[#DFD5C5]"
          />
        </div>
      )}
    </div>
  );
}

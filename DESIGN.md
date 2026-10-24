# DESIGN.md: Masjid Al Jami'ah IAIN Manado

## Identity & Mood
- **Product**: Portal Resmi, Layar Informasi Smart TV (Digital Signage), dan CMS Admin Masjid Al Jami'ah IAIN Manado.
- **Audience**: Mahasiswa, dosen, civitas akademika IAIN Manado, masyarakat sekitar Kota Manado, dan pengurus Takmir Masjid.
- **Visual Language**: Warm Arabian & Modern Architectural (terinspirasi dari tekstur batu pasir hangat, aksen terakota tembaga, dan tipografi editorial akademis yang tenang serta berwibawa).
- **Dials**: `Dial: ENERGY 2 / RHYTHM 3 / MOTION 2`

## Color Palette (WCAG AA/AAA Verified)
1. **Warm Alabaster (`#FAF7F2`)**: Latar belakang utama halaman publik untuk menghadirkan suasana ruang ibadah yang terang, hangat, dan tidak menyilaukan mata dibanding putih murni (`#FFFFFF`).
2. **Soft Sandstone (`#F2ECE1`)**: Latar sekunder untuk membedakan seksi informasi tanpa garis pembatas yang kaku.
3. **Deep Warm Espresso (`#1E1B18`)**: Warna teks utama (rasio kontras 16.04:1 di atas `#FAF7F2`) serta latar belakang utama Mode Smart TV (`/tv`) agar tidak menyilaukan jamaah di dalam ruang sholat.
4. **Muted Espresso (`#524740`)**: Warna teks sekunder dan keterangan (rasio kontras 8.42:1 di atas `#FAF7F2` dan 7.65:1 di atas `#F2ECE1`).
5. **Terracotta Copper (`#A84A2E`)**: Satu-satunya warna aksen utama untuk tombol aksi (CTA), penanda waktu sholat aktif, dan elemen interaktif penting (rasio kontras 5.70:1 dengan teks putih `#FFFFFF`, dan 5.33:1 di atas `#FAF7F2`).
6. **Champagne Sand (`#E8CFA0`)**: Aksen teks tinggi kontras khusus di atas latar gelap `#1E1B18` (rasio kontras 11.32:1) pada Hero dan layar TV.
7. **Olive Sage Dark (`#3D4D33`)**: Penanda status positif dan pemasukan kas masjid (rasio kontras 8.52:1 di atas `#FAF7F2`).

## Typography & Reasons (R-06, R-31)
- **Heading Serif (`Playfair Display` / `Georgia` fallback)**: Memberikan karakter akademis dan arsitektural yang khas bagi masjid kampus perguruan tinggi Islam.
- **Body Sans (`Plus Jakarta Sans` / system-ui)**: Menjamin keterbacaan tinggi pada tabel jadwal sholat, laporan angka keuangan, dan artikel panjang di layar HP maupun monitor TV.
- **Arabic (`Amiri` / `Traditional Arabic`)**: Menampilkan kutipan ayat Al-Qur'an dan Hadits dengan proporsi harakat yang jelas dari jarak jauh di layar TV.

## Architectural Decisions & One-Line Reasons (R-31)
- **Why this color palette?**: Memadukan batu pasir hangat (`#FAF7F2`) dan terakota (`#A84A2E`) agar tampil beda dari klise hijau-emas standar namun tetap hangat, ramah, dan memenuhi kontras WCAG AA/AAA.
- **Why this layout & rhythm (RHYTHM 3)?**: Setiap seksi dirancang mengikuti bentuk kontennya: bar horizontal untuk 5 waktu sholat, split-panel asimetris untuk agenda vs petugas Jumat, tabel dan grafik komparasi untuk 3 kas masjid, katalog interaktif untuk layanan, serta grid editorial untuk berita.
- **Why sticky transparent-to-solid navbar?**: Memberikan ruang visual penuh pada foto arsitektur masjid di bagian Hero saat pertama kali dibuka, lalu berubah menjadi navigasi berlatar terang yang jelas saat pengguna membaca konten di bawah.
- **Why Hero cross-fade slideshow with dark scrim?**: Menampilkan berbagai sudut kegiatan dan arsitektur Masjid Al Jami'ah dengan scrim gelap (`rgba(20, 16, 13, 0.72)`) agar teks putih di atas foto selalu memiliki rasio kontras >7:1 di setiap titik gambar.
- **Why 16:9 dark theme on `/tv`?**: Layar TV di dalam masjid menyala sepanjang hari dan dilihat dari jarak 3 hingga 15 meter, sehingga latar gelap hangat (`#1E1B18`) mencegah silau di ruang ibadah dan menghemat daya panel LED.

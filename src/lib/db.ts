import fs from 'fs';
import path from 'path';
import { MosqueDatabase } from '@/types/mosque';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE_PATH = path.join(DATA_DIR, 'mosque-db.json');

const LEGACY_DUMMY_TRX_IDS = new Set([
  'trx-1',
  'trx-2',
  'trx-3',
  'trx-4',
  'trx-5',
  'trx-6',
  'trx-7',
]);

const LEGACY_DUMMY_EVENT_IDS = new Set(['evt-1', 'evt-2', 'evt-3', 'evt-4']);
const LEGACY_DUMMY_PROJECT_IDS = new Set(['proj-rehab-1', 'proj-rehab-2']);
const LEGACY_DUMMY_NEWS_IDS = new Set(['news-1', 'news-2', 'news-3']);

export const INITIAL_MOSQUE_DATA: MosqueDatabase = {
  mosqueProfile: {
    name: "Masjid Al Jami'ah IAIN Manado",
    institution: 'Institut Agama Islam Negeri (IAIN) Manado',
    logoUrl: '/uploads/1792826397444-logo-iain-manado.png',
    address:
      'Jl. Dr. S.H. Sarundajang Kawasan Ring Road I, Malendeng, Kec. Paal Dua',
    city: 'Kota Manado',
    province: 'Sulawesi Utara',
    email: 'masjid.aljamiah@iain-manado.ac.id',
    whatsapp: '628114300000',
    tagline:
      'Pusat Peribadatan, Kajian Keilmuan Islam, dan Pemberdayaan Umat di Lingkungan Kampus IAIN Manado.',
  },
  footerSettings: {
    layoutStyle: 'THREE_COLUMN',
    middleColumnTitle: 'Halaman & Informasi',
    rightColumnTitle: 'Layar Informasi Masjid',
    rightColumnDescription:
      'Buka mode layar informasi penuh 16:9 untuk ditampilkan pada Smart TV di dalam ruang utama masjid.',
    showTvButton: true,
    showSitemapLink: true,
    copyrightText: 'Hak Cipta Dilindungi.',
    instagramUrl: '',
    youtubeUrl: '',
    campusWebsiteUrl: 'https://iain-manado.ac.id',
  },
  heroSlides: [
    {
      id: 'slide-1',
      title: "Selamat Datang di Masjid Al Jami'ah IAIN Manado",
      subtitle:
        'Ruang sujud, pusat diskusi keilmuan Islam, dan pembinaan karakter mahasiswa serta sivitas akademika di Kota Manado.',
      mediaType: 'VIDEO',
      imageUrl:
        'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1920&q=85',
      videoUrl:
        '/uploads/1792817540303-ytdown-com_youtube_profil-institut-agama.mp4',
      ctaText: 'Lihat Jadwal Sholat & Kajian',
      ctaLink: '#jadwal-sholat',
      order: 1,
      active: true,
    },
    {
      id: 'slide-2',
      title: 'Kajian Rutin Ba’da Maghrib & Halaqah Mahasiswa',
      subtitle:
        'Mengintegrasikan tradisi keilmuan turats, tafsir Al-Qur’an, dan wawasan keislaman moderat bagi mahasiswa dan masyarakat umum.',
      mediaType: 'IMAGE',
      imageUrl:
        'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1920&q=85',
      videoUrl: '',
      ctaText: 'Cek Agenda Kegiatan Hari Ini',
      ctaLink: '#kegiatan',
      order: 2,
      active: true,
    },
    {
      id: 'slide-3',
      title: 'Transparansi Kas & Layanan Terpadu Masjid Kampus',
      subtitle:
        'Pengelolaan infaq operasional, pembangunan, serta layanan peminjaman fasilitas masjid yang terbuka dan dapat diakses secara daring.',
      mediaType: 'IMAGE',
      imageUrl:
        'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1920&q=85',
      videoUrl: '',
      ctaText: 'Lihat Laporan Kas Masjid',
      ctaLink: '#keuangan',
      order: 3,
      active: true,
    },
  ],
  prayerSettings: {
    city: 'Kota Manado',
    latitude: 1.4748,
    longitude: 124.8421,
    useManualOverride: false,
    manualTimes: {
      Subuh: '04:28',
      Syuruq: '05:44',
      Dzuhur: '11:51',
      Ashar: '15:08',
      Maghrib: '17:55',
      Isya: '19:05',
    },
    offsets: {
      Subuh: 0,
      Syuruq: 0,
      Dzuhur: 0,
      Ashar: 0,
      Maghrib: 0,
      Isya: 0,
    },
    adzanDurationMinutes: {
      Subuh: 4,
      Dzuhur: 4,
      Ashar: 4,
      Maghrib: 4,
      Isya: 4,
    },
    iqomahMinutes: {
      Subuh: 15,
      Dzuhur: 10,
      Ashar: 10,
      Maghrib: 7,
      Isya: 10,
    },
    prayerDurationMinutes: {
      Subuh: 12,
      Dzuhur: 12,
      Ashar: 12,
      Maghrib: 12,
      Isya: 15,
    },
    adzanDurationSeconds: 180,
    jumatOfficer: {
      date: 'Setiap Hari Jumat',
      khatib: '-',
      khatibTopic: '-',
      imam: '-',
      muadzin: '-',
      bilal: '-',
    },
  },
  events: [],
  transactions: [],
  donationInfo: {
    bankName: 'Bank Syariah Indonesia (BSI)',
    accountNumber: '-',
    accountHolder: "UPZ / Takmir Masjid Al Jami'ah IAIN Manado",
    qrisImageUrl: '',
    confirmationWhatsapp: '628114300000',
    isSampleDataNotice: false,
    treasurerPin: '123456',
    treasurerName: 'Bendahara Takmir Masjid',
  },
  services: [
    {
      id: 'srv-1',
      title: 'Peminjaman Aula & Ruang Diskusi Masjid',
      slug: 'peminjaman-aula-masjid',
      shortDescription:
        'Layanan penggunaan ruang serbaguna dan pelataran Masjid Al Jami’ah untuk kegiatan akademik, seminar keislaman, dan agenda UKM/HMJ.',
      requirements: [
        'Surat permohonan resmi dari Fakultas, Lembaga, atau UKM/HMJ di lingkungan IAIN Manado',
        'Menjaga ketertiban, kebersihan, dan adab di lingkungan masjid',
        'Kegiatan wajib dihentikan sementara saat masuk waktu adzan hingga selesai sholat berjamaah',
      ],
      picName: 'Bidang Kerumahtanggaan & Inventaris Takmir',
      picWhatsapp: '628114300000',
      iconName: 'Building2',
      active: true,
    },
    {
      id: 'srv-2',
      title: 'Layanan Konsultasi Keislaman & Bimbingan Ibadah',
      slug: 'konsultasi-keislaman',
      shortDescription:
        'Layanan tanya jawab hukum Islam (fiqih), konsultasi bacaan Al-Qur’an, serta bimbingan rohani bagi mahasiswa dan sivitas akademika.',
      requirements: [
        'Mengisi formulir janji temu daring atau menghubungi pengurus',
        'Memilih topik konsultasi (Ibadah, Muamalah, Keluarga, atau Tahsin Al-Qur’an)',
      ],
      picName: 'Bidang Dakwah & Takmir Masjid',
      picWhatsapp: '628114300000',
      iconName: 'BookOpen',
      active: true,
    },
    {
      id: 'srv-3',
      title: 'Layanan ZISWAF & Santunan Sosial Kampus',
      slug: 'layanan-ziswaf',
      shortDescription:
        'Penerimaan dan penyaluran Zakat, Infaq, Sedekah, dan Wakaf buku/inventaris untuk mendukung kemakmuran masjid dan bantuan mahasiswa.',
      requirements: [
        'Konfirmasi penyerahan zakat/infaq/wakaf melalui formulir atau petugas piket',
        'Pengajuan bantuan sosial mahasiswa wajib melampirkan keterangan aktif kuliah',
      ],
      picName: 'Unit Pengumpul Zakat & Bendahara Takmir',
      picWhatsapp: '628114300000',
      iconName: 'HeartHandshake',
      active: true,
    },
    {
      id: 'srv-4',
      title: 'Pojok Literasi & Perpustakaan Kitab Masjid',
      slug: 'perpustakaan-masjid',
      shortDescription:
        'Fasilitas baca di tempat untuk koleksi mushaf Al-Qur’an, kitab tafsir, hadits, dan literatur keislaman di serambi Masjid Al Jami’ah.',
      requirements: [
        'Mencatat kunjungan pada buku daftar baca atau formulir peminjaman kelompok diskusi',
        'Mengembalikan kitab ke rak semula setelah selesai digunakan',
      ],
      picName: 'Bidang Keilmuan & Remaja Masjid',
      picWhatsapp: '628114300000',
      iconName: 'GraduationCap',
      active: true,
    },
  ],
  serviceSubmissions: [],
  rehabSettings: {
    pageTitle: 'Progres Rehabilitasi & Pengembangan Fasilitas Masjid',
    pageSubtitle:
      'Laporan berkala tahapan pekerjaan fisik, rencana penambahan fasilitas baru, serta transparansi kebutuhan material dan dana pembangunan Masjid Al Jami’ah IAIN Manado.',
    syncWithDevelopmentFund: true,
    picName: 'Panitia Rehabilitasi & Bidang Ri’ayah Takmir',
    picWhatsapp: '628114300000',
    projects: [],
  },
  mualafCenter: {
    pageTitle: "Mualaf Center Masjid Al Jami'ah IAIN Manado",
    pageSubtitle:
      'Pusat Pelayanan Konsultasi Keislaman, Prosesi Ikrar Syahadat, dan Pembinaan Berkelanjutan bagi Mualaf di Lingkungan Kampus IAIN Manado & Sulawesi Utara.',
    welcomeMessage:
      'Segala puji bagi Allah SWT atas limpahan hidayah-Nya. Mualaf Center Masjid Al Jami’ah IAIN Manado hadir untuk mendampingi saudara-saudari yang ingin mengenal Islam lebih dekat, mengucapkan dua kalimat syahadat secara resmi, serta mendapatkan bimbingan ibadah dasar secara ramah, kekeluargaan, dan tanpa dipungut biaya.',
    requirements: [
      'Niat tulus ikhlas dari hati sendiri tanpa adanya paksaan dari pihak mana pun',
      'Membawa fotokopi identitas diri (KTP / Kartu Mahasiswa / Paspor) sebanyak 2 lembar',
      'Menyiapkan pasfoto terbaru ukuran 3x4 sebanyak 3 lembar (untuk Piagam Syahadat)',
      'Menghadirkan 2 (dua) orang saksi (dapat dibantu disediakan oleh Pengurus Takmir jika belum memiliki saksi)',
      'Menandatangani Surat Pernyataan Memeluk Agama Islam di atas materai yang disiapkan oleh Sekretariat Mualaf Center',
    ],
    steps: [
      {
        id: 'mstep-1',
        stepNumber: 1,
        title: 'Konsultasi & Pendampingan Awal',
        description:
          'Calon mualaf dapat berdiskusi secara privat dan nyaman dengan tim pembina (tersedia pembimbing Ustadz maupun Ustadzah) mengenai dasar-dasar aqidah Islam.',
      },
      {
        id: 'mstep-2',
        stepNumber: 2,
        title: 'Verifikasi Berkas & Penjadwalan',
        description:
          'Pengurus sekretariat membantu kelengkapan administrasi dan menyepakati waktu pelaksanaan ikrar syahadat di Masjid Al Jami’ah.',
      },
      {
        id: 'mstep-3',
        stepNumber: 3,
        title: 'Prosesi Ikrar Dua Kalimat Syahadat',
        description:
          'Pelaksanaan ikrar syahadat yang dibimbing langsung oleh Imam/Ulama Takmir Masjid Al Jami’ah IAIN Manado dengan disaksikan oleh para saksi.',
      },
      {
        id: 'mstep-4',
        stepNumber: 4,
        title: 'Penyerahan Sertifikat & Pembinaan Rutin',
        description:
          'Penerbitan Surat Keterangan / Piagam Ikrar Syahadat resmi, pemberian paket peralatan ibadah, serta pendampingan belajar sholat dan Al-Qur’an.',
      },
    ],
    programs: [
      {
        id: 'mprog-1',
        title: 'Bimbingan Thaharah (Bersuci) & Tata Cara Sholat Fardhu',
        schedule: 'Setiap Pekan (Waktu Fleksibel Sesuai Kesepakatan)',
        mentor: 'Tim Pembina Ibadah Mualaf Center',
        description:
          'Pendampingan praktik wudhu, tayammum, mandi wajib, serta gerakan dan bacaan sholat lima waktu secara bertahap hingga mandiri.',
      },
      {
        id: 'mprog-2',
        title: 'Kelas Belajar Membaca Al-Qur’an (Iqra & Tahsin Dasar)',
        schedule: 'Setiap Selasa & Jumat Sore (Atau Kelas Privat)',
        mentor: 'Tim Pengajar Tahsin & Ustadzah Pembina',
        description:
          'Belajar mengenal huruf hijaiyah dari dasar (Iqra) hingga mampu membaca surat-surat pendek Al-Qur’an dengan makhraj yang benar.',
      },
      {
        id: 'mprog-3',
        title: 'Kajian Dasar Aqidah, Akhlak & Kekeluargaan Islam',
        schedule: '2 Minggu Sekali / Pendampingan Berkelanjutan',
        mentor: 'Dosen Pembina Takmir IAIN Manado',
        description:
          'Penguatan keimanan, pengenalan rukun iman dan rukun Islam, serta ruang konsultasi kekeluargaan bagi para mualaf.',
      },
    ],
    mentors: [
      {
        id: 'mmen-1',
        name: 'Tim Ulama & Dosen Pembina Putra Takmir Al Jami’ah',
        role: 'Pembimbing Ikrar Syahadat, Aqidah & Fiqih Ibadah (Putra)',
        whatsapp: '628114300000',
      },
      {
        id: 'mmen-2',
        name: 'Tim Dosen & Ustadzah Pembina Muslimah IAIN Manado',
        role: 'Pembimbing Khusus Calon Mualaf & Muslimah (Putri)',
        whatsapp: '628114300000',
      },
    ],
    hotlineName: 'Sekretariat Mualaf Center Al Jami’ah',
    hotlineWhatsapp: '628114300000',
    submissions: [],
  },
  news: [],
  customPages: [
    {
      id: 'page-profil',
      title: "Profil & Sejarah Masjid Al Jami'ah IAIN Manado",
      slug: 'profil-masjid',
      subtitle: 'Jantung Spiritual dan Intelektual Sivitas Akademika IAIN Manado',
      content: `<p><strong>Masjid Al Jami'ah IAIN Manado</strong> merupakan pusat peribadatan utama sekaligus ruang pembinaan keagamaan bagi mahasiswa, dosen, tenaga kependidikan, serta masyarakat di sekitar kampus Institut Agama Islam Negeri (IAIN) Manado, Sulawesi Utara.</p>
<h2>Visi Kemakmuran Masjid</h2>
<p>Menjadikan Masjid Al Jami'ah sebagai pusat peribadatan yang khusyuk, pusat kajian keilmuan Islam yang moderat dan inklklusif, serta pusat pemberdayaan umat berbasis lingkungan akademik.</p>
<h2>Misi Utama</h2>
<ul>
<li>Menyelenggarakan peribadatan sholat fardhu berjamaah dan sholat Jumat yang tertib, bersih, dan nyaman.</li>
<li>Mengembangkan halaqah keilmuan, tahsin Al-Qur'an, dan diskusi keislaman bagi mahasiswa lintas fakultas.</li>
<li>Mengelola dana infaq, sedekah, dan ZISWAF secara transparan, akuntabel, dan berdampak langsung bagi kemakmuran masjid serta kesejahteraan sivitas akademika.</li>
</ul>`,
      updatedAt: '2026-10-23',
      status: 'PUBLISHED',
      seoTitle: "Profil & Visi Misi Masjid Al Jami'ah IAIN Manado",
      seoDescription:
        "Mengenal sejarah, visi, misi, dan peran Masjid Al Jami'ah di lingkungan kampus IAIN Manado, Sulawesi Utara.",
    },
    {
      id: 'page-takmir',
      title: "Struktur Kepengurusan Takmir Masjid Al Jami'ah",
      slug: 'struktur-takmir',
      subtitle:
        'Susunan Pengurus Badan Takmir & Kemakmuran Masjid Al Jami’ah IAIN Manado',
      content: `<p>Pengelolaan Masjid Al Jami'ah IAIN Manado dijalankan secara kolektif oleh Badan Takmir Masjid yang terdiri dari unsur pimpinan, dosen, tenaga kependidikan, serta perwakilan mahasiswa (Remaja Masjid Kampus).</p>
<h2>Bidang-Bidang Pelayanan Takmir</h2>
<ul>
<li><strong>Bidang Idarah (Manajemen & Administrasi):</strong> Mengelola kesekretariatan, penjadwalan penggunaan ruang, sistem informasi, dan pelaporan keuangan.</li>
<li><strong>Bidang Imarah (Kemakmuran, Ibadah & Dakwah):</strong> Mengatur jadwal imam, khatib Jumat, muadzin, kajian rutin ba'da sholat, serta pembinaan tahsin mahasiswa.</li>
<li><strong>Bidang Ri'ayah (Pemeliharaan, Kebersihan & Inventaris):</strong> Memastikan kebersihan ruang sujud, kesucian tempat wudhu, kelayakan tata suara (sound system), serta kenyamanan fasilitas masjid.</li>
</ul>
<p><em>Catatan: Daftar nama personil pengurus periode berjalan dapat diperbarui langsung oleh Admin melalui menu Halaman & Menu di Dashboard Admin.</em></p>`,
      updatedAt: '2026-10-23',
      status: 'PUBLISHED',
      seoTitle: "Struktur Pengurus Takmir Masjid Al Jami'ah IAIN Manado",
      seoDescription:
        "Susunan bidang pelayanan Idarah, Imarah, dan Ri'ayah pada Badan Takmir Masjid Al Jami'ah IAIN Manado.",
    },
    {
      id: 'page-sop',
      title: 'SOP Peminjaman Fasilitas & Adab di Masjid Kampus',
      slug: 'sop-peminjaman',
      subtitle:
        'Panduan Penggunaan Aula, Pelataran, dan Inventaris Masjid Al Jami’ah',
      content: `<p>Untuk menjaga kekhusyukan ibadah sekaligus mendukung kelancaran kegiatan akademik kemahasiswaan, setiap peminjam fasilitas di Masjid Al Jami'ah IAIN Manado wajib mengikuti prosedur berikut:</p>
<h2>Prosedur Pengajuan</h2>
<ol>
<li>Mengisi formulir pengajuan daring pada bagian <strong>Layanan Masjid</strong> di website ini minimal 3 (tiga) hari sebelum pelaksanaan kegiatan.</li>
<li>Menyerahkan surat permohonan resmi dari pimpinan Fakultas, Lembaga, atau Pembina UKM/HMJ kepada Sekretariat Takmir.</li>
<li>Menerima konfirmasi persetujuan jadwal dari Bidang Kerumahtanggaan Takmir.</li>
</ol>
<h2>Ketentuan Selama Kegiatan Berlangsung</h2>
<ul>
<li>Seluruh peserta wajib menutup aurat sesuai syariat dan menjaga kesopanan di area masjid.</li>
<li>Kegiatan wajib dihentikan 15 menit sebelum adzan berkumandang dan baru dilanjutkan kembali setelah sholat berjamaah selesai.</li>
<li>Panitia pelaksana bertanggung jawab penuh atas kebersihan ruangan dan kerapian inventaris setelah acara berakhir.</li>
</ul>`,
      updatedAt: '2026-10-23',
      status: 'PUBLISHED',
      seoTitle: "SOP Peminjaman Aula & Fasilitas Masjid Al Jami'ah IAIN Manado",
      seoDescription:
        "Panduan lengkap prosedur dan syarat peminjaman aula, ruang diskusi, dan fasilitas Masjid Al Jami'ah IAIN Manado.",
    },
  ],
  menus: [
    {
      id: 'menu-1',
      label: 'Beranda',
      href: '/',
      order: 1,
      children: [],
    },
    {
      id: 'menu-2',
      label: 'Profil Masjid',
      href: '/p/profil-masjid',
      order: 2,
      children: [
        {
          id: 'sub-2-1',
          label: 'Sejarah & Visi Misi',
          href: '/p/profil-masjid',
        },
        {
          id: 'sub-2-2',
          label: 'Struktur Pengurus Takmir',
          href: '/p/struktur-takmir',
        },
        {
          id: 'sub-2-3',
          label: 'SOP Peminjaman Masjid',
          href: '/p/sop-peminjaman',
        },
      ],
    },
    {
      id: 'menu-3',
      label: 'Jadwal & Agenda',
      href: '/#jadwal-sholat',
      order: 3,
      children: [
        {
          id: 'sub-3-1',
          label: 'Jadwal Sholat 5 Waktu',
          href: '/#jadwal-sholat',
        },
        {
          id: 'sub-3-2',
          label: 'Kegiatan Masjid Hari Ini',
          href: '/#kegiatan',
        },
      ],
    },
    {
      id: 'menu-4',
      label: 'Keuangan',
      href: '/#keuangan',
      order: 4,
      children: [],
    },
    {
      id: 'menu-5',
      label: 'Layanan',
      href: '/#layanan',
      order: 5,
      children: [
        {
          id: 'sub-5-1',
          label: 'Layanan Umum & Fasilitas',
          href: '/#layanan',
        },
        {
          id: 'sub-5-2',
          label: 'Progres Rehabilitasi Masjid',
          href: '/rehabilitasi',
        },
        {
          id: 'sub-5-3',
          label: 'Layanan Mualaf Center',
          href: '/mualaf-center',
        },
      ],
    },
    {
      id: 'menu-6',
      label: 'Berita',
      href: '/berita',
      order: 6,
      children: [],
    },
  ],
  quotes: [
    {
      id: 'qt-1',
      arabicText:
        'إِنَّمَا يَعْمُرُ مَسَاجِدَ اللَّهِ مَنْ آمَنَ بِاللَّهِ وَالْيَوْمِ الْآخِرِ وَأَقَامَ الصَّلَاةَ وَآتَى الزَّكَاةَ وَلَمْ يَخْشَ إِلَّا اللَّهَ',
      translation:
        'Sesungguhnya yang memakmurkan masjid-masjid Allah hanyalah orang-orang yang beriman kepada Allah dan hari kemudian, serta tetap mendirikan sholat, menunaikan zakat, dan tidak takut kepada siapa pun selain kepada Allah.',
      source: 'QS. At-Taubah: 18',
      active: true,
    },
    {
      id: 'qt-2',
      arabicText:
        'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ',
      translation:
        'Barang siapa menempuh suatu jalan untuk menuntut ilmu, maka Allah akan memudahkan baginya jalan menuju surga.',
      source: 'HR. Muslim No. 2699',
      active: true,
    },
    {
      id: 'qt-3',
      arabicText:
        'سَوُّوا صُفُوفَكُمْ فَإِنَّ تَسْوِيَةَ الصُّفُوفِ مِنْ إِقَامَةِ الصَّلَاةِ',
      translation:
        'Luruskanlah shaf-shaf kalian, karena sesungguhnya meluruskan shaf termasuk kesempurnaan mendirikan sholat.',
      source: 'HR. Bukhari No. 723 & Muslim No. 433',
      active: true,
    },
  ],
  tvSettings: {
    slideDurationSeconds: 12,
    showFinanceSlide: true,
    showQuoteSlide: true,
    showEventSlide: true,
    enableBeepSound: true,
    runningText: [
      "Selamat datang di Masjid Al Jami'ah IAIN Manado. Mohon menonaktifkan atau mengubah dering telepon genggam ke mode hening selama berada di ruang ibadah.",
      'Ikuti Kajian Rutin Ba’da Maghrib setiap hari kerja dan Halaqah Tahsin Al-Qur’an Mahasiswa setiap sore ba’da Ashar.',
      'Laporan keuangan kas operasional, pembangunan, dan sosial ZISWAF diperbarui secara berkala melalui portal web dan layar informasi masjid.',
    ],
    shafWarningText:
      'Harap luruskan dan rapatkan shaf, serta pastikan telepon genggam dalam keadaan hening sebelum sholat berjamaah dimulai.',
  },
  users: [
    {
      id: 'usr-1',
      username: 'admin',
      name: "Admin Utama Takmir Al Jami'ah",
      role: 'SUPER_ADMIN',
    },
  ],
};

export function readMosqueDb(): MosqueDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(
        DB_FILE_PATH,
        JSON.stringify(INITIAL_MOSQUE_DATA, null, 2),
        'utf-8'
      );
      return INITIAL_MOSQUE_DATA;
    }
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<MosqueDatabase>;

    // Strip any legacy sample/dummy records even if present in an older JSON file
    const cleanedTransactions = (parsed.transactions || []).filter(
      (t) => !LEGACY_DUMMY_TRX_IDS.has(t.id)
    );
    const cleanedEvents = (parsed.events || []).filter(
      (e) => !LEGACY_DUMMY_EVENT_IDS.has(e.id)
    );
    const cleanedNews = (parsed.news || []).filter(
      (n) => !LEGACY_DUMMY_NEWS_IDS.has(n.id)
    );
    const cleanedProjects = (parsed.rehabSettings?.projects || []).filter(
      (p) => !LEGACY_DUMMY_PROJECT_IDS.has(p.id)
    );

    const filteredMenus = (parsed.menus || INITIAL_MOSQUE_DATA.menus)
      .filter(
        (m) => m.href !== '/tv' && m.label.toLowerCase() !== 'mode tv masjid'
      )
      .map((m) => {
        if (m.id === 'menu-5' || m.label.toLowerCase() === 'layanan') {
          const existingChildren = m.children || [];
          const hasRehab = existingChildren.some(
            (c) => c.href === '/rehabilitasi'
          );
          const hasMualaf = existingChildren.some(
            (c) => c.href === '/mualaf-center'
          );
          const hasGeneral = existingChildren.some(
            (c) => c.href === '/#layanan'
          );
          const nextChildren = [...existingChildren];

          if (!hasGeneral) {
            nextChildren.unshift({
              id: 'sub-5-1',
              label: 'Layanan Umum & Fasilitas',
              href: '/#layanan',
            });
          }
          if (!hasRehab) {
            nextChildren.push({
              id: 'sub-5-2',
              label: 'Progres Rehabilitasi Masjid',
              href: '/rehabilitasi',
            });
          }
          if (!hasMualaf) {
            nextChildren.push({
              id: 'sub-5-3',
              label: 'Layanan Mualaf Center',
              href: '/mualaf-center',
            });
          }
          return {
            ...m,
            children: nextChildren,
          };
        }
        return m;
      });

    const parsedJumat = parsed.prayerSettings?.jumatOfficer;
    const cleanedJumatOfficer =
      parsedJumat &&
      !parsedJumat.date.includes('Data Contoh') &&
      !parsedJumat.khatib.includes('Diatur via Admin')
        ? parsedJumat
        : INITIAL_MOSQUE_DATA.prayerSettings.jumatOfficer;

    const rawAccountNumber = parsed.donationInfo?.accountNumber || '-';
    const cleanedAccountNumber = rawAccountNumber.includes('DIATUR DI ADMIN')
      ? '-'
      : rawAccountNumber;

    return {
      ...INITIAL_MOSQUE_DATA,
      ...parsed,
      transactions: cleanedTransactions,
      events: cleanedEvents,
      news: cleanedNews,
      menus: filteredMenus,
      rehabSettings: {
        ...INITIAL_MOSQUE_DATA.rehabSettings,
        ...(parsed.rehabSettings || {}),
        projects: cleanedProjects,
      },
      mualafCenter: {
        ...INITIAL_MOSQUE_DATA.mualafCenter,
        ...(parsed.mualafCenter || {}),
        requirements:
          parsed.mualafCenter?.requirements ??
          INITIAL_MOSQUE_DATA.mualafCenter.requirements,
        steps:
          parsed.mualafCenter?.steps ?? INITIAL_MOSQUE_DATA.mualafCenter.steps,
        programs:
          parsed.mualafCenter?.programs ??
          INITIAL_MOSQUE_DATA.mualafCenter.programs,
        mentors:
          parsed.mualafCenter?.mentors ??
          INITIAL_MOSQUE_DATA.mualafCenter.mentors,
        submissions: parsed.mualafCenter?.submissions ?? [],
      },
      mosqueProfile: {
        ...INITIAL_MOSQUE_DATA.mosqueProfile,
        ...(parsed.mosqueProfile || {}),
      },
      donationInfo: {
        ...INITIAL_MOSQUE_DATA.donationInfo,
        ...(parsed.donationInfo || {}),
        accountNumber: cleanedAccountNumber,
        isSampleDataNotice: false,
        treasurerPin: parsed.donationInfo?.treasurerPin || '123456',
        treasurerName:
          parsed.donationInfo?.treasurerName || 'Bendahara Takmir Masjid',
      },
      footerSettings: {
        ...INITIAL_MOSQUE_DATA.footerSettings,
        ...(parsed.footerSettings || {}),
      },
      prayerSettings: {
        ...INITIAL_MOSQUE_DATA.prayerSettings,
        ...(parsed.prayerSettings || {}),
        jumatOfficer: cleanedJumatOfficer,
        adzanDurationMinutes: {
          ...INITIAL_MOSQUE_DATA.prayerSettings.adzanDurationMinutes!,
          ...(parsed.prayerSettings?.adzanDurationMinutes || {}),
        },
        prayerDurationMinutes: {
          ...INITIAL_MOSQUE_DATA.prayerSettings.prayerDurationMinutes!,
          ...(parsed.prayerSettings?.prayerDurationMinutes || {}),
        },
      },
    };
  } catch {
    return INITIAL_MOSQUE_DATA;
  }
}

export function writeMosqueDb(data: MosqueDatabase): MosqueDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  return data;
}

# TV Masjid Al Jami'ah IAIN Manado (Android TV Kiosk APK)

Aplikasi khusus Smart TV / Google TV / Android TV Box untuk menampilkan layar informasi **Masjid Al Jami'ah IAIN Manado** (`https://aljamiah.iain-manado.ac.id/tv?kiosk=1`) secara *fullscreen* 16:9 yang terkunci proporsional, anti tidur (*Keep Screen On*), dan mendukung *Auto-Start* otomatis saat TV dinyalakan.

## Fitur Utama
- **Leanback Banner Resmi Android TV**: Muncul langsung di jajaran aplikasi beranda utama Android TV / Google TV maupun Android TV Box.
- **Tampilan Terkunci 1920x1080 (`textZoom = 100%`)**: Mematikan pembesaran font otomatis bawaan pabrik TV sehingga tata letak selalu rapi dan tidak pernah acak-acakan di ukuran TV berapa pun.
- **Auto-Start Saat TV Dinyalakan**: Otomatis membuka layar TV masjid ketika listrik/TV baru dinyalakan (`BOOT_COMPLETED` & `QUICKBOOT_POWERON`).
- **Auto-Reconnect Jaringan**: Jika saat TV baru menyala WiFi belum tersambung, aplikasi akan menunggu dengan tampilan masjid dan otomatis memuat jadwal sholat begitu WiFi aktif.
- **Kendali Remote TV**:
  - **Tekan tombol `OK` 3 kali berturut-turut** (atau tahan tombol `OK` / tekan tombol `MENU`): Membuka menu **Pengaturan TV Masjid** (Muat Ulang, Aktif/Nonaktif Auto-Start, Izin Auto-Start Android 10+, Ubah URL Server, atau Keluar).
  - **Tekan tombol `BACK` 2 kali**: Keluar ke menu utama TV (mencegah keluar tidak sengaja).

## Cara Mengunduh & Memasang `.apk` ke TV
1. Buka repository GitHub -> tab **Actions** -> pilih workflow **Build APK Smart TV Masjid**.
2. Klik proses build paling atas (centang hijau), lalu di bagian **Artifacts** unduh **`tv-masjid-al-jamiah-apk`**.
3. Ekstrak file `.zip` tersebut untuk mendapatkan file **`tv-masjid-al-jamiah.apk`**.
4. Salin file `.apk` ke Flashdisk USB (atau kirim lewat aplikasi **Send Files to TV** dari HP), lalu install di Smart TV.
5. **Khusus Android TV / Google TV versi 10 ke atas (agar Auto-Start berjalan mulus):**
   - Buka aplikasi **TV Masjid Al Jami'ah**, tekan tombol **OK 3x** di remote TV.
   - Pilih menu **"3. Izin Auto-Start Android TV 10+"**, lalu aktifkan izin **Tampilkan di atas aplikasi lain (*Display over other apps*)** untuk aplikasi **TV Masjid Al Jami'ah**.

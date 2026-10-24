# Panduan Deployment & Konfigurasi Server: Portal Web & Smart TV Masjid Al Jami'ah IAIN Manado

**Dokumen Teknis untuk Tim Pengelola Server / UPT TIPD IAIN Manado**
- **Nama Aplikasi:** Portal Web Publik, Smart TV Display, & CMS Admin Masjid Al Jami'ah IAIN Manado
- **Repositori Git:** `https://github.com/n00b-sx/web-masjid-iain-manado.git`
- **Branch Utama:** `main`
- **Framework:** Next.js 15 (App Router, Mode `standalone` aktif)
- **Port Default:** `3000` (dapat diubah melalui environment variable `PORT`)

---

## 1. Spesifikasi Kebutuhan Server (System Requirements)

Sebelum memulai proses instalasi, pastikan server telah memiliki komponen berikut:
1. **Node.js:** Versi `20.x LTS` atau `22.x LTS` (Beserta `npm`).
2. **Git:** Terinstal untuk menarik kode dari GitHub.
3. **Process Manager:** `PM2` (disarankan agar aplikasi berjalan terus-menerus di latar belakang dan otomatis menyala saat server reboot).
4. **Web Server (Reverse Proxy):** Nginx, Apache, atau LiteSpeed.
5. **Ruang Penyimpanan & Hak Akses Tulis (Write Permission):**
   - Aplikasi menyimpan database konfigurasi/konten di folder `data/mosque-db.json`.
   - Aplikasi menyimpan unggahan gambar (foto kegiatan, banner hero, dan QRIS) di folder `public/uploads/`.
   - Pastikan user yang menjalankan proses Node.js memiliki izin baca-tulis (`chmod 755` / `chown`) pada kedua direktori tersebut.

---

## 2. Langkah Instalasi di Server Linux (VPS / Dedicated Server via SSH)

### Langkah 2.1: Clone Repositori dari GitHub
Masuk ke terminal SSH server dan arahkan ke direktori web (contoh: `/var/www/`):

```bash
cd /var/www
git clone https://github.com/n00b-sx/web-masjid-iain-manado.git
cd web-masjid-iain-manado
```

### Langkah 2.2: Konfigurasi Environment Variable
Buat file `.env.local` di direktori utama proyek untuk mendefinisikan domain resmi kampus (digunakan untuk pembuatan otomatis `sitemap.xml`, `robots.txt`, dan *meta tag* SEO/WhatsApp preview):

```bash
nano .env.local
```

Isi dengan konfigurasi berikut (sesuaikan dengan subdomain resmi yang dialokasikan oleh kampus):

```env
NEXT_PUBLIC_SITE_URL=https://masjid.iain-manado.ac.id
NODE_ENV=production
```

Simpan file (`Ctrl+O`, `Enter`, lalu `Ctrl+X`).

### Langkah 2.3: Instalasi Paket & Build Produksi
Jalankan perintah berikut untuk menginstal dependensi dan melakukan kompilasi produksi:

```bash
npm install
npm run build
```

Pastikan direktori penyimpanan data dan upload memiliki izin akses tulis:

```bash
mkdir -p data public/uploads
chmod -R 755 data public/uploads
```

### Langkah 2.4: Menjalankan Aplikasi dengan PM2
Agar aplikasi berjalan 24/7 di latar belakang (termasuk untuk melayani Smart TV di dalam masjid):

```bash
# Instal PM2 secara global jika belum tersedia
sudo npm install -g pm2

# Jalankan aplikasi pada port 3000 (atau ubah angka 3000 jika port tersebut sudah dipakai aplikasi lain)
PORT=3000 pm2 start npm --name "masjid-iain-manado" -- start

# Simpan daftar proses PM2 agar otomatis berjalan saat server restart
pm2 save
pm2 startup
```

Untuk memeriksa status aplikasi atau melihat log:
```bash
pm2 status
pm2 logs masjid-iain-manado
```

---

## 3. Konfigurasi Reverse Proxy (Subdomain Kampus)

### Opsi A: Menggunakan Nginx (Direkomendasikan)
Buat file konfigurasi virtual host baru di `/etc/nginx/sites-available/masjid.iain-manado.ac.id`:

```nginx
server {
    listen 80;
    server_name masjid.iain-manado.ac.id;

    # Batas maksimal ukuran upload file gambar di Admin (10 MB)
    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktifkan konfigurasi dan muat ulang Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/masjid.iain-manado.ac.id /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Aktifkan HTTPS (SSL Gratis Let's Encrypt):
```bash
sudo certbot --nginx -d masjid.iain-manado.ac.id
```

### Opsi B: Menggunakan Apache (`mod_proxy`)
Jika server kampus menggunakan Apache2, pastikan modul `proxy` dan `proxy_http` sudah aktif (`sudo a2enmod proxy proxy_http`), lalu gunakan konfigurasi VirtualHost berikut:

```apache
<VirtualHost *:80>
    ServerName masjid.iain-manado.ac.id

    ProxyPreserveHost On
    ProxyRequests Off
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/

    ErrorLog ${APACHE_LOG_DIR}/masjid-error.log
    CustomLog ${APACHE_LOG_DIR}/masjid-access.log combined
</VirtualHost>
```

---

## 4. Alternatif Instalasi pada Panel Hosting (cPanel / aaPanel)

Jika server internal kampus menggunakan **aaPanel** atau **cPanel**:

1. **Melalui aaPanel:**
   - Buka menu **Website** -> tab **Node Project** -> klik **Add Node Project**.
   - Arahkan **Path** ke folder hasil `git clone` (`/www/wwwroot/web-masjid-iain-manado`).
   - Pilih **Run Opt:** `start (next start)` dan **Port:** `3000`.
   - Masukkan **Domain:** `masjid.iain-manado.ac.id` dan centang **Bind Extranet**.
2. **Melalui cPanel:**
   - Buka menu **Git Version Control**, lakukan *clone* dari `https://github.com/n00b-sx/web-masjid-iain-manado.git`.
   - Buka menu **Setup Node.js App**, pilih **Node.js 20/22**, mode **Production**, arahkan **Application Root** ke folder repo, dan **Application Startup File** ke `node_modules/next/dist/bin/next` dengan argumen `start`.

---

## 5. Prosedur Update Aplikasi di Kemudian Hari (Via Git)

Apabila tim pengembang melakukan pembaruan fitur di GitHub, tim server dapat memperbarui aplikasi **tanpa menghapus data kas, berita, atau foto yang sudah diunggah oleh pengurus masjid** dengan langkah berikut:

```bash
cd /var/www/web-masjid-iain-manado

# 1. Cadangkan data JSON masjid terlebih dahulu sebelum pull
cp data/mosque-db.json data/mosque-db.backup.json

# 2. Tarik perubahan kode terbaru dari GitHub
git stash
git pull origin main

# 3. Kembalikan database JSON produksi yang berisi data riil masjid
cp data/mosque-db.backup.json data/mosque-db.json

# 4. Build ulang dan restart proses PM2
npm install
npm run build
pm2 restart masjid-iain-manado
```

---

## 6. Daftar Rute Penting & Kredensial Awal

Setelah aplikasi berjalan, verifikasi rute-rute berikut:
1. **Halaman Utama Publik:** `https://masjid.iain-manado.ac.id/`
2. **Halaman Arsip Berita:** `https://masjid.iain-manado.ac.id/berita`
3. **Halaman Khusus Layar Smart TV Masjid (16:9):** `https://masjid.iain-manado.ac.id/tv`
   *(Buka URL ini pada browser Smart TV LED di dalam ruang utama masjid dan klik tombol "Layar Penuh")*.
4. **Halaman Dashboard Admin CMS:** `https://masjid.iain-manado.ac.id/admin`
   - **Username Default:** `admin`
   - **Password Default:** `aljamiah2026`
5. **Indeksasi SEO Google Search Console:**
   - Sitemap XML: `https://masjid.iain-manado.ac.id/sitemap.xml`
   - Robots.txt: `https://masjid.iain-manado.ac.id/robots.txt`

# Panduan Hosting - Aparel Khas Papua Store

Project ini didesain sebagai **Fullstack Node.js + React Application** yang terintegrasi (Unified Build). 
Artinya, backend server Node.js (Express) kamu bertindak sekaligus untuk menyajikan file-file frontend React (`dist/spa`). 

Karena itu, **kamu tidak perlu memisahkannya ke Vercel**. Cara termudah, tercepat, dan paling direkomendasikan adalah melakukan deploy **satu project ini sekaligus** di platform seperti **Railway.app** atau **Render.com**.

Berikut adalah langkah-langkah detailnya:

---

## 1. Hosting Database MySQL Online (Clever Cloud - Gratis & Stabil)
Karena database kamu saat ini di `localhost`, kamu perlu memindahkannya ke cloud agar web online bisa mengaksesnya.

1. Daftar akun gratis di [Clever Cloud](https://www.clever-cloud.com/).
2. Buat database baru: Klik **Create** -> **an add-on** -> Pilih **Cellar S3** atau **MySQL** (Pilih **MySQL**).
3. Pilih plan gratisan (**Free** / **Dev**).
4. Setelah dibuat, klik add-on MySQL tersebut, masuk ke bagian **Configuration**. Kamu akan mendapatkan detail info koneksi:
   * **Host** (cth: `uq82x1...clevercloud.com`)
   * **Database Name** (cth: `bq91z...`)
   * **User** (cth: `u83n...`)
   * **Password** (cth: `xxxxxx`)
   * **Port** (cth: `3306`)
5. Buka software database-mu di laptop (DBeaver, Navicat, atau phpMyAdmin bawaan Clever Cloud).
6. Sambungkan ke MySQL online tersebut, lalu import file `server/schema.sql` untuk membuat tabel-tabelnya secara otomatis.

---

## 2. Hubungkan Project ke GitHub
Hosting modern memerlukan project-mu diunggah ke repositori GitHub terlebih dahulu.

1. Buat repositori baru di GitHub dengan nama bebas (misal: `aparel-khas-papua`).
2. Jalankan perintah git di terminal laptopmu:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for production hosting"
   git branch -M main
   git remote add origin URL_REPOSITORI_GITHUB_KAMU
   git push -u origin main
   ```

---

## 3. Hosting Web & Backend (Render.com atau Railway.app)

### Opsi A: Menggunakan Railway.app (Sangat Cepat & Mudah)
1. Login/Daftar di [Railway.app](https://railway.app/) menggunakan akun GitHub.
2. Klik **New Project** -> **Deploy from GitHub repo** -> Pilih repositori project kamu.
3. Railway secara otomatis membaca `package.json` dan mendeteksi bahwa ini adalah project Node.js.
4. Masuk ke tab **Variables** di Railway untuk menyeting `.env` online kamu:
   * `NODE_ENV` = `production`
   * `PORT` = `3000` (atau biarkan default Railway)
   * `DB_HOST` = `[Isi dengan Host MySQL Clever Cloud kamu]`
   * `DB_PORT` = `3306`
   * `DB_USER` = `[Isi dengan User MySQL Clever Cloud kamu]`
   * `DB_PASSWORD` = `[Isi dengan Password MySQL Clever Cloud kamu]`
   * `DB_NAME` = `[Isi dengan Database Name MySQL Clever Cloud kamu]`
   * `JWT_SECRET` = `[Isi dengan string acak bebas untuk pengamanan token]`
5. Selesai! Web akan ter-deploy otomatis dan Railway akan memberikan link domain gratis (cth: `aparel-khas-papua.up.railway.app`).

---

### Opsi B: Menggunakan Render.com (Gratis Selamanya)
1. Login/Daftar di [Render.com](https://render.com/) menggunakan akun GitHub.
2. Klik **New** -> **Web Service**.
3. Hubungkan akun GitHub dan pilih repositori project kamu.
4. Isi konfigurasi berikut:
   * **Name**: `aparel-khas-papua`
   * **Runtime**: `Node`
   * **Build Command**: `npm run build`
   * **Start Command**: `npm start`
5. Scroll ke bawah, klik tombol **Advanced** -> **Add Environment Variable** lalu masukkan variabel berikut:
   * `DB_HOST` = `[Host MySQL Clever Cloud kamu]`
   * `DB_PORT` = `3306`
   * `DB_USER` = `[User MySQL Clever Cloud kamu]`
   * `DB_PASSWORD` = `[Password MySQL Clever Cloud kamu]`
   * `DB_NAME` = `[Database Name MySQL Clever Cloud kamu]`
   * `JWT_SECRET` = `[String acak bebas]`
6. Klik **Create Web Service**. Proses deployment akan berjalan sekitar 2-3 menit. Setelah selesai, Render akan memberikan URL gratis untuk websitemu.

# Rencana Implementasi Backend Noken Papua Store

Dokumen ini menjelaskan langkah-langkah implementasi backend lengkap untuk e-commerce **Noken Papua Store** menggunakan Node.js, Express, MySQL, dan JWT. Seluruh endpoint dirancang agar langsung kompatibel dengan frontend React + Vite + TypeScript yang sudah ada.

---

## User Review Required

> [!IMPORTANT]
> **Integrasi dengan Vite Dev Server**  
> Kami akan membuat `server/app.js` sebagai entrypoint mandiri (agar bisa dijalankan dengan `npm run dev` dari folder `server`). Di saat yang sama, kami akan mengaitkan `server/app.js` ke `server/index.ts` agar integrasi dengan Vite dev server (`npm run dev` dari root) tetap berjalan dengan mulus tanpa mengubah konfigurasi frontend.

---

## Proposed Changes

Kami akan mengimplementasikan backend secara terstruktur dengan membagi pengerjaan ke dalam 11 modul utama.

### 📁 Modul 1: Setup Express, MySQL & Error Handler

Kami akan membuat middleware penanganan error global dan menyiapkan entrypoint `app.js`.

#### [NEW] [errorHandler.js](file:///Users/jeremysahertian/Documents/Jeremy%20Nathanael%20Sahertian/GABUNGAN%20FROND%20AND%20BACK/ContohPI/server/middleware/errorHandler.js)
* Membuat middleware handler error global untuk menangkap seluruh internal server error dan memformat responsenya sesuai dengan standar API Response:
  ```json
  {
    "success": false,
    "message": "Pesan error...",
    "error": {}
  }
  ```

#### [NEW] [app.js](file:///Users/jeremysahertian/Documents/Jeremy%20Nathanael%20Sahertian/GABUNGAN%20FROND%20AND%20BACK/ContohPI/server/app.js)
* Entrypoint utama Express server.
* Memuat seluruh router API, middleware CORS, parser JSON/urlencoded, static folder untuk `/uploads`, dan mengaktifkan `errorHandler`.
* Mendengarkan (listen) di `PORT` jika dijalankan secara mandiri.

#### [MODIFY] [index.ts](file:///Users/jeremysahertian/Documents/Jeremy%20Nathanael%20Sahertian/GABUNGAN%20FROND%20AND%20BACK/ContohPI/server/index.ts)
* Menghubungkan file `index.ts` untuk mengimpor instance `app` dari `app.js` dan mengekspor fungsi `createServer` agar kompatibel dengan sistem dev server Vite.

---

### 🔑 Modul 2: Authentication & User Profile

Menyediakan registrasi, login, penanganan password dengan bcrypt, JWT, profile management, dan ubah password.

#### [MODIFY] [authController.js](file:///Users/jeremysahertian/Documents/Jeremy%20Nathanael%20Sahertian/GABUNGAN%20FROND%20AND%20BACK/ContohPI/server/controllers/authController.js)
* Memastikan fungsi registrasi, login user, dan login admin mengembalikan token JWT.

#### [MODIFY] [userController.js](file:///Users/jeremysahertian/Documents/Jeremy%20Nathanael%20Sahertian/GABUNGAN%20FROND%20AND%20BACK/ContohPI/server/controllers/userController.js)
* Menambahkan endpoint profil user:
  * `getUserProfile` (GET `/api/users/profile`): Mengambil profil user yang sedang login.
  * `updateUserProfile` (PUT `/api/users/profile`): Mengupdate nama dan email user.
  * `changePassword` (PUT `/api/users/change-password`): Mengubah password dengan memverifikasi password lama terlebih dahulu menggunakan bcrypt.

#### [MODIFY] [userRoutes.js](file:///Users/jeremysahertian/Documents/Jeremy%20Nathanael%20Sahertian/GABUNGAN%20FROND%20AND%20BACK/ContohPI/server/routes/userRoutes.js)
* Menambahkan rute `/profile`, `/change-password`, dan rute CRUD admin lainnya.

---

### 🗂️ Modul 3: Categories
* Memastikan fungsionalitas CRUD kategori berjalan lancar di `categoryController.js` dan `categoryRoutes.js`.

---

### 📦 Modul 4: Products (Dengan Gambar Tambahan & Status Wishlist)
* Mengimplementasikan detail produk lengkap beserta status wishlist untuk user yang sedang login.
* Menyediakan upload gambar produk utama dan gambar galeri produk tambahan.

#### [MODIFY] [productController.js](file:///Users/jeremysahertian/Documents/Jeremy%20Nathanael%20Sahertian/GABUNGAN%20FROND%20AND%20BACK/ContohPI/server/controllers/productController.js)
* Menambahkan/memperbaiki rute berikut:
  * `getLatestProducts` (GET `/api/products/latest`): Mengambil produk terbaru.
  * `searchProducts` (GET `/api/products/search`): Pencarian produk.
  * `getProductById` (GET `/api/products/:id`): Mengembalikan informasi produk lengkap dengan detail kategori, list gambar galeri, rating rata-rata, jumlah review, list reviews, serta status `isWishlist` (true/false) jika user menyertakan JWT token.
  * `addProductImage` (POST `/api/products/:id/images`): Menambah gambar tambahan di galeri (`product_images`).
  * `deleteProductImage` (DELETE `/api/products/images/:id`): Menghapus gambar galeri produk.

#### [MODIFY] [productRoutes.js](file:///Users/jeremysahertian/Documents/Jeremy%20Nathanael%20Sahertian/GABUNGAN%20FROND%20AND%20BACK/ContohPI/server/routes/productRoutes.js)
* Mendaftarkan rute `/latest`, `/search`, rute galeri `:id/images`, dan `images/:id`.

---

### ❤️ Modul 5: Wishlist
* Memastikan validasi di `wishlistController.js` mencegah user menyimpan produk yang sama lebih dari satu kali ke dalam tabel `wishlists`.

---

### 🛒 Modul 6: Cart
* Memastikan sinkronisasi data keranjang belanja pembeli (`carts` & `cart_items`) berjalan dinamis di `cartController.js` & `cartRoutes.js`.

---

### 📋 Modul 7: Orders (Daftar Status Baru & Pengurangan Stok)
* Menyesuaikan flow status pesanan dengan siklus hidup: `pending` -> `waiting_payment` -> `paid` -> `processing` -> `shipped` -> `completed` -> `cancelled`.

#### [MODIFY] [orderController.js](file:///Users/jeremysahertian/Documents/Jeremy%20Nathanael%20Sahertian/GABUNGAN%20FROND%20AND%20BACK/ContohPI/server/controllers/orderController.js)
* Memperbarui `createOrder` agar:
  1. Mengurangi stok produk di tabel `products`.
  2. Menyimpan detail barang ke `order_items`.
  3. Mengosongkan keranjang belanja (`cart_items`) milik user setelah order berhasil dibuat.

---

### 💳 Modul 8: Payments (Dengan Rute Admin)
* Sinkronisasi status order otomatis ke `paid` saat admin memverifikasi pembayaran.

#### [MODIFY] [paymentController.js](file:///Users/jeremysahertian/Documents/Jeremy%20Nathanael%20Sahertian/GABUNGAN%20FROND%20AND%20BACK/ContohPI/server/controllers/paymentController.js)
* Menambahkan `getAllPaymentsAdmin` (GET `/api/payments/admin`).
* Menyempurnakan `verifyPayment` agar memperbarui status order terkait menjadi `paid`.

#### [MODIFY] [paymentRoutes.js](file:///Users/jeremysahertian/Documents/Jeremy%20Nathanael%20Sahertian/GABUNGAN%20FROND%20AND%20BACK/ContohPI/server/routes/paymentRoutes.js)
* Mendaftarkan endpoint admin `/admin`.

---

### 🚚 Modul 9: Shipments (Hubungan Status Completed)
* Sinkronisasi status order otomatis ke `completed` saat pengiriman dinyatakan selesai (`delivered`).

#### [MODIFY] [shipmentController.js](file:///Users/jeremysahertian/Documents/Jeremy%20Nathanael%20Sahertian/GABUNGAN%20FROND%20AND%20BACK/ContohPI/server/controllers/shipmentController.js)
* Menambahkan `getShipmentByOrderId` (GET `/api/shipments/order/:orderId`).
* Mengupdate `updateShipment` agar ketika status pengiriman diset menjadi `delivered`, status order otomatis diset menjadi `completed`.

#### [MODIFY] [shipmentRoutes.js](file:///Users/jeremysahertian/Documents/Jeremy%20Nathanael%20Sahertian/GABUNGAN%20FROND%20AND%20BACK/ContohPI/server/routes/shipmentRoutes.js)
* Menambahkan rute `/order/:orderId`.

---

### ⭐ Modul 10: Reviews (Validasi Pembelian)
* Ulasan produk hanya boleh diberikan oleh pengguna terdaftar yang sudah pernah membeli produk tersebut secara sukses.

#### [MODIFY] [reviewController.js](file:///Users/jeremysahertian/Documents/Jeremy%20Nathanael%20Sahertian/GABUNGAN%20FROND%20AND%20BACK/ContohPI/server/controllers/reviewController.js)
* Memodifikasi `createReview` agar:
  1. Wajib menggunakan JWT token untuk mengekstrak identitas user (tidak menerima `userName` mentah dari body).
  2. Mengecek ke database apakah user bersangkutan memiliki order dengan status `completed` yang berisi produk (`productId`) yang akan direview. Jika belum pernah membeli, tolak request.

---

### 📊 Modul 11: Dashboard Admin (Monthly Sales)
* Menambahkan data penjualan bulanan untuk panel statistik dasbor admin.

#### [MODIFY] [dashboardController.js](file:///Users/jeremysahertian/Documents/Jeremy%20Nathanael%20Sahertian/GABUNGAN%20FROND%20AND%20BACK/ContohPI/server/controllers/dashboardController.js)
* Menambahkan parameter `monthlySales` (grafik tren penjualan bulanan selama 12 bulan terakhir) ke dalam data kembalian dasbor admin.

---

## Verification Plan

### Automated Tests
* Menjalankan perintah kompilasi server untuk memastikan tidak ada kesalahan impor maupun tipe data:
  ```bash
  npm run typecheck
  ```

### Manual Verification
1. Menjalankan server lokal menggunakan `npm run dev`.
2. Melakukan tes endpoint autentikasi (`/register` & `/login`) menggunakan REST Client.
3. Melakukan tes flow transaksi dari checkout produk hingga verifikasi pembayaran oleh admin untuk memastikan integrasi data keranjang dan stok bekerja dengan benar.

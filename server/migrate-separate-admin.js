import pool from './config/db.js';
import bcrypt from 'bcrypt';

async function migrate() {
  try {
    console.log("Memulai migrasi pemisahan admin...");

    // 1. Buat tabel admins jika belum ada
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✅ Tabel 'admins' siap.");

    // 2. Cek apakah admin@nokenpapua.com sudah ada di tabel admins
    const [existingAdmin] = await pool.query('SELECT id FROM admins WHERE email = ?', ['admin@nokenpapua.com']);
    if (existingAdmin.length === 0) {
      // Hash password 'admin123'
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO admins (name, email, password) VALUES (?, ?, ?)',
        ['Super Admin', 'admin@nokenpapua.com', hashedPassword]
      );
      console.log("✅ Default admin (admin@nokenpapua.com) berhasil di-seed di tabel 'admins'.");
    } else {
      console.log("ℹ️ Akun admin@nokenpapua.com sudah ada di tabel 'admins'.");
    }

    // 3. Hapus baris dengan email admin@nokenpapua.com di tabel users
    const [deleteResult] = await pool.query('DELETE FROM users WHERE email = ?', ['admin@nokenpapua.com']);
    if (deleteResult.affectedRows > 0) {
      console.log(`✅ Berhasil menghapus ${deleteResult.affectedRows} baris admin lama dari tabel 'users'.`);
    } else {
      console.log("ℹ️ Tidak ada baris admin dengan email admin@nokenpapua.com di tabel 'users'.");
    }

    console.log("🎉 Migrasi pemisahan admin sukses!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Kesalahan migrasi:", error);
    process.exit(1);
  }
}

migrate();

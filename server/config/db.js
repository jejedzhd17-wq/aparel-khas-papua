import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'apparel_papua',
  waitForConnections: true,
  connectionLimit: process.env.DB_HOST && process.env.DB_HOST !== 'localhost' ? 1 : 10,
  queueLimit: 0,
  timezone: '+07:00',
  // SSL untuk cloud database (Clever Cloud, PlanetScale, dll)
  ssl: process.env.DB_HOST && process.env.DB_HOST !== 'localhost'
    ? { rejectUnauthorized: false }
    : undefined,
});

// Test koneksi saat startup
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database MySQL terhubung:', process.env.DB_NAME);
    connection.release();
  } catch (error) {
    console.error('❌ Gagal koneksi database:', error.message);
    console.warn('⚠️  Server tetap berjalan. Pastikan MySQL aktif dan database "apparel_papua" sudah dibuat agar fitur backend berfungsi.');
  }
}

export default pool;

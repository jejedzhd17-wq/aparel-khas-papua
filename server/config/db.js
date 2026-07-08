import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const isCloud = process.env.DB_HOST && process.env.DB_HOST !== 'localhost';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'apparel_papua',
  waitForConnections: true,
  // Serverless: max 1 connection per function container
  // Local dev: allow 10 connections
  connectionLimit: isCloud ? 1 : 10,
  queueLimit: 0,
  timezone: '+07:00',
  // Aggressively release idle connections on cloud (serverless)
  idleTimeout: isCloud ? 10000 : 60000,       // 10s idle timeout on cloud
  maxIdle: isCloud ? 1 : 10,                   // max idle connections
  enableKeepAlive: isCloud ? false : true,     // disable keep-alive on serverless
  // SSL for cloud databases
  ssl: isCloud ? { rejectUnauthorized: false } : undefined,
  // Shorter connect timeout to fail fast
  connectTimeout: isCloud ? 10000 : 30000,
});

// Test koneksi saat startup
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database MySQL terhubung:', process.env.DB_NAME || 'apparel_papua');
    connection.release();
  } catch (error) {
    console.error('❌ Gagal koneksi database:', error.message);
    console.warn('⚠️  Server tetap berjalan. Pastikan MySQL aktif dan database sudah dibuat.');
  }
}

export default pool;

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

// Helper: generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ─── POST /api/auth/register ─────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Validasi input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Semua field harus diisi (name, email, password)',
      });
    }

    if (!phone || phone.trim().length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Nomor HP wajib diisi (minimal 8 digit)',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter',
      });
    }

    // Cek apakah email sudah terdaftar
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar',
      });
    }

    // Simpan user ke database (password disimpan apa adanya untuk demo)
    const [result] = await pool.query(
      'INSERT INTO users (nama, email, password, role, alamat, no_hp) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email.toLowerCase(), password, 'user', address || null, phone || null]
    );

    const userId = result.insertId;

    // Generate token
    const token = generateToken({ id: userId, email: email.toLowerCase(), role: 'user' });

    return res.status(201).json({
      success: true,
      message: 'Akun berhasil dibuat',
      data: {
        token,
        user: { 
          id: userId, 
          name, 
          email: email.toLowerCase(), 
          role: 'user',
          address: address || null,
          phone: phone || null
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password harus diisi',
      });
    }

    // 1. Cari user di tabel users terlebih dahulu
    const [users] = await pool.query(
      'SELECT id, nama as name, email, password, role, alamat, no_hp FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    let user;
    if (users.length > 0) {
      user = users[0];
    } else {
      // 2. Jika tidak ada di tabel users, cari di tabel admins
      const [admins] = await pool.query(
        'SELECT id, nama as name, email, password FROM admins WHERE email = ?',
        [email.toLowerCase()]
      );

      if (admins.length > 0) {
        user = {
          id: admins[0].id,
          name: admins[0].name,
          email: admins[0].email,
          password: admins[0].password,
          role: 'admin',
          alamat: null,
          no_hp: null,
        };
      }
    }

    // Jika tidak ditemukan di kedua tabel
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email tidak terdaftar. Silakan daftar terlebih dahulu.',
      });
    }

    // Verifikasi password — user pakai plain text, admin pakai bcrypt
    let isPasswordValid;
    if (user.role === 'admin') {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      isPasswordValid = (password === user.password);
    }
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Password salah',
      });
    }

    // Generate token
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          address: user.alamat,
          phone: user.no_hp
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── POST /api/auth/admin/login ───────────────────────────────────
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password harus diisi',
      });
    }

    // Cari admin berdasarkan email dari tabel admins
    const [admins] = await pool.query(
      'SELECT id, nama as name, email, password FROM admins WHERE email = ?',
      [email.toLowerCase()]
    );

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah',
      });
    }

    const admin = admins[0];

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah',
      });
    }

    // Generate token dengan role 'admin'
    const token = generateToken({ id: admin.id, email: admin.email, role: 'admin' });

    return res.status(200).json({
      success: true,
      message: 'Login admin berhasil',
      data: {
        token,
        user: { id: admin.id, name: admin.name, email: admin.email, role: 'admin' },
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, nama as name, email, role, alamat, no_hp, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan',
      });
    }

    const user = users[0];

    return res.status(200).json({
      success: true,
      message: 'Data user berhasil diambil',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.alamat,
        phone: user.no_hp,
        createdAt: user.created_at
      },
    });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── POST /api/auth/logout ────────────────────────────────────────
export const logout = async (req, res) => {
  // JWT stateless — logout di sisi client dengan menghapus token
  return res.status(200).json({
    success: true,
    message: 'Logout berhasil. Silakan hapus token di sisi client.',
  });
};

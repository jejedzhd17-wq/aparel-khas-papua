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

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, address, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email.toLowerCase(), hashedPassword, 'user', address || null, phone || null]
    );

    const userId = result.insertId;
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
          phone: phone || null,
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

    // Cari user di tabel users
    const [users] = await pool.query(
      'SELECT id, name, email, password, role, address, phone FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email tidak terdaftar. Silakan daftar terlebih dahulu.',
      });
    }

    const user = users[0];

    // Verifikasi password
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch {
      isPasswordValid = (password === user.password);
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Password salah',
      });
    }

    const token = generateToken({ id: user.id, email: user.email, role: 'user' });

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'user',
          address: user.address,
          phone: user.phone,
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

    // Cari admin dari tabel admins yang terpisah
    const [admins] = await pool.query(
      "SELECT id, name, email, password FROM admins WHERE email = ?",
      [email.toLowerCase()]
    );

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah',
      });
    }

    const admin = admins[0];

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah',
      });
    }

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
    let query = 'SELECT id, name, email, role, address, phone, created_at FROM users WHERE id = ?';
    if (req.user.role === 'admin') {
      query = 'SELECT id, name, email, created_at FROM admins WHERE id = ?';
    }

    const [results] = await pool.query(query, [req.user.id]);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User/Admin tidak ditemukan',
      });
    }

    const userOrAdmin = results[0];

    return res.status(200).json({
      success: true,
      message: 'Data user/admin berhasil diambil',
      data: {
        id: userOrAdmin.id,
        name: userOrAdmin.name,
        email: userOrAdmin.email,
        role: req.user.role,
        address: userOrAdmin.address || null,
        phone: userOrAdmin.phone || null,
        createdAt: userOrAdmin.created_at,
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
  return res.status(200).json({
    success: true,
    message: 'Logout berhasil. Silakan hapus token di sisi client.',
  });
};

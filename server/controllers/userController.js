import pool from '../config/db.js';
import bcrypt from 'bcrypt';

// ─── GET /api/users (admin) ───────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, nama as name, email, role, alamat as address, no_hp as phone, created_at as joinDate FROM users ORDER BY created_at DESC'
    );

    return res.status(200).json({
      success: true,
      message: 'Daftar user berhasil diambil',
      data: users,
    });
  } catch (error) {
    console.error('GetAllUsers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── GET /api/users/:id (admin) ───────────────────────────────────
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.query(
      'SELECT id, nama as name, email, role, alamat as address, no_hp as phone, created_at as joinDate FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Data user berhasil diambil',
      data: users[0],
    });
  } catch (error) {
    console.error('GetUserById error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── POST /api/users (admin) ──────────────────────────────────────
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role = 'user', address, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, dan password harus diisi',
      });
    }

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role harus user atau admin',
      });
    }

    // Cek email duplikat
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar',
      });
    }

    const [result] = await pool.query(
      'INSERT INTO users (nama, email, password, role, alamat, no_hp) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email.toLowerCase(), password, role, address || null, phone || null]
    );

    return res.status(201).json({
      success: true,
      message: 'User berhasil dibuat',
      data: { 
        id: result.insertId, 
        name, 
        email: email.toLowerCase(), 
        role,
        address: address || null,
        phone: phone || null
      },
    });
  } catch (error) {
    console.error('CreateUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── PUT /api/users/:id (admin) ───────────────────────────────────
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, address, phone } = req.body;

    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan',
      });
    }

    const updateFields = [];
    const updateValues = [];

    if (name) { updateFields.push('nama = ?'); updateValues.push(name); }
    if (email) { updateFields.push('email = ?'); updateValues.push(email.toLowerCase()); }
    if (role && ['user', 'admin'].includes(role)) { updateFields.push('role = ?'); updateValues.push(role); }
    if (address !== undefined) { updateFields.push('alamat = ?'); updateValues.push(address); }
    if (phone !== undefined) { updateFields.push('no_hp = ?'); updateValues.push(phone); }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada data yang diupdate',
      });
    }

    updateValues.push(id);
    await pool.query(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);

    const [updatedUser] = await pool.query(
      'SELECT id, nama as name, email, role, alamat as address, no_hp as phone, created_at as joinDate FROM users WHERE id = ?',
      [id]
    );

    return res.status(200).json({
      success: true,
      message: 'User berhasil diupdate',
      data: updatedUser[0],
    });
  } catch (error) {
    console.error('UpdateUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── DELETE /api/users/:id (admin) ────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Cegah admin menghapus diri sendiri
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus akun sendiri',
      });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan',
      });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'User berhasil dihapus',
    });
  } catch (error) {
    console.error('DeleteUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

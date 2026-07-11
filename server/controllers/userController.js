import pool from '../config/db.js';
import bcrypt from 'bcrypt';

// ─── GET /api/users (admin) ───────────────────────────────────────
// Union both tables to list all users and admins in the dashboard
export const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT id, name, email, 'user' as role, address, phone, created_at as joinDate FROM users
      UNION ALL
      SELECT id, name, email, 'admin' as role, NULL as address, NULL as phone, created_at as joinDate FROM admins
      ORDER BY joinDate DESC
    `);

    return res.status(200).json({
      success: true,
      message: 'Daftar user & admin berhasil diambil',
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

    // Check users table first
    const [users] = await pool.query(
      'SELECT id, name, email, \'user\' as role, address, phone, created_at as joinDate FROM users WHERE id = ?',
      [id]
    );

    if (users.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'Data user berhasil diambil',
        data: users[0],
      });
    }

    // Check admins table next
    const [admins] = await pool.query(
      'SELECT id, name, email, \'admin\' as role, NULL as address, NULL as phone, created_at as joinDate FROM admins WHERE id = ?',
      [id]
    );

    if (admins.length > 0) {
      return res.status(200).json({
        success: true,
        message: 'Data admin berhasil diambil',
        data: admins[0],
      });
    }

    return res.status(404).json({
      success: false,
      message: 'User tidak ditemukan',
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

    // Check email uniqueness in both tables
    const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    const [existingAdmin] = await pool.query('SELECT id FROM admins WHERE email = ?', [email.toLowerCase()]);
    if (existingUser.length > 0 || existingAdmin.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let insertId;
    if (role === 'admin') {
      const [result] = await pool.query(
        'INSERT INTO admins (name, email, password) VALUES (?, ?, ?)',
        [name, email.toLowerCase(), hashedPassword]
      );
      insertId = result.insertId;
    } else {
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password, role, address, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email.toLowerCase(), hashedPassword, 'user', address || null, phone || null]
      );
      insertId = result.insertId;
    }

    return res.status(201).json({
      success: true,
      message: 'User/Admin berhasil dibuat',
      data: {
        id: insertId,
        name,
        email: email.toLowerCase(),
        role,
        address: role === 'admin' ? null : (address || null),
        phone: role === 'admin' ? null : (phone || null),
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

    // Check if user exists in users table
    const [existingUser] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    const isUser = existingUser.length > 0;

    // Check if admin exists in admins table
    const [existingAdmin] = await pool.query('SELECT id FROM admins WHERE id = ?', [id]);
    const isAdmin = existingAdmin.length > 0;

    if (!isUser && !isAdmin) {
      return res.status(404).json({
        success: false,
        message: 'User/Admin tidak ditemukan',
      });
    }

    if (isUser) {
      // Update in users table
      const updateFields = [];
      const updateValues = [];

      if (name)  { updateFields.push('name = ?');    updateValues.push(name); }
      if (email) { updateFields.push('email = ?');   updateValues.push(email.toLowerCase()); }
      if (address !== undefined) { updateFields.push('address = ?'); updateValues.push(address); }
      if (phone  !== undefined)  { updateFields.push('phone = ?');   updateValues.push(phone); }

      if (updateFields.length > 0) {
        updateValues.push(id);
        await pool.query(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);
      }
    } else {
      // Update in admins table
      const updateFields = [];
      const updateValues = [];

      if (name)  { updateFields.push('name = ?');    updateValues.push(name); }
      if (email) { updateFields.push('email = ?');   updateValues.push(email.toLowerCase()); }

      if (updateFields.length > 0) {
        updateValues.push(id);
        await pool.query(`UPDATE admins SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);
      }
    }

    // Fetch updated data
    let updatedData;
    if (isUser) {
      const [rows] = await pool.query(
        'SELECT id, name, email, \'user\' as role, address, phone, created_at as joinDate FROM users WHERE id = ?',
        [id]
      );
      updatedData = rows[0];
    } else {
      const [rows] = await pool.query(
        'SELECT id, name, email, \'admin\' as role, NULL as address, NULL as phone, created_at as joinDate FROM admins WHERE id = ?',
        [id]
      );
      updatedData = rows[0];
    }

    return res.status(200).json({
      success: true,
      message: 'Data berhasil diupdate',
      data: updatedData,
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

    // Check users table
    const [existingUser] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUser.length > 0) {
      await pool.query('DELETE FROM users WHERE id = ?', [id]);
      return res.status(200).json({
        success: true,
        message: 'User berhasil dihapus',
      });
    }

    // Check admins table
    const [existingAdmin] = await pool.query('SELECT id FROM admins WHERE id = ?', [id]);
    if (existingAdmin.length > 0) {
      // Prevent deleting self if current user is admin and targets their own ID
      if (parseInt(id) === req.user.id && req.user.role === 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Tidak dapat menghapus akun admin sendiri',
        });
      }
      await pool.query('DELETE FROM admins WHERE id = ?', [id]);
      return res.status(200).json({
        success: true,
        message: 'Admin berhasil dihapus',
      });
    }

    return res.status(404).json({
      success: false,
      message: 'User/Admin tidak ditemukan',
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

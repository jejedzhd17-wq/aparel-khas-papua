import pool from '../config/db.js';

// GET /api/bank-accounts — publik (untuk payment gateway)
export const getAllBankAccounts = async (req, res) => {
  try {
    const [accounts] = await pool.query(
      `SELECT id, type, name, account_number, account_holder, color, sort_order
       FROM bank_accounts
       WHERE is_active = 1
       ORDER BY sort_order ASC`
    );
    return res.json({ success: true, data: accounts });
  } catch (err) {
    console.error('getAllBankAccounts error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

// GET /api/bank-accounts/admin — semua termasuk nonaktif (khusus admin)
export const getAllBankAccountsAdmin = async (req, res) => {
  try {
    const [accounts] = await pool.query(
      `SELECT * FROM bank_accounts ORDER BY sort_order ASC`
    );
    return res.json({ success: true, data: accounts });
  } catch (err) {
    console.error('getAllBankAccountsAdmin error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

// POST /api/bank-accounts — tambah rekening baru (khusus admin)
export const createBankAccount = async (req, res) => {
  try {
    const { type, name, account_number, account_holder, color, sort_order, is_active } = req.body;
    if (!name || !account_number) {
      return res.status(400).json({ success: false, message: 'Nama dan nomor rekening harus diisi' });
    }
    const [result] = await pool.query(
      `INSERT INTO bank_accounts (type, name, account_number, account_holder, color, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [type || 'bank', name, account_number, account_holder || 'Aparel Papua Store', color || '#005CA5', sort_order || 0, is_active !== undefined ? is_active : 1]
    );
    return res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (err) {
    console.error('createBankAccount error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

// PUT /api/bank-accounts/:id — update rekening (khusus admin)
export const updateBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, name, account_number, account_holder, color, sort_order, is_active } = req.body;

    const fields = [];
    const values = [];
    if (type !== undefined) { fields.push('type = ?'); values.push(type); }
    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (account_number !== undefined) { fields.push('account_number = ?'); values.push(account_number); }
    if (account_holder !== undefined) { fields.push('account_holder = ?'); values.push(account_holder); }
    if (color !== undefined) { fields.push('color = ?'); values.push(color); }
    if (sort_order !== undefined) { fields.push('sort_order = ?'); values.push(sort_order); }
    if (is_active !== undefined) { fields.push('is_active = ?'); values.push(is_active ? 1 : 0); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada data yang diubah' });
    }

    values.push(id);
    await pool.query(`UPDATE bank_accounts SET ${fields.join(', ')} WHERE id = ?`, values);
    return res.json({ success: true, message: 'Rekening berhasil diupdate' });
  } catch (err) {
    console.error('updateBankAccount error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

// DELETE /api/bank-accounts/:id (khusus admin)
export const deleteBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM bank_accounts WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Rekening berhasil dihapus' });
  } catch (err) {
    console.error('deleteBankAccount error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
};

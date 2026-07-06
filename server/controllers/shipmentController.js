import pool from '../config/db.js';

// ─── Helper: Generate timeline pengiriman dinamis ───────────────────
const generateTimeline = (shipment) => {
  const { kurir, resi, status_pengiriman, tanggal_kirim } = shipment;

  const dateFormatted = tanggal_kirim
    ? new Date(tanggal_kirim).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : '-';

  const isDikirim  = ['dikirim', 'shipped', 'in_transit', 'delivered', 'selesai'].includes(status_pengiriman);
  const isInTransit = ['in_transit', 'delivered', 'selesai'].includes(status_pengiriman);
  const isDelivered = ['delivered', 'selesai'].includes(status_pengiriman);

  return [
    {
      id: 1,
      label: 'Pesanan Diproses',
      date: dateFormatted,
      time: '-',
      completed: true,
      description: 'Penjual sedang menyiapkan paket Anda',
    },
    {
      id: 2,
      label: 'Paket Dikirim',
      date: isDikirim ? dateFormatted : '-',
      time: '-',
      completed: isDikirim,
      description: isDikirim
        ? `Paket diserahkan ke kurir ${kurir || '-'} dengan resi ${resi || '-'}`
        : 'Menunggu kurir menjemput barang',
    },
    {
      id: 3,
      label: 'Dalam Perjalanan',
      date: isInTransit ? dateFormatted : '-',
      time: '-',
      completed: isInTransit,
      description: isInTransit
        ? 'Paket sedang menuju ke alamat tujuan'
        : 'Paket belum masuk ke hub logistik terdekat',
    },
    {
      id: 4,
      label: 'Diterima',
      date: isDelivered ? dateFormatted : '-',
      time: '-',
      completed: isDelivered,
      description: isDelivered
        ? 'Paket telah berhasil diterima'
        : 'Menunggu hingga paket sampai ke tujuan',
    },
  ];
};

// ─── Helper: Parse kolom alamat_pengiriman ────────────────────────────
// Format di DB: "Nama\nInfo baris 2\nInfo baris 3\n..."
const parseAddress = (alamat) => {
  const lines = (alamat || '').split('\n').map((l) => l.trim()).filter(Boolean);
  const name = lines[0] || 'Pelanggan';
  const address = lines.length > 1 ? lines.slice(1).join(', ') : alamat || '-';
  return { name, address };
};

// ─── GET /api/shipments (Daftar shipment untuk user yang login) ─────
export const getUserShipments = async (req, res) => {
  try {
    const userId = req.user.id;

    const [shipments] = await pool.query(
      `SELECT s.id, s.order_id, s.kurir, s.resi, s.status_pengiriman, s.tanggal_kirim,
              o.alamat_pengiriman, o.total_harga
       FROM shipments s
       INNER JOIN orders o ON s.order_id = o.id
       WHERE o.user_id = ?
       ORDER BY s.tanggal_kirim DESC`,
      [userId]
    );

    const formatted = shipments.map((s) => {
      const { name, address } = parseAddress(s.alamat_pengiriman);
      return {
        id: s.id,
        orderId: s.order_id,
        trackingNumber: s.resi,
        courier: s.kurir,
        status: s.status_pengiriman || 'dikirim',
        shippingDate: s.tanggal_kirim,
        address,
        customerName: name,
        total: s.total_harga,
        timeline: generateTimeline(s),
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Daftar pengiriman berhasil diambil',
      data: formatted,
    });
  } catch (error) {
    console.error('GetUserShipments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// ─── GET /api/shipments/:id (Detail shipment by ID) ───────────────
export const getShipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const [shipments] = await pool.query(
      `SELECT s.id, s.order_id, s.kurir, s.resi, s.status_pengiriman, s.tanggal_kirim,
              o.alamat_pengiriman, o.total_harga, o.user_id
       FROM shipments s
       INNER JOIN orders o ON s.order_id = o.id
       WHERE s.id = ?`,
      [id]
    );

    if (shipments.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengiriman tidak ditemukan' });
    }

    const s = shipments[0];

    // Cek otorisasi: hanya admin atau pemilik order
    if (req.user.role !== 'admin' && s.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke pengiriman ini' });
    }

    // Ambil item-item dalam order
    const [items] = await pool.query(
      `SELECT oi.jumlah AS quantity, p.nama_produk AS name
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [s.order_id]
    );

    const { name, address } = parseAddress(s.alamat_pengiriman);

    return res.status(200).json({
      success: true,
      message: 'Detail pengiriman berhasil diambil',
      data: {
        id: s.id,
        orderId: s.order_id,
        trackingNumber: s.resi,
        courier: s.kurir,
        status: s.status_pengiriman || 'dikirim',
        shippingDate: s.tanggal_kirim,
        address,
        customerName: name,
        items,
        timeline: generateTimeline(s),
      },
    });
  } catch (error) {
    console.error('GetShipmentById error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── GET /api/shipments/track/:trackingNumber (Public – lacak via resi) ──
export const trackShipmentByResi = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const [shipments] = await pool.query(
      `SELECT s.id, s.order_id, s.kurir, s.resi, s.status_pengiriman, s.tanggal_kirim,
              o.alamat_pengiriman, o.total_harga
       FROM shipments s
       INNER JOIN orders o ON s.order_id = o.id
       WHERE s.resi = ?`,
      [trackingNumber]
    );

    if (shipments.length === 0) {
      return res.status(404).json({ success: false, message: 'Nomor resi tidak terdaftar' });
    }

    const s = shipments[0];

    // Ambil item-item dalam order
    const [items] = await pool.query(
      `SELECT oi.jumlah AS quantity, p.nama_produk AS name
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [s.order_id]
    );

    const { name, address } = parseAddress(s.alamat_pengiriman);

    return res.status(200).json({
      success: true,
      message: 'Pelacakan resi berhasil',
      data: {
        id: s.id,
        orderId: s.order_id,
        trackingNumber: s.resi,
        courier: s.kurir,
        status: s.status_pengiriman || 'dikirim',
        shippingDate: s.tanggal_kirim,
        address,
        customerName: name,
        items,
        timeline: generateTimeline(s),
      },
    });
  } catch (error) {
    console.error('TrackShipmentByResi error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── GET /api/shipments/admin (Semua pengiriman – admin only) ────────
export const getAllShipmentsAdmin = async (req, res) => {
  try {
    const [shipments] = await pool.query(
      `SELECT s.id, s.order_id, s.kurir, s.resi, s.status_pengiriman, s.tanggal_kirim,
              o.alamat_pengiriman
       FROM shipments s
       INNER JOIN orders o ON s.order_id = o.id
       ORDER BY s.tanggal_kirim DESC`
    );

    const formatted = shipments.map((s) => {
      const { name, address } = parseAddress(s.alamat_pengiriman);
      return {
        id: s.id,
        orderId: s.order_id,
        courier: s.kurir,
        trackingNumber: s.resi,
        status: s.status_pengiriman || 'dikirim',
        customerName: name,
        address,
        date: s.tanggal_kirim,
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Daftar semua pengiriman berhasil diambil',
      data: formatted,
    });
  } catch (error) {
    console.error('GetAllShipmentsAdmin error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── POST /api/shipments (Buat shipment baru – admin) ─────────────────
export const createShipment = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { orderId, courier, trackingNumber } = req.body;

    if (!orderId || !courier || !trackingNumber) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Order ID, kurir, dan nomor resi harus diisi',
      });
    }

    // Pastikan order ada
    const [orders] = await pool.query('SELECT id FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
    }

    // Cek apakah sudah ada shipment untuk order ini
    const [existing] = await pool.query('SELECT id FROM shipments WHERE order_id = ?', [orderId]);

    let insertId;
    if (existing.length > 0) {
      // Update saja jika sudah ada
      await connection.query(
        `UPDATE shipments
         SET kurir = ?, resi = ?, status_pengiriman = 'dikirim', tanggal_kirim = CURDATE()
         WHERE order_id = ?`,
        [courier, trackingNumber, orderId]
      );
      insertId = existing[0].id;
    } else {
      // Insert baru
      const [result] = await connection.query(
        `INSERT INTO shipments (order_id, kurir, resi, status_pengiriman, tanggal_kirim)
         VALUES (?, ?, ?, 'dikirim', CURDATE())`,
        [orderId, courier, trackingNumber]
      );
      insertId = result.insertId;
    }

    // Update status order menjadi 'dikirim'
    await connection.query("UPDATE orders SET status = 'dikirim' WHERE id = ?", [orderId]);

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Pengiriman berhasil didaftarkan',
      data: { id: insertId, orderId, courier, trackingNumber, status: 'dikirim' },
    });
  } catch (error) {
    await connection.rollback();
    console.error('CreateShipment error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  } finally {
    connection.release();
  }
};

// ─── PUT /api/shipments/:id (Update shipment – admin) ─────────────────
export const updateShipment = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { courier, trackingNumber, status } = req.body;

    const [shipments] = await pool.query('SELECT order_id FROM shipments WHERE id = ?', [id]);
    if (shipments.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Pengiriman tidak ditemukan' });
    }

    const { order_id } = shipments[0];

    await connection.query(
      `UPDATE shipments
       SET kurir = COALESCE(?, kurir),
           resi  = COALESCE(?, resi),
           status_pengiriman = COALESCE(?, status_pengiriman)
       WHERE id = ?`,
      [courier || null, trackingNumber || null, status || null, id]
    );

    // Sinkronkan status pesanan
    if (status === 'delivered' || status === 'selesai') {
      await connection.query("UPDATE orders SET status = 'selesai' WHERE id = ?", [order_id]);
    } else if (['dikirim', 'shipped', 'in_transit'].includes(status)) {
      await connection.query("UPDATE orders SET status = 'dikirim' WHERE id = ?", [order_id]);
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: 'Data pengiriman berhasil diperbarui',
      data: { id, courier, trackingNumber, status },
    });
  } catch (error) {
    await connection.rollback();
    console.error('UpdateShipment error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  } finally {
    connection.release();
  }
};

// ─── DELETE /api/shipments/:id (Hapus shipment – admin) ───────────────
export const deleteShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM shipments WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Pengiriman tidak ditemukan' });
    }
    return res.status(200).json({ success: true, message: 'Pengiriman berhasil dihapus' });
  } catch (error) {
    console.error('DeleteShipment error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

import pool from '../config/db.js';

// ─── Helper: generate timeline pengiriman ───────────────────────────
const generateTimeline = (shipment) => {
  const { courier, tracking_number, status, shipping_date } = shipment;
  const dateFormatted = shipping_date
    ? new Date(shipping_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : '-';

  const isShipped    = ['shipped', 'in_transit', 'delivered'].includes(status);
  const isInTransit  = ['in_transit', 'delivered'].includes(status);
  const isDelivered  = status === 'delivered';

  return [
    { id: 1, label: 'Pesanan Diproses',   date: dateFormatted, completed: true,        description: 'Penjual sedang menyiapkan paket Anda' },
    { id: 2, label: 'Paket Dikirim',      date: isShipped   ? dateFormatted : '-', completed: isShipped,
      description: isShipped ? `Paket diserahkan ke kurir ${courier || '-'} dengan resi ${tracking_number || '-'}` : 'Menunggu kurir menjemput barang' },
    { id: 3, label: 'Dalam Perjalanan',   date: isInTransit ? dateFormatted : '-', completed: isInTransit,
      description: isInTransit ? 'Paket sedang menuju ke alamat tujuan' : 'Paket belum masuk ke hub logistik terdekat' },
    { id: 4, label: 'Diterima',           date: isDelivered ? dateFormatted : '-', completed: isDelivered,
      description: isDelivered ? 'Paket telah berhasil diterima' : 'Menunggu hingga paket sampai ke tujuan' },
  ];
};

// Helper: format shipment object
const formatShipment = (s, items = []) => ({
  id: s.id,
  orderId:        s.order_id,
  trackingNumber: s.tracking_number,
  courier:        s.courier,
  status:         s.status || 'pending',
  shippingDate:   s.shipping_date,
  estimatedDelivery: s.estimated_delivery || null,
  address:        s.address   ? `${s.address}, ${s.city || ''}, ${s.province || ''}` : '-',
  customerName:   s.full_name || 'Pelanggan',
  total:          s.total ? parseFloat(s.total) : null,
  items,
  timeline: generateTimeline(s),
});

// ─── GET /api/shipments (Shipment milik user) ─────────────────────
export const getUserShipments = async (req, res) => {
  try {
    const userId = req.user.id;

    const [shipments] = await pool.query(
      `SELECT s.id, s.order_id, s.courier, s.tracking_number, s.status, s.shipping_date, s.estimated_delivery,
              o.full_name, o.address, o.city, o.province, o.total
       FROM shipments s
       INNER JOIN orders o ON s.order_id = o.id
       WHERE o.user_id = ?
       ORDER BY s.shipping_date DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Daftar pengiriman berhasil diambil',
      data: shipments.map(s => formatShipment(s)),
    });
  } catch (error) {
    console.error('GetUserShipments error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── GET /api/shipments/:id ───────────────────────────────────────
export const getShipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const [shipments] = await pool.query(
      `SELECT s.id, s.order_id, s.courier, s.tracking_number, s.status, s.shipping_date, s.estimated_delivery,
              o.full_name, o.address, o.city, o.province, o.total, o.user_id
       FROM shipments s
       INNER JOIN orders o ON s.order_id = o.id
       WHERE s.id = ?`,
      [id]
    );

    if (shipments.length === 0) return res.status(404).json({ success: false, message: 'Pengiriman tidak ditemukan' });

    const s = shipments[0];
    if (req.user.role !== 'admin' && s.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke pengiriman ini' });
    }

    const [items] = await pool.query(
      `SELECT oi.quantity, p.name FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`,
      [s.order_id]
    );

    return res.status(200).json({ success: true, message: 'Detail pengiriman berhasil diambil', data: formatShipment(s, items) });
  } catch (error) {
    console.error('GetShipmentById error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── GET /api/shipments/track/:trackingNumber (Public) ────────────
export const trackShipmentByResi = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const [shipments] = await pool.query(
      `SELECT s.id, s.order_id, s.courier, s.tracking_number, s.status, s.shipping_date, s.estimated_delivery,
              o.full_name, o.address, o.city, o.province, o.total
       FROM shipments s
       INNER JOIN orders o ON s.order_id = o.id
       WHERE s.tracking_number = ?`,
      [trackingNumber]
    );

    if (shipments.length === 0) return res.status(404).json({ success: false, message: 'Nomor resi tidak terdaftar' });

    const s = shipments[0];
    const [items] = await pool.query(
      `SELECT oi.quantity, p.name FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`,
      [s.order_id]
    );

    return res.status(200).json({ success: true, message: 'Pelacakan resi berhasil', data: formatShipment(s, items) });
  } catch (error) {
    console.error('TrackShipmentByResi error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── GET /api/shipments/admin (Admin) ────────────────────────────
export const getAllShipmentsAdmin = async (req, res) => {
  try {
    const [shipments] = await pool.query(
      `SELECT s.id, s.order_id, s.courier, s.tracking_number, s.status, s.shipping_date,
              o.full_name, o.address, o.city, o.province
       FROM shipments s
       INNER JOIN orders o ON s.order_id = o.id
       ORDER BY s.shipping_date DESC`
    );

    return res.status(200).json({
      success: true,
      message: 'Daftar semua pengiriman berhasil diambil',
      data: shipments.map(s => formatShipment(s)),
    });
  } catch (error) {
    console.error('GetAllShipmentsAdmin error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

// ─── POST /api/shipments (Admin – buat shipment baru) ──────────────
export const createShipment = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { orderId, courier, trackingNumber } = req.body;

    if (!orderId || !courier || !trackingNumber) {
      connection.release();
      return res.status(400).json({ success: false, message: 'Order ID, kurir, dan nomor resi harus diisi' });
    }

    const [orders] = await pool.query('SELECT id FROM orders WHERE id = ?', [orderId]);
    if (orders.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
    }

    const [existing] = await pool.query('SELECT id FROM shipments WHERE order_id = ?', [orderId]);

    let insertId;
    if (existing.length > 0) {
      await connection.query(
        "UPDATE shipments SET courier = ?, tracking_number = ?, status = 'shipped', shipping_date = NOW() WHERE order_id = ?",
        [courier, trackingNumber, orderId]
      );
      insertId = existing[0].id;
    } else {
      const [result] = await connection.query(
        "INSERT INTO shipments (order_id, courier, tracking_number, status, shipping_date) VALUES (?, ?, ?, 'shipped', NOW())",
        [orderId, courier, trackingNumber]
      );
      insertId = result.insertId;
    }

    await connection.query("UPDATE orders SET status = 'shipped' WHERE id = ?", [orderId]);
    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Pengiriman berhasil didaftarkan',
      data: { id: insertId, orderId, courier, trackingNumber, status: 'shipped' },
    });
  } catch (error) {
    await connection.rollback();
    console.error('CreateShipment error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  } finally {
    connection.release();
  }
};

// ─── PUT /api/shipments/:id (Admin – update) ──────────────────────
export const updateShipment = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id }  = req.params;
    const { courier, trackingNumber, status } = req.body;

    const [shipments] = await pool.query('SELECT order_id FROM shipments WHERE id = ?', [id]);
    if (shipments.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Pengiriman tidak ditemukan' });
    }

    const { order_id } = shipments[0];

    await connection.query(
      `UPDATE shipments
       SET courier = COALESCE(?, courier),
           tracking_number = COALESCE(?, tracking_number),
           status = COALESCE(?, status)
       WHERE id = ?`,
      [courier || null, trackingNumber || null, status || null, id]
    );

    // Sinkronkan status order
    if (status === 'delivered') {
      await connection.query("UPDATE orders SET status = 'completed' WHERE id = ?", [order_id]);
    } else if (['shipped', 'in_transit'].includes(status)) {
      await connection.query("UPDATE orders SET status = 'shipped' WHERE id = ?", [order_id]);
    }

    await connection.commit();
    return res.status(200).json({ success: true, message: 'Data pengiriman berhasil diperbarui', data: { id, courier, trackingNumber, status } });
  } catch (error) {
    await connection.rollback();
    console.error('UpdateShipment error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  } finally {
    connection.release();
  }
};

// ─── DELETE /api/shipments/:id (Admin) ────────────────────────────
export const deleteShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM shipments WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Pengiriman tidak ditemukan' });
    return res.status(200).json({ success: true, message: 'Pengiriman berhasil dihapus' });
  } catch (error) {
    console.error('DeleteShipment error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server', error: error.message });
  }
};

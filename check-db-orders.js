import mysql from 'mysql2';

async function main() {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'apparel_papua',
  });

  const pool = connection.promise();

  try {
    console.log('--- ORDERS ---');
    const [orders] = await pool.query('SELECT id, user_id, total_harga, status, created_at FROM orders');
    console.log(orders);

    console.log('--- PAYMENTS ---');
    const [payments] = await pool.query('SELECT id, order_id, status, metode, bukti_pembayaran FROM payments');
    console.log(payments);
  } catch (err) {
    console.error(err);
  } finally {
    connection.end();
  }
}

main();

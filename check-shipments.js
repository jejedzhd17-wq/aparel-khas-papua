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
    console.log('--- COLUMNS OF shipments ---');
    const [shipmentCols] = await pool.query('SHOW COLUMNS FROM shipments');
    console.log(shipmentCols);

    console.log('--- ALL RECORDS OF shipments ---');
    const [shipmentRows] = await pool.query('SELECT * FROM shipments');
    console.log(shipmentRows);
  } catch (err) {
    console.error(err);
  } finally {
    connection.end();
  }
}

main();

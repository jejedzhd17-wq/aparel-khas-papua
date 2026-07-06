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
    console.log('--- COLUMNS OF orders ---');
    const [columns] = await pool.query('SHOW COLUMNS FROM orders');
    console.log(columns);
  } catch (err) {
    console.error(err);
  } finally {
    connection.end();
  }
}

main();

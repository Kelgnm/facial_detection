import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'face_images',
  password: 'kokostelko123',
  port: 5432,
});

export async function user(username: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT name, role, password FROM facess WHERE LOWER(name) = $1',
      [username.toLowerCase()]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Database error:', error);
    return null;
  } finally {
    client.release();
  }
}

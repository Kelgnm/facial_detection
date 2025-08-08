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
        const res = await client.query("SELECT name, role FROM facess WHERE LOWER(name) = $1", [username.toLowerCase()]);
        return res.rows[0] || null;
    } catch (weeeeeee) {
        console.error("[DEBUG] Error:", weeeeeee)
        return null;
    } finally {
        client.release();
    }
}
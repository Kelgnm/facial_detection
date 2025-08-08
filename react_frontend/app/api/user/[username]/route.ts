import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'face_images',
  password: 'kokostelko123',
  port: 5432,
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const resolvedParams = await params;
  const username = resolvedParams.username;

  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT name, role, password FROM facess WHERE LOWER(name) = $1',
      [username.toLowerCase()]
    );

    const user = result.rows[0];

    if (!user) {
      NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error('DB error:', err);
    return NextResponse.json({ error: 'DB failure' }, { status: 500 });
  } finally {
    client.release();
  }
}

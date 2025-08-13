  import { NextResponse } from 'next/server';
import { user } from '../../../../lib/db';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const username = url.searchParams.get('username');
  if (!username) return NextResponse.json({ error: 'Missing username' }, { status: 400 });
  const dbUser = await user(username);
  return NextResponse.json(dbUser || {});
}

import { NextResponse } from 'next/server'
import { user } from '../../../../lib/db'

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  const { username } = params

  if (!username) {
    return NextResponse.json({ error: 'Missing username' }, { status: 400 })
  }

  const dbUser = await user(username)

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json(dbUser)
}

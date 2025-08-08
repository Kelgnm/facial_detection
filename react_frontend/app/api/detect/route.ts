import { NextResponse } from 'next/server'
import { spawn } from 'child_process'

export async function POST(req: Request) {
  const body = await req.json();
  const images = body?.images;

  if (!images || !Array.isArray(images) || images.length === 0) {
    return NextResponse.json({ seen: null, error: 'Invalid or missing images data' }, { status: 400 });
  }

  return new Promise((resolve) => {
    const py = spawn('python', ['../src/scripts/image.py']);

    py.stdin.write(JSON.stringify({ images }));
    py.stdin.end();

    let output = '';
    py.stdout.on('data', (data) => (output += data.toString()));
    py.stderr.on('data', (err) => console.error('[stderr]', err.toString()));

    py.on('close', () => {
      try {
        const parsed = JSON.parse(output.trim());
        resolve(NextResponse.json(parsed));
      } catch (e) {
        resolve(NextResponse.json({ seen: null, error: 'Failed to parse output' }));
      }
    });
  });
}

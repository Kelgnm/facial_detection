import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

function runPythonScript(): Promise<any> {
  return new Promise((resolve, reject) => {
    const python = spawn('python', ['../src/scripts/image.py']);
    let output = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      console.error('Python error:', data.toString());
    });

    python.on('error', (err) => {
      reject(err);
    });

    python.on('close', (code) => {
      try {
        const result = JSON.parse(output.trim());
        resolve(result);
      } catch (err) {
        reject(new Error('Invalid JSON output'));
      }
    });
  });
}


export async function GET(): Promise<Response> {
  try {
    const result = await runPythonScript();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error running script:', error);
    return NextResponse.json({seen: null, error: error.message || 'Unknown'})
  }
  
}
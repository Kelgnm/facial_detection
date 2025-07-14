import { NextRequest, NextResponse } from "next/server";
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { name, id } = await req.json();
    const userID = Date.now().toString();

    if (!name || !id) {
      return NextResponse.json({ success: false, message: 'Name or ID is missing' }, { status: 400 });
    }

    const scriptPath = path.join(process.cwd(), '..', 'src', 'scripts', 'face_detect.py');
    const register = spawn('python', [scriptPath, userID, name]);

    let output = '';
    let errorOutput = '';

    register.stdout.on('data', (data) => {
      output += data.toString();
    });

    register.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error('Python stderr:', data.toString());
    });

    const exitCode: number = await new Promise((resolve) => {
      register.on('close', resolve);
    });

    console.log('Script exited with code:', exitCode);
    console.log('Script stdout:', output);
    console.log('Script stderr:', errorOutput);

    let result;

    try {
      result = JSON.parse(output);
    } catch (err) {
      console.error('Failed to parse output as JSON:', output);
      return NextResponse.json({
        success: false,
        message: 'Invalid response from Python script'
      }, { status: 500 });
    }

    if (exitCode === 0 && result.status === 'success') {
      return NextResponse.json({
        success: true,
        message: result.message || 'Registered successfully'
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message || 'Registration failed'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Unhandled API Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 });
  }
}

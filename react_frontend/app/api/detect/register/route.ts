import { NextRequest, NextResponse } from "next/server";
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { name, id, role, password } = await req.json();
    const userID = Date.now().toString();

    if (!name || !id || !role || !password) {
      return NextResponse.json({ success: false, message: 'Missing required stuff' }, { status: 400 });
    }

    const scriptPath = path.join(process.cwd(), '..', 'src', 'scripts', 'face_detect.py');
    const dataJson = path.join(process.cwd(), 'react_frontend', 'public', 'scripts', 'data.json');
    const register = spawn('python', [scriptPath, userID, name, role, password, dataJson]);

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

    console.log('Script output:', output); // Optional: Debug line

    // ✅ Check output AFTER it's fully collected
    const match = output.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error('No JSON in output:', output);
      return NextResponse.json({
        success: false,
        message: 'No valid JSON output from Python script'
      }, { status: 500 });
    }

    let result;

    try {
      result = JSON.parse(match[0]); // only parse the matched JSON part
    } catch (err) {
      console.error('Failed to parse JSON:', output);
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

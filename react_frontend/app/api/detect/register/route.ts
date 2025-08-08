import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";

export async function POST(req: NextRequest) {
  const { name, role, password, image } = await req.json();
  const userID = Date.now().toString();

  return new Promise((resolve) => {
    const python = spawn("python", ["../src/scripts/register_my_ass.py"]);

    python.stdin.write(JSON.stringify({
      user_id: userID,
      name,
      role,
      password,
      image
    }));
    python.stdin.end();

    let output = "";
    python.stdout.on("data", (data) => (output += data.toString()));
    python.stderr.on("data", (err) => console.error("[stderr]", err.toString()));

    python.on("close", () => {
      try {
        const parsed = JSON.parse(output.trim());
        resolve(NextResponse.json(parsed));
      } catch {
        resolve(NextResponse.json({ status: "error", message: "Invalid Python output" }));
      }
    });
  });
}

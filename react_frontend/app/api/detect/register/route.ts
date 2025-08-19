import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";

export async function POST(req: NextRequest) {
  const { name, role, password, image } = await req.json();

  return new Promise((resolve) => {
    const python = spawn("python", ["../src/scripts/register_my_ass.py"]);

    let output = "";
    let errorOutput = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
      console.error("[Python stderr]", data.toString());
    });

    python.on("close", () => {
      if (errorOutput) console.error("[Python errors]", errorOutput);

      try {
        const parsed = JSON.parse(output.trim());
        resolve(NextResponse.json(parsed));
      } catch (err) {
        resolve(
          NextResponse.json({
            status: "error",
            message: "Invalid Python output",
            output: output,
            error: err.toString(),
          })
        );
      }
    });

    python.stdin.write(JSON.stringify({ name, role, password, image }));
    python.stdin.end();
  });
}

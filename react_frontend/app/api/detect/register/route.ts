import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";

export async function GET(req: NextRequest) {
  let ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    (req as any).socket?.remoteAddress ||
    req.ip ||
    "unknown";

  if (ip === "::1") {
    ip = "127.0.0.1";
  }

  if (ip.startsWith("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }

  console.log("[USER] IP:", ip);

  return NextResponse.json({ ip });
}

export async function POST(req: NextRequest): Promise<Response> {
  const { name, role, password, image } = await req.json();

  return new Promise<Response>((resolve) => {
    const python = spawn("python", ["src/scripts/register_my_ass.py"]);

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
      } catch (err: any) {
        resolve(
          NextResponse.json(
            {
              status: "error",
              message: "Invalid Python output",
              output: output,
              error: err?.toString() ?? "Unknown error",
            },
            { status: 500 }
          )
        );
      }
    });

    python.stdin.write(JSON.stringify({ name, role, password, image }));
    python.stdin.end();
  });
}


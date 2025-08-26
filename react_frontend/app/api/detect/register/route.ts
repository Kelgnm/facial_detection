import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";

export async function POST(req: NextRequest): Promise<Response> {
  const { name, role, password, image } = await req.json();

  return new Promise<Response>((resolve) => {
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

    python.on("close", (code) => {
      if (errorOutput) console.error("[Python errors]", errorOutput);

      console.log("[Python stdout]", output);

      try {
        const parsed = JSON.parse(output.trim());
        const status = parsed.status === "success" ? 200 : 400;
        resolve(NextResponse.json(parsed, { status }));
      } catch (err: any) {
        console.error("[JSON parse error]", err);
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


export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: "info",
    message: "Use POST to register a user with face data",
  });
}
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/register")) {
    // Use x-forwarded-for (real client IP if behind proxy)
    let ip = req.headers.get("x-forwarded-for") || "Unknown";

    // If multiple IPs are in the header, take the first one
    if (ip.includes(",")) {
      ip = ip.split(",")[0].trim();
    }

    // Handle localhost (::1 → 127.0.0.1)
    if (ip === "::1") ip = "127.0.0.1";

    console.log(`[USER] IP: ${ip}`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/register/:path*",
};

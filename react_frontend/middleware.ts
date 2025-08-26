import { NextRequest, NextResponse } from "next/server";

function getClientIp(req: NextRequest) {
  const xff = req.headers.get('x-forwarded-for') || "";
  const ipfromxff = xff.split(',')[0]?.trim();
  let ip =
    ipfromxff ||
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-real-ip') ||
    '';

  if (ip === '::1') ip = '127.0.0.1';
  if (ip.startsWith('::ffff:')) ip = ip.slice(7);
  return ip || 'unknown';
}

export function middleware(req: NextRequest) {
  const ip = getClientIp(req);
  const ua = req.headers.get('user-agent') || "unknown";
  const ts = new Date().toISOString();
  console.log(`[USER LOG]
  Time:   ${ts}
  IP:     ${ip}
  Device:  ${ua}
  `);
  return NextResponse.next();
}

export const config = {
  matcher: "/register/:path*",
};

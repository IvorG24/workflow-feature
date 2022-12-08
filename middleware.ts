// References:
// https://github.com/supabase/supabase/issues/491#issuecomment-1313075179
// https://supabase.com/docs/learn/auth-deep-dive/auth-deep-dive-jwts
// https://github.com/vercel/next.js/discussions/38227

import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    const cookie = request.cookies.get("supabase-auth-token");
    const token = cookie ? JSON.parse(cookie)[0] : null;
    if (!token) throw new Error("Invalid Token");

    await jwtVerify(
      token,
      new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET)
    );
  } catch {
    // Invalid Token
    const vercelUrl = process.env.VERCEL_URL || "http://localhost:3000";
    return NextResponse.redirect(`${vercelUrl}/sign-in`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/t/:path*"],
};

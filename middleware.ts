// References:
// https://github.com/supabase/supabase/issues/491#issuecomment-1313075179
// https://supabase.com/docs/learn/auth-deep-dive/auth-deep-dive-jwts
// https://github.com/vercel/next.js/discussions/38227

import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    const vercelUrl = process.env.VERCEL_URL || "http://localhost:3000";
    const cookie = request.cookies.get("supabase-auth-token");
    const token = cookie ? JSON.parse(cookie)[0] : null;
    if (!token) throw new Error("Invalid Token");

    await jwtVerify(
      token,
      new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET)
    );

    if (
      request.nextUrl.pathname.includes("/sign-in") ||
      request.nextUrl.pathname.includes("/register")
    )
      return NextResponse.redirect(`${vercelUrl}`);

    return NextResponse.next();
  } catch {
    // Invalid Token
    const vercelUrl = process.env.VERCEL_URL || "http://localhost:3000";

    if (
      request.nextUrl.pathname.includes("/sign-in") ||
      request.nextUrl.pathname.includes("/register")
    )
      return NextResponse.next();

    // * TODO - If API protection return a response instead of page redirect.
    // https://nextjs.org/docs/advanced-features/middleware#:~:text=Once%20enabled%2C%20you%20can%20provide%20a%20response%20from%20middleware%20using%20the%20Response%20or%20NextResponse%20API%3A
    // if (request.nextUrl.pathname.includes("/api")) {
    //   return new NextResponse(
    //     JSON.stringify({ success: false, message: "authentication failed" }),
    //     { status: 401, headers: { "content-type": "application/json" } }
    //   );
    // }

    return NextResponse.redirect(`${vercelUrl}/sign-in`);
  }
}

export const config = {
  matcher: [
    "/",
    "/sign-in/:path*",
    "/register/:path*",
    "/profiles/:path*",
    "/t/:path*",
    "/api/:function*",
  ],
};

import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/logout"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public paths, static assets, and Next.js internals
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/games/") && pathname.includes(".") // static game assets
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE_NAME = "fohlio-session";

const PROTECTED_PREFIXES = ["/lessons", "/progress", "/admin"];
const ADMIN_PREFIXES = ["/admin"];
const AUTH_PATHS = ["/login", "/register"];

interface TokenPayload {
  userId: string;
  role: "student" | "admin";
}

async function getTokenPayload(
  request: NextRequest,
): Promise<TokenPayload | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = await getTokenPayload(request);

  const isProtected = PROTECTED_PREFIXES.some((p) =>
    pathname.startsWith(p),
  );
  const isAdmin = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuth = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdmin && user?.role !== "admin") {
    return NextResponse.redirect(new URL("/lessons", request.url));
  }

  if (isAuth && user) {
    return NextResponse.redirect(new URL("/lessons", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\..*|api).*)",
  ],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { safeRedirectTarget } from "@/lib/safeRedirect";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE_NAME = "fohlio-session";

// Default-deny: every route under the matcher requires auth unless it matches
// a public prefix below. New routes (like /series) are protected automatically.
const PUBLIC_PREFIXES = ["/login", "/register"];
const ADMIN_PREFIXES = ["/admin"];

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

  const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
  const isAdmin = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));

  // Public auth pages: if already signed in, forward to the redirect target
  // (or /courses). This lets `/login?redirect=/series` actually land on
  // /series for an already-signed-in user instead of swallowing the param.
  if (isPublic) {
    if (user) {
      const target = safeRedirectTarget(
        request.nextUrl.searchParams.get("redirect"),
      );
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  // Everything else needs auth. Preserve where the user was going so the
  // login form can bounce them back after a successful sign-in.
  if (!user) {
    const url = new URL("/login", request.url);
    // Preserve the original path *plus* its query string, so a deep link
    // like /courses/nestjs/lessons/intro?from=email survives the round-trip.
    url.searchParams.set(
      "redirect",
      pathname + (request.nextUrl.search || ""),
    );
    return NextResponse.redirect(url);
  }

  // Admin routes also need the admin role.
  if (isAdmin && user.role !== "admin") {
    return NextResponse.redirect(new URL("/courses", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on every page route, but skip Next internals, static assets, and
    // API endpoints (those enforce auth at the handler level).
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\..*|api).*)",
  ],
};

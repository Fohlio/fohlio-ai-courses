import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { ADMIN_GITHUB_NICKNAME } from "./constants";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE_NAME = "fohlio-session";
const TOKEN_EXPIRY = "7d";
const SALT_ROUNDS = 10;

// ---------------------------------------------------------------------------
// Password Hashing
// ---------------------------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ---------------------------------------------------------------------------
// JWT
// ---------------------------------------------------------------------------

interface JWTPayload {
  userId: string;
  githubNickname: string;
  displayName: string | null;
  role: "student" | "admin";
}

export async function signToken(
  payload: JWTPayload,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(
  token: string,
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cookie Management
// ---------------------------------------------------------------------------

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

// ---------------------------------------------------------------------------
// Server-Side Auth Helper
// ---------------------------------------------------------------------------

export async function getCurrentUser() {
  const token = await getSessionToken();
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      githubNickname: true,
      displayName: true,
      role: true,
    },
  });

  return user;
}

// ---------------------------------------------------------------------------
// Role Determination
// ---------------------------------------------------------------------------

export function resolveRole(
  githubNickname: string,
): "student" | "admin" {
  return githubNickname.toLowerCase() === ADMIN_GITHUB_NICKNAME.toLowerCase()
    ? "admin"
    : "student";
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  resolveRole,
  signToken,
  setSessionCookie,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { githubNickname, password, displayName } = body;

    if (!githubNickname?.trim()) {
      return NextResponse.json(
        { error: "GitHub nickname is required" },
        { status: 400 },
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { githubNickname: githubNickname.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User with this GitHub nickname already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const role = resolveRole(githubNickname.trim());

    const user = await prisma.user.create({
      data: {
        githubNickname: githubNickname.trim(),
        displayName: displayName?.trim() || null,
        passwordHash,
        role,
      },
      select: {
        id: true,
        githubNickname: true,
        displayName: true,
        role: true,
      },
    });

    const token = await signToken({
      userId: user.id,
      githubNickname: user.githubNickname,
      displayName: user.displayName,
      role: user.role,
    });

    await setSessionCookie(token);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 },
    );
  }
}

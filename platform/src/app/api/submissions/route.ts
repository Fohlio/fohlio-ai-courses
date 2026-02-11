import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lessonId = request.nextUrl.searchParams.get("lessonId");
  if (!lessonId) {
    return NextResponse.json(
      { error: "lessonId query parameter required" },
      { status: 400 },
    );
  }

  const submissions = await prisma.taskSubmission.findMany({
    where: { userId: user.id, lessonId },
  });

  return NextResponse.json({ submissions });
}

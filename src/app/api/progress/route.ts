import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateStudentProgress } from "@/lib/progress";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await prisma.taskSubmission.findMany({
    where: { userId: user.id },
    select: { taskId: true, lessonId: true, status: true, updatedAt: true },
  });

  const progress = calculateStudentProgress(
    user.id,
    user.githubNickname,
    user.displayName,
    submissions,
  );

  return NextResponse.json({ progress });
}

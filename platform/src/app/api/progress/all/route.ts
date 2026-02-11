import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateStudentProgress } from "@/lib/progress";
import type { AdminStudentSummary } from "@/lib/types";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { role: "student" },
    select: { id: true, githubNickname: true, displayName: true },
    orderBy: { githubNickname: "asc" },
  });

  const allSubmissions = await prisma.taskSubmission.findMany({
    where: { userId: { in: users.map((u) => u.id) } },
    select: { userId: true, taskId: true, lessonId: true, status: true, updatedAt: true },
  });

  const students: AdminStudentSummary[] = users.map((user) => {
    const subs = allSubmissions.filter((s) => s.userId === user.id);
    const progress = calculateStudentProgress(
      user.id,
      user.githubNickname,
      user.displayName,
      subs,
    );
    return {
      user: { id: user.id, githubNickname: user.githubNickname, displayName: user.displayName },
      progress,
    };
  });

  return NextResponse.json({ students });
}

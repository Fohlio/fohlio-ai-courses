import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOverallStudentProgress } from "@/lib/courseQueries";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progress = await getOverallStudentProgress({
    id: user.id,
    role: user.role,
  });

  return NextResponse.json({ data: progress });
}

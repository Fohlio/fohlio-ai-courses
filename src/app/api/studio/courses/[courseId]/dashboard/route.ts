import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOwnerCourseDashboard } from "@/lib/courseQueries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = await params;
  const dashboard = await getOwnerCourseDashboard(courseId, {
    id: user.id,
    role: user.role,
  });

  if (!dashboard) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  return NextResponse.json({ data: dashboard });
}

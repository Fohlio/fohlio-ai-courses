import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createCourse } from "@/lib/courseMutations";
import { getCourseCatalog, getStudioCourses } from "@/lib/courseQueries";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scope = request.nextUrl.searchParams.get("scope") ?? "published";
  const viewer = { id: user.id, role: user.role };

  if (scope === "mine") {
    const courses = await getStudioCourses(viewer);
    return NextResponse.json({ data: courses });
  }

  const courses = await getCourseCatalog(viewer);
  return NextResponse.json({ data: courses });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const result = await createCourse({ id: user.id, role: user.role }, payload);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ data: result.data }, { status: 201 });
}

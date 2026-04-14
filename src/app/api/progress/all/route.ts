import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAdminStudentSummaries } from "@/lib/courseQueries";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const students = await getAdminStudentSummaries();

  return NextResponse.json({ students });
}

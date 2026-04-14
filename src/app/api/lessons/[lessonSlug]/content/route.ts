import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { getCurrentUser } from "@/lib/auth";
import { getLessonBySlug } from "@/lib/constants";
import { getLessonFilePath } from "@/lib/content";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonSlug: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonSlug } = await params;
  const lesson = getLessonBySlug(lessonSlug);
  if (!lesson || !lesson.contentFile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = getLessonFilePath(lesson);

  try {
    const buffer = await readFile(filePath);
    const contentType =
      lesson.contentType === "pdf" ? "application/pdf" : "text/html";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}

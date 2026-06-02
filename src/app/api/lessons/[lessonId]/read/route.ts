import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ParamsSchema = z.object({
  lessonId: z.string().min(1),
});

/**
 * POST /api/lessons/[lessonId]/read
 *
 * Mark a lesson as read (scrolled-to-end) by the authenticated user.
 *
 * Security:
 * - Auth-first: getCurrentUser() -> 401 if anon.
 * - IDOR-safe lesson lookup: findFirst({ isPublished + course.status="published" })
 *   so draft/foreign/missing lessons all return 404 (never 403 — uniform response).
 * - No mass-assignment: the create object is a server literal built from the
 *   session userId + path lessonId + DB-derived courseId. Any client-supplied
 *   userId, courseId, readAt, or id is ignored entirely (the body is NOT parsed).
 * - Idempotent: upsert on @@unique([userId, lessonId]) with update:{} (no-op).
 *
 * List-staleness: the lesson/course pages use force-dynamic (no shared cache
 * keyed on user data), so a client-side router.refresh() after a successful
 * mark is sufficient to re-render with the new read state. We do NOT call
 * revalidatePath/revalidateTag — lesson reads are per-user data, never in a
 * shared public cache. The client island (LessonReadTracker) calls
 * router.refresh() on success.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> },
): Promise<NextResponse> {
  // 1. Auth first — defense in depth (middleware does not cover API routes).
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate path param.
  const rawParams = await params;
  const parsed = ParamsSchema.safeParse(rawParams);
  if (!parsed.success) {
    return NextResponse.json({ error: "lessonId is required" }, { status: 400 });
  }
  const { lessonId } = parsed.data;

  // 3. IDOR-safe lookup: only published lessons in published courses.
  // Returns null for draft, unpublished, foreign-course, or missing lessons.
  // Uniform 404 for all — never 403 (do not distinguish missing from forbidden).
  const lessonRow = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      isPublished: true,
      course: { status: "published" },
    },
    select: { id: true, courseId: true },
  });

  if (!lessonRow) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 4. Check for an existing read BEFORE upsert so we can report alreadyRead
  // accurately. The subsequent upsert is still idempotent regardless.
  const existing = await prisma.lessonRead.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    select: { id: true },
  });
  const alreadyRead = existing !== null;

  // 5. Upsert — server-literal create; update:{} is a no-op (idempotent).
  // courseId is denormalised from the verified lesson row (not from the client).
  await prisma.lessonRead.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    create: {
      userId: user.id,
      lessonId,
      courseId: lessonRow.courseId,
    },
    update: {},
  });

  return NextResponse.json({ data: { read: true, alreadyRead } });
}

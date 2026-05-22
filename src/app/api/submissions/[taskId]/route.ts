import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordSubmissionAward } from "@/lib/gamification";
import { Prisma } from "@/generated/prisma/client";

const HTTP_URL_RE = /^https?:\/\/\S+$/i;

const PrLinkSchema = z.object({
  type: z.literal("pr_link"),
  url: z.string().trim().regex(HTTP_URL_RE, "Must be a public http(s) URL."),
});

const ScreenshotSchema = z.object({
  type: z.literal("screenshot"),
  fileUrl: z.string().trim().regex(HTTP_URL_RE, "Must be a public http(s) URL."),
  fileName: z.string().min(1).max(255),
});

const TextSchema = z.object({
  type: z.literal("text"),
  text: z.string().trim().min(1).max(10_000),
});

const QuizSchema = z.object({
  type: z.literal("quiz"),
  answers: z
    .array(
      z.object({
        questionIndex: z.number().int().nonnegative(),
        question: z.string(),
        answer: z.string(),
      }),
    )
    .min(1),
});

const ChecklistSchema = z.object({
  type: z.literal("checklist"),
  items: z
    .array(z.object({ label: z.string(), checked: z.boolean() }))
    .min(1),
});

const WidgetSchema = z.object({
  type: z.literal("widget"),
  widgetId: z.string().min(1).max(64),
  state: z.record(z.string(), z.unknown()),
  completed: z.boolean(),
  reflection: z.string().max(4_000).optional(),
});

const ContentSchema = z.discriminatedUnion("type", [
  PrLinkSchema,
  ScreenshotSchema,
  TextSchema,
  QuizSchema,
  ChecklistSchema,
  WidgetSchema,
]);

const PutBodySchema = z.object({
  courseId: z.string().min(1),
  lessonId: z.string().min(1),
  content: ContentSchema,
});

type ContentType = z.infer<typeof ContentSchema>["type"];

const SUBMISSION_TYPE_TO_CONTENT_TYPE: Record<string, ContentType> = {
  pr_link: "pr_link",
  screenshot: "screenshot",
  text: "text",
  quiz: "quiz",
  checklist: "checklist",
  widget: "widget",
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await params;

  let parsed;
  try {
    parsed = PutBodySchema.parse(await request.json());
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof z.ZodError
            ? error.issues[0]?.message || "Invalid request body."
            : "Invalid request body.",
      },
      { status: 400 },
    );
  }

  const { courseId, lessonId, content } = parsed;

  const task = await prisma.homeworkTask.findUnique({
    where: { id: taskId },
    select: {
      lessonId: true,
      submissionType: true,
      category: true,
      widgetId: true,
      lesson: {
        select: {
          courseId: true,
          isPublished: true,
          course: { select: { status: true, ownerId: true } },
        },
      },
    },
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  if (task.lessonId !== lessonId || task.lesson.courseId !== courseId) {
    return NextResponse.json(
      { error: "Course/lesson does not match task." },
      { status: 400 },
    );
  }

  if (SUBMISSION_TYPE_TO_CONTENT_TYPE[task.submissionType] !== content.type) {
    return NextResponse.json(
      { error: "Submission type does not match the task." },
      { status: 400 },
    );
  }

  if (content.type === "widget" && task.widgetId && content.widgetId !== task.widgetId) {
    return NextResponse.json(
      { error: "Widget id does not match the task definition." },
      { status: 400 },
    );
  }

  const isPrivileged =
    user.role === "admin" || task.lesson.course.ownerId === user.id;

  if (!isPrivileged) {
    if (task.lesson.course.status !== "published" || !task.lesson.isPublished) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Cast: Zod-parsed content is a discriminated union with
  // `Record<string, unknown>` inside WidgetContent.state — Prisma's recursive
  // `InputJsonValue` type can't see that this is JSON-safe. We validated the
  // shape at the schema boundary above, so the cast is safe.
  const contentJson = content as unknown as Prisma.InputJsonValue;

  const submission = await prisma.taskSubmission.upsert({
    where: { userId_taskId: { userId: user.id, taskId } },
    create: {
      userId: user.id,
      taskId,
      lessonId,
      courseId,
      status: "submitted",
      content: contentJson,
    },
    update: {
      courseId,
      status: "submitted",
      content: contentJson,
    },
  });

  // Idempotent XP + mastery + streak. Resubmissions are no-ops on XP.
  // Course owners and admins do not earn XP for their own course content.
  let award: Awaited<ReturnType<typeof recordSubmissionAward>> | null = null;
  if (!isPrivileged) {
    try {
      award = await recordSubmissionAward({
        userId: user.id,
        taskId,
        lessonId,
        courseId,
        taskCategory: task.category,
      });
    } catch (error) {
      // XP failure must never block submission success.
      console.error("[submissions.PUT] gamification award failed", error);
    }
  }

  return NextResponse.json({ submission, award });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await params;

  const submission = await prisma.taskSubmission.findUnique({
    where: { userId_taskId: { userId: user.id, taskId } },
  });

  return NextResponse.json({ submission: submission ?? null });
}

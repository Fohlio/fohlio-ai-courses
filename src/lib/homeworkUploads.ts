import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { z } from "zod";
import { env } from "./env";
import { prisma } from "./prisma";
import { err, ok, type Result } from "./result";
import type { UserRole } from "./types";

interface Viewer {
  id: string;
  role: UserRole;
}

interface HomeworkUploadError {
  error: string;
  type: "auth" | "validation" | "server";
}

// Strict allowlist for screenshot filenames — letters/digits/dot/dash/underscore only.
// The client slugifies before upload; spaces/query-unsafe chars in a blob pathname
// break the client-upload PUT (400). Rejects control chars / RTL overrides too.
const FILE_NAME_RE = /^[\p{L}\p{N}._-]+$/u;

const UploadPayloadSchema = z.object({
  taskId: z.string().min(1),
  fileName: z.string().min(1).max(255).regex(FILE_NAME_RE),
});

const SCREENSHOT_CONSTRAINTS = {
  // @vercel/blob does not support MIME wildcards — list explicit types.
  allowedContentTypes: [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
  ],
  maximumSizeInBytes: 10 * 1024 * 1024,
};

const TOKEN_TTL_MS = 1000 * 60 * 5;

export async function handleHomeworkUploadRequest(
  request: Request,
  viewer: Viewer,
): Promise<Result<unknown, HomeworkUploadError>> {
  if (!env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN is missing — homework uploads disabled.");
    return err({
      error: "Uploads are temporarily unavailable.",
      type: "server",
    });
  }

  try {
    const body = (await request.json()) as HandleUploadBody;
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const parsedPayload = UploadPayloadSchema.parse(
          clientPayload ? JSON.parse(clientPayload) : {},
        );

        const task = await prisma.homeworkTask.findUnique({
          where: { id: parsedPayload.taskId },
          select: {
            submissionType: true,
            lesson: {
              select: {
                isPublished: true,
                course: {
                  select: { status: true, ownerId: true },
                },
              },
            },
          },
        });

        if (!task) {
          throw new Error("Task not found");
        }

        if (task.submissionType !== "screenshot") {
          throw new Error("Forbidden");
        }

        const isPrivileged =
          viewer.role === "admin" || task.lesson.course.ownerId === viewer.id;

        if (!isPrivileged) {
          if (task.lesson.course.status !== "published" || !task.lesson.isPublished) {
            throw new Error("Forbidden");
          }
        }

        return {
          addRandomSuffix: true,
          validUntil: Date.now() + TOKEN_TTL_MS,
          tokenPayload: JSON.stringify(parsedPayload),
          ...SCREENSHOT_CONSTRAINTS,
        };
      },
      onUploadCompleted: async () => {
        // No DB row needed — the blob URL is stored on the submission itself.
      },
    });

    return ok(response);
  } catch (error) {
    console.error("Homework upload error:", error);

    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return err({ error: "ValidationError", type: "validation" });
    }

    if (error instanceof Error) {
      if (error.message === "Forbidden") {
        return err({ error: "Forbidden", type: "auth" });
      }
      if (error.message === "Task not found") {
        return err({ error: "Task not found", type: "validation" });
      }
    }

    return err({ error: "Upload failed.", type: "server" });
  }
}

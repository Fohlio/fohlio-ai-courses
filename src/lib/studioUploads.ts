import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { z } from "zod";
import { env } from "./env";
import { prisma } from "./prisma";
import { err, ok, type Result } from "./result";
import type { AssetKind, UserRole } from "./types";

interface Viewer {
  id: string;
  role: UserRole;
}

const UploadPayloadSchema = z.object({
  courseId: z.string().min(1),
  lessonId: z.string().min(1),
  kind: z.enum(["image", "video", "html_source"]),
  fileName: z.string().min(1),
});

function isOwnerOrAdmin(ownerId: string, viewer: Viewer): boolean {
  return viewer.role === "admin" || viewer.id === ownerId;
}

function getUploadConstraints(kind: AssetKind) {
  switch (kind) {
    case "video":
      return {
        allowedContentTypes: ["video/*"],
        maximumSizeInBytes: 250 * 1024 * 1024,
      };
    case "html_source":
      return {
        allowedContentTypes: ["text/html"],
        maximumSizeInBytes: 2 * 1024 * 1024,
      };
    case "image":
    default:
      return {
        allowedContentTypes: ["image/*"],
        maximumSizeInBytes: 10 * 1024 * 1024,
      };
  }
}

export async function handleStudioUploadRequest(
  request: Request,
  viewer: Viewer,
): Promise<Result<unknown, string>> {
  if (!env.BLOB_READ_WRITE_TOKEN) {
    return err("BLOB_READ_WRITE_TOKEN is missing. Uploads are disabled until it is configured.");
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const parsedPayload = UploadPayloadSchema.parse(
          clientPayload ? JSON.parse(clientPayload) : {},
        );
        const course = await prisma.course.findUnique({
          where: { id: parsedPayload.courseId },
          select: { ownerId: true },
        });

        if (!course || !isOwnerOrAdmin(course.ownerId, viewer)) {
          throw new Error("Forbidden");
        }

        const lesson = await prisma.lesson.findFirst({
          where: {
            id: parsedPayload.lessonId,
            courseId: parsedPayload.courseId,
          },
          select: { id: true },
        });

        if (!lesson) {
          throw new Error("Lesson not found");
        }

        const constraints = getUploadConstraints(parsedPayload.kind);

        return {
          token: env.BLOB_READ_WRITE_TOKEN,
          addRandomSuffix: true,
          validUntil: Date.now() + 1000 * 60 * 15,
          tokenPayload: JSON.stringify(parsedPayload),
          ...constraints,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const parsedPayload = UploadPayloadSchema.parse(
          tokenPayload ? JSON.parse(tokenPayload) : {},
        );

        const existingAsset = await prisma.lessonAsset.findFirst({
          where: {
            lessonId: parsedPayload.lessonId,
            pathname: blob.pathname,
          },
          select: { id: true },
        });

        if (existingAsset) {
          return;
        }

        await prisma.lessonAsset.create({
          data: {
            lessonId: parsedPayload.lessonId,
            kind: parsedPayload.kind,
            fileName: parsedPayload.fileName,
            pathname: blob.pathname,
            url: blob.url,
            contentType: blob.contentType || "application/octet-stream",
            size: null,
          },
        });
      },
    });

    return ok(response);
  } catch (error) {
    console.error("Studio upload error:", error);
    return err(
      error instanceof Error ? error.message : "Failed to prepare lesson upload.",
    );
  }
}

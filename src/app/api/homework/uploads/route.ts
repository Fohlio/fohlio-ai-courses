import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { handleHomeworkUploadRequest } from "@/lib/homeworkUploads";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await handleHomeworkUploadRequest(request, {
    id: user.id,
    role: user.role,
  });

  if (!result.ok) {
    const status =
      result.error.type === "auth"
        ? 403
        : result.error.type === "validation"
          ? 400
          : 500;
    return NextResponse.json({ error: result.error.error }, { status });
  }

  return NextResponse.json(result.data);
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { handleStudioUploadRequest } from "@/lib/studioUploads";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await handleStudioUploadRequest(request, {
    id: user.id,
    role: user.role,
  });

  if (!result.ok) {
    if (result.error.error === "Forbidden") {
      return NextResponse.json({ error: result.error.error }, { status: 403 });
    }

    if (
      result.error.type === "validation" ||
      result.error.error === "ValidationError"
    ) {
      return NextResponse.json({ error: result.error.error }, { status: 400 });
    }

    return NextResponse.json({ error: result.error.error }, { status: 500 });
  }

  return NextResponse.json(result.data);
}

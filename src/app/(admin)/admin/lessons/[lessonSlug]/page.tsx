import { redirect } from "next/navigation";

export default function LegacyAdminLessonRedirect() {
  redirect("/admin/courses");
}

import { redirect } from "next/navigation";

export default function LegacyAdminLessonsRedirect() {
  redirect("/admin/courses");
}

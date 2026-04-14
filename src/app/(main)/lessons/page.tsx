import { redirect } from "next/navigation";

export default function LegacyLessonsRedirect() {
  redirect("/courses");
}

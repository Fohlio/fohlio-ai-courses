import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function AdminDebugUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const me = await getCurrentUser();
  if (!me || me.role !== "admin") {
    notFound();
  }

  const { q } = await searchParams;
  const search = q?.trim() ?? "";

  const users = await prisma.user.findMany({
    where: search
      ? {
          OR: [
            { githubNickname: { contains: search, mode: "insensitive" } },
            { displayName: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      githubNickname: true,
      displayName: true,
      role: true,
      createdAt: true,
      _count: { select: { submissions: true } },
    },
  });

  const submissionsByContent = search
    ? await prisma.taskSubmission.findMany({
        where: { content: { path: [], string_contains: search } as never },
        select: { id: true, userId: true, taskId: true, updatedAt: true },
        take: 50,
      }).catch(() => [] as Array<{
        id: string;
        userId: string;
        taskId: string;
        updatedAt: Date;
      }>)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          User Debug ({users.length})
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Raw user records from the database — for diagnosing missing students.
        </p>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={search}
          placeholder="Search by nickname or display name (substring, case-insensitive)"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Search
        </button>
      </form>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-3 py-2 font-medium text-gray-600">Nickname</th>
                <th className="px-3 py-2 font-medium text-gray-600">Display name</th>
                <th className="px-3 py-2 font-medium text-gray-600">Role</th>
                <th className="px-3 py-2 font-medium text-gray-600">Submissions</th>
                <th className="px-3 py-2 font-medium text-gray-600">Created</th>
                <th className="px-3 py-2 font-medium text-gray-600">User ID</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                    No users match.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100">
                    <td className="px-3 py-2 font-medium">
                      {user.githubNickname}
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {user.displayName ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {user._count.submissions}
                    </td>
                    <td className="px-3 py-2 text-gray-500">
                      {dateFormatter.format(user.createdAt)}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-400">
                      {user.id}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {search && submissionsByContent.length > 0 && (
        <Card>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Submissions whose content matches &quot;{search}&quot;
          </h2>
          <p className="mb-3 text-xs text-gray-500">
            Helpful when a student submitted homework but their User row went
            missing — finds orphaned submissions.
          </p>
          <ul className="space-y-2 text-sm">
            {submissionsByContent.map((sub) => (
              <li key={sub.id} className="rounded border border-gray-200 p-2">
                <div className="font-mono text-xs text-gray-500">
                  user:{sub.userId} task:{sub.taskId}
                </div>
                <div className="text-xs text-gray-400">
                  {dateFormatter.format(sub.updatedAt)}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

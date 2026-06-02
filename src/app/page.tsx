import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getSeriesCatalog, type SeriesCardSummary } from "@/lib/courseQueries";

export const dynamic = "force-dynamic";

// Static fallback so logged-out visitors (or a DB hiccup) never see a crash.
const FALLBACK_TRACKS: SeriesCardSummary[] = [
  {
    id: "fallback-backend",
    slug: "backend",
    title: "Backend Engineering",
    subtitle: "NestJS + MikroORM",
    description:
      "Build production APIs the way the Fohlio platform does: structured NestJS modules and type-safe MikroORM data access.",
    coverImageUrl: null,
    order: 0,
    courseCount: 2,
    publishedLessonCount: 0,
    totalTasks: 0,
  },
  {
    id: "fallback-ai-gtm",
    slug: "ai-for-gtm",
    title: "AI for GTM",
    subtitle: "Fohlio Tech Course",
    description:
      "Tech literacy and practical AI tooling for the go-to-market team — how the product works and how to move faster with AI.",
    coverImageUrl: null,
    order: 1,
    courseCount: 1,
    publishedLessonCount: 0,
    totalTasks: 0,
  },
  {
    id: "fallback-domain",
    slug: "fohlio-domain",
    title: "The Fohlio Domain",
    subtitle: "How buildings get furnished",
    description:
      "The real FF&E industry Fohlio serves — from specification to procurement — and how it maps to the platform.",
    coverImageUrl: null,
    order: 2,
    courseCount: 1,
    publishedLessonCount: 0,
    totalTasks: 0,
  },
];

const VALUE_PROPS = [
  {
    title: "Tech literacy for GTM",
    description:
      "Demystify how the Fohlio platform is built so sales, success, and marketing speak the same language as engineering.",
    icon: (
      <path
        d="M9 7H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M9 7h6m-7 5h8m-8 4h5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Practical AI tooling",
    description:
      "Hands-on AI workflows you can use today — drafting, research, and automation that compound across the whole team.",
    icon: (
      <path
        d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.95 6.95-1.41-1.41M7.46 7.46 6.05 6.05m11.9 0-1.41 1.41M7.46 16.54l-1.41 1.41M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Real engineering depth",
    description:
      "Full courses on NestJS and MikroORM that mirror the actual Fohlio codebase, not toy examples.",
    icon: (
      <path
        d="m8 6-6 6 6 6m8-12 6 6-6 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Learn the domain",
    description:
      "Understand FF&E — how buildings actually get furnished — so every conversation lands with real-world context.",
    icon: (
      <path
        d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

function ValueIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-6 w-6 text-brand"
        aria-hidden="true"
      >
        {children}
      </svg>
    </div>
  );
}

async function getTracks(): Promise<SeriesCardSummary[]> {
  try {
    const series = await getSeriesCatalog();
    return series.length > 0 ? series : FALLBACK_TRACKS;
  } catch {
    return FALLBACK_TRACKS;
  }
}

async function getViewer() {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}

export default async function Home() {
  const [user, tracks] = await Promise.all([getViewer(), getTracks()]);
  const isAuthed = Boolean(user);
  const displayName = user?.displayName ?? user?.githubNickname ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/icon.svg"
              alt="Fohlio Courses"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg"
            />
            <span className="text-base font-semibold tracking-tight text-gray-900">
              Fohlio Courses
            </span>
          </Link>

          {isAuthed ? (
            <Link
              href="/series"
              className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2"
            >
              Go to your courses
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-gray-200">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-light/60 to-white"
          />
          <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full bg-brand-light px-3 py-1 text-xs font-medium text-brand">
                Internal learning platform
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl">
                Level up the whole Fohlio team — from GTM to engineering.
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-gray-600">
                {isAuthed && displayName ? (
                  <>Welcome back, {displayName}. Pick up where you left off.</>
                ) : (
                  <>
                    Tech literacy and practical AI tools for the go-to-market
                    team, plus deep engineering tracks on NestJS, MikroORM, and
                    the Fohlio domain. One platform, every track.
                  </>
                )}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {isAuthed ? (
                  <Link
                    href="/series"
                    className="inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-base font-medium text-white transition-colors hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2"
                  >
                    Go to your courses
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-base font-medium text-white transition-colors hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/series"
                      className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2"
                    >
                      Browse tracks
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Value props */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              What you&apos;ll get
            </h2>
            <p className="mt-3 text-gray-600">
              Built in-house, mapped to how Fohlio actually works.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_PROPS.map((prop) => (
              <div
                key={prop.title}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <ValueIcon>{prop.icon}</ValueIcon>
                <h3 className="mt-4 text-base font-semibold text-gray-900">
                  {prop.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {prop.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tracks */}
        <section className="border-t border-gray-200 bg-gray-50">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  Tracks
                </h2>
                <p className="mt-3 text-gray-600">
                  Each track bundles related courses into a single learning
                  path.
                </p>
              </div>
              <Link
                href="/series"
                className="text-sm font-medium text-brand hover:underline"
              >
                View all tracks
              </Link>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tracks.map((track) => (
                <Link
                  key={track.id}
                  href={`/series/${track.slug}`}
                  className="group block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <article className="flex h-full flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow group-hover:shadow-md">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center rounded-full bg-success-light px-2.5 py-0.5 text-xs font-medium text-success">
                        Track
                      </span>
                      <span className="text-xs text-gray-400">
                        {track.courseCount} course
                        {track.courseCount === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {track.title}
                      </h3>
                      {track.subtitle && (
                        <p className="mt-1 text-sm text-gray-500">
                          {track.subtitle}
                        </p>
                      )}
                    </div>

                    <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
                      {track.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500">
                      <span className="font-medium text-brand">
                        Explore track
                      </span>
                      {track.publishedLessonCount > 0 && (
                        <span>{track.publishedLessonCount} lessons</span>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            <Image
              src="/icon.svg"
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 rounded-md"
            />
            <span className="text-sm font-medium text-gray-700">
              Fohlio Courses
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Internal learning platform — {new Date().getFullYear()} Fohlio.
          </p>
        </div>
      </footer>
    </div>
  );
}

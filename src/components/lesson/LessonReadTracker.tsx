"use client";

/**
 * LessonReadTracker — client island that marks a lesson as read once the user
 * scrolls to the end of the content.
 *
 * Design decisions:
 * - Renders an empty 1px sentinel <div> placed after the lesson content.
 * - Uses IntersectionObserver to detect when the sentinel enters the viewport.
 * - SHORT-LESSON GUARD: does NOT fire when the sentinel is already visible on
 *   mount without any scroll. The guard is gated on at least one real scroll
 *   event having fired before the intersection callback is allowed to POST.
 *   Short lessons where the end is immediately visible are excluded — the user
 *   has not actually read anything.
 * - Fires exactly once per mount (ref-guarded). Fire-and-forget.
 * - On success: calls router.refresh() so server-rendered list pages re-render
 *   with the updated read state. The lesson pages use force-dynamic so a refresh
 *   re-fetches the per-user data without any cache invalidation.
 * - Anon 401 / network errors are swallowed silently (no UI error).
 * - No new dependencies — uses native IntersectionObserver + fetch.
 *
 * Props:
 * - lessonId: the DB lesson ID (NOT the slug). Passed from the server page.
 *
 * Caller responsibility: only render this when the user is authenticated AND
 * lesson.contentType === "html" AND lesson.contentHtml.trim() !== "".
 * PDF and empty lessons must NOT mount this component.
 */

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface LessonReadTrackerProps {
  lessonId: string;
}

export function LessonReadTracker({ lessonId }: LessonReadTrackerProps) {
  const router = useRouter();
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Guard: fire POST at most once per mount.
  const firedRef = useRef(false);
  // Guard: track whether at least one real scroll event has occurred.
  const hasScrolledRef = useRef(false);

  const markRead = useCallback(async () => {
    if (firedRef.current) return;
    firedRef.current = true;

    try {
      const res = await fetch(`/api/lessons/${lessonId}/read`, {
        method: "POST",
      });
      // 401 (anon, or session expired) -> swallow silently.
      // Any 2xx -> refresh the route so list pages pick up the read state.
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // Network failure — fire-and-forget, no UI error.
    }
  }, [lessonId, router]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Track real scroll events (not programmatic or initial render).
    const onScroll = () => {
      hasScrolledRef.current = true;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && hasScrolledRef.current) {
            // Sentinel is visible AND a real scroll has occurred -> mark read.
            void markRead();
          }
        }
      },
      {
        // Fire when at least 50% of the sentinel is visible (it's an empty div,
        // so effectively fires when it enters the viewport).
        threshold: 0.5,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [markRead]);

  return (
    <div
      ref={sentinelRef}
      data-testid="lesson-read-sentinel"
      aria-hidden="true"
      style={{ height: 1 }}
    />
  );
}

import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import type { StudentProgress } from "@/lib/types";

export function useProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetch("/api/progress")
      .then((res) => res.json())
      .then((data) => setProgress(data.progress ?? null))
      .catch(() => setProgress(null))
      .finally(() => setLoading(false));
  }, [user]);

  return { progress, loading };
}

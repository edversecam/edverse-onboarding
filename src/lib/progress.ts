"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "./supabase/client";
import { useUser } from "./auth";

export interface ProgressData {
  done: string[];
  index: number;
}

/** Loads and saves the signed-in user's progress for a course. */
export function useProgress(courseId: string) {
  const user = useUser();
  const [initial, setInitial] = useState<ProgressData | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (user === undefined) return; // auth still resolving
    if (!user) {
      setInitial({ done: [], index: 0 });
      setReady(true);
      return;
    }
    const supabase = createClient();
    supabase
      .from("progress")
      .select("completed_lessons,last_index")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle()
      .then(({ data }) => {
        setInitial({
          done: data?.completed_lessons ?? [],
          index: data?.last_index ?? 0,
        });
        setReady(true);
      });
  }, [user, courseId]);

  const persist = useCallback(
    (done: string[], index: number) => {
      if (!user) return;
      const supabase = createClient();
      supabase
        .from("progress")
        .upsert({
          user_id: user.id,
          course_id: courseId,
          completed_lessons: done,
          last_index: index,
          updated_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error)
            console.warn("Edverse: progress save skipped —", error.message || error.code || error);
        });
    },
    [user, courseId]
  );

  return { ready, initial, persist };
}

"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "./supabase/client";

/** undefined = still loading, null = signed out, User = signed in. */
export function useUser(): User | null | undefined {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);
  return user;
}

export type Role = "learner" | "author" | "admin";

export function useRole(): Role | null {
  const user = useUser();
  const [role, setRole] = useState<Role | null>(null);
  useEffect(() => {
    if (!user) {
      setRole(null);
      return;
    }
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setRole(((data?.role as Role) ?? "learner")));
  }, [user]);
  return role;
}

export async function signOut() {
  await createClient().auth.signOut();
}

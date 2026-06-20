"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/auth";

// Pages where we must NOT bounce the user (the auth flow itself lives here).
const EXEMPT = ["/login", "/security", "/auth"];

/**
 * Enforces mandatory two-factor authentication: any signed-in user who hasn't
 * reached assurance level aal2 is routed to enrol (no factor) or verify
 * (factor exists) before they can reach app pages.
 */
export function MfaGuard() {
  const user = useUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if (EXEMPT.some((p) => pathname.startsWith(p))) return;

    let active = true;
    (async () => {
      const supabase = createClient();
      const { data, error } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (!active || error || !data) return;
      if (data.currentLevel === "aal2") return; // fully authenticated

      const target = data.nextLevel === "aal2" ? "/security/verify" : "/security/setup";
      router.replace(`${target}?next=${encodeURIComponent(pathname)}`);
    })();

    return () => {
      active = false;
    };
  }, [user, pathname, router]);

  return null;
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useUser } from "@/lib/auth";

export function AccountMenu() {
  const user = useUser();
  const router = useRouter();

  if (user === undefined) {
    return <div className="h-9 w-20 animate-pulse rounded-lg bg-surface-2" />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-muted sm:inline">{user.email}</span>
      <button
        type="button"
        onClick={async () => {
          await signOut();
          router.push("/login");
          router.refresh();
        }}
        className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-2"
      >
        Sign out
      </button>
    </div>
  );
}

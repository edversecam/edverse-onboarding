"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { signOut } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

function VerifyInner() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/";
  const supabase = createClient();

  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.mfa.listFactors();
      const totp = data?.totp?.find((f) => f.status === "verified");
      if (!totp) {
        // No verified factor — send to setup.
        router.replace(`/security/setup?next=${encodeURIComponent(next)}`);
        return;
      }
      setFactorId(totp.id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;
    setBusy(true);
    setError(null);
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
    if (cErr) {
      setError(cErr.message);
      setBusy(false);
      return;
    }
    const { error: vErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: code.trim(),
    });
    if (vErr) setError(vErr.message);
    else {
      router.push(next);
      router.refresh();
    }
    setBusy(false);
  };

  return (
    <div className="grid min-h-dvh place-items-center bg-gradient-to-b from-brand-tint/50 to-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-7 shadow-[var(--shadow-card)]">
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Two-factor verification
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Enter the 6-digit code from your authenticator app to finish signing
            in.
          </p>

          <form onSubmit={verify} className="mt-5 space-y-3">
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              autoFocus
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="input text-center text-lg tracking-[0.4em]"
            />
            {error && (
              <p className="rounded-lg bg-danger-tint px-3 py-2 text-sm text-danger">{error}</p>
            )}
            <button
              type="submit"
              disabled={busy || code.length < 6}
              className="w-full rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
            >
              {busy ? "Verifying…" : "Verify"}
            </button>
          </form>

          <button
            type="button"
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
            className="mt-4 w-full text-center text-sm text-muted hover:text-brand-700"
          >
            Use a different account
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-muted">Loading…</div>}>
      <VerifyInner />
    </Suspense>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { createClient } from "@/lib/supabase/client";

function SetupInner() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/";
  const supabase = createClient();

  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Enrol a TOTP factor on mount.
  useEffect(() => {
    (async () => {
      // If a factor already exists, go verify instead.
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const existing = factors?.totp?.find((f) => f.status === "verified");
      if (existing) {
        router.replace(`/security/verify?next=${encodeURIComponent(next)}`);
        return;
      }
      // Clean up any half-finished (unverified) factors first.
      for (const f of factors?.totp ?? []) {
        if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `Edverse ${Date.now()}`,
      });
      if (error) setError(error.message);
      else {
        setQr(data.totp.qr_code);
        setSecret(data.totp.secret);
        setFactorId(data.id);
      }
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
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-7 shadow-[var(--shadow-card)]">
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Set up two-factor authentication
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Scan this QR code with an authenticator app (Google Authenticator,
            Authy, 1Password…), then enter the 6-digit code to finish securing
            your account.
          </p>

          <div className="mt-5 flex flex-col items-center gap-3">
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qr}
                alt="2FA QR code"
                className="h-44 w-44 rounded-lg border border-border bg-white p-2"
              />
            ) : (
              <div className="h-44 w-44 animate-pulse rounded-lg bg-surface-2" />
            )}
            {secret && (
              <p className="text-center text-xs text-muted">
                Can&apos;t scan? Enter this key manually:
                <br />
                <code className="mt-1 inline-block rounded bg-surface-2 px-2 py-1 font-mono text-foreground">
                  {secret}
                </code>
              </p>
            )}
          </div>

          <form onSubmit={verify} className="mt-5 space-y-3">
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
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
              disabled={busy || !factorId || code.length < 6}
              className="w-full rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
            >
              {busy ? "Verifying…" : "Verify & continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-muted">Loading…</div>}>
      <SetupInner />
    </Suspense>
  );
}

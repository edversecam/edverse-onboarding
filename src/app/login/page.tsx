"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import {
  FacebookIcon,
  GoogleIcon,
  TelegramIcon,
} from "@/components/auth/ProviderIcons";
import { createClient } from "@/lib/supabase/client";
import { signInWithTelegram, telegramConfigured } from "@/lib/telegram";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState<null | string>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const supabase = createClient();
  const callbackUrl = (n: string) =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(n)}`;

  const oauth = async (provider: "google" | "facebook") => {
    setError(null);
    setBusy(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl(next) },
    });
    if (error) {
      setError(
        `${provider === "google" ? "Google" : "Facebook"} sign-in isn't enabled yet. ${error.message}`
      );
      setBusy(null);
    }
  };

  const telegram = async () => {
    setError(null);
    if (!telegramConfigured()) {
      setError(
        "Telegram login isn't configured yet — an admin needs to set the bot. See the setup notes."
      );
      return;
    }
    setBusy("telegram");
    try {
      await signInWithTelegram(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Telegram sign-in failed.");
    }
    setBusy(null);
  };

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("email");
    setError(null);
    setNotice(null);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else {
        // MfaGuard will step up to 2FA (enrol or verify) before any app page.
        router.push(next);
        router.refresh();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) setError(error.message);
      else if (data.session) {
        router.push(next);
        router.refresh();
      } else {
        const { error: e2 } = await supabase.auth.signInWithPassword({ email, password });
        if (e2) {
          setNotice("Account created — please sign in.");
          setMode("signin");
        } else {
          router.push(next);
          router.refresh();
        }
      }
    }
    setBusy(null);
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden min-h-dvh flex-col justify-between overflow-hidden bg-gradient-to-br from-brand to-brand-700 p-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #fff 0 1px, transparent 1px 22px)",
          }}
        />
        <div className="relative">
          <Logo light />
        </div>
        <div className="relative max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            New Hire Onboarding
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight">
            Welcome to the team. Let&apos;s get you started.
          </h1>
          <p className="mt-4 text-white/80">
            Sign in to access your personalized onboarding courses, track your
            progress, and meet your new team.
          </p>
        </div>
        <div className="relative flex items-stretch gap-6 text-sm">
          <Stat value="12" label="Guided lessons" />
          <Divider />
          <Stat value="~45m" label="To complete" />
          <Divider />
          <Stat value="Secure" label="2-factor login" />
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-7 flex justify-center lg:hidden">
            <Logo />
          </div>

          <h2 className="font-display text-3xl font-semibold text-foreground">
            {mode === "signin" ? "Sign in to Edverse" : "Create your account"}
          </h2>
          <p className="mt-1.5 text-sm text-muted">
            Use your Google, Facebook, Telegram, or email account to continue to
            onboarding.
          </p>

          <div className="mt-6 space-y-3">
            <SocialButton onClick={() => oauth("google")} busy={busy === "google"}>
              <GoogleIcon className="h-5 w-5" />
              Continue with Google
            </SocialButton>
            <SocialButton onClick={() => oauth("facebook")} busy={busy === "facebook"}>
              <FacebookIcon className="h-5 w-5" />
              Continue with Facebook
            </SocialButton>
            <SocialButton onClick={telegram} busy={busy === "telegram"}>
              <TelegramIcon className="h-5 w-5" />
              Continue with Telegram
            </SocialButton>
          </div>

          <div className="my-5 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-border" />
            or with email
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submitEmail} className="space-y-3">
            {mode === "signup" && (
              <Labeled label="Full name">
                <input
                  className="input"
                  placeholder="Jordan Lee"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </Labeled>
            )}
            <Labeled label="Email">
              <input
                type="email"
                required
                className="input"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </Labeled>
            <Labeled
              label="Password"
              aside={
                mode === "signin" ? (
                  <span className="text-xs font-semibold text-brand-700">Forgot?</span>
                ) : undefined
              }
            >
              <input
                type="password"
                required
                minLength={6}
                className="input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </Labeled>

            {error && (
              <p className="rounded-lg bg-danger-tint px-3 py-2 text-sm text-danger">{error}</p>
            )}
            {notice && (
              <p className="rounded-lg bg-success-tint px-3 py-2 text-sm text-success">{notice}</p>
            )}

            <button
              type="submit"
              disabled={busy === "email"}
              className="w-full rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
            >
              {busy === "email" ? "Please wait…" : "Continue"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            {mode === "signin" ? "New here? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setNotice(null);
              }}
              className="font-semibold text-brand-700 hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
            <LockIcon /> Protected by two-factor authentication
          </p>
        </div>
      </main>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-semibold">{value}</p>
      <p className="text-white/70">{label}</p>
    </div>
  );
}
function Divider() {
  return <span className="w-px self-stretch bg-white/20" />;
}
function SocialButton({
  children,
  onClick,
  busy,
}: {
  children: React.ReactNode;
  onClick: () => void;
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-surface-2 disabled:opacity-60"
    >
      {children}
    </button>
  );
}
function Labeled({
  label,
  aside,
  children,
}: {
  label: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {aside}
      </span>
      {children}
    </label>
  );
}
function LockIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
      <path d="M8 1a3 3 0 0 0-3 3v2H4.5A1.5 1.5 0 0 0 3 7.5v5A1.5 1.5 0 0 0 4.5 14h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 6H11V4a3 3 0 0 0-3-3Zm1.5 5h-3V4a1.5 1.5 0 0 1 3 0v2Z" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-muted">Loading…</div>}>
      <LoginInner />
    </Suspense>
  );
}

"use client";

import { createClient } from "./supabase/client";

const BOT_ID = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID;

/** Telegram is only offered when the bot id is configured. */
export function telegramConfigured(): boolean {
  return !!BOT_ID;
}

interface TelegramAPI {
  Login: {
    auth: (
      opts: { bot_id: string; request_access?: string },
      cb: (user: unknown) => void
    ) => void;
  };
}

function loadWidget(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as unknown as { Telegram?: TelegramAPI }).Telegram?.Login)
      return resolve();
    const s = document.createElement("script");
    s.src = "https://telegram.org/js/telegram-widget.js?22";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load the Telegram widget."));
    document.body.appendChild(s);
  });
}

/**
 * Opens the Telegram login popup, then exchanges the verified payload for a
 * Supabase session via the `telegram-auth` edge function (which checks the
 * signature with the bot token server-side).
 */
export async function signInWithTelegram(next: string): Promise<void> {
  await loadWidget();
  const tg = (window as unknown as { Telegram: TelegramAPI }).Telegram.Login;

  const user = await new Promise<Record<string, unknown>>((resolve, reject) => {
    tg.auth({ bot_id: BOT_ID!, request_access: "write" }, (u) => {
      if (!u) reject(new Error("Telegram authorization was cancelled."));
      else resolve(u as Record<string, unknown>);
    });
  });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/telegram-auth`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify(user),
    }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Telegram verification failed.");
  }
  const { token_hash } = await res.json();

  const supabase = createClient();
  const { error } = await supabase.auth.verifyOtp({ type: "email", token_hash });
  if (error) throw error;

  window.location.href = next;
}

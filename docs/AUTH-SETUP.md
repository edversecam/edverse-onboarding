# Edverse — Login & 2FA setup

The login page offers **Google**, **Facebook**, **Telegram**, and **email/password**,
and enforces **two-factor authentication (TOTP)** for every account.

Email/password + 2FA work out of the box. The social providers need credentials
from each platform (only you can create these) enabled in Supabase.

## Showing the social buttons
The Google / Facebook / Telegram buttons are **hidden until configured**. After
enabling a provider below, reveal its button with an env var (in Vercel +
`.env.local`), then redeploy:
- Google:   `NEXT_PUBLIC_AUTH_GOOGLE=true`
- Facebook: `NEXT_PUBLIC_AUTH_FACEBOOK=true`
- Telegram: `NEXT_PUBLIC_TELEGRAM_BOT_ID=<bot id>` (the button shows automatically)

Supabase project: **edverse** (`ugrbjajtazdgjfhdcbtx`) ·
Dashboard → Authentication → Providers.

## Two-factor authentication
Currently **disabled** — sign-in goes straight through with email/password (or a
social provider). Supabase still supports TOTP MFA if you want to bring it back
later (`supabase.auth.mfa.enroll/challenge/verify`).

## Google
1. Google Cloud Console → APIs & Services → Credentials → **OAuth client ID** (Web).
2. Authorized redirect URI: `https://ugrbjajtazdgjfhdcbtx.supabase.co/auth/v1/callback`
3. Copy the Client ID + Secret into Supabase → Authentication → Providers → **Google** → enable.

## Facebook
1. developers.facebook.com → create an app → add **Facebook Login**.
2. Valid OAuth redirect URI: `https://ugrbjajtazdgjfhdcbtx.supabase.co/auth/v1/callback`
3. Copy the App ID + Secret into Supabase → Providers → **Facebook** → enable.

## Telegram
Telegram isn't a built-in Supabase provider, so it's wired through the
`telegram-auth` edge function (already deployed) which verifies the login
signature with your bot token.

1. In Telegram, talk to **@BotFather** → create a bot (or reuse one) → copy the
   **bot token** and note the **bot id** (the number before `:` in the token).
2. BotFather → `/setdomain` → set it to `edverse-onboarding.vercel.app`.
3. Set the function secret:
   `supabase secrets set TELEGRAM_BOT_TOKEN=<token>` (or in the dashboard →
   Edge Functions → telegram-auth → Secrets).
4. Add the bot id as a public env var in Vercel and `.env.local`:
   `NEXT_PUBLIC_TELEGRAM_BOT_ID=<bot id>`
5. Redeploy. The “Continue with Telegram” button then opens the Telegram popup.

## Redirect URLs (for OAuth + production)
Supabase → Authentication → URL Configuration → add:
- Site URL: `https://edverse-onboarding.vercel.app`
- Redirect URLs: `https://edverse-onboarding.vercel.app/auth/callback`,
  `http://localhost:3000/auth/callback`

# Edverse — Login & 2FA setup

The login page offers **Google**, **Facebook**, **Telegram**, and **email/password**,
and enforces **two-factor authentication (TOTP)** for every account.

Email/password + 2FA work out of the box. The social providers need credentials
from each platform (only you can create these) enabled in Supabase.

Supabase project: **edverse** (`ugrbjajtazdgjfhdcbtx`) ·
Dashboard → Authentication → Providers.

## Two-factor authentication (already on)
- After the first sign-in, every user is sent to **/security/setup** to scan a
  QR code with an authenticator app (Google Authenticator, Authy, 1Password…).
- On later logins they enter a 6-digit code at **/security/verify**.
- Enforced globally by `MfaGuard` (`src/components/auth/MfaGuard.tsx`).

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

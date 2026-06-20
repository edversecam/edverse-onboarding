// Verifies a Telegram Login Widget payload server-side (HMAC with the bot
// token) and returns a magic-link token_hash the client exchanges for a
// Supabase session. Requires the TELEGRAM_BOT_TOKEN secret to be set.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!botToken) return json({ error: "Telegram is not configured (missing bot token)." }, 500);

    const user = (await req.json()) as Record<string, string>;
    const { hash, ...fields } = user;
    if (!hash) return json({ error: "Missing Telegram hash." }, 400);

    // Verify signature: secret = SHA256(bot_token); HMAC-SHA256 of the sorted
    // "key=value\n" data-check string must equal the provided hash.
    const enc = new TextEncoder();
    const dataCheck = Object.keys(fields)
      .sort()
      .map((k) => `${k}=${fields[k]}`)
      .join("\n");
    const secretKey = await crypto.subtle.digest("SHA-256", enc.encode(botToken));
    const key = await crypto.subtle.importKey(
      "raw",
      secretKey,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(dataCheck));
    const hex = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
    if (hex !== hash) return json({ error: "Invalid Telegram signature." }, 401);

    if (Date.now() / 1000 - Number(fields.auth_date) > 86400)
      return json({ error: "Telegram login expired, please try again." }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const email = `tg${fields.id}@telegram.edverse.local`;
    const fullName =
      [fields.first_name, fields.last_name].filter(Boolean).join(" ") ||
      fields.username ||
      `Telegram ${fields.id}`;

    let link = await admin.auth.admin.generateLink({ type: "magiclink", email });
    if (link.error) {
      await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name: fullName, telegram_id: fields.id, provider: "telegram" },
      });
      link = await admin.auth.admin.generateLink({ type: "magiclink", email });
      if (link.error) return json({ error: link.error.message }, 500);
    }

    return json({ email, token_hash: link.data.properties.hashed_token });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

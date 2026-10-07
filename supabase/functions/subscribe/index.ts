import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json; charset=utf-8",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: cors });

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Enter a valid email address." }, 400);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const ip = req.headers.get("cf-connecting-ip") || "unknown";
    const { data: allowed, error: rateError } = await db.rpc("hit_rate_limit", { p_bucket: "subscribe", p_subject: ip, p_max: 5, p_window_seconds: 3600 });
    if (rateError) throw rateError;
    if (allowed !== true) return json({ error: "Please wait before trying again." }, 429);
    const { error } = await db.from("subscribers").upsert({ email, source: body.source || "landing", utm_source: body.utm_source || null, utm_campaign: body.utm_campaign || null }, { onConflict: "email" });
    if (error) throw error;
    const resendKey = Deno.env.get("RESEND_API_KEY"), sender = Deno.env.get("EMAIL_FROM");
    if (resendKey && sender) {
      const headers = { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" };
      await fetch("https://api.resend.com/emails", { method: "POST", headers, body: JSON.stringify({ from: sender, to: email, subject: "Your free Promptora prompt", html: "<p>Here is a prompt to try today:</p><blockquote>Act as a helpful coach for [GOAL]. Ask one question at a time, then give me a short practical plan with a clear first step.</blockquote>" }) });
      await fetch("https://api.resend.com/emails", { method: "POST", headers, body: JSON.stringify({ from: sender, to: email, subject: "Your Promptora launch price reminder", scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), html: `<p>A quick reminder: Promptora’s launch price is ₹199 for lifetime access to 250+ practical AI prompts.</p><p><a href="${Deno.env.get("SITE_URL")}">Explore the prompt library</a></p><p>You can unsubscribe from future emails at any time.</p>` }) });
    }
    return json({ ok: true });
  } catch (error) {
    console.error("subscribe failed:", error);
    return json({ error: "We could not save your email. Please try again." }, 500);
  }
});

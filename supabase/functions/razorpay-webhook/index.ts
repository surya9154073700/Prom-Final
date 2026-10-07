import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info, x-razorpay-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json; charset=utf-8",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: cors });

async function hmac(secret: string, value: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return [...new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)))].map(x => x.toString(16).padStart(2, "0")).join("");
}

async function sha(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";
  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
  if (!secret || await hmac(secret, raw) !== signature) return json({ error: "Invalid signature" }, 401);

  let event: any;
  try { event = JSON.parse(raw); } catch { return json({ error: "Invalid payload" }, 400); }
  if (event.event !== "payment.captured") return json({ ok: true });

  const payment = event.payload?.payment?.entity;
  if (!payment?.id || !payment?.order_id || payment.status !== "captured") return json({ error: "Invalid payment" }, 400);
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: existing } = await db.from("purchases").select("id").eq("razorpay_payment_id", payment.id).maybeSingle();
  if (existing) return json({ ok: true, idempotent: true });

  const { data: order, error: lookupError } = await db.from("purchases").select("id,amount,status,product").eq("razorpay_order_id", payment.order_id).maybeSingle();
  if (lookupError) return json({ error: "Could not verify order" }, 500);
  if (!order || order.status !== "created" || order.amount !== payment.amount || payment.currency !== "INR") {
    return json({ error: "Payment does not match the server-created order" }, 400);
  }

  const { data: purchase, error } = await db.from("purchases").update({ razorpay_payment_id: payment.id, email: payment.email || null, status: "paid" }).eq("id", order.id).eq("status", "created").select("*").maybeSingle();
  if (error) {
    // A duplicate webhook may race with the first delivery. The payment ID is unique.
    const { data: duplicate } = await db.from("purchases").select("id").eq("razorpay_payment_id", payment.id).maybeSingle();
    if (duplicate) return json({ ok: true, idempotent: true });
    console.error(error);
    return json({ error: "Purchase record failed" }, 500);
  }
  if (!purchase) return json({ ok: true, idempotent: true });

  const eventId = `purchase_${payment.id}`;
  const pixel = Deno.env.get("META_PIXEL_ID"), accessToken = Deno.env.get("META_ACCESS_TOKEN");
  if (pixel && accessToken) {
    const userData: Record<string, string> = {};
    if (payment.email) userData.em = await sha(payment.email.trim().toLowerCase());
    await fetch(`https://graph.facebook.com/v20.0/${pixel}/events?access_token=${accessToken}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: [{ event_name: "Purchase", event_time: Math.floor(Date.now() / 1000), event_id: eventId, action_source: "website", event_source_url: Deno.env.get("SITE_URL"), user_data: userData, custom_data: { currency: "INR", value: payment.amount / 100 } }] }) });
  }

  if (purchase.email && Deno.env.get("RESEND_API_KEY")) {
    const link = `${Deno.env.get("SITE_URL")}/?token=${purchase.access_token}`;
    await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: Deno.env.get("EMAIL_FROM"), to: purchase.email, subject: "Your Promptora library is ready", html: `<p>Thanks for your purchase. Open your library using your private link:</p><p><a href="${link}">Open my prompts</a></p>` }) });
  }
  return json({ ok: true });
  } catch (error) {
    console.error("razorpay-webhook failed:", error);
    return json({ error: "Webhook processing failed" }, 500);
  }
});

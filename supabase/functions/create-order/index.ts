import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json; charset=utf-8",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: cors });
}

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const razorpayId = (Deno.env.get("RAZORPAY_KEY_ID") || "").trim();
    const razorpaySecret = (Deno.env.get("RAZORPAY_KEY_SECRET") || "").trim();
    if (!supabaseUrl || !serviceKey || !razorpayId || !razorpaySecret) {
      console.error("create-order is missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RAZORPAY_KEY_ID, or RAZORPAY_KEY_SECRET");
      return json({ error: "Checkout is not configured yet. Please contact support." }, 503);
    }

    let body: Record<string, unknown>;
    try { body = await req.json(); } catch { return json({ error: "Request body must be valid JSON." }, 400); }
    const product = body.product === "bonus" ? "bonus" : "library";
    const db = createClient(supabaseUrl, serviceKey);
    const ip = req.headers.get("cf-connecting-ip") || "unknown";
    const { data: allowed, error: rateError } = await db.rpc("hit_rate_limit", { p_bucket: "checkout", p_subject: ip, p_max: 12, p_window_seconds: 3600 });
    if (rateError) {
      console.error("Checkout rate-limit check failed:", rateError.message);
      return json({ error: "Checkout is temporarily unavailable. Please try again shortly." }, 503);
    }
    if (allowed !== true) return json({ error: "Too many checkout attempts. Please try again later." }, 429);

    if (product === "library") {
      const { count, error } = await db.from("purchases").select("id", { count: "exact", head: true }).eq("status", "paid").eq("product", "library");
      if (error) throw error;
      if ((count || 0) >= 1000) return json({ error: "The launch price spots have been claimed." }, 409);
    }

    const notes = {
      product,
      utm_source: String(body.utm_source || "").slice(0, 200),
      utm_campaign: String(body.utm_campaign || "").slice(0, 200),
      utm_medium: String(body.utm_medium || "").slice(0, 200),
    };
    console.log("Razorpay credential diagnostics:", {
      keyIdPrefix: razorpayId.slice(0, 8),
      keyIdLength: razorpayId.length,
      keySecretLength: razorpaySecret.length,
    });
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: "Basic " + btoa(`${razorpayId}:${razorpaySecret}`), "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 19900, currency: "INR", receipt: `pr_${crypto.randomUUID().slice(0, 20)}`, notes }),
    });
    const responseText = await response.text();
    let orderData: any;
    try { orderData = JSON.parse(responseText); } catch {
      console.error(`[Razorpay orders] HTTP ${response.status}: non-JSON response:`, responseText);
      return json({ error: "Payment provider returned an invalid response. Please retry shortly." }, 502);
    }
    if (!response.ok) {
      console.error(`[Razorpay orders] HTTP ${response.status}:`, responseText);
      return json({ error: "Payment provider could not start checkout. Please retry shortly." }, 502);
    }

    const { error: insertError } = await db.from("purchases").insert({
      razorpay_order_id: orderData.id,
      amount: 19900,
      product,
      status: "created",
      utm_source: notes.utm_source || null,
      utm_campaign: notes.utm_campaign || null,
      utm_medium: notes.utm_medium || null,
    });
    if (insertError) throw insertError;

    return json({ order_id: orderData.id, amount: orderData.amount, key_id: razorpayId, product });
  } catch (error) {
    console.error("create-order failed:", error);
    return json({ error: "Checkout could not start. Please try again." }, 500);
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Max-Age": "86400", "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: cors });
Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);
  const order = new URL(req.url).searchParams.get("order");
  if (!order || !/^order_[A-Za-z0-9]+$/.test(order)) return json({ error: "Order required" }, 400);
  try {
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: purchase, error } = await db.from("purchases").select("status,access_token,razorpay_payment_id,product").eq("razorpay_order_id", order).maybeSingle();
    if (error) throw error;
    return json(purchase?.status === "paid" ? { paid: true, token: purchase.access_token, product: purchase.product, event_id: `purchase_${purchase.razorpay_payment_id}` } : { paid: false });
  } catch (error) {
    console.error("purchase-status failed:", error);
    return json({ error: "Payment status is unavailable" }, 500);
  }
});

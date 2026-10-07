import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info, x-admin-password", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Max-Age": "86400", "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: cors });
Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);
  try {
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const ip = req.headers.get("cf-connecting-ip") || "unknown";
  const { data: allowed } = await db.rpc("hit_rate_limit", { p_bucket: "admin", p_subject: ip, p_max: 10, p_window_seconds: 3600 });
  const expected = Deno.env.get("ADMIN_PASSWORD");
  const supplied = req.headers.get("x-admin-password") || "";
  if (allowed !== true || !expected || supplied !== expected) return json({ error: "Unauthorized" }, allowed === true ? 401 : 429);
  const [visits, subscribers, purchases] = await Promise.all([
    db.from("visits").select("utm_source"),
    db.from("subscribers").select("utm_source"),
    db.from("purchases").select("amount,utm_source").eq("status", "paid"),
  ]);
  if (visits.error || subscribers.error || purchases.error) return json({ error: "Dashboard data is unavailable" }, 500);
  const sources = new Map<string, { visitors: number; emails: number; purchases: number; revenue: number }>();
  function bump(rows: any[], key: "visitors" | "emails" | "purchases") {
    for (const row of rows || []) {
      const source = row.utm_source || "direct";
      const totals = sources.get(source) || { visitors: 0, emails: 0, purchases: 0, revenue: 0 };
      totals[key]++;
      if (key === "purchases") totals.revenue += row.amount / 100;
      sources.set(source, totals);
    }
  }
  bump(visits.data || [], "visitors"); bump(subscribers.data || [], "emails"); bump(purchases.data || [], "purchases");
  const totals = [...sources.values()].reduce((a, x) => ({ visitors: a.visitors + x.visitors, emails: a.emails + x.emails, purchases: a.purchases + x.purchases, revenue: a.revenue + x.revenue }), { visitors: 0, emails: 0, purchases: 0, revenue: 0 });
  return json({ totals: { ...totals, conversion: totals.visitors ? totals.purchases / totals.visitors : 0 }, by_source: Object.fromEntries(sources) });
  } catch (error) {
    console.error("admin-stats failed:", error);
    return json({ error: "Dashboard data is unavailable" }, 500);
  }
});

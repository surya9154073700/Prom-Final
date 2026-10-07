import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json; charset=utf-8",
};
const json = (body: unknown, status = 200, cache = "no-store") => new Response(JSON.stringify(body), { status, headers: { ...cors, "Cache-Control": cache } });

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);
  try {
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { count, error } = await db.from("purchases").select("id", { count: "exact", head: true }).eq("status", "paid").eq("product", "library");
    if (error) throw error;
    return json({ remaining: Math.max(0, 1000 - (count || 0)) }, 200, "public, max-age=30");
  } catch (error) {
    console.error("stock failed:", error);
    return json({ remaining: null, error: "Stock is unavailable" }, 500);
  }
});

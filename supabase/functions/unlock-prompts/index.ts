import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Max-Age": "86400", "Content-Type": "application/json; charset=utf-8", "Cache-Control": "private, no-store" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: cors });
Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || token.length > 100) return json({ error: "Access link required" }, 401);
  try {
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: purchase, error: purchaseError } = await db.from("purchases").select("id,product").eq("access_token", token).eq("status", "paid").maybeSingle();
    if (purchaseError) throw purchaseError;
    if (!purchase) return json({ error: "This access link is invalid or expired." }, 403);
    const { data, error } = await db.from("prompts").select("id,title,category,prompt_text,output_example,is_free,sort_order").eq("is_bonus", purchase.product === "bonus").order("sort_order");
    if (error) return json({ error: "Could not load prompts." }, 500);
    return json({ prompts: data });
  } catch (error) {
    console.error("unlock-prompts failed:", error);
    return json({ error: "Could not load prompts." }, 500);
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Max-Age": "86400", "Content-Type": "application/json; charset=utf-8" };
Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: cors });
  try {
    const body = await req.json();
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { error } = await db.from("visits").upsert({ session_id: String(body.session_id || crypto.randomUUID()).slice(0, 80), utm_source: body.utm_source || null, utm_campaign: body.utm_campaign || null }, { onConflict: "session_id" });
    if (error) throw error;
    return Response.json({ ok: true }, { headers: cors });
  } catch { return Response.json({ ok: false }, { status: 500, headers: cors }); }
});

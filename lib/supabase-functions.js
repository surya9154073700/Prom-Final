const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function supabaseFunctionUrl(functionName) {
  const configured = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!configured) throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL in .env.local and restart the dev server.");

  let url;
  try { url = new URL(configured); } catch { throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid Supabase project URL."); }
  const localHost = ["localhost", "127.0.0.1"].includes(url.hostname);
  if (url.protocol !== "https:" && !(localHost && url.protocol === "http:")) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must use HTTPS for the deployed Supabase project.");
  }
  if (!localHost && !url.hostname.endsWith(".supabase.co")) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be the project URL, such as https://<project-ref>.supabase.co.");
  }
  if (!publicKey) throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and restart the dev server.");
  return `${url.origin}/functions/v1/${encodeURIComponent(functionName)}`;
}

export function supabaseFunctionHeaders(extra = {}) {
  if (!publicKey) throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and restart the dev server.");
  return { apikey: publicKey, Authorization: `Bearer ${publicKey}`, ...extra };
}

export async function readFunctionJson(response, functionName) {
  const responseText = await response.text();
  let data;
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    console.error(`[Supabase ${functionName}] ${response.url || "unknown URL"} HTTP ${response.status}: expected JSON, received:`, responseText);
    throw new Error(`Checkout service returned HTTP ${response.status}. Check the Supabase function URL and deployment.`);
  }
  if (!response.ok) {
    console.error(`[Supabase ${functionName}] ${response.url || "unknown URL"} HTTP ${response.status}:`, responseText);
    throw new Error(data.error || `Checkout service returned HTTP ${response.status}.`);
  }
  return data;
}

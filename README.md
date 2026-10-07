# Promptora

Mobile-first ad landing page for Promptora’s prompt library. Public visitors receive only the five free prompt bodies and the titles/categories of the locked samples. Private prompt text is returned by a Supabase Edge Function only after a paid purchase’s access token is validated.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SUPABASE_URL` to the Supabase project root URL (`https://<project-ref>.supabase.co`), plus `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, and `NEXT_PUBLIC_META_PIXEL_ID`. Do not put `/functions/v1` in the URL; the browser constructs the Edge Function URL itself. Restart `npm run dev` after changing environment variables.
3. Start the app with `npm run dev`.

### Required environment variables

The Next.js browser needs `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL`; `NEXT_PUBLIC_META_PIXEL_ID` enables browser pixel events. The Edge Functions need `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `SITE_URL`, and `ADMIN_PASSWORD`. Email delivery also needs `RESEND_API_KEY` and `EMAIL_FROM`. Server-side Meta Purchase events need `META_PIXEL_ID` and `META_ACCESS_TOKEN`. All are present in `.env.example`. Only the `NEXT_PUBLIC_*` values belong in the website host; set all other values as Supabase Function secrets.

If checkout says Supabase is not configured, make sure the two public Supabase values are present in `.env.local` and restart Next.js. The create-order call goes to `https://<project-ref>.supabase.co/functions/v1/create-order`; non-JSON responses are logged with their HTTP status and response body in the browser console.

The landing page supports `utm_source`, `utm_campaign`, `utm_medium`, `variant=1|2|3`, and `hook=` query parameters. Example: `/?utm_source=instagram&utm_campaign=students&variant=2&hook=prepare%20for%20an%20exam`.

## Supabase and payments

1. Create a Supabase project. Run `supabase/schema.sql` in the SQL Editor. The SQL seeds five free prompts and fifteen locked sample prompts, enables RLS, and exposes only free prompt rows to public roles.
2. Install the Supabase CLI and link the project. Set Edge Function secrets from `.env.example`: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `META_PIXEL_ID`, `META_ACCESS_TOKEN`, `SITE_URL`, `ADMIN_PASSWORD`, `RESEND_API_KEY`, and `EMAIL_FROM`. Never put the service role key or Razorpay secrets in `NEXT_PUBLIC_*` variables.
3. Deploy functions: `supabase functions deploy create-order`, `supabase functions deploy stock`, `supabase functions deploy track-visit`, `supabase functions deploy subscribe`, `supabase functions deploy unlock-prompts`, `supabase functions deploy purchase-status`, `supabase functions deploy razorpay-webhook`, and `supabase functions deploy admin-stats`. `supabase/config.toml` disables gateway JWT checks for these public entry points; each function enforces its own rate limit, access token, admin password, or Razorpay webhook signature. The `create-order` response includes JSON and CORS headers for browser preflight requests.
4. Configure Razorpay webhook URL as `https://YOUR_PROJECT.supabase.co/functions/v1/razorpay-webhook`, subscribe to `payment.captured`, and use the same webhook secret in the function secrets. The webhook verifies the signature, updates the existing order row idempotently, assigns its access token, emails the private link, and sends a Meta Conversions API Purchase event.
5. In Meta Events Manager, configure the Pixel ID and Conversions API token. Browser Purchase fires only after `purchase-status` confirms the webhook; the browser/server pair share `purchase_<razorpay_payment_id>` as `event_id` for deduplication.
6. Configure Resend with a verified sender. The subscribe function sends a welcome prompt and schedules a launch reminder 24 hours later.
7. Set `ADMIN_PASSWORD` to a long random value. Visit `/admin` for visitor, lead, purchase, revenue, and source reporting.

## Deploy the website

Deploy the Next.js app to Vercel or another Next.js 15 host. Add the public variables from `.env.example` to the host, then deploy. Use the same production site URL for `NEXT_PUBLIC_SITE_URL` and the Edge Function `SITE_URL`.

## Ad variants and content

`variant=1`, `variant=2`, and `variant=3` select the three headline versions. `hook=` replaces the first free card’s title and adapts its prompt. Replace the sample rows in `schema.sql` with the approved library content before launch. Stock is based on paid purchase rows and capped at 1,000.

## Operational notes

- Razorpay checkout is initialized by the browser, but fulfilment and prompt access are granted only from the signed webhook.
- The public `prompts` policy filters on `is_free = true`; do not add any public policy that allows locked row reads.
- Email and checkout functions apply database-backed rate limits. Restrict Supabase function invoke settings to public access as needed; the functions validate payloads and use server-side service credentials.
- The admin stats endpoint is password protected with `ADMIN_PASSWORD`; rotate this secret periodically.
- Free prompt copy is bundled as a small static client constant for fast rendering. Locked sample titles are metadata only, with dummy placeholder copy.

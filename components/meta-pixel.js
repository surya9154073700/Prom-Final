"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const isReal = PIXEL_ID && !PIXEL_ID.includes("PLACEHOLDER");

export function metaTrack(event, params = {}) {
  if (typeof window === "undefined") return;
  if (!window.fbq) return;
  try {
    const standard = ["PageView", "Lead", "InitiateCheckout", "Purchase", "AddPaymentInfo", "CompleteRegistration", "ViewContent"];
    if (standard.includes(event)) {
      const { eventID, ...eventParams } = params;
      window.fbq("track", event, eventParams, eventID ? { eventID } : undefined);
    } else {
      window.fbq("trackCustom", event, params);
    }
  } catch {}
}

function PageViewTracker() {
  const pathname = usePathname();
  const sp = useSearchParams();
  useEffect(() => {
    if (!isReal) return;
    metaTrack("PageView");
  }, [pathname, sp]);
  return null;
}

export default function MetaPixel() {
  if (!isReal) {
    // Dev / placeholder: no network calls, but window.fbq exists as a no-op.
    return (
      <Script id="fb-pixel-noop" strategy="afterInteractive">{`
        window.fbq = window.fbq || function(){ /* placeholder */ };
      `}</Script>
    );
  }
  return (
    <>
      <Script id="fb-pixel" strategy="afterInteractive">{`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${PIXEL_ID}');
      `}</Script>
      <noscript>
        <img height="1" width="1" style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`} alt="" />
      </noscript>
      <Suspense fallback={null}><PageViewTracker /></Suspense>
    </>
  );
}

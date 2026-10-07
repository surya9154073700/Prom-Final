import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import MetaPixel from "@/components/meta-pixel";
const inter=Inter({subsets:["latin"],variable:"--font-inter",display:"swap"});
export const metadata={metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||"https://promptora.in"),title:"Promptora — 250+ AI Prompts for Work, Study & Creating",description:"Get more from ChatGPT, Claude, and Gemini with practical, copy-ready prompts. Try 5 free. Unlock lifetime access for ₹199.",keywords:["AI prompts","ChatGPT prompts","Promptora","AI for work","AI study prompts"],openGraph:{title:"Promptora — Practical AI prompts for your next task",description:"Try 5 prompts free, then unlock 250+ practical prompts for ₹199. One-time payment. Lifetime access.",type:"website",siteName:"Promptora"},twitter:{card:"summary_large_image",title:"Promptora — 250+ practical AI prompts",description:"Try 5 prompts free. Unlock lifetime access for ₹199."}};
export const viewport={width:"device-width",initialScale:1,maximumScale:1};
export default function RootLayout({children}){return <html lang="en" className={inter.variable}><body><MetaPixel/>{children}<Toaster position="top-center" richColors/></body></html>}

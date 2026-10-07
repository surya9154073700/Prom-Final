import Link from "next/link";
import { Sparkles } from "lucide-react";
import Logo from "@/components/logo";

function LegalShell({ title, children }) {
  return (
    <div className="min-h-screen gradient-bg">
      <header className="glass border-b border-border/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} className="rounded-[10px]" />
            <span className="font-bold text-xl">Promptora</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">← Back to home</Link>
        </div>
      </header>
      <main className="container max-w-3xl py-14 md:py-20">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">{title}</h1>
        <div className="text-slate-700 text-[16px] leading-relaxed space-y-4">{children}</div>
      </main>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy">
      <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>
      <p>Promptora respects your privacy. This page explains what information we collect, how we use it, and the choices you have.</p>
      <h2 className="text-xl font-semibold mt-6">Information we collect</h2>
      <p>We collect your name, email address, and encrypted password when you sign up. When you purchase the toolkit, we collect payment metadata (order ID, payment ID, amount) from Razorpay. We do not store card or bank information.</p>
      <h2 className="text-xl font-semibold mt-6">How we use it</h2>
      <p>Your email is used to authenticate your account and send essential service communication. Payment information is used only to verify and record your purchase for lifetime access.</p>
      <h2 className="text-xl font-semibold mt-6">Cookies</h2>
      <p>We use a single authentication cookie to keep you logged in. We do not use third-party advertising or tracking cookies on this site.</p>
      <h2 className="text-xl font-semibold mt-6">Your rights</h2>
      <p>You may request deletion of your account and personal data at any time by writing to us from the Contact page.</p>
      <h2 className="text-xl font-semibold mt-6">Contact</h2>
      <p>For privacy-related questions, visit our <Link href="/contact" className="text-violet-700 underline">Contact page</Link>.</p>
    </LegalShell>
  );
}

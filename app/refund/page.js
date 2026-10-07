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

export default function RefundPage() {
  return (
    <LegalShell title="Refund & Cancellation Policy">
      <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>
      <p>Promptora is a digital product delivered instantly upon payment. Because of the nature of digital goods, we generally do not offer refunds once access has been granted.</p>
      <h2 className="text-xl font-semibold mt-6">Exceptions</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>You were charged but did not receive access.</li>
        <li>You were charged multiple times for the same purchase.</li>
        <li>You believe a transaction was unauthorised.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6">How to request</h2>
      <p>Please write to us from our <Link href="/contact" className="text-violet-700 underline">Contact page</Link> within 7 days of the transaction with your order ID and payment proof. We will investigate and respond within 3 business days.</p>
      <h2 className="text-xl font-semibold mt-6">Cancellation</h2>
      <p>Promptora is a one-time purchase, not a subscription. There is nothing to cancel after purchase.</p>
    </LegalShell>
  );
}

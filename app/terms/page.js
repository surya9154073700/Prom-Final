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

export default function TermsPage() {
  return (
    <LegalShell title="Terms & Conditions">
      <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>
      <p>Welcome to Promptora. By accessing or using our website and the 250 Prompt Toolkit, you agree to these terms.</p>
      <h2 className="text-xl font-semibold mt-6">What you receive</h2>
      <p>A one-time payment of ₹199 unlocks lifetime access to 250 curated AI prompts across 12 categories, hosted on your Promptora dashboard. Access is personal and non-transferable.</p>
      <h2 className="text-xl font-semibold mt-6">License</h2>
      <p>You may use the prompts for personal and professional purposes with AI assistants. You may not resell, redistribute, or republish the prompt collection as a competing product.</p>
      <h2 className="text-xl font-semibold mt-6">Account responsibility</h2>
      <p>You are responsible for keeping your account credentials secure. Do not share your login with others.</p>
      <h2 className="text-xl font-semibold mt-6">Modifications</h2>
      <p>We may update prompts, add new ones, or adjust the dashboard experience over time. We will not downgrade the core 250 prompt offering.</p>
      <h2 className="text-xl font-semibold mt-6">Liability</h2>
      <p>Promptora is provided as-is. Outcomes from AI use depend on your inputs, model availability, and third-party tools we do not control.</p>
      <h2 className="text-xl font-semibold mt-6">Contact</h2>
      <p>Questions? Visit our <Link href="/contact" className="text-violet-700 underline">Contact page</Link>.</p>
    </LegalShell>
  );
}

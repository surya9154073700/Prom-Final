"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Mail } from "lucide-react";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Promptora support: ${name || "website enquiry"}`);
    const body = encodeURIComponent(`From: ${name || ""}\nReply to: ${email}\n\n${message}`);
    window.location.href = `mailto:hellopromptoraa@gmail.com?subject=${subject}&body=${body}`;
    toast.info("Your email app is opening with the message ready to send.");
  };

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
      <main className="container max-w-2xl py-14 md:py-20">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Have a question?</h1>
        <p className="text-muted-foreground mb-8">We usually reply within 1 business day.</p>
        <Card className="shadow-premium border-border/60">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Your name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <textarea id="message" required value={message} onChange={e => setMessage(e.target.value)} rows={5} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <Button type="submit" className="w-full h-11 bg-gradient-to-r from-violet-600 to-blue-600 shadow-glow">
                <Mail className="w-4 h-4 mr-2" /> Open email app
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

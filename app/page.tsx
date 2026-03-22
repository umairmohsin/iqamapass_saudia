import Link from "next/link";
import { ShieldCheck, Plane, Bell } from "lucide-react";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function LandingPage() {
  const { dict, language } = await getDictionary();
  const rtl = language === "ur";

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6" dir={rtl ? "rtl" : "ltr"}>
      <header className="mb-16 flex items-center justify-between">
        <span className="text-lg font-black">{dict.appName}</span>
        <div className="flex gap-3">
          <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium text-ink hover:bg-white/60">
            {dict.login}
          </Link>
          <Button asChild>
            <Link href="/signup">{dict.getStarted}</Link>
          </Button>
        </div>
      </header>
      <section className="grid flex-1 items-center gap-10 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="mb-3 text-sm uppercase tracking-[0.25em] text-muted">Local privacy mode</p>
          <h1 className="max-w-3xl text-5xl font-black leading-tight md:text-7xl">{dict.landingHeadline}</h1>
          <p className="mt-6 max-w-xl text-lg text-muted">Track your residency and travel compliance with data saved only on your device.</p>
          <div className="mt-8 flex gap-3">
            <Button asChild><Link href="/signup">{dict.getStarted}</Link></Button>
            <Button variant="secondary" asChild><Link href="/login">{dict.login}</Link></Button>
          </div>
        </div>
        <Card className="grid gap-4 bg-gradient-to-br from-white to-sand">
          <Feature icon={ShieldCheck} title="Private by default" body="Your documents and travel data stay in this browser only." />
          <Feature icon={Plane} title="180-day tracker" body="See how many safe days remain outside Saudi." />
          <Feature icon={Bell} title="In-app reminders" body="Urgency cards and reminder thresholds without storing email on a server." />
        </Card>
      </section>
    </main>
  );
}

function Feature({ icon: Icon, title, body }: { icon: React.ComponentType<{ className?: string }>; title: string; body: string }) {
  return (
    <div className="rounded-3xl bg-white/75 p-5">
      <Icon className="mb-3 h-6 w-6 text-clay" />
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </div>
  );
}

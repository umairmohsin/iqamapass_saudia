"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/shell";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocalDashboard, useLocalData } from "@/lib/local-store";
import { formatDate } from "@/lib/utils";
import { getDocumentStatus } from "@/lib/compliance";

export default function DashboardPage() {
  const router = useRouter();
  const { data, ready } = useLocalData();
  const dashboard = useLocalDashboard(data);

  useEffect(() => {
    if (ready && !data.user) router.replace("/login");
  }, [data.user, ready, router]);

  if (!ready || !data.user) return null;

  return (
    <AppShell currentPath="/dashboard">
      <section className="space-y-6">
        <Card className="border-clay/20 bg-clay/5">
          <p className="text-sm font-semibold text-ink">Privacy mode: all account data, profiles, documents, and trips stay in this browser only.</p>
        </Card>
        {dashboard.urgentCount > 0 ? (
          <Card className="border-danger/20 bg-danger/5">
            <p className="text-sm font-semibold text-danger">You have {dashboard.urgentCount} urgent or expired document alerts.</p>
          </Card>
        ) : null}
        <div className="grid gap-4 md:grid-cols-[1.4fr_0.6fr]">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Travel compliance</p>
                <h2 className="text-2xl font-black">Abroad counter</h2>
              </div>
              <StatusBadge tone={dashboard.abroadSummary.tone}>{dashboard.abroadSummary.safeDaysRemaining} safe days</StatusBadge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-canvas p-4"><p className="text-sm text-muted">Days abroad</p><p className="mt-2 text-3xl font-black">{dashboard.abroadSummary.daysAbroad}</p></div>
              <div className="rounded-3xl bg-canvas p-4"><p className="text-sm text-muted">Safe days remaining</p><p className="mt-2 text-3xl font-black">{dashboard.abroadSummary.safeDaysRemaining}</p></div>
            </div>
            <div className="mt-4"><Button variant="secondary" asChild><Link href="/trips">Manage trips</Link></Button></div>
          </Card>
          <Card>
            <p className="text-sm text-muted">Quick actions</p>
            <div className="mt-4 grid gap-3">
              <Button asChild><Link href="/documents/new">Add document</Link></Button>
              <Button variant="secondary" asChild><Link href="/family">Manage family</Link></Button>
              <Button variant="secondary" asChild><Link href="/settings">Settings</Link></Button>
            </div>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dashboard.documents.map((document) => {
            const status = getDocumentStatus(document.expiry_date);
            return (
              <Card key={document.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted">{document.profiles.full_name}</p>
                    <h3 className="text-xl font-black capitalize">{document.label || document.document_type.replaceAll("_", " ")}</h3>
                  </div>
                  <StatusBadge tone={status.tone}>{status.tone}</StatusBadge>
                </div>
                <p className="mt-4 text-sm text-muted">Expiry date</p>
                <p className="mt-1 text-lg font-semibold">{formatDate(document.expiry_date)}</p>
                <p className="mt-2 text-sm text-muted">{status.daysRemaining === null ? "No date entered" : `${status.daysRemaining} days remaining`}</p>
                {dashboard.passportBlocker && (document.document_type === "passport" || document.document_type === "iqama") ? (
                  <p className="mt-3 rounded-2xl bg-amber/15 p-3 text-sm text-amber">Your passport may block Iqama renewal. Renew passport first.</p>
                ) : null}
                <div className="mt-4"><Link href={`/documents/${document.id}`} className="text-sm font-semibold text-clay">View details</Link></div>
              </Card>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}

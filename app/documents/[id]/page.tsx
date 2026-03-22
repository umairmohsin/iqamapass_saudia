"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { getDocumentStatus } from "@/lib/compliance";
import { useLocalData, removeDocument } from "@/lib/local-store";
import { formatDate } from "@/lib/utils";

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, ready, update } = useLocalData();

  useEffect(() => {
    if (ready && !data.user) router.replace("/login");
  }, [data.user, ready, router]);

  if (!ready || !data.user) return null;

  const document = data.documents.find((item) => item.id === params.id);
  if (!document) return <AppShell currentPath="/documents"><Card>Document not found.</Card></AppShell>;
  const profile = data.profiles.find((item) => item.id === document.profile_id);
  const status = getDocumentStatus(document.expiry_date);

  return (
    <AppShell currentPath="/documents">
      <Card className="mx-auto max-w-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted">{profile?.full_name}</p>
            <h1 className="text-3xl font-black capitalize">{document.label || document.document_type.replaceAll("_", " ")}</h1>
          </div>
          <StatusBadge tone={status.tone}>{status.tone}</StatusBadge>
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div><dt className="text-sm text-muted">Expiry</dt><dd className="text-lg font-semibold">{formatDate(document.expiry_date)}</dd></div>
          <div><dt className="text-sm text-muted">Issue date</dt><dd className="text-lg font-semibold">{formatDate(document.issue_date)}</dd></div>
          <div><dt className="text-sm text-muted">Entry type</dt><dd className="text-lg font-semibold capitalize">{document.visa_entry_type || "--"}</dd></div>
          <div><dt className="text-sm text-muted">Notes</dt><dd className="text-lg font-semibold">{document.notes || "--"}</dd></div>
        </dl>
        <div className="mt-6 flex gap-3">
          <Button asChild><Link href={`/documents/${params.id}/edit`}>Edit</Link></Button>
          <Button variant="danger" type="button" onClick={() => { update((current) => removeDocument(current, document.id)); router.push('/dashboard'); }}>Delete</Button>
        </div>
      </Card>
    </AppShell>
  );
}

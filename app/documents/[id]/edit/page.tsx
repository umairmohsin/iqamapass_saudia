"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { addOrUpdateDocument, useLocalData } from "@/lib/local-store";

export default function EditDocumentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, ready, update } = useLocalData();

  useEffect(() => {
    if (ready && !data.user) router.replace("/login");
  }, [data.user, ready, router]);

  if (!ready || !data.user) return null;

  const documentRecord = data.documents.find((item) => item.id === params.id);
  if (!documentRecord) return <AppShell currentPath="/documents"><Card>Document not found.</Card></AppShell>;

  async function onSubmit(formData: FormData) {
    update((current) => addOrUpdateDocument(current, {
      id: documentRecord!.id,
      profile_id: String(formData.get("profile_id") || documentRecord!.profile_id),
      document_type: String(formData.get("document_type") || documentRecord!.document_type) as "iqama" | "passport" | "reentry_visa" | "other",
      label: String(formData.get("label") || "") || null,
      expiry_date: String(formData.get("expiry_date") || "") || null,
      issue_date: String(formData.get("issue_date") || "") || null,
      visa_entry_type: (String(formData.get("visa_entry_type") || "") || null) as "single" | "multiple" | null,
      notes: String(formData.get("notes") || "") || null,
      alert_90: formData.get("alert_90") === "on",
      alert_60: formData.get("alert_60") === "on",
      alert_30: formData.get("alert_30") === "on",
      alert_7: formData.get("alert_7") === "on"
    }));
    router.push(`/documents/${documentRecord!.id}`);
  }

  return (
    <AppShell currentPath="/documents">
      <Card className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-black">Edit document</h1>
        <form action={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <div><label htmlFor="profile_id">Profile</label><select id="profile_id" name="profile_id" defaultValue={documentRecord.profile_id} required>{data.profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.full_name}</option>)}</select></div>
          <div><label htmlFor="document_type">Document type</label><select id="document_type" name="document_type" defaultValue={documentRecord.document_type}><option value="iqama">Iqama</option><option value="passport">Passport</option><option value="reentry_visa">Exit re-entry visa</option><option value="other">Other</option></select></div>
          <div><label htmlFor="label">Custom label</label><input id="label" name="label" defaultValue={documentRecord.label || ""} /></div>
          <div><label htmlFor="expiry_date">Expiry date</label><input id="expiry_date" name="expiry_date" type="date" defaultValue={documentRecord.expiry_date || ""} required /></div>
          <div><label htmlFor="issue_date">Issue date</label><input id="issue_date" name="issue_date" type="date" defaultValue={documentRecord.issue_date || ""} /></div>
          <div><label htmlFor="visa_entry_type">Visa entry type</label><select id="visa_entry_type" name="visa_entry_type" defaultValue={documentRecord.visa_entry_type || ""}><option value="">Not applicable</option><option value="single">Single</option><option value="multiple">Multiple</option></select></div>
          <div className="md:col-span-2"><label htmlFor="notes">Notes</label><textarea id="notes" name="notes" rows={4} defaultValue={documentRecord.notes || ""} /></div>
          <div className="md:col-span-2 grid gap-2 sm:grid-cols-4"><label><input name="alert_90" type="checkbox" defaultChecked={documentRecord.alert_90} /> 90 days</label><label><input name="alert_60" type="checkbox" defaultChecked={documentRecord.alert_60} /> 60 days</label><label><input name="alert_30" type="checkbox" defaultChecked={documentRecord.alert_30} /> 30 days</label><label><input name="alert_7" type="checkbox" defaultChecked={documentRecord.alert_7} /> 7 days</label></div>
          <div className="md:col-span-2"><Button type="submit">Update document</Button></div>
        </form>
      </Card>
    </AppShell>
  );
}

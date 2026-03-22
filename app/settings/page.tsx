"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { clearLocalData, ensureSelfProfile, useLocalData } from "@/lib/local-store";

export default function SettingsPage() {
  const router = useRouter();
  const { data, ready, update } = useLocalData();

  useEffect(() => {
    if (ready && !data.user) router.replace("/login");
  }, [data.user, ready, router]);

  if (!ready || !data.user) return null;

  async function onSubmit(formData: FormData) {
    const language = String(formData.get("language_preference") || "en") as "en" | "ur";
    update((current) => ensureSelfProfile({
      ...current,
      user: current.user ? {
        ...current.user,
        full_name: String(formData.get("full_name") || ""),
        city: String(formData.get("city") || ""),
        language_preference: language
      } : null
    }));
    document.cookie = `language=${language}; path=/; max-age=31536000`;
    router.refresh();
  }

  function handleDelete() {
    clearLocalData();
    router.push("/");
  }

  return (
    <AppShell currentPath="/settings">
      <Card className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-black">Settings</h1>
        <form action={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <div><label htmlFor="full_name">Name</label><input id="full_name" name="full_name" defaultValue={data.user.full_name} /></div>
          <div><label htmlFor="city">City</label><input id="city" name="city" defaultValue={data.user.city} /></div>
          <div><label htmlFor="language_preference">Language</label><select id="language_preference" name="language_preference" defaultValue={data.user.language_preference}><option value="en">English</option><option value="ur">Urdu</option></select></div>
          <div><label htmlFor="plan">Mode</label><input id="plan" value="Local privacy mode" disabled readOnly /></div>
          <div className="md:col-span-2 flex gap-3"><Button type="submit">Save settings</Button><Button variant="secondary" type="button" onClick={() => router.push('/login')}>Go to login</Button></div>
        </form>
        <div className="mt-6 rounded-3xl border border-danger/20 bg-danger/5 p-4">
          <p className="text-sm text-danger">Delete local account removes all stored documents, trips, and profiles from this browser immediately.</p>
          <Button variant="danger" type="button" className="mt-4" onClick={handleDelete}>Delete local account</Button>
        </div>
      </Card>
    </AppShell>
  );
}

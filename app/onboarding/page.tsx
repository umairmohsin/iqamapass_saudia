"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { addOrUpdateDocument, ensureSelfProfile, loadLocalData, saveLocalData, useLocalData } from "@/lib/local-store";

export default function OnboardingPage() {
  const router = useRouter();
  const { data, ready, update } = useLocalData();

  useEffect(() => {
    if (ready && !data.user) router.replace("/signup");
  }, [data.user, ready, router]);

  async function onSubmit(formData: FormData) {
    const fullName = String(formData.get("full_name") || "");
    const city = String(formData.get("city") || "");
    const iqamaType = String(formData.get("iqama_type") || "work") as "work" | "family";
    const language = String(formData.get("language") || "en") as "en" | "ur";
    const iqamaExpiry = String(formData.get("iqama_expiry") || "");
    const passportExpiry = String(formData.get("passport_expiry") || "");

    const next = ensureSelfProfile({
      ...data,
      user: data.user ? { ...data.user, full_name: fullName, city, iqama_type: iqamaType, language_preference: language } : null
    });

    const selfProfile = next.profiles.find((profile) => profile.relation === "self");
    let updated = next;
    if (selfProfile && iqamaExpiry) {
      updated = addOrUpdateDocument(updated, {
        profile_id: selfProfile.id,
        document_type: "iqama",
        label: null,
        expiry_date: iqamaExpiry,
        issue_date: null,
        visa_entry_type: null,
        notes: null,
        alert_90: true,
        alert_60: true,
        alert_30: true,
        alert_7: true
      });
    }
    if (selfProfile && passportExpiry) {
      updated = addOrUpdateDocument(updated, {
        profile_id: selfProfile.id,
        document_type: "passport",
        label: null,
        expiry_date: passportExpiry,
        issue_date: null,
        visa_entry_type: null,
        notes: null,
        alert_90: true,
        alert_60: true,
        alert_30: true,
        alert_7: true
      });
    }

    saveLocalData(updated);
    update(() => updated);
    document.cookie = `language=${language}; path=/; max-age=31536000`;
    router.push("/dashboard");
  }

  if (!ready || !data.user) return null;

  return (
    <AppShell currentPath="/onboarding">
      <Card className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-black">Complete onboarding</h1>
        <p className="mt-2 text-sm text-muted">Your profile and dates are saved only in this browser.</p>
        <form action={onSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
          <div><label htmlFor="full_name">Full name</label><input id="full_name" name="full_name" defaultValue={data.user.full_name} required /></div>
          <div><label htmlFor="city">City</label><input id="city" name="city" defaultValue={data.user.city} required /></div>
          <div><label htmlFor="iqama_type">Iqama type</label><select id="iqama_type" name="iqama_type" defaultValue={data.user.iqama_type}><option value="work">Work</option><option value="family">Family</option></select></div>
          <div><label htmlFor="language">Language</label><select id="language" name="language" defaultValue={data.user.language_preference}><option value="en">English</option><option value="ur">Urdu</option></select></div>
          <div><label htmlFor="iqama_expiry">Iqama expiry</label><input id="iqama_expiry" name="iqama_expiry" type="date" required /></div>
          <div><label htmlFor="passport_expiry">Passport expiry</label><input id="passport_expiry" name="passport_expiry" type="date" /></div>
          <div className="md:col-span-2"><Button type="submit">Save and continue</Button></div>
        </form>
      </Card>
    </AppShell>
  );
}

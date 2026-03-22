"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { addFamilyProfile, useLocalData } from "@/lib/local-store";

export default function FamilyPage() {
  const router = useRouter();
  const { data, ready, update } = useLocalData();

  useEffect(() => {
    if (ready && !data.user) router.replace("/login");
  }, [data.user, ready, router]);

  if (!ready || !data.user) return null;

  async function onSubmit(formData: FormData) {
    update((current) => addFamilyProfile(current, {
      full_name: String(formData.get("full_name") || ""),
      relation: String(formData.get("relation") || "spouse") as "spouse" | "child" | "dependent",
      city: String(formData.get("city") || "") || undefined,
      iqama_type: (String(formData.get("iqama_type") || "") || null) as "work" | "family" | null
    }));
  }

  return (
    <AppShell currentPath="/family">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <h1 className="text-3xl font-black">Family profiles</h1>
          <p className="mt-2 text-sm text-muted">Family data also stays on this device. Premium is disabled in local mode, so you can add dependents freely.</p>
          <form action={onSubmit} className="mt-6 grid gap-4">
            <div><label htmlFor="full_name">Full name</label><input id="full_name" name="full_name" required /></div>
            <div><label htmlFor="relation">Relation</label><select id="relation" name="relation"><option value="spouse">Spouse</option><option value="child">Child</option><option value="dependent">Dependent</option></select></div>
            <div><label htmlFor="city">City</label><input id="city" name="city" /></div>
            <div><label htmlFor="iqama_type">Iqama type</label><select id="iqama_type" name="iqama_type"><option value="work">Work</option><option value="family">Family</option></select></div>
            <Button type="submit">Add family member</Button>
          </form>
        </Card>
        <div className="space-y-4">
          {data.profiles.map((profile) => (
            <Card key={profile.id}>
              <p className="text-sm text-muted uppercase">{profile.relation}</p>
              <h2 className="text-xl font-black">{profile.full_name}</h2>
              <p className="mt-1 text-sm text-muted">{profile.city || "No city"}</p>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

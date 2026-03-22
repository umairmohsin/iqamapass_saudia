"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { addTrip, removeTrip, useLocalData } from "@/lib/local-store";
import { calculateAbroadSummary } from "@/lib/compliance";
import { formatDate } from "@/lib/utils";

export default function TripsPage() {
  const router = useRouter();
  const { data, ready, update } = useLocalData();

  useEffect(() => {
    if (ready && !data.user) router.replace("/login");
  }, [data.user, ready, router]);

  if (!ready || !data.user) return null;

  const primary = data.profiles.find((profile) => profile.is_primary);
  const summary = calculateAbroadSummary(data.trips.filter((trip) => trip.profile_id === primary?.id));

  async function onSubmit(formData: FormData) {
    update((current) => addTrip(current, {
      profile_id: String(formData.get("profile_id") || "self_profile"),
      departure_date: String(formData.get("departure_date")),
      return_date: String(formData.get("return_date") || "") || null,
      destination: String(formData.get("destination") || "") || null,
      notes: String(formData.get("notes") || "") || null
    }));
  }

  return (
    <AppShell currentPath="/trips">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h1 className="text-3xl font-black">Travel log</h1>
          <p className="mt-2 text-sm text-muted">Local-only rolling 180-day calculation. No trip data is uploaded anywhere.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-canvas p-4"><p className="text-sm text-muted">Days abroad</p><p className="mt-2 text-3xl font-black">{summary.daysAbroad}</p></div>
            <div className="rounded-3xl bg-canvas p-4"><p className="text-sm text-muted">Safe days left</p><p className="mt-2 text-3xl font-black">{summary.safeDaysRemaining}</p></div>
          </div>
          <form action={onSubmit} className="mt-6 grid gap-4">
            <div><label htmlFor="profile_id">Profile</label><select id="profile_id" name="profile_id">{data.profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.full_name}</option>)}</select></div>
            <div><label htmlFor="departure_date">Departure date</label><input id="departure_date" name="departure_date" type="date" required /></div>
            <div><label htmlFor="return_date">Return date</label><input id="return_date" name="return_date" type="date" /></div>
            <div><label htmlFor="destination">Destination</label><input id="destination" name="destination" /></div>
            <div><label htmlFor="notes">Notes</label><textarea id="notes" name="notes" rows={3} /></div>
            <Button type="submit">Add trip</Button>
          </form>
        </Card>
        <div className="space-y-4">
          {data.trips.map((trip) => {
            const profile = data.profiles.find((item) => item.id === trip.profile_id);
            return (
              <Card key={trip.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted">{profile?.full_name || "Profile"}</p>
                    <h2 className="text-xl font-black">{formatDate(trip.departure_date)} to {trip.return_date ? formatDate(trip.return_date) : "Currently abroad"}</h2>
                    <p className="mt-1 text-sm text-muted">{trip.destination || "No destination"}</p>
                  </div>
                  <Button variant="ghost" type="button" onClick={() => update((current) => removeTrip(current, trip.id))}>Delete</Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

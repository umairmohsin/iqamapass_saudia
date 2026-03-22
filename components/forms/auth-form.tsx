"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createUser, ensureSelfProfile, loadLocalData, saveLocalData } from "@/lib/local-store";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const language = (String(formData.get("language") || "en") === "ur" ? "ur" : "en");
    const data = loadLocalData();

    if (mode === "signup") {
      if (data.user?.email && data.user.email !== email) {
        setError("This device already has a local account. Clear local data in Settings to start over.");
        setLoading(false);
        return;
      }
      const next = ensureSelfProfile({
        ...data,
        user: createUser({ email, password, language_preference: language })
      });
      saveLocalData(next);
      document.cookie = `language=${language}; path=/; max-age=31536000`;
      router.push("/onboarding");
      router.refresh();
      return;
    }

    if (!data.user || data.user.email !== email || data.user.password !== password) {
      setError("Local account not found on this device.");
      setLoading(false);
      return;
    }

    document.cookie = `language=${data.user.language_preference}; path=/; max-age=31536000`;
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required minLength={4} />
      </div>
      {mode === "signup" ? (
        <div>
          <label htmlFor="language">Language</label>
          <select id="language" name="language" defaultValue="en">
            <option value="en">English</option>
            <option value="ur">Urdu</option>
          </select>
        </div>
      ) : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <p className="text-xs text-muted">Account and document data stay on this device only.</p>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Please wait..." : mode === "signup" ? "Create local account" : "Open local account"}
      </Button>
    </form>
  );
}

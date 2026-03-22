import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";
import { Card } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full">
        <h1 className="mb-2 text-3xl font-black">Create a local account</h1>
        <p className="mb-6 text-sm text-muted">Start tracking Iqama, passport, and travel compliance without sending your data to a server.</p>
        <AuthForm mode="signup" />
        <p className="mt-4 text-sm text-muted">
          Already have an account on this device? <Link href="/login">Login</Link>
        </p>
      </Card>
    </main>
  );
}

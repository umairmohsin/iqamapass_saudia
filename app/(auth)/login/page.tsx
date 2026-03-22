import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full">
        <h1 className="mb-2 text-3xl font-black">Open your local account</h1>
        <p className="mb-6 text-sm text-muted">Sign in on this device to view private residency data stored only in your browser.</p>
        <AuthForm mode="login" />
        <div className="mt-4 flex justify-between text-sm text-muted">
          <Link href="/reset-password">Forgot password?</Link>
          <Link href="/signup">Create account</Link>
        </div>
      </Card>
    </main>
  );
}

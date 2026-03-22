import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { Card } from "@/components/ui/card";

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full">
        <h1 className="mb-2 text-3xl font-black">Reset password</h1>
        <p className="mb-6 text-sm text-muted">We will email you a password reset link.</p>
        <ResetPasswordForm />
      </Card>
    </main>
  );
}

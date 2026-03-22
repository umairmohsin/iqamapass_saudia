"use client";

export function ResetPasswordForm() {
  return (
    <div className="space-y-4 text-sm text-muted">
      <p>This app keeps data locally on the device, so there is no server-side password reset.</p>
      <p>If you forget the password, clear local app data from your browser storage and create a new local account.</p>
    </div>
  );
}

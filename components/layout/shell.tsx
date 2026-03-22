import Link from "next/link";
import { Home, Files, Plane, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/documents/new", label: "Documents", icon: Files },
  { href: "/trips", label: "Trips", icon: Plane },
  { href: "/family", label: "Family", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children, currentPath }: { children: React.ReactNode; currentPath: string }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-24 pt-6 md:pb-10">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/dashboard" className="text-lg font-black tracking-tight">
          IqamaPass
        </Link>
        <nav className="hidden gap-2 md:flex">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = currentPath.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm",
                  active ? "bg-ink text-white" : "bg-white/80 text-ink hover:bg-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <nav className="fixed bottom-4 left-1/2 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 justify-between rounded-full border border-white/70 bg-white/90 px-3 py-2 shadow-card md:hidden">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = currentPath.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center rounded-full px-3 py-2 text-[11px]",
                active ? "text-clay" : "text-muted"
              )}
            >
              <Icon className="mb-1 h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

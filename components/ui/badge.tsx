import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/lib/compliance";

const toneStyles: Record<StatusTone, string> = {
  safe: "bg-forest/10 text-forest",
  warning: "bg-amber/15 text-amber",
  urgent: "bg-danger/15 text-danger",
  expired: "bg-danger text-white",
  nodata: "bg-stone-200 text-stone-600"
};

export function StatusBadge({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", toneStyles[tone])}>
      {children}
    </span>
  );
}

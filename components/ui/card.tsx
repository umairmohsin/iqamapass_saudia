import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-card backdrop-blur",
        className
      )}
      {...props}
    />
  );
}

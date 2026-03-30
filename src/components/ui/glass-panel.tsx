import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "@/lib/utils";

type GlassPanelProps<T extends ElementType> = {
  as?: T;
} & ComponentPropsWithoutRef<T>;

export function GlassPanel<T extends ElementType = "section">({
  as,
  className,
  ...props
}: GlassPanelProps<T>) {
  const Component = as ?? "section";

  return (
    <Component
      className={cn(
        "glass rounded-[var(--radius-xl)] p-4 md:p-5",
        className,
      )}
      {...props}
    />
  );
}

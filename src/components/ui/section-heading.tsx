import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
};

export function SectionHeading({
  title,
  subtitle,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 border-b border-white/10 pb-3",
        className,
      )}
    >
      <div>
        <h2 className="display-type text-xl font-semibold text-ink md:text-2xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-ink-muted md:text-[0.95rem]">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}

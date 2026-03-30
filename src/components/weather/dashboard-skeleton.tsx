import { GlassPanel } from "@/components/ui/glass-panel";

export function DashboardSkeleton() {
  return (
    <div className="grid gap-4">
      <GlassPanel className="space-y-4">
        <div className="h-5 w-44 rounded bg-white/16 shimmer" />
        <div className="h-12 w-36 rounded-xl bg-white/18 shimmer" />
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="h-16 rounded-2xl border border-white/11 bg-white/7 shimmer"
            />
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-4">
        <div className="h-5 w-36 rounded bg-white/16 shimmer" />
        <div className="h-44 w-full rounded-2xl border border-white/11 bg-white/7 shimmer" />
      </GlassPanel>

      <GlassPanel className="space-y-2">
        <div className="h-5 w-28 rounded bg-white/16 shimmer" />
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="h-16 rounded-2xl bg-white/7 shimmer" />
        ))}
      </GlassPanel>
    </div>
  );
}

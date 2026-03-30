import { CloudSun, Compass, Sparkles } from "lucide-react";

import { GlassPanel } from "@/components/ui/glass-panel";
import { MetricPill } from "@/components/ui/metric-pill";
import { SectionHeading } from "@/components/ui/section-heading";

const quickMetrics = [
  { label: "Feels Like", value: "--" },
  { label: "Humidity", value: "--" },
  { label: "Wind", value: "--" },
  { label: "UV Index", value: "--" },
];

const hourlySkeleton = Array.from({ length: 8 }, (_, index) => index);
const dailySkeleton = Array.from({ length: 7 }, (_, index) => index);

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="bg-mesh" aria-hidden />
      <div className="pointer-events-none absolute -top-16 left-[8%] h-64 w-64 rounded-full bg-cyan-300/28 blur-[92px] atmosphere-orb" />
      <div className="pointer-events-none absolute right-[4%] top-24 h-80 w-80 rounded-full bg-sky-200/18 blur-[106px] atmosphere-orb" />

      <main className="relative mx-auto flex w-full max-w-[1240px] flex-1 flex-col gap-4 px-4 py-5 md:gap-5 md:px-8 md:py-8">
        <header className="glass rounded-[var(--radius-xl)] p-4 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-ink-muted">Atmoxis</p>
              <h1 className="display-type mt-1 text-3xl font-semibold text-ink md:text-4xl">
                Detailed weather with atmospheric clarity.
              </h1>
            </div>
            <div className="flex flex-col items-stretch gap-2 sm:flex-row md:items-center">
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/16 bg-white/10 px-4 text-sm font-semibold text-ink transition-colors hover:bg-white/18 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
              >
                <Compass size={16} />
                Use my location
              </button>
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-cyan-100/25 bg-cyan-200/18 px-4 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-200/28 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-100"
              >
                <Sparkles size={16} />
                Atmospheric mode
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
          <GlassPanel as="section" aria-label="Current weather snapshot">
            <SectionHeading
              title="Current Conditions"
              subtitle="Live weather data will appear here after API setup."
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-ink-muted">Location</p>
                <p className="display-type mt-2 text-3xl font-semibold">Awaiting location</p>
                <div className="mt-5 h-16 w-40 rounded-2xl border border-white/12 bg-white/6 shimmer" />
              </div>
              <div className="flex flex-wrap gap-2 self-start sm:justify-end">
                {quickMetrics.map((metric) => (
                  <MetricPill key={metric.label} label={metric.label} value={metric.value} />
                ))}
              </div>
            </div>
          </GlassPanel>

          <GlassPanel as="aside" aria-label="Status">
            <SectionHeading
              title="System Status"
              subtitle="API, geolocation, and preferences"
            />
            <ul className="mt-4 space-y-3 text-sm text-ink-muted">
              <li className="flex items-center justify-between rounded-2xl border border-white/12 bg-white/5 px-3 py-2.5">
                <span>Weather API</span>
                <span className="font-semibold text-ink">Pending</span>
              </li>
              <li className="flex items-center justify-between rounded-2xl border border-white/12 bg-white/5 px-3 py-2.5">
                <span>Geolocation</span>
                <span className="font-semibold text-ink">Idle</span>
              </li>
              <li className="flex items-center justify-between rounded-2xl border border-white/12 bg-white/5 px-3 py-2.5">
                <span>Saved Places</span>
                <span className="font-semibold text-ink">0</span>
              </li>
            </ul>
          </GlassPanel>
        </div>

        <GlassPanel as="section" aria-label="Hourly forecast preview">
          <SectionHeading
            title="Hourly Forecast"
            subtitle="Next 24 hours with smooth trend transitions"
            action={
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs text-ink-muted">
                <CloudSun size={14} />
                24h view
              </span>
            }
          />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {hourlySkeleton.map((hour) => (
              <div
                key={hour}
                className="rounded-2xl border border-white/10 bg-white/6 p-3"
              >
                <div className="h-4 w-10 rounded bg-white/16 shimmer" />
                <div className="mt-3 h-8 w-8 rounded-full bg-white/12 shimmer" />
                <div className="mt-3 h-5 w-14 rounded bg-white/16 shimmer" />
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel as="section" aria-label="Daily forecast preview">
          <SectionHeading
            title="7-Day Forecast"
            subtitle="High and low temperatures with precipitation chance"
          />
          <div className="mt-4 space-y-2.5">
            {dailySkeleton.map((day) => (
              <div
                key={day}
                className="grid grid-cols-[1.1fr_auto_auto] items-center rounded-2xl border border-white/10 bg-white/6 px-4 py-3"
              >
                <div className="h-4 w-20 rounded bg-white/15 shimmer" />
                <div className="h-4 w-18 justify-self-end rounded bg-white/15 shimmer" />
                <div className="ml-4 h-4 w-14 justify-self-end rounded bg-white/15 shimmer" />
              </div>
            ))}
          </div>
        </GlassPanel>

        <p className="pb-4 text-center text-sm text-ink-muted">
          Atmoxis shell complete. Live APIs, geolocation, and animated data views are next.
        </p>
      </main>
    </div>
  );
}

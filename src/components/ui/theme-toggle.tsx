"use client";

import { SunMoon } from "lucide-react";
import { useEffect } from "react";

type Theme = "dark" | "light";

function setTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  window.localStorage.setItem("atmoxis-theme", theme);
  window.dispatchEvent(new Event("atmoxis-theme-change"));
}

function detectTheme(): Theme {
  const storedTheme = window.localStorage.getItem("atmoxis-theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  const attrTheme = document.documentElement.getAttribute("data-theme");
  if (attrTheme === "light" || attrTheme === "dark") {
    return attrTheme;
  }

  return "light";
}

export function ThemeToggle() {
  useEffect(() => {
    try {
      setTheme(detectTheme());
    } catch {
      // Ignore local storage or media query access failures.
    }
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        const current = detectTheme();
        const next: Theme = current === "dark" ? "light" : "dark";
        setTheme(next);
      }}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line/40 bg-card-elevated/60 px-3 text-xs font-semibold text-ink transition hover:bg-card-elevated/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
      aria-label="Toggle light and dark mode"
      title="Toggle light and dark mode"
    >
      <SunMoon size={14} />
      <span>Theme</span>
    </button>
  );
}

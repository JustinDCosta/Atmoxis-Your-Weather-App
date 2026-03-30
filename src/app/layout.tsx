import type { Metadata } from "next";
import { Manrope, Syne } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Atmoxis | Premium Weather Experience",
  description:
    "Atmoxis is a polished weather web app with atmospheric visuals and practical forecasts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden bg-bg text-ink">
        <Script id="atmoxis-theme-init" strategy="beforeInteractive">
          {`(() => {
            try {
              const stored = localStorage.getItem("atmoxis-theme");
              const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
              const theme = stored === "light" || stored === "dark" ? stored : (prefersLight ? "light" : "dark");
              document.documentElement.setAttribute("data-theme", theme);
            } catch {}
          })();`}
        </Script>
        {children}
      </body>
    </html>
  );
}

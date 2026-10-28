import type { Metadata, Viewport } from "next";
import { Lexend, Source_Sans_3 } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import "./globals.css";

const display = Lexend({ variable: "--font-display", subsets: ["latin", "latin-ext"], weight: ["500", "600"] });
const body = Source_Sans_3({ variable: "--font-body", subsets: ["latin", "latin-ext"], weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  title: { default: "Protejează ce ai construit", template: "%s · Protejează ce ai construit" },
  description:
    "Învață să-ți protejezi banii, să recunoști fraudele și să înțelegi riscurile înainte să iei o decizie financiară.",
};

export const viewport: Viewport = { themeColor: "#16325c" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ro" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#continut"
          className="sr-only z-50 rounded-[var(--radius-control)] bg-primary px-4 py-2 text-on-primary focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Sari la conținut
        </a>
        <SiteHeader />
        <main id="continut" tabIndex={-1} className="mx-auto w-full max-w-[1120px] flex-1 px-4 py-8 outline-none sm:px-6 sm:py-12 lg:px-8">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AccessibilityShell } from "@/components/accessibility/AccessibilityShell";
import { WebsiteUsageTracker } from "@/components/analytics/WebsiteUsageTracker";
import { LanguageProvider } from "@/contexts/LanguageContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Consumer Representative Remuneration Tool",
  description:
    "Interactive decision tool to support remuneration for health consumer representatives in Australia.",
  applicationName: "Consumer Representative Remuneration Tool",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <LanguageProvider>
          <WebsiteUsageTracker />
          <AccessibilityShell />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}

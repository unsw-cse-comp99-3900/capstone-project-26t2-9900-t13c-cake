import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AccessibilityShell } from "@/components/accessibility/AccessibilityShell";
import { LanguageProvider } from "@/contexts/LanguageContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Consumer Rep Remuneration Tool",
  description:
    "Interactive decision tool to support remuneration for health consumer representatives in Australia.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <LanguageProvider>
          <AccessibilityShell>{children}</AccessibilityShell>
        </LanguageProvider>
      </body>
    </html>
  );
}

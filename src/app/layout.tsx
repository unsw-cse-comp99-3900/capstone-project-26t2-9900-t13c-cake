import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { WebsiteUsageTracker } from "@/components/analytics/WebsiteUsageTracker";
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
        <WebsiteUsageTracker />
        {children}
      </body>
    </html>
  );
}

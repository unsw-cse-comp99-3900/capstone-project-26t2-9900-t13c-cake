import type { Metadata } from "next";
import { PrivacyNoticePage } from "@/components/privacy/PrivacyNoticePage";

export const metadata: Metadata = {
  title: "Privacy and data scope | Consumer Representative Remuneration Tool",
  description: "Privacy notice and data storage scope for the remuneration decision tool.",
};

export default function Page() {
  return <PrivacyNoticePage />;
}

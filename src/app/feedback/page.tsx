import type { Metadata } from "next";
import { FeedbackPage } from "@/components/feedback/FeedbackPage";

export const metadata: Metadata = {
  title: "Anonymous feedback | Consumer Representative Remuneration Tool",
  description: "Optional anonymous feedback survey for the remuneration decision tool.",
};

export default function Page() {
  return <FeedbackPage />;
}

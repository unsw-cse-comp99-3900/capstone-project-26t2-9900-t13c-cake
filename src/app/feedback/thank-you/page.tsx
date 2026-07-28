import type { Metadata } from "next";
import { FeedbackThankYouPage } from "@/components/feedback/FeedbackThankYouPage";

export const metadata: Metadata = {
  title: "Feedback saved | Consumer Rep Remuneration Tool",
  description: "Confirmation that anonymous feedback was saved.",
};

export default function Page() {
  return <FeedbackThankYouPage />;
}

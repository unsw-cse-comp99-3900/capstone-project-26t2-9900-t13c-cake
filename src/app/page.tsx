import { LandingPage } from "@/components/landing/LandingPage";

export default function HomePage() {
  return (
    <>
      <LandingPage />
      <div id="questionnaire" className="scroll-mt-6" aria-hidden="true" />
    </>
  );
}

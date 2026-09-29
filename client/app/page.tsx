import { getSession } from "@/features/auth/lib/auth-server";
import {
  LandingNavbar,
  HeroSection,
  FrameworkMarquee,
  LiveDemoConsole,
  AudienceSwitcher,
  WorkflowGrid,
  HowItWorksFlow,
  ConfidentialityStrip,
  FaqAccordion,
  FinalCtaFooter,
} from "@/features/landing";

export default async function HomePage() {
  const session = await getSession();
  const isAuthenticated = !!session;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F2EE] bg-[url('/images/background_mat.svg')] bg-repeat text-neutral-900 selection:bg-lime-300 selection:text-neutral-900 font-sans">
      {/* 1. Sticky Navigation Header */}
      <LandingNavbar isAuthenticated={isAuthenticated} />

      {/* Main Page Flow */}
      <main className="flex-1 flex flex-col">
        {/* 2. Hero Section */}
        <HeroSection isAuthenticated={isAuthenticated} />

        {/* 3. Statutory & Institutional Framework Marquee */}
        <FrameworkMarquee />

        {/* 4. The Signature Interactive Live Demo Console */}
        <LiveDemoConsole />

        {/* 5. Audience Switcher (Who It's For) */}
        <AudienceSwitcher />

        {/* 6. 4-Quadrant Workflow Grid (What We Cover) */}
        <WorkflowGrid />

        {/* 7. How Sahayak Works (3-Stage Visual Pipeline) */}
        <HowItWorksFlow />

        {/* 8. Confidentiality & Trust Strip */}
        <ConfidentialityStrip />

        {/* 9. FAQ Accordion */}
        <FaqAccordion />
      </main>

      {/* 10. Final Call-to-Action Card & Legal Footer */}
      <FinalCtaFooter isAuthenticated={isAuthenticated} />
    </div>
  );
}

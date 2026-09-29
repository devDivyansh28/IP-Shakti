"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, Clock, ShieldCheck, Zap, Globe, Sparkles } from "lucide-react";

interface AudienceContent {
  id: string;
  label: string;
  metrics: {
    value: string;
    label: string;
    sub: string;
    icon: typeof TrendingUp;
  }[];
  headline: string;
  description: string;
}

const AUDIENCE_DATA: AudienceContent[] = [
  {
    id: "researchers",
    label: "Researchers & Universities",
    metrics: [
      {
        value: "10x",
        label: "faster prior art checks",
        sub: "compared to manual text searches",
        icon: TrendingUp,
      },
      {
        value: "< 2 min",
        label: "to check patent eligibility",
        sub: "instant scripture & law scan",
        icon: Clock,
      },
      {
        value: "Zero",
        label: "legal background needed",
        sub: "describe your research naturally",
        icon: ShieldCheck,
      },
    ],
    headline: "Verify novelty before you publish or file.",
    description:
      "Confirm that your herbal discovery is genuinely novel and eligible for protection. Sahayak checks centuries of documented knowledge and existing patent records instantly, helping you protect your scientific breakthroughs with confidence.",
  },
  {
    id: "startups",
    label: "Startups & D2C Brands",
    metrics: [
      {
        value: "30 days → 0",
        label: "regulatory clearance time",
        sub: "from weeks of doubt to instant clarity",
        icon: Zap,
      },
      {
        value: "100%",
        label: "statutorily grounded",
        sub: "exact official acts and rules cited",
        icon: ShieldCheck,
      },
      {
        value: "Zero",
        label: "unexpected compliance notices",
        sub: "pre-screened before manufacturing",
        icon: Sparkles,
      },
    ],
    headline: "Launch fast. Stay protected. Zero legal traps.",
    description:
      "Bring your herbal formulations to market without fear of regulatory roadblocks. Sahayak checks patentability, classical formulation rules, and licensing requirements before you invest heavily in production.",
  },
  {
    id: "enterprises",
    label: "Enterprises & Exporters",
    metrics: [
      {
        value: "Day 1",
        label: "global market readiness",
        sub: "multi-country requirement checks",
        icon: Globe,
      },
      {
        value: "1-Click",
        label: "Biodiversity Act screening",
        sub: "NBA Form I requirement detection",
        icon: Clock,
      },
      {
        value: "Zero",
        label: "treaty disclosure surprises",
        sub: "WIPO country-of-origin alignment",
        icon: ShieldCheck,
      },
    ],
    headline: "Expand globally with complete regulatory certainty.",
    description:
      "Scale your Ayurvedic products across international borders with confidence. Sahayak evaluates country-specific patent conditions, WIPO traditional knowledge treaties, and mandatory biodiversity approvals for seamless global commercialization.",
  },
];

export function AudienceSwitcher() {
  const [activeTabId, setActiveTabId] = useState<string>("researchers");
  const activeContent = AUDIENCE_DATA.find((item) => item.id === activeTabId) ?? AUDIENCE_DATA[0];

  return (
    <section className="w-full py-16 px-6 relative overflow-hidden bg-[#FAF8F5]">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-start mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-[14px] h-[14px] bg-lime-300 border border-neutral-900 rounded-[2px]" />
            <div className="h-px w-6 bg-neutral-900/40" />
            <span className="px-3 py-1 rounded-full bg-[#FFFFFF] border border-neutral-900/40 text-xs font-mono font-bold uppercase tracking-widest text-neutral-800">
              Who It&apos;s For
            </span>
          </div>

          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-[44px] leading-tight text-neutral-900 max-w-3xl">
            Built for every team advancing Ayurvedic innovation
          </h2>
        </div>

        {/* Tab Switcher & Dynamic Content Card */}
        <div className="bg-[#FFFFFF] border-2 border-neutral-900 rounded-[28px] shadow-[4px_4px_0px_0px_#121212] overflow-hidden">
          {/* Top Tab Switcher Bar */}
          <div className="flex flex-wrap items-center gap-2 p-3 sm:p-4 border-b-2 border-neutral-900 bg-[#F7F4EE]">
            {AUDIENCE_DATA.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTabId(tab.id)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-heading font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-neutral-900 text-lime-300 shadow-sm"
                      : "text-neutral-700 hover:text-neutral-950 hover:bg-neutral-900/5"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* 3 Metric Boxes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-b-2 border-neutral-900">
            {activeContent.metrics.map((m, mIdx) => {
              const Icon = m.icon;
              return (
                <div
                  key={`${activeContent.id}-${mIdx}`}
                  className={`relative p-8 flex flex-col items-center justify-center text-center ${
                    mIdx > 0 ? "border-t-2 md:border-t-0 md:border-l-2 border-neutral-900" : ""
                  }`}
                >
                  {/* Decorative Lime Corner Tab on first box */}
                  {mIdx === 0 && (
                    <div className="hidden md:block absolute -left-2.5 -bottom-2.5 w-[18px] h-[18px] border border-neutral-900 bg-lime-300 rounded-[2px] z-10" />
                  )}

                  <div className="text-neutral-500 mb-3">
                    <Icon className="w-5 h-5" />
                  </div>

                  <span className="font-heading font-extrabold text-neutral-900 text-4xl sm:text-5xl leading-none mb-2 tracking-tight">
                    {m.value}
                  </span>

                  <span className="font-heading font-bold text-neutral-900 text-sm sm:text-base leading-snug mb-1">
                    {m.label}
                  </span>

                  <span className="font-sans text-xs text-neutral-600 leading-snug">
                    {m.sub}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Dynamic Headline & Description Below Metrics */}
          <div className="p-8 sm:p-12 bg-[#FAF8F5] min-h-[160px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeContent.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-2xl text-center"
              >
                <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-neutral-900 mb-3 tracking-tight">
                  {activeContent.headline}
                </h3>
                <p className="font-sans text-sm sm:text-base text-neutral-700 leading-relaxed">
                  {activeContent.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

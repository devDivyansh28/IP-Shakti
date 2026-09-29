"use client";

import { ArrowDown, Layers, Database, ShieldCheck, Check } from "lucide-react";

const STAGES = [
  {
    step: "01",
    title: "Formulation & Question Ingestion",
    description:
      "You input your herbs, extraction method, novel delivery carrier, or target export country in plain language. Sahayak identifies biological components and key legal questions.",
    pills: ["Active Botanicals", "Delivery Matrix", "Target Country"],
    icon: Layers,
  },
  {
    step: "02",
    title: "Dual Statutory & Scripture Cross-Reference",
    description:
      "Sahayak searches verified government gazettes and classical compendia in parallel — evaluating Section 3(p), Section 3(d), BDA 2023 clearance, and WIPO treaties simultaneously.",
    pills: ["Patents Act § 3", "BDA 2023 Form I", "Classical Compendia", "WIPO GRATK"],
    icon: Database,
  },
  {
    step: "03",
    title: "Actionable Legal Dossier & Citations",
    description:
      "You receive an evidence-backed breakdown with exact section-level citations, risk indicators, and clear next steps to take directly to your patent agent or board.",
    pills: ["Patentability Verdict", "Exact Gazette Citations", "Filing Roadmap"],
    icon: ShieldCheck,
  },
];

export function HowItWorksFlow() {
  return (
    <section id="how-it-works" className="w-full py-16 px-6 relative overflow-hidden bg-transparent">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Context & Summary */}
          <div className="lg:col-span-5 flex flex-col items-start lg:sticky lg:top-28">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-[14px] h-[14px] bg-lime-300 border border-neutral-900 rounded-[2px]" />
              <div className="h-px w-6 bg-neutral-900/40" />
              <span className="px-3 py-1 rounded-full bg-[#FFFFFF] border border-neutral-900/40 text-xs font-mono font-bold uppercase tracking-widest text-neutral-800">
                How It Works
              </span>
            </div>

            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-[44px] leading-tight text-neutral-900 mb-4">
              From your question to verified legal proof.
            </h2>

            <p className="font-sans text-base sm:text-lg text-neutral-700 leading-relaxed mb-6">
              A transparent three-step engine that examines official government acts and historical Ayurvedic compendia in parallel — giving you clear answers with zero guesswork.
            </p>

            <div className="p-4 rounded-[14px] bg-[#FFFFFF] border border-neutral-900/20 shadow-sm flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-lime-300 border border-neutral-900 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 text-neutral-900" strokeWidth={3} />
              </div>
              <p className="font-sans text-xs text-neutral-700 leading-relaxed">
                <strong className="text-neutral-900">Zero Hallucinations Guarantee:</strong> Every citation is cross-checked against our indexed database of verified Indian and global legal acts.
              </p>
            </div>
          </div>

          {/* Right Column: 3-Stage Visual Pipeline */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {STAGES.map((stage, sIdx) => {
              const Icon = stage.icon;
              return (
                <div key={stage.step} className="flex flex-col items-center">
                  {/* Stage Card */}
                  <div className="w-full bg-[#FFFFFF] border-2 border-neutral-900 rounded-[20px] p-6 sm:p-8 shadow-[3px_3px_0px_0px_#121212]">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[8px] bg-neutral-900 text-lime-300 flex items-center justify-center border border-neutral-900">
                          <Icon className="w-4 h-4" strokeWidth={2} />
                        </div>
                        <h3 className="font-heading font-bold text-lg sm:text-xl text-neutral-900">
                          {stage.title}
                        </h3>
                      </div>
                      <span className="font-mono font-bold text-sm text-neutral-600 bg-[#FAF8F5] px-2.5 py-1 rounded-[6px] border border-neutral-900/15">
                        {stage.step}
                      </span>
                    </div>

                    <p className="font-sans text-xs sm:text-sm text-neutral-700 leading-relaxed mb-5">
                      {stage.description}
                    </p>

                    {/* Pill Badges */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-neutral-900/10">
                      {stage.pills.map((pill) => (
                        <span
                          key={pill}
                          className="px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-neutral-900/20 text-[11px] font-mono font-medium text-neutral-800"
                        >
                          {pill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Connecting Arrow between cards */}
                  {sIdx < STAGES.length - 1 && (
                    <div className="py-2 text-neutral-900 flex items-center justify-center">
                      <ArrowDown className="w-5 h-5 text-neutral-900/50" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { FlaskConical, ScrollText, Landmark, Globe2, ArrowUpRight } from "lucide-react";

const WORKFLOWS = [
  {
    title: "Patent Eligibility & Novelty",
    badge: "Formulations & Extracts",
    icon: FlaskConical,
    description:
      "Quickly evaluate whether your botanical formulation, extract, or carrier method qualifies for patent protection before investing in costly filings.",
    highlights: [
      "Novel delivery carriers (nano-emulsions, liposomes)",
      "Section 3(d) comparative efficacy requirements",
      "Identification of patentable claims",
    ],
  },
  {
    title: "Traditional Knowledge Defense",
    badge: "Classical Scripture Screening",
    icon: ScrollText,
    description:
      "Screen centuries of documented classical Ayurvedic treatises to ensure your innovation isn't rejected for overlapping with ancient remedies.",
    highlights: [
      "Automated cross-check against ancient texts",
      "Section 3(p) traditional knowledge bar analysis",
      "Formulation differentiation strategies",
    ],
  },
  {
    title: "Biodiversity & Government Approvals",
    badge: "NBA & State Biodiversity Rules",
    icon: Landmark,
    description:
      "Navigate mandatory National Biodiversity Authority (NBA) approvals when utilizing Indian biological herbs and bio-resources.",
    highlights: [
      "NBA Form I clearance requirement detection",
      "Commercial utilization vs research exemptions",
      "Biological Diversity Act 2023 compliance",
    ],
  },
  {
    title: "Global Market & Export Readiness",
    badge: "PCT & WIPO Treaty Alignment",
    icon: Globe2,
    description:
      "Prepare your Ayurvedic products for international expansion with clear visibility into country-specific patent rules and global treaties.",
    highlights: [
      "WIPO GRATK Treaty origin disclosure checks",
      "Pre-screening for foreign PCT patent applications",
      "Multi-country regulatory requirement roadmaps",
    ],
  },
];

export function WorkflowGrid() {
  return (
    <section id="workflows" className="w-full py-16 px-6 relative overflow-hidden bg-transparent">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-start mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-[14px] h-[14px] bg-lime-300 border border-neutral-900 rounded-[2px]" />
            <div className="h-px w-6 bg-neutral-900/40" />
            <span className="px-3 py-1 rounded-full bg-[#FFFFFF] border border-neutral-900/40 text-xs font-mono font-bold uppercase tracking-widest text-neutral-800">
              What We Cover
            </span>
          </div>

          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-[44px] leading-tight text-neutral-900 max-w-3xl mb-3">
            One assistant. Every stage of protection and compliance.
          </h2>

          <p className="font-sans text-base sm:text-lg text-neutral-700 leading-relaxed max-w-2xl">
            From initial lab testing to international patent filings, Sahayak covers the four critical compliance pillars every Ayurvedic innovator encounters.
          </p>
        </div>

        {/* 4-Quadrant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {WORKFLOWS.map((wf, idx) => {
            const Icon = wf.icon;
            return (
              <div
                key={wf.title}
                className="relative bg-[#FFFFFF] border-2 border-neutral-900 rounded-[20px] p-7 sm:p-8 shadow-[3px_3px_0px_0px_#121212] hover:shadow-[5px_5px_0px_0px_#121212] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
              >
                {/* Decorative Lime Corner Marker on top right */}
                <div className="absolute top-4 right-4 w-3 h-3 bg-lime-300 border border-neutral-900 rounded-[2px]" />

                <div>
                  {/* Card Icon & Category */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-[10px] bg-neutral-900 text-lime-300 flex items-center justify-center shrink-0 border border-neutral-900">
                      <Icon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-600 bg-[#FAF8F5] px-2.5 py-1 rounded-[6px] border border-neutral-900/10">
                      {wf.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-heading font-bold text-xl sm:text-2xl text-neutral-900 mb-3 tracking-tight">
                    {wf.title}
                  </h3>

                  <p className="font-sans text-sm text-neutral-700 leading-relaxed mb-6">
                    {wf.description}
                  </p>
                </div>

                {/* Highlights List */}
                <div className="pt-4 border-t border-neutral-900/10">
                  <ul className="space-y-2">
                    {wf.highlights.map((item, iIdx) => (
                      <li key={iIdx} className="flex items-center text-xs sm:text-sm font-medium text-neutral-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 mr-2.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

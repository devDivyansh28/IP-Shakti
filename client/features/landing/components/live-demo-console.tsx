"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowRight, CheckCircle2, AlertTriangle, FileText, CornerDownLeft } from "lucide-react";

interface ScenarioData {
  id: string;
  categoryBadge: string;
  question: string;
  steps: { title: string; detail: string }[];
  verdict: string;
  badges: { label: string; status: "cleared" | "mandatory" | "advisory" }[];
}

const SCENARIOS: ScenarioData[] = [
  {
    id: "researcher",
    categoryBadge: "Lab Researcher / Patent Check",
    question: "Can we patent an Ashwagandha extract with a novel lipid nano-carrier that increases bioavailability?",
    steps: [
      {
        title: "Botanical & Novelty Scan",
        detail: "Withania somnifera detected. Root extract delivery relies on a synthetic phospholipid nano-emulsion matrix.",
      },
      {
        title: "Traditional Knowledge & Prior Art Check",
        detail: "Cross-referenced Charaka Samhita & classical compendia. While crude root use is traditional, the lipid nano-carrier is novel.",
      },
      {
        title: "Statutory Exemption Evaluation",
        detail: "Under Section 3(p), traditional knowledge bar is cleared because patent claims center on the novel carrier matrix.",
      },
    ],
    verdict:
      "Your formulation qualifies for patent protection because the nano-carrier is novel and non-obvious. However, comparative clinical data is required under Section 3(d) to prove enhanced therapeutic efficacy over standard root powder, and NBA clearance is required before foreign filing.",
    badges: [
      { label: "Patents Act § 3(p) — Cleared (Novel Carrier)", status: "cleared" },
      { label: "Patents Act § 3(d) — Efficacy Data Required", status: "advisory" },
      { label: "BDA 2023 § 3(2) — Form I Mandatory", status: "mandatory" },
    ],
  },
  {
    id: "startup",
    categoryBadge: "Startup / Indian Launch",
    question: "Is our polyherbal wellness blend blocked by traditional Ayurvedic scriptures, and which license do we need?",
    steps: [
      {
        title: "Formulation Composition Mapping",
        detail: "Identified Tulsi, Cinnamon, and Dry Ginger prepared in a modern water-soluble effervescent tablet format.",
      },
      {
        title: "Classical Scripture Cross-Reference",
        detail: "Ingredients correspond closely to traditional 'Ayush Kwath' documented in classical treatises and Ministry advisories.",
      },
      {
        title: "Licensing & Exemption Strategy",
        detail: "Direct patent on mixture is barred under Section 3(e) (mere admixture). Optimal route: AYUSH Proprietary Medicine license + Trademark.",
      },
    ],
    verdict:
      "A composition patent is vulnerable under Section 3(e) as an admixture without synergistic data. We recommend commercializing under an AYUSH Proprietary Medicine license, securing Trademark protection for your brand name, and applying for Schedule T GMP certification.",
    badges: [
      { label: "Patents Act § 3(e) — High Admixture Hurdle", status: "advisory" },
      { label: "AYUSH Ministry — Schedule T GMP Pathway", status: "cleared" },
      { label: "Trademark Act 1999 — Recommended Protection", status: "cleared" },
    ],
  },
  {
    id: "enterprise",
    categoryBadge: "Global Enterprise / Export",
    question: "What approvals do we need from the National Biodiversity Authority before filing our patent in the US or Europe?",
    steps: [
      {
        title: "Jurisdiction & Biological Origin Scan",
        detail: "Formulation utilizes biological resources sourced exclusively from the Western Ghats of India for international PCT filings.",
      },
      {
        title: "Biodiversity Act Form I Verification",
        detail: "Section 3 & Section 6 of Biological Diversity Act 2023 mandate prior approval from NBA before seeking IPR outside India.",
      },
      {
        title: "WIPO GRATK Treaty Alignment",
        detail: "Article 3 requires mandatory disclosure of the country of origin and indigenous community traditional knowledge in foreign applications.",
      },
    ],
    verdict:
      "Prior approval from the National Biodiversity Authority via Form I is legally mandatory under BDA 2023 Section 6 before your foreign patent can be granted. In addition, you must formally declare India as the country of origin under the WIPO GRATK Treaty to avoid international scrutiny.",
    badges: [
      { label: "BDA 2023 § 6 — Form I Approval Mandatory", status: "mandatory" },
      { label: "WIPO GRATK Treaty Art 3 — Origin Disclosure", status: "mandatory" },
      { label: "PCT Rule 51bis — Declaration of Source", status: "cleared" },
    ],
  },
];

export function LiveDemoConsole() {
  const [activeScenarioId, setActiveScenarioId] = useState<string>("researcher");
  const activeScenario = SCENARIOS.find((s) => s.id === activeScenarioId) ?? SCENARIOS[0];

  return (
    <section id="demo" className="w-full py-16 px-6 relative overflow-hidden">
      {/* Background Section Anchor Lines */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none z-0">
        <span className="absolute top-0 bottom-0 left-[12%] w-px bg-neutral-900/[0.05]" />
        <span className="absolute top-0 bottom-0 left-[88%] w-px bg-neutral-900/[0.05]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-start mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-[14px] h-[14px] bg-lime-300 border border-neutral-900 rounded-[2px]" />
            <div className="h-px w-6 bg-neutral-900/40" />
            <span className="px-3 py-1 rounded-full bg-[#FAF8F5] border border-neutral-900/40 text-xs font-mono font-bold uppercase tracking-widest text-neutral-800">
              Interactive Live Demo
            </span>
          </div>

          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-[44px] leading-tight text-neutral-900 max-w-3xl mb-4">
            Intelligent legal guidance for every stage of your product
          </h2>

          <p className="font-sans text-base sm:text-lg text-neutral-700 leading-relaxed max-w-2xl">
            Whether you are validating an early lab formulation, filing a patent, or preparing to launch in new markets — ask any question and receive clear reasoning backed by official legal benchmarks.
          </p>
        </div>

        {/* Split-Screen Console Card */}
        <div className="bg-[#FBF9F4] border-2 border-neutral-900 rounded-[24px] shadow-[4px_4px_0px_0px_#121212] overflow-hidden flex flex-col lg:flex-row min-h-[500px]">
          {/* Left Panel: The Researcher / User Inquiry */}
          <div className="lg:w-[46%] p-6 sm:p-8 border-b lg:border-b-0 lg:border-r-2 border-neutral-900 flex flex-col justify-between bg-[#FAF8F5]">
            <div>
              {/* Header Label */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
                  Select Real-World Dilemma
                </span>
                <span className="text-[11px] font-mono bg-neutral-900 text-lime-300 px-2 py-0.5 rounded-[4px]">
                  3 Live Scenarios
                </span>
              </div>

              {/* Clickable Scenario Pills */}
              <div className="flex flex-col gap-2.5 mb-6" role="tablist" aria-label="Demo Scenarios">
                {SCENARIOS.map((scenario) => {
                  const isSelected = scenario.id === activeScenarioId;
                  return (
                    <button
                      key={scenario.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setActiveScenarioId(scenario.id)}
                      className={`text-left p-3.5 rounded-[12px] border transition-all duration-150 relative ${
                        isSelected
                          ? "bg-neutral-900 text-white border-neutral-900 shadow-[2px_2px_0px_0px_#D4F843]"
                          : "bg-white text-neutral-800 border-neutral-900/20 hover:border-neutral-900/60 hover:bg-neutral-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                            isSelected ? "text-lime-300" : "text-neutral-600"
                          }`}
                        >
                          {scenario.categoryBadge}
                        </span>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-lime-300 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-medium leading-snug line-clamp-2">
                        {scenario.question}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Query Input Box */}
            <div className="pt-4 border-t border-neutral-900/10">
              <label htmlFor="active-query" className="block text-[11px] font-mono font-semibold text-neutral-600 mb-1.5 uppercase">
                Active Prompt To Sahayak
              </label>
              <div className="relative flex items-center">
                <input
                  id="active-query"
                  type="text"
                  readOnly
                  value={activeScenario.question}
                  className="w-full text-xs sm:text-sm font-sans font-medium text-neutral-900 bg-white border border-neutral-900/40 rounded-[10px] pl-3 pr-24 py-2.5 shadow-inner focus:outline-none"
                />
                <div className="absolute right-1.5 flex items-center gap-1">
                  <span className="hidden sm:inline-flex items-center text-[10px] font-mono text-neutral-600 mr-1">
                    <CornerDownLeft className="w-3 h-3" />
                  </span>
                  <div className="px-2.5 py-1 rounded-[6px] bg-lime-300 border border-neutral-900 text-[11px] font-bold text-neutral-900 flex items-center gap-1">
                    <span>Analyzed</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Transparent Reasoning & Verified Citations */}
          <div className="lg:w-[54%] flex flex-col bg-white">
            {/* macOS Style Window Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-900/15 bg-[#FAF8F5]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] border border-neutral-900/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-neutral-900/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28C840] border border-neutral-900/20" />
                <span className="ml-3 font-mono text-[11px] text-neutral-600 truncate max-w-[200px] sm:max-w-xs">
                  sahayak://legal-benchmarks/{activeScenario.id}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-800">
                  Verified Analysis
                </span>
              </div>
            </div>

            {/* Live Content Transition via AnimatePresence */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeScenario.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  {/* Step-by-Step Reasoning Trace */}
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 mb-3 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-neutral-900" />
                      Statutory Reasoning Trace
                    </h3>
                    <div className="space-y-2.5">
                      {activeScenario.steps.map((st, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-2.5 rounded-[10px] bg-[#FAF8F5] border border-neutral-900/10"
                        >
                          <span className="w-5 h-5 rounded-[4px] bg-neutral-900 text-lime-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-heading font-semibold text-xs sm:text-sm text-neutral-900">
                              {st.title}
                            </span>
                            <span className="font-sans text-xs text-neutral-600 leading-relaxed mt-0.5">
                              {st.detail}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Grounded Legal Verdict */}
                  <div className="p-4 rounded-[12px] bg-lime-300/15 border border-neutral-900/25">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <CheckCircle2 className="w-4 h-4 text-neutral-900" />
                      <span className="font-heading font-bold text-xs uppercase tracking-wider text-neutral-900">
                        Sahayak Grounded Verdict
                      </span>
                    </div>
                    <p className="font-sans text-xs sm:text-sm text-neutral-800 leading-relaxed">
                      {activeScenario.verdict}
                    </p>
                  </div>

                  {/* Clickable Legal Citation Badges */}
                  <div>
                    <span className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                      Cited Statutory Benchmarks
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeScenario.badges.map((b, bIdx) => (
                        <span
                          key={bIdx}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border text-xs font-mono font-medium ${
                            b.status === "cleared"
                              ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                              : b.status === "mandatory"
                              ? "bg-amber-50 text-amber-900 border-amber-300"
                              : "bg-blue-50 text-blue-900 border-blue-300"
                          }`}
                        >
                          {b.status === "cleared" ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          )}
                          <span>{b.label}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

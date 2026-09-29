"use client";

import { Lock, EyeOff, ShieldCheck } from "lucide-react";

const TRUST_POINTS = [
  {
    icon: EyeOff,
    title: "Zero Model Training on Your Data",
    description:
      "Your proprietary formulations, experimental ratios, and queries are never retained to train public machine learning models.",
  },
  {
    icon: Lock,
    title: "Isolated Private Workspaces",
    description:
      "Uploaded laboratory notes, trial data, and draft claims remain strictly segregated to your private session and account.",
  },
  {
    icon: ShieldCheck,
    title: "Public Gazette Citations Only",
    description:
      "All statutory benchmarks and citations originate from public official gazettes, guaranteeing zero cross-contamination of your IP.",
  },
];

export function ConfidentialityStrip() {
  return (
    <section className="w-full py-16 px-6 relative overflow-hidden bg-[#F7F4EE]">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-[14px] h-[14px] bg-lime-300 border border-neutral-900 rounded-[2px]" />
            <span className="px-3 py-1 rounded-full bg-[#FFFFFF] border border-neutral-900/40 text-xs font-mono font-bold uppercase tracking-widest text-neutral-800">
              Confidentiality First
            </span>
            <div className="w-[14px] h-[14px] bg-lime-300 border border-neutral-900 rounded-[2px]" />
          </div>

          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl leading-tight text-neutral-900 max-w-2xl">
            Your research and formulations, strictly confidential
          </h2>
        </div>

        {/* 3 Trust Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TRUST_POINTS.map((tp, idx) => {
            const Icon = tp.icon;
            return (
              <div
                key={tp.title}
                className="bg-[#FFFFFF] border-2 border-neutral-900 rounded-[18px] p-6 sm:p-7 shadow-[3px_3px_0px_0px_#121212] flex flex-col items-start"
              >
                <div className="w-10 h-10 rounded-[10px] bg-lime-300 border border-neutral-900 text-neutral-900 flex items-center justify-center mb-4 shrink-0 shadow-sm">
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>

                <h3 className="font-heading font-bold text-lg text-neutral-900 mb-2">
                  {tp.title}
                </h3>

                <p className="font-sans text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {tp.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

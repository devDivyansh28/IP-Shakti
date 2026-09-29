"use client";

import { ShieldCheck, BookOpen, Globe2, Scale, Landmark } from "lucide-react";

const FRAMEWORKS = [
  {
    name: "Indian Patent Office (IPO)",
    subtitle: "The Patents Act, 1970 & Section 3(p) Guidelines",
    icon: Scale,
  },
  {
    name: "National Biodiversity Authority (NBA)",
    subtitle: "Biological Diversity Act 2023 & Form I Rules",
    icon: Landmark,
  },
  {
    name: "Traditional Knowledge Digital Library (TKDL)",
    subtitle: "CSIR & AYUSH Classical Compendia Index",
    icon: BookOpen,
  },
  {
    name: "AYUSH Pharmacopoeia Commission (PCIM&H)",
    subtitle: "Ayurvedic Formulations & Schedule T Standards",
    icon: ShieldCheck,
  },
  {
    name: "WIPO GRATK Treaty (Geneva)",
    subtitle: "Global Genetic Resources & TK Disclosure",
    icon: Globe2,
  },
];

export function FrameworkMarquee() {
  return (
    <section className="w-full py-8 border-y border-neutral-900/10 bg-[#FAF8F5]/80 overflow-hidden" aria-label="Official Frameworks">
      <div className="max-w-6xl mx-auto px-6 mb-4 text-center">
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-600">
          Grounded in Official Indian &amp; Global Frameworks
        </p>
      </div>

      {/* Marquee Scroller Container */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex items-center gap-6 animate-[marquee_32s_linear_infinite] w-max py-2">
          {/* Duplicate array for seamless infinite loop */}
          {[...FRAMEWORKS, ...FRAMEWORKS].map((fw, idx) => {
            const Icon = fw.icon;
            return (
              <div
                key={`${fw.name}-${idx}`}
                className="flex items-center gap-3.5 px-5 py-3 rounded-[14px] bg-[#FFFFFF] border border-neutral-900/20 shadow-[2px_2px_0px_0px_rgba(18,18,18,0.06)] hover:border-neutral-900/60 hover:shadow-[2px_2px_0px_0px_#121212] transition-all duration-200 shrink-0"
              >
                <div className="w-8 h-8 rounded-[8px] bg-neutral-900 flex items-center justify-center text-lime-300 shrink-0">
                  <Icon className="w-4 h-4" strokeWidth={2} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-heading font-semibold text-sm text-neutral-900 leading-tight">
                    {fw.name}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-600 leading-tight mt-0.5">
                    {fw.subtitle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

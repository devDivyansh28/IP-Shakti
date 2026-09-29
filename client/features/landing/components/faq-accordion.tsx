"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Does Sahayak replace a registered Indian patent attorney or agent?",
    answer:
      "No. Sahayak is an intelligent diagnostic and pre-screening assistant designed to uncover traditional knowledge conflicts, check patentability, and highlight regulatory hurdles early in your research. Formal patent filing and representation before the Indian Patent Office (IPO) should always be completed with a registered patent agent or advocate.",
  },
  {
    question: "How does the assistant guarantee zero hallucinated citations?",
    answer:
      "Sahayak does not invent legal rules. Every response is strictly retrieved and grounded in our verified statutory repository — including the Indian Patents Act 1970, Biological Diversity Act 2023 Rules, and official compendia. Every recommendation is accompanied by section-level citations you can independently verify.",
  },
  {
    question: "Can I evaluate both classical formulas and modern herbal extracts?",
    answer:
      "Yes. Sahayak analyzes classical formulations (Shastrokta remedies like Asavas, Arishtas, and Bhasmas) to identify traditional knowledge protections, as well as modern proprietary polyherbals, isolated botanicals, and novel delivery systems (like liposomes or nano-carriers) for patent eligibility.",
  },
  {
    question: "Does Sahayak assist with international patent filings (PCT, WIPO, US, Europe)?",
    answer:
      "Yes. Sahayak evaluates whether your formulation complies with international frameworks like the WIPO GRATK Treaty (mandatory country-of-origin disclosure) and alerts you if National Biodiversity Authority (NBA Form I) approval is required before you file abroad.",
  },
  {
    question: "Are my formulation details and research kept private?",
    answer:
      "Completely. Your queries, proprietary compositions, and uploaded research documents are confidential to your session and are never shared or used to train public AI models.",
  },
];

export function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="w-full py-16 px-6 relative overflow-hidden bg-[#FAF8F5]">
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-[14px] h-[14px] bg-lime-300 border border-neutral-900 rounded-[2px]" />
            <div className="h-px w-6 bg-neutral-900/40" />
            <span className="px-3 py-1 rounded-full bg-[#FFFFFF] border border-neutral-900/40 text-xs font-mono font-bold uppercase tracking-widest text-neutral-800">
              FAQ
            </span>
          </div>

          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl leading-tight text-neutral-900">
            Have Questions? We&apos;ve Answers!
          </h2>
        </div>

        {/* Accordion Container */}
        <div className="bg-[#FFFFFF] border-2 border-neutral-900 rounded-[22px] shadow-[4px_4px_0px_0px_#121212] overflow-hidden divide-y-2 divide-neutral-900">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={item.question} className="transition-colors">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:bg-[#F7F4EE] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-heading font-bold text-base sm:text-lg text-neutral-900">
                    {item.question}
                  </span>
                  <div className="w-8 h-8 rounded-[8px] bg-[#FAF8F5] border border-neutral-900/30 flex items-center justify-center text-neutral-900 shrink-0">
                    {isOpen ? (
                      <Minus className="w-4 h-4" strokeWidth={2.5} />
                    ) : (
                      <Plus className="w-4 h-4" strokeWidth={2.5} />
                    )}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-neutral-700 text-xs sm:text-sm font-sans leading-relaxed border-t border-neutral-900/10 bg-[#FAF8F5]/50">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

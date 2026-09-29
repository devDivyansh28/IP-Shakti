"use client";

import Link from "next/link";
import { ArrowRight, Scale, ShieldCheck } from "lucide-react";
import { authRoutes } from "@/features/auth/lib/auth-routes";

interface FinalCtaFooterProps {
  isAuthenticated?: boolean;
}

export function FinalCtaFooter({ isAuthenticated = false }: FinalCtaFooterProps) {
  const targetHref = isAuthenticated ? authRoutes.dashboard : authRoutes.login;

  return (
    <footer className="w-full bg-[#F7F4EE] border-t border-neutral-900/10 pt-16 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Final CTA Card (Browser Frame Box) */}
        <div className="relative bg-[#FFFFFF] border-2 border-neutral-900 rounded-[24px] shadow-[4px_4px_0px_0px_#121212] p-8 sm:p-12 lg:p-14 text-center overflow-hidden mb-16">
          {/* Decorative Corner Notches */}
          <div className="absolute top-3 left-3 w-3 h-3 bg-lime-300 border border-neutral-900 rounded-[2px]" />
          <div className="absolute top-3 right-3 w-3 h-3 bg-lime-300 border border-neutral-900 rounded-[2px]" />

          <div className="max-w-2xl mx-auto flex flex-col items-center">
            <div className="w-12 h-12 rounded-[12px] bg-neutral-900 text-lime-300 flex items-center justify-center border border-neutral-900 mb-6 shadow-sm">
              <Scale className="w-6 h-6" strokeWidth={2} />
            </div>

            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-[40px] leading-tight text-neutral-900 mb-4 tracking-tight">
              Start evaluating your Ayurvedic innovations today
            </h2>

            <p className="font-sans text-base sm:text-lg text-neutral-700 leading-relaxed mb-8">
              Join researchers, startups, and institutions using Sahayak to navigate patenting and compliance with total confidence.
            </p>

            <Link
              href={targetHref}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-[13px] text-base font-bold text-neutral-900 bg-lime-300 border-2 border-neutral-900 shadow-[3px_3px_0px_0px_#121212] hover:bg-lime-400 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-150 group"
            >
              <span>START CHAT</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-150" strokeWidth={2.5} />
            </Link>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-4 rounded-[12px] bg-[#FAF8F5] border border-neutral-900/15 mb-10 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
          <p className="font-sans text-xs text-neutral-600 leading-relaxed">
            <strong className="text-neutral-900">Legal Notice &amp; Disclaimer:</strong> IP-SAKTI Sahayak is an artificial intelligence-assisted compliance and diagnostic pre-screening platform intended for preliminary educational and research evaluation. It does not constitute formal legal counsel and does not substitute for qualified representation by a registered Indian Patent Agent or Advocate.
          </p>
        </div>

        {/* Footer Navigation & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-neutral-900/10 text-xs font-mono text-neutral-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900">IP-SAKTI Sahayak</span>
            <span>&bull;</span>
            <span>Government Gazette Grounded</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-neutral-600">
            <span>The Patents Act, 1970</span>
            <span>&bull;</span>
            <span>BDA 2023 Rules</span>
            <span>&bull;</span>
            <span>WIPO GRATK Treaty</span>
          </div>

          <div>
            &copy; {new Date().getFullYear()} IP-SAKTI Sahayak. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

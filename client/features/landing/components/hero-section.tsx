"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { authRoutes } from "@/features/auth/lib/auth-routes";
import { useAuthModal } from "@/features/auth/hooks/use-auth-modal";

interface HeroSectionProps {
  isAuthenticated?: boolean;
}

export function HeroSection({ isAuthenticated = false }: HeroSectionProps) {
  const openAuthModal = useAuthModal((s) => s.openAuthModal);
  const targetHref = isAuthenticated ? authRoutes.dashboard : authRoutes.login;

  return (
    <section className="relative w-full pt-4 sm:pt-8 pb-8 sm:pb-12 px-4 sm:px-6 overflow-hidden">
      {/* Background Architectural Guide Lines */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none z-0">
        <span className="absolute top-0 bottom-0 left-[12%] w-px bg-neutral-900/[0.07]" />
        <span className="absolute top-0 bottom-0 left-[38%] w-px bg-neutral-900/[0.07]" />
        <span className="absolute top-0 bottom-0 left-[62%] w-px bg-neutral-900/[0.07]" />
        <span className="absolute top-0 bottom-0 left-[88%] w-px bg-neutral-900/[0.07]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Main Hero Card with Folded Paper Corner Notch */}
        <div className="relative bg-[#FAF8F5] border-2 border-neutral-900 rounded-[20px] sm:rounded-[24px] shadow-[4px_4px_0px_0px_#121212] overflow-hidden">
          {/* Folded Paper Corner Notch (Top-Right Dog-Ear) */}
          <div className="absolute top-0 right-0 w-12 sm:w-16 h-12 sm:h-16 pointer-events-none z-20">
            <div className="absolute top-0 right-0 w-0 h-0 border-t-[48px] sm:border-t-[64px] border-t-[#F7F4EE] border-l-[48px] sm:border-l-[64px] border-l-transparent drop-shadow-[-1px_1px_1px_rgba(0,0,0,0.15)]" />
            <div className="absolute top-0 right-0 w-12 sm:w-16 h-12 sm:h-16 border-b border-l border-neutral-900/30" />
            <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-[2px] bg-lime-300 border border-neutral-900" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-5 sm:p-8 md:p-14 lg:p-16">
            {/* Left Column: Typography & Action */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              {/* Category Pill Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 text-lime-300 border border-neutral-900 text-xs font-mono font-medium tracking-wide uppercase mb-4 sm:mb-6 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Statutory Intelligence for Ayurveda</span>
              </div>

              {/* Bold Punchy Headline */}
              <h1 className="font-heading font-extrabold text-[32px] sm:text-[44px] lg:text-[56px] leading-[1.08] tracking-tight text-neutral-900 mb-4 sm:mb-6">
                Ayurvedic Patenting and Compliance Made Simple
              </h1>

              {/* Journal Sub-headline */}
              <p className="font-sans text-base sm:text-xl text-neutral-700 leading-relaxed max-w-xl mb-6 sm:mb-8">
                You focus on inventing and refining your formulations. We handle the complex patent rules, biodiversity approvals, and traditional knowledge checks — zero legal background needed.
              </p>

              {/* CTA Group */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-3">
                {!isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => openAuthModal()}
                    className="inline-flex items-center justify-center px-8 py-3.5 rounded-[13px] text-base font-bold text-neutral-900 bg-lime-300 border-2 border-neutral-900 shadow-[3px_3px_0px_0px_#121212] hover:bg-lime-400 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-150 group cursor-pointer"
                  >
                    <span>START CHAT</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-150" strokeWidth={2.5} />
                  </button>
                ) : (
                  <Link
                    href={targetHref}
                    className="inline-flex items-center justify-center px-8 py-3.5 rounded-[13px] text-base font-bold text-neutral-900 bg-lime-300 border-2 border-neutral-900 shadow-[3px_3px_0px_0px_#121212] hover:bg-lime-400 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-150 group"
                  >
                    <span>START CHAT</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-150" strokeWidth={2.5} />
                  </Link>
                )}

                <a
                  href="#demo"
                  className="inline-flex items-center text-sm font-mono font-semibold text-neutral-800 hover:text-neutral-950 underline underline-offset-4 px-2 py-2 transition-colors"
                >
                  Explore Live Demo ↓
                </a>
              </div>
            </div>

            {/* Right Column: Ayurvedic Researcher Mascot Illustration */}
            <div className="lg:col-span-5 flex items-center justify-center relative">
              <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
                {/* Decorative Background Stamp Ring */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-neutral-900/20 animate-[spin_60s_linear_infinite]" />
                <div className="absolute inset-4 rounded-full bg-lime-300/20 border border-neutral-900/10" />

                {/* Vector SVG Researcher Mascot */}
                <svg
                  viewBox="0 0 320 320"
                  className="w-full h-full relative z-10 drop-shadow-md"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="Ayurvedic researcher examining a herbal flask and approved patent certificate"
                >
                  {/* Outer Seal Ring */}
                  <circle cx="160" cy="160" r="145" stroke="#121212" strokeWidth="2.5" strokeDasharray="6 4" />

                  {/* Grounding Base Shadow */}
                  <ellipse cx="160" cy="275" rx="90" ry="14" fill="#121212" fillOpacity="0.1" />

                  {/* Researcher Body: Lab Coat */}
                  <path
                    d="M110 270 L118 170 Q130 155 160 155 Q190 155 202 170 L210 270 Z"
                    fill="#FFFFFF"
                    stroke="#121212"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  {/* Coat Lapels */}
                  <path d="M142 165 L160 215 L178 165" stroke="#121212" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M160 215 L160 270" stroke="#121212" strokeWidth="2" />
                  {/* Coat Pocket with Herbal Quill */}
                  <rect x="124" y="210" width="22" height="26" rx="3" fill="#FAF8F5" stroke="#121212" strokeWidth="1.75" />
                  <path d="M135 204 L135 212" stroke="#121212" strokeWidth="2" strokeLinecap="round" />

                  {/* Researcher Head & Glasses */}
                  <circle cx="160" cy="115" r="32" fill="#F4EFE6" stroke="#121212" strokeWidth="2.5" />
                  {/* Hair */}
                  <path
                    d="M130 115 C130 85, 190 85, 190 115 C186 102, 175 96, 160 96 C145 96, 134 102, 130 115 Z"
                    fill="#121212"
                  />
                  {/* Glasses */}
                  <rect x="141" y="112" width="16" height="12" rx="3" fill="#D4F843" fillOpacity="0.4" stroke="#121212" strokeWidth="2" />
                  <rect x="163" y="112" width="16" height="12" rx="3" fill="#D4F843" fillOpacity="0.4" stroke="#121212" strokeWidth="2" />
                  <line x1="157" y1="117" x2="163" y2="117" stroke="#121212" strokeWidth="2" />
                  {/* Friendly Smile */}
                  <path d="M153 133 Q160 138 167 133" stroke="#121212" strokeWidth="2" strokeLinecap="round" />

                  {/* Left Hand holding Herbal Erlenmeyer Flask */}
                  <path d="M102 188 Q88 200 80 230" stroke="#121212" strokeWidth="8" strokeLinecap="round" />
                  {/* Flask */}
                  <path
                    d="M75 220 L85 220 L96 250 A6 6 0 0 1 91 257 L69 257 A6 6 0 0 1 64 250 Z"
                    fill="#D4F843"
                    fillOpacity="0.85"
                    stroke="#121212"
                    strokeWidth="2.25"
                    strokeLinejoin="round"
                  />
                  {/* Plant Sprout inside Flask */}
                  <path d="M80 252 Q80 238 80 234 Q80 228 85 224" stroke="#1A3E31" strokeWidth="2" strokeLinecap="round" />
                  <path d="M80 238 Q86 234 89 238" fill="#1A3E31" />
                  <path d="M80 244 Q74 240 72 244" fill="#1A3E31" />

                  {/* Right Hand holding Patent Document */}
                  <path d="M218 188 Q232 200 240 225" stroke="#121212" strokeWidth="8" strokeLinecap="round" />
                  {/* Patent Certificate Parchment */}
                  <g transform="rotate(8 240 225)">
                    <rect x="220" y="195" width="46" height="60" rx="4" fill="#FFFFFF" stroke="#121212" strokeWidth="2" />
                    {/* Simulated Text Lines */}
                    <line x1="226" y1="207" x2="258" y2="207" stroke="#121212" strokeWidth="2" strokeLinecap="round" />
                    <line x1="226" y1="214" x2="252" y2="214" stroke="#121212" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="226" y1="221" x2="256" y2="221" stroke="#121212" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Approved Gold/Lime Seal Stamp */}
                    <circle cx="243" cy="238" r="9" fill="#D4F843" stroke="#121212" strokeWidth="1.5" />
                    <path d="M240 238 L242 241 L247 236" stroke="#121212" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </g>

                  {/* Floating Little Square Corner Tracer Notches */}
                  <rect x="36" y="50" width="14" height="14" rx="2" fill="#D4F843" stroke="#121212" strokeWidth="1.75" />
                  <rect x="270" y="250" width="14" height="14" rx="2" fill="#D4F843" stroke="#121212" strokeWidth="1.75" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

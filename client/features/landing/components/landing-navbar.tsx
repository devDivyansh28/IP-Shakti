"use client";

import Link from "next/link";
import { Scale, ArrowRight, LogIn } from "lucide-react";
import { authRoutes } from "@/features/auth/lib/auth-routes";

interface LandingNavbarProps {
  isAuthenticated?: boolean;
}

export function LandingNavbar({ isAuthenticated = false }: LandingNavbarProps) {
  const targetChatHref = isAuthenticated ? authRoutes.dashboard : authRoutes.login;

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F7F4EE]/95 backdrop-blur-md border-b border-neutral-900/10 transition-colors">
      <div className="max-w-7xl mx-auto px-6 h-[76px] flex items-center justify-between gap-4">
        {/* Brand Logo & Mark */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="w-10 h-10 rounded-[10px] bg-neutral-900 flex items-center justify-center text-lime-300 border border-neutral-900 shadow-sm group-hover:scale-105 transition-transform duration-200">
            <Scale className="w-5 h-5" strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-lg leading-tight tracking-tight text-neutral-900">
              IP-SAKTI Sahayak
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-600">
              Ayurvedic IP Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-neutral-700" aria-label="Main Navigation">
          <a
            href="#demo"
            className="hover:text-neutral-950 transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
          >
            Interactive Demo
          </a>
          <a
            href="#how-it-works"
            className="hover:text-neutral-950 transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
          >
            How It Works
          </a>
          <a
            href="#workflows"
            className="hover:text-neutral-950 transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
          >
            What We Cover
          </a>
          <a
            href="#faq"
            className="hover:text-neutral-950 transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
          >
            FAQ
          </a>
        </nav>

        {/* Action Buttons (Auth Aware) */}
        <div className="flex items-center gap-3 shrink-0">
          {!isAuthenticated ? (
            <>
              <Link
                href={authRoutes.login}
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 h-[42px] rounded-[11px] text-sm font-semibold text-neutral-900 border border-neutral-900/80 bg-[#FAF8F5] hover:bg-neutral-200/50 transition-colors duration-200"
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                LOG IN
              </Link>

              <Link
                href={authRoutes.login}
                className="inline-flex items-center justify-center px-5 py-2 h-[42px] rounded-[11px] text-sm font-bold text-neutral-900 bg-lime-300 border-2 border-neutral-900 shadow-[2px_2px_0px_0px_#121212] hover:bg-lime-400 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-150"
              >
                <span>START CHAT</span>
                <ArrowRight className="w-4 h-4 ml-1.5" strokeWidth={2.5} />
              </Link>
            </>
          ) : (
            <Link
              href={targetChatHref}
              className="inline-flex items-center justify-center px-5 py-2 h-[42px] rounded-[11px] text-sm font-bold text-neutral-900 bg-lime-300 border-2 border-neutral-900 shadow-[2px_2px_0px_0px_#121212] hover:bg-lime-400 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-150"
            >
              <span>OPEN CHAT</span>
              <ArrowRight className="w-4 h-4 ml-1.5" strokeWidth={2.5} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

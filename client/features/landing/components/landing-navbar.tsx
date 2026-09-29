"use client";

import { useState } from "react";
import Link from "next/link";
import { Scale, ArrowRight, LogIn, Menu, X } from "lucide-react";
import { authRoutes } from "@/features/auth/lib/auth-routes";
import { useAuthModal } from "@/features/auth/hooks/use-auth-modal";

interface LandingNavbarProps {
  isAuthenticated?: boolean;
}

export function LandingNavbar({ isAuthenticated = false }: LandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const openAuthModal = useAuthModal((s) => s.openAuthModal);
  const targetChatHref = isAuthenticated ? authRoutes.dashboard : authRoutes.login;

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F7F4EE]/95 backdrop-blur-md border-b border-neutral-900/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[68px] sm:h-[76px] flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Mark */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] bg-neutral-900 flex items-center justify-center text-lime-300 border border-neutral-900 shadow-sm group-hover:scale-105 transition-transform duration-200 shrink-0">
            <Scale className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-heading font-bold text-base sm:text-lg leading-tight tracking-tight text-neutral-900 truncate">
              IP-SAKTI Sahayak
            </span>
            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-neutral-600 truncate">
              Ayurvedic IP Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[15px] font-medium text-neutral-700" aria-label="Main Navigation">
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
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {!isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => openAuthModal()}
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 h-[38px] sm:h-[42px] rounded-[11px] text-xs sm:text-sm font-semibold text-neutral-900 border border-neutral-900/80 bg-[#FAF8F5] hover:bg-neutral-200/50 transition-colors duration-200 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                LOG IN
              </button>

              <button
                type="button"
                onClick={() => openAuthModal()}
                className="inline-flex items-center justify-center px-3.5 sm:px-5 py-2 h-[38px] sm:h-[42px] rounded-[11px] text-xs sm:text-sm font-bold text-neutral-900 bg-lime-300 border-2 border-neutral-900 shadow-[2px_2px_0px_0px_#121212] hover:bg-lime-400 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-150 cursor-pointer"
              >
                <span>START CHAT</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5" strokeWidth={2.5} />
              </button>
            </>
          ) : (
            <Link
              href={targetChatHref}
              className="inline-flex items-center justify-center px-3.5 sm:px-5 py-2 h-[38px] sm:h-[42px] rounded-[11px] text-xs sm:text-sm font-bold text-neutral-900 bg-lime-300 border-2 border-neutral-900 shadow-[2px_2px_0px_0px_#121212] hover:bg-lime-400 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-150"
            >
              <span>OPEN CHAT</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5" strokeWidth={2.5} />
            </Link>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-1.5 sm:p-2 rounded-lg border border-neutral-900/30 text-neutral-900 hover:bg-neutral-200/50 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-900/10 bg-[#F7F4EE] px-5 py-4 flex flex-col gap-3 shadow-lg">
          <a
            href="#demo"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-semibold text-neutral-800 hover:text-neutral-950 py-1.5"
          >
            Interactive Demo
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-semibold text-neutral-800 hover:text-neutral-950 py-1.5"
          >
            How It Works
          </a>
          <a
            href="#workflows"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-semibold text-neutral-800 hover:text-neutral-950 py-1.5"
          >
            What We Cover
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-semibold text-neutral-800 hover:text-neutral-950 py-1.5"
          >
            FAQ
          </a>

          {!isAuthenticated && (
            <div className="pt-2 border-t border-neutral-900/10 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal();
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-[11px] text-xs font-semibold text-neutral-900 border border-neutral-900/80 bg-white"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>LOG IN</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

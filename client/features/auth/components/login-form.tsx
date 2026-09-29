"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Scale, ArrowLeft, Loader2 } from "lucide-react";
import { signIn } from "../lib/auth-client";
import { authRoutes } from "../lib/auth-routes";

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbackUrl = searchParams.get("callbackUrl") ?? authRoutes.dashboard;

  async function handleGoogleSignIn() {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
      });

      if (error) {
        setError(error.message ?? "Authentication failed. Please try again.");
        setIsLoading(false);
        return;
      }

      if (data?.url && data.redirect) {
        window.location.href = data.url;
        return;
      }
    } catch {
      setError("Unable to connect to sign-in provider.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="relative bg-[#FFFFFF] border-2 border-neutral-900 rounded-[22px] shadow-[4px_4px_0px_0px_#121212] p-8 sm:p-9 text-center">
        {/* Brand Icon & Title */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-[12px] bg-neutral-900 text-lime-300 flex items-center justify-center border border-neutral-900 shadow-sm mb-3">
            <Scale className="w-6 h-6" strokeWidth={2} />
          </div>

          <h1 className="font-heading font-extrabold text-2xl text-neutral-900 tracking-tight">
            Sign In to Sahayak
          </h1>
        </div>

        {/* Continue with Google Action */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleGoogleSignIn();
          }}
          className="space-y-4"
        >
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[52px] rounded-[13px] bg-[#FAF8F5] hover:bg-[#FFFFFF] active:bg-neutral-100 border-2 border-neutral-900 shadow-[3px_3px_0px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-3 text-sm font-heading font-bold text-neutral-900 transition-all duration-150 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-neutral-900" />
            ) : (
              <GoogleIcon className="w-5 h-5 shrink-0" />
            )}
            <span>{isLoading ? "Connecting..." : "Continue with Google"}</span>
          </button>

          {error && (
            <p className="text-center text-xs text-red-600 bg-red-50 p-2 rounded-[6px] border border-red-200">
              {error}
            </p>
          )}
        </form>

        {/* Back Link */}
        <div className="mt-6 pt-4 border-t border-neutral-900/10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

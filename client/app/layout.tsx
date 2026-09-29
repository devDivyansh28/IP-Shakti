import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import QueryProvider from "@/shared/components/providers/query-provider";
import { ThemeProvider } from "@/shared/components/providers/theme-provider";

export const metadata: Metadata = {
  title: "IP-SAKTI Sahayak | Ayurvedic IPR & Regulatory Intelligence",
  description:
    "Multilingual, RAG-grounded AI assistant for Ayurvedic Intellectual Property, formulation regulatory classification, prior-art novelty, and Access and Benefit Sharing (ABS) compliance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased")}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

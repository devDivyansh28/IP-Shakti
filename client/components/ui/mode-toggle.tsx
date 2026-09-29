"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <button
        type="button"
        title="Toggle theme"
        className="size-8 rounded-xl flex items-center justify-center border-2 border-neutral-900/20 dark:border-white/20 bg-white dark:bg-[#161B20] text-neutral-800 dark:text-[#FBF9F5] transition-all"
      >
        <Sun className="size-4" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="size-8 rounded-xl flex items-center justify-center border-2 border-neutral-900 dark:border-white/20 bg-white dark:bg-[#161B20] text-neutral-800 dark:text-[#FBF9F5] shadow-[2px_2px_0px_0px_#121212] dark:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer transition-all"
    >
      {isDark ? (
        <Sun className="size-4 text-lime-300" />
      ) : (
        <Moon className="size-4 text-neutral-800" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const isDark = (theme ?? resolvedTheme) !== "light";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-md border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-800/60"
      title={isDark ? "Tema claro" : "Tema escuro"}
    >
      {isDark ? "Claro" : "Escuro"}
    </button>
  );
}


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
      onClick={async () => {
        const newDark = !isDark;
        setTheme(newDark ? 'dark' : 'light');
        try {
          // Busca id do usuário; se não existir, envia null mesmo assim
          let userId: string | number | null = null;
          try {
            const res = await fetch('/api/users', { cache: 'no-store' });
            if (res.ok) {
              const data = await res.json();
              const u = Array.isArray(data) ? (data[0] || {}) : data;
              if (u?.id != null) userId = u.id;
            }
          } catch {}
          if (!userId) userId = localStorage.getItem('userId');
          await fetch('/api/users/dark_theme', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId ?? null, dark_theme: newDark }),
          });
        } catch {}
      }}
      className="rounded-md border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-800/60"
      title={isDark ? "Tema claro" : "Tema escuro"}
    >
      {isDark ? "Claro" : "Escuro"}
    </button>
  );
}

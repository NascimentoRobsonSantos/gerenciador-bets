"use client";

import Link from "next/link";
import { BarChart3, List, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

export default function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Ensure portal target exists only on client to avoid hydration issues
  useEffect(() => setMounted(true), []);

  // Close on route change
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!open) return;
    const { style } = document.body;
    const prev = style.overflow;
    style.overflow = "hidden";
    return () => {
      style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  const content = (
    <div className="fixed inset-0 z-[100] md:hidden" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <aside
        className="fixed left-0 top-0 h-full w-72 border-r border-neutral-800 p-4 shadow-2xl bg-background text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold">Gerenciador Bets</span>
          <button
            onClick={onClose}
            className="rounded-md border border-neutral-700 p-1 hover:bg-neutral-800/60"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex flex-col gap-1">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-neutral-800/60"
          >
            <BarChart3 className="h-4 w-4" /> Dashboard
          </Link>
          <div className="mt-2 text-xs uppercase text-neutral-500 px-1">Entradas</div>
          <Link
            href="/entradas/virtual"
            onClick={onClose}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-neutral-800/60"
          >
            <List className="h-4 w-4" /> Virtual
          </Link>
        </nav>
      </aside>
    </div>
  );

  // Render outside header to avoid stacking-context issues from backdrop/filter
  return createPortal(content, document.body);
}

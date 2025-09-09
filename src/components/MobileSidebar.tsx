"use client";

import Link from "next/link";
import { BarChart3, List, X } from "lucide-react";

export default function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <aside className="absolute left-0 top-0 h-full w-72 bg-background border-r border-neutral-800 p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold">Gerenciador Bets</span>
          <button onClick={onClose} className="rounded-md border border-neutral-700 p-1 hover:bg-neutral-800/60" aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex flex-col gap-1">
          <Link href="/" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-neutral-800/60"><BarChart3 className="h-4 w-4" /> Dashboard</Link>
          <div className="mt-2 text-xs uppercase text-neutral-500 px-1">Entradas</div>
          <Link href="/entradas/virtual" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-neutral-800/60"><List className="h-4 w-4" /> Virtual</Link>
        </nav>
      </aside>
    </div>
  );
}


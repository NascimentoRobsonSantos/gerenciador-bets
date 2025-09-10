"use client";

import { usePathname } from "next/navigation";
import SettingsMenu from "@/components/SettingsMenu";
import { useState } from "react";
import { Menu } from "lucide-react";
import MobileSidebar from "@/components/MobileSidebar";

export default function Header() {
  const pathname = usePathname();
  const title = pathname === "/" ? "Dashboard" : pathname.replace(/\//g, " · ").slice(3);
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-800 bg-neutral-950/70 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/40 px-4 md:px-6 py-3">
      <div className="flex items-center gap-2">
        <button onClick={() => setOpen(true)} className="md:hidden rounded-md border border-neutral-700 px-2 py-1 hover:bg-neutral-800/60" aria-label="Abrir menu">
          <Menu className="h-5 w-5" />
        </button>
        <div className="font-medium text-b365-yellow">{title || "Gerenciador Bets"}</div>
      </div>
      <SettingsMenu />
      <MobileSidebar open={open} onClose={() => setOpen(false)} />
    </header>
  );
}

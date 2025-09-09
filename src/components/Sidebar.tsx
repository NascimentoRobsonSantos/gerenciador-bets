"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, List, Navigation } from "lucide-react";

const navItem = (
  href: string,
  label: string,
  icon?: React.ReactNode,
  isActive?: boolean
) => (
  <Link
    href={href}
    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-neutral-800/60 ${
      isActive ? "bg-neutral-800/60 text-b365-yellow" : "text-neutral-300"
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export default function Sidebar() {
  const pathname = usePathname();
  const isActive = (p: string) => pathname === p;

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col gap-2 border-r border-neutral-800 bg-neutral-950 p-4">
      <div className="flex items-center gap-2 px-1 py-2">
        <Navigation className="h-5 w-5 text-b365-yellow" />
        <span className="font-semibold">Gerenciador Bets</span>
      </div>

      <nav className="mt-2 flex flex-col gap-1">
        {navItem("/", "Dashboard", <BarChart3 className="h-4 w-4" />, isActive("/"))}
        <div className="mt-2 text-xs uppercase text-neutral-500 px-1">Entradas</div>
        {navItem(
          "/entradas/virtual",
          "Virtual",
          <List className="h-4 w-4" />,
          isActive("/entradas/virtual")
        )}
      </nav>
    </aside>
  );
}


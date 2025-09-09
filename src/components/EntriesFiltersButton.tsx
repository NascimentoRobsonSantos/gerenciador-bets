"use client";

import { Filter } from "lucide-react";

export default function EntriesFiltersButton() {
  function open() {
    const ev = new CustomEvent("open-entries-filters");
    window.dispatchEvent(ev);
  }
  return (
    <button
      onClick={open}
      className="inline-flex items-center gap-2 rounded-md border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-800/60"
      title="Filtros"
    >
      <Filter className="h-4 w-4" /> Filtros
    </button>
  );
}


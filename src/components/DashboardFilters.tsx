"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardFilters({
  initialStatus = "all",
  initialStartDate,
  initialEndDate,
  initialBetOrigin,
}: {
  initialStatus?: "all" | "green" | "red" | "false";
  initialStartDate?: string | undefined;
  initialEndDate?: string | undefined;
  initialBetOrigin?: string | undefined;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<typeof initialStatus>(initialStatus);
  const [startDate, setStartDate] = useState<string>(initialStartDate ?? "");
  const [endDate, setEndDate] = useState<string>(initialEndDate ?? "");
  const [betOrigin, setBetOrigin] = useState<string>(initialBetOrigin ?? "");

  const [open, setOpen] = useState(false);

  // Mobile trigger via global event
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('open-dashboard-filters', onOpen as any);
    return () => window.removeEventListener('open-dashboard-filters', onOpen as any);
  }, []);

  const content = (
    <div className="flex flex-wrap items-end justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-900/30 p-3">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <div className="text-xs text-neutral-400">De</div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded border form-input px-2 py-1 text-sm"
          />
        </div>
        <div>
          <div className="text-xs text-neutral-400">Até</div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded border form-input px-2 py-1 text-sm"
          />
        </div>
        <div>
          <div className="text-xs text-neutral-400">Status</div>
          <select
            value={status}
            onChange={(e) => {
              const val = e.target.value as any;
              setStatus(val);
              const qs = new URLSearchParams();
              if (val !== 'all') qs.set('status', val);
              if (startDate) qs.set('startDate', startDate);
              if (endDate) qs.set('endDate', endDate);
              if (betOrigin) qs.set('bet_origin', betOrigin);
              const query = qs.toString();
              router.push(`/${query ? `?${query}` : ''}`);
            }}
            className="rounded border form-input px-2 py-1 text-sm"
          >
            <option value="all">Todos</option>
            <option value="false">Não entrei</option>
            <option value="green">Green</option>
            <option value="red">Red</option>
          </select>
        </div>
        <div>
          <div className="text-xs text-neutral-400">Bet Origin</div>
          <input
            type="text"
            value={betOrigin}
            onChange={(e) => setBetOrigin(e.target.value)}
            placeholder="Ex.: MR TIPS"
            className="rounded border form-input px-2 py-1 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 mt-5">
          <button
            onClick={() => {
              const qs = new URLSearchParams();
              if (status !== 'all') qs.set('status', status);
              if (startDate) qs.set('startDate', startDate);
              if (endDate) qs.set('endDate', endDate);
              if (betOrigin) qs.set('bet_origin', betOrigin);
              const query = qs.toString();
              router.push(`/${query ? `?${query}` : ''}`);
            }}
            className="rounded-md border border-neutral-700 bg-b365-green/20 px-3 py-1 text-sm hover:bg-b365-green/30"
          >
            Aplicar filtros
          </button>
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setStatus("all");
              setBetOrigin("");
              router.push(`/`);
            }}
            className="rounded-md border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-800/60"
          >
            Limpar filtros
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden sm:block">{content}</div>
      {open ? (
        <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/60 px-4 sm:hidden" onClick={() => setOpen(false)}>
          <div className="w-full max-w-xl rounded-lg border border-neutral-800 bg-background text-foreground p-4" onClick={(e) => e.stopPropagation()}>
            {content}
            <div className="mt-3 flex justify-end">
              <button onClick={() => setOpen(false)} className="rounded-md border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-800/60">Fechar</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

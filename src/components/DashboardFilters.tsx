"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardFilters({
  initialStatus = "all",
  initialStartDate,
  initialEndDate,
}: {
  initialStatus?: "all" | "green" | "red" | "null";
  initialStartDate?: string | undefined;
  initialEndDate?: string | undefined;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<typeof initialStatus>(initialStatus);
  const [startDate, setStartDate] = useState<string>(initialStartDate ?? "");
  const [endDate, setEndDate] = useState<string>(initialEndDate ?? "");

  return (
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
              const query = qs.toString();
              router.push(`/${query ? `?${query}` : ''}`);
            }}
            className="rounded border form-input px-2 py-1 text-sm"
          >
            <option value="all">Todos</option>
            <option value="null">Não entrei</option>
            <option value="green">Green</option>
            <option value="red">Red</option>
          </select>
        </div>
        <div className="flex items-center gap-2 mt-5">
          <button
            onClick={() => {
              const qs = new URLSearchParams();
              if (status !== 'all') qs.set('status', status);
              if (startDate) qs.set('startDate', startDate);
              if (endDate) qs.set('endDate', endDate);
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
}

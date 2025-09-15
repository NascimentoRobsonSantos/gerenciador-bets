"use client";

import { useEffect, useMemo, useState } from "react";
import { Entry } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Filter } from "lucide-react";
// gráficos de placar movidos para o Dashboard

function toAttemptLabel(idxZeroBased: number | null) {
  if (idxZeroBased == null || idxZeroBased < 0) return "-";
  const n = idxZeroBased + 1;
  return n === 1 ? "1ª" : n === 2 ? "2ª" : n === 3 ? "3ª" : n === 4 ? "4ª" : `${n}ª`;
}

function formatCreatedAt(value: string | null | undefined) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm} - ${hh}:${min}`;
}

export default function EntriesTableClient({
  initialEntries,
  page,
  limit,
  totalItems,
  initialStatus = "all",
  initialStartDate,
  initialEndDate,
  initialBetOrigin,
}: {
  initialEntries: Entry[];
  page: number;
  limit: number;
  totalItems: number;
  initialStatus?: "all" | "green" | "red" | "false" | "naoentrei_green" | "naoentrei_red";
  initialStartDate?: string | undefined;
  initialEndDate?: string | undefined;
  initialBetOrigin?: string | undefined;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Entry[]>(initialEntries);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [entradaInput, setEntradaInput] = useState<Record<number, string>>({});
  const [oddInput, setOddInput] = useState<Record<number, string>>({});
  const [startDate, setStartDate] = useState<string>(initialStartDate ?? "");
  const [endDate, setEndDate] = useState<string>(initialEndDate ?? "");
  const [status, setStatus] = useState<"all" | "green" | "red" | "false" | "naoentrei_green" | "naoentrei_red">(initialStatus as any);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRow, setModalRow] = useState<Entry | null>(null);
  const [modalTouchedGanhos, setModalTouchedGanhos] = useState(false);
  const [betOrigin, setBetOrigin] = useState<string>(initialBetOrigin ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expiredOpen, setExpiredOpen] = useState(false);
  const [totalsOpen, setTotalsOpen] = useState(false); // cards de totais recolhidos por padrão

  // Persistir preferência de expandir/recolher totais
  useEffect(() => {
    try {
      const v = localStorage.getItem('entries_totals_open');
      if (v === '1') setTotalsOpen(true);
    } catch {}
  }, []);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((totalItems ?? 0) / Math.max(1, limit))), [totalItems, limit]);

  // Sync rows when server data changes (e.g., after router.refresh)
  useEffect(() => {
    setRows(initialEntries);
    setEditingId(null);
    setEntradaInput({});
    setOddInput({});
  }, [initialEntries]);

  function startEdit(id: number) {
    setErrorMsg(null);
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    // Prepare modal copy
    setModalRow({ ...row });
    setModalTouchedGanhos(false);
    // valor_final é derivado e exibido como leitura
    setModalOpen(true);
  }

  function cancelEdit() {
    setModalOpen(false);
    setModalRow(null);
    
  }

  // Close modal on ESC key
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancelEdit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  // Open filters modal on global event (from page header button)
  useEffect(() => {
    const open = () => setFiltersOpen(true);
    window.addEventListener('open-entries-filters', open as any);
    return () => window.removeEventListener('open-entries-filters', open as any);
  }, []);

  function prevRowOrInitial(row: Entry) {
    const orig = initialEntries.find((e) => e.id === row.id);
    return orig ?? row;
  }

  function handleChange(id: number, field: keyof Entry, value: any) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        let updated: Entry = { ...r } as any;

        if (field === "valor_entrada") {
          // manter string no estado separado e converter aqui para número (ou null se vazio)
          setEntradaInput((prev) => ({ ...prev, [id]: String(value) }));
          const entradaNum = String(value).trim() === "" ? 0 : Number(value);
          updated.valor_entrada = String(value).trim() === "" ? null : entradaNum;
          const oddNum = Number(updated.odd ?? 0) || 0;
          // Regra: só recalcular por multiplicação se valor_ganhos não for positivo
          if (!((Number(updated.valor_ganhos ?? 0) || 0) > 0)) {
            updated.valor_ganhos = Math.round(entradaNum * oddNum * 100) / 100;
          }
        } else if (field === "odd") {
          setOddInput((prev) => ({ ...prev, [id]: String(value) }));
          const oddNum = String(value).trim() === "" ? 0 : Number(value);
          updated.odd = String(value).trim() === "" ? null : oddNum;
          const entradaNum = Number(updated.valor_entrada ?? 0) || 0;
          // Regra: só recalcular por multiplicação se valor_ganhos não for positivo
          if (!((Number(updated.valor_ganhos ?? 0) || 0) > 0)) {
            updated.valor_ganhos = Math.round(entradaNum * oddNum * 100) / 100;
          }
        } else {
          (updated as any)[field] = value;
        }
        return updated;
      })
    );
  }

  function updateModalField(field: keyof Entry, value: any) {
    if (!modalRow) return;
    let next = { ...modalRow } as any;
    if (field === 'valor_entrada') {
      const entradaNum = String(value).trim() === '' ? null : Number(value);
      next.valor_entrada = entradaNum;
      // Regra: calcular automaticamente valor_ganhos = odd * valor_entrada
      const oddNum = Number(next.odd ?? 0) || 0;
      const baseEntrada = Number(entradaNum ?? 0) || 0;
      next.valor_ganhos = Math.round(baseEntrada * oddNum * 100) / 100;
      // Atualiza valor_final (lucro): ganhos - perdido - entrada
      next.valor_final = Math.round((((Number(next.valor_ganhos ?? 0) || 0) - (Number(next.valor_perdido ?? 0) || 0) - (Number(next.valor_entrada ?? 0) || 0)) * 100)) / 100;
    } else if (field === 'odd') {
      const oddNum = String(value).trim() === '' ? null : Number(value);
      next.odd = oddNum;
      // Regra: calcular automaticamente valor_ganhos = odd * valor_entrada
      const entradaNum = Number(next.valor_entrada ?? 0) || 0;
      next.valor_ganhos = Math.round(entradaNum * (Number(oddNum || 0)) * 100) / 100;
      next.valor_final = Math.round((((Number(next.valor_ganhos ?? 0) || 0) - (Number(next.valor_perdido ?? 0) || 0) - (Number(next.valor_entrada ?? 0) || 0)) * 100)) / 100;
    } else if (field === 'valor_ganhos') {
      setModalTouchedGanhos(true);
      next.valor_ganhos = String(value).trim() === '' ? null : Number(value);
      next.valor_final = Math.round((((Number(next.valor_ganhos ?? 0) || 0) - (Number(next.valor_perdido ?? 0) || 0) - (Number(next.valor_entrada ?? 0) || 0)) * 100)) / 100;
    } else if (field === 'valor_perdido') {
      next.valor_perdido = String(value).trim() === '' ? null : Number(value);
      next.valor_final = Math.round((((Number(next.valor_ganhos ?? 0) || 0) - (Number(next.valor_perdido ?? 0) || 0) - (Number(next.valor_entrada ?? 0) || 0)) * 100)) / 100;
    } else {
      (next as any)[field] = value;
    }
    setModalRow(next);
  }

  // Valor final é derivado na UI, não editável

  // As filtragens são server-side: usar rows direto para totais e render
  const totals = useMemo(() => {
    const count = rows.length;
    const greens = rows.filter((r) => r.status === 'green').length;
    const reds = rows.filter((r) => r.status === 'red').length;
    // Não entrei: novo formato + backcompat
    let naoEntrouGreen = rows.filter((r) => r.status === 'naoentrei_green').length;
    let naoEntrouRed = rows.filter((r) => r.status === 'naoentrei_red').length;
    for (const r of rows) {
      if (r.status === 'green' || r.status === 'red' || r.status === 'naoentrei_green' || r.status === 'naoentrei_red') continue;
      const minutosArr = Array.isArray(r.minutos) ? r.minutos : r.minutos == null ? [] : [Number(r.minutos)];
      const hasAttemptGreen = r.minuto_green != null && minutosArr.some((m) => Number(m) === Number(r.minuto_green));
      if (hasAttemptGreen) naoEntrouGreen++; else naoEntrouRed++;
    }
    const totalEntrada = rows.reduce((acc, r) => acc + (Number(r.valor_entrada ?? 0) || 0), 0);
    const totalGanhos = rows.reduce((acc, r) => acc + (Number(r.valor_ganhos ?? 0) || 0), 0);
    const totalPerdido = rows.reduce((acc, r) => acc + (Number(r.valor_perdido ?? 0) || 0), 0);
    const totalFinal = rows.reduce((acc, r) => acc + (((Number(r.valor_ganhos ?? 0) || 0) - (Number(r.valor_perdido ?? 0) || 0) - (Number(r.valor_entrada ?? 0) || 0))), 0);
    const totalRed = rows
      .filter((r) => r.status === 'red')
      .reduce((acc, r) => acc + (((Number(r.valor_ganhos ?? 0) || 0) - (Number(r.valor_perdido ?? 0) || 0) - (Number(r.valor_entrada ?? 0) || 0))), 0);
    // Somatório de tentativas por etapa (1ª a 4ª)
    let t1 = 0, t2 = 0, t3 = 0, t4 = 0;
    for (const r of rows) {
      const minutosArr = Array.isArray(r.minutos) ? r.minutos : r.minutos == null ? [] : [Number(r.minutos)];
      const idx = r.minuto_green != null ? minutosArr.findIndex((m) => Number(m) === Number(r.minuto_green)) : -1;
      if (idx < 0) continue;
      const attempt = Math.min(Math.max(idx + 1, 1), 4);
      if (attempt === 1) t1++; else if (attempt === 2) t2++; else if (attempt === 3) t3++; else t4++;
    }
    return { count, totalEntrada, totalGanhos, totalPerdido, totalFinal, greens, reds, totalRed, t1, t2, t3, t4, naoEntrouGreen, naoEntrouRed };
  }, [rows]);


  async function saveRow(id: number) {
    setSavingId(id);
    setErrorMsg(null);
    const row = rows.find((r) => r.id === id);
    if (!row) return;

    // Ajusta payload: valor_final (lucro) = ganhos - perdido - entrada
    const entrada = Number(row.valor_entrada ?? 0) || 0;
    const ganhos = Number(row.valor_ganhos ?? 0) || 0;
    const perdido = Number(row.valor_perdido ?? 0) || 0;
    const valor_final = Math.round(((ganhos - perdido - entrada) + Number.EPSILON) * 100) / 100;
    const payload = { ...row, valor_final, updated_at: new Date().toISOString() };

    try {
      const res = await fetch("/api/entries/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 401) { setExpiredOpen(true); return; }
        const t = await res.text();
        throw new Error(t || "Falha ao salvar");
      }
      // clear editing state and inputs
      setEditingId(null);
      setEntradaInput((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
      setOddInput((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
      // refresh server data to update list and totals
      router.refresh();
    } catch (e: any) {
      setErrorMsg(e?.message || "Erro ao salvar");
    } finally {
      setSavingId(null);
    }
  }

  async function saveModal() {
    if (!modalRow) return;
    setSavingId(modalRow.id);
    setErrorMsg(null);
    // Ajusta payload: valor_final (lucro) = ganhos - perdido - entrada
    const entrada = Number(modalRow.valor_entrada ?? 0) || 0;
    const ganhos = Number(modalRow.valor_ganhos ?? 0) || 0;
    const perdido = Number(modalRow.valor_perdido ?? 0) || 0;
    const valor_final = Math.round(((ganhos - perdido - entrada) + Number.EPSILON) * 100) / 100;
    const payload = { ...modalRow, valor_final, updated_at: new Date().toISOString() };
    try {
      const res = await fetch("/api/entries/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 401) { setExpiredOpen(true); return; }
        const t = await res.text();
        throw new Error(t || "Falha ao salvar");
      }
      setModalOpen(false);
      setModalRow(null);
      router.refresh();
    } catch (e: any) {
      setErrorMsg(e?.message || "Erro ao salvar");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteModal() {
    if (!modalRow) return;
    setSavingId(modalRow.id);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/entries/update", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: modalRow.id }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Falha ao excluir");
      }
      setModalOpen(false);
      setModalRow(null);
      router.refresh();
    } catch (e: any) {
      setErrorMsg(e?.message || "Erro ao excluir");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {errorMsg ? <div className="text-sm text-red-400">{errorMsg}</div> : null}

      {/* Totais (colapsável) */}
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/30">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="text-sm text-neutral-400">Totais</div>
          <button
            onClick={() => setTotalsOpen((v) => { const next = !v; try { localStorage.setItem('entries_totals_open', next ? '1' : '0'); } catch {}; return next; })}
            className="rounded-md border border-neutral-700 px-2 py-0.5 text-xs hover:bg-neutral-800/60"
          >
            {totalsOpen ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
        {totalsOpen ? (
          <div className="px-3 pb-3">
            <div className="grid grid-cols-3 sm:grid-cols-12 gap-3 text-sm w-full">
              <div className="rounded border border-neutral-800 bg-neutral-900/40 px-3 py-2">
                <div className="text-xs text-neutral-400">Entradas (página/filtradas)</div>
                <div className="font-medium">{totals.count}</div>
              </div>
              <div className="rounded border border-neutral-800 bg-neutral-900/40 px-3 py-2">
                <div className="text-xs text-neutral-400">Entrei/Green</div>
                <div className="font-medium text-b365-green">{totals.greens}</div>
              </div>
              <div className="rounded border border-neutral-800 bg-neutral-900/40 px-3 py-2">
                <div className="text-xs text-neutral-400">Entrei/Red</div>
                <div className="font-medium text-red-500">{totals.reds}</div>
              </div>
              <div className="rounded border border-neutral-800 bg-neutral-900/40 px-3 py-2">
                <div className="text-xs text-neutral-400">Não entrei/Green</div>
                <div className="font-medium text-b365-green">{totals.naoEntrouGreen}</div>
              </div>
              <div className="rounded border border-neutral-800 bg-neutral-900/40 px-3 py-2">
                <div className="text-xs text-neutral-400">Não entrei/Red</div>
                <div className="font-medium text-red-500">{totals.naoEntrouRed}</div>
              </div>
              <div className="rounded border border-neutral-800 bg-neutral-900/40 px-3 py-2">
                <div className="text-xs text-neutral-400">1ª Tent.</div>
                <div className="font-medium">{totals.t1}</div>
              </div>
              <div className="rounded border border-neutral-800 bg-neutral-900/40 px-3 py-2">
                <div className="text-xs text-neutral-400">2ª Tent.</div>
                <div className="font-medium">{totals.t2}</div>
              </div>
              <div className="rounded border border-neutral-800 bg-neutral-900/40 px-3 py-2">
                <div className="text-xs text-neutral-400">3ª Tent.</div>
                <div className="font-medium">{totals.t3}</div>
              </div>
              <div className="rounded border border-neutral-800 bg-neutral-900/40 px-3 py-2">
                <div className="text-xs text-neutral-400">4ª Tent.</div>
                <div className="font-medium">{totals.t4}</div>
              </div>
              <div className="rounded border border-neutral-800 bg-neutral-900/40 px-3 py-2">
                <div className="text-xs text-neutral-400">Total Entrada</div>
                <div className="font-medium">{formatCurrency(totals.totalEntrada)}</div>
              </div>
              <div className="rounded border border-neutral-800 bg-neutral-900/40 px-3 py-2">
                <div className="text-xs text-neutral-400">Total Ganhos</div>
                <div className="font-medium">{formatCurrency(totals.totalGanhos)}</div>
              </div>
              <div className="rounded border border-neutral-800 bg-neutral-900/40 px-3 py-2">
                <div className="text-xs text-neutral-400">Total Perdido</div>
                <div className="font-medium text-red-400">{formatCurrency(totals.totalPerdido)}</div>
              </div>
              <div className="rounded border border-neutral-800 bg-neutral-900/40 px-3 py-2">
                <div className="text-xs text-neutral-400">Total Final</div>
                <div className={`font-medium ${totals.totalFinal > 0 ? 'text-b365-green' : totals.totalFinal < 0 ? 'text-red-600' : ''}`}>
                  {formatCurrency(totals.totalFinal)}
                </div>
              </div>
              <div className="rounded border border-neutral-800 bg-neutral-900/40 px-3 py-2">
                <div className="text-xs text-neutral-400">Total Red</div>
                <div className="font-medium text-red-500">{formatCurrency(totals.totalRed)}</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Gráficos de placar removidos daqui; agora no Dashboard */}

      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="min-w-full text-sm hidden md:table">
          <thead className="bg-neutral-900/60">
            <tr className="text-left">
              <th className="px-3 py-2">Criado</th>
              <th className="px-3 py-2">Grupo</th>
              <th className="px-3 py-2">Campeonato</th>
              <th className="px-3 py-2">Hora</th>
              <th className="px-3 py-2">Minutos</th>
              <th className="px-3 py-2">Tentativa</th>
              <th className="px-3 py-2">Odd</th>
              <th className="px-3 py-2">Placar</th>
              <th className="px-3 py-2">Valor Entrada</th>
              <th className="px-3 py-2">Valor Ganhos</th>
              <th className="px-3 py-2">Valor Perdido</th>
              <th className="px-3 py-2">Valor Final</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => {
              const isEditing = editingId === e.id;
              const minutosArr = Array.isArray(e.minutos) ? e.minutos : e.minutos == null ? [] : [Number(e.minutos)];
              const idx = e.minuto_green != null ? minutosArr.findIndex((m) => Number(m) === Number(e.minuto_green)) : -1;
              const attempt = toAttemptLabel(idx >= 0 ? idx : null);
              const oddNum = Number(e.odd ?? 0) || 0;
              const perdido = Number(e.valor_perdido ?? 0) || 0;
              const finalVal = Number(e.valor_final ?? 0) || 0;
              return (
                <tr key={e.id} className="border-t border-neutral-800/70 hover:bg-neutral-900/40">
                  <td className="px-3 py-2">{formatCreatedAt(e.created_at)}</td>
                  <td className="px-3 py-2">{e.bet_origin}</td>
                  <td className="px-3 py-2">{e.campeonato ?? "-"}</td>
                  <td className="px-3 py-2">{e.hora ?? "-"}</td>
                  <td className="px-3 py-2">{minutosArr.length ? minutosArr.join(", ") : "-"}</td>
                  <td className="px-3 py-2">{attempt}</td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        className="w-24 rounded border form-input px-2 py-1"
                        value={oddInput[e.id] ?? (e.odd ? String(e.odd) : "")}
                        placeholder="odd"
                        onChange={(ev) => handleChange(e.id, "odd", ev.target.value)}
                      />
                    ) : (
                      oddNum ? oddNum.toFixed(2) : e.odd ?? "-"
                    )}
                  </td>
                  <td className="px-3 py-2">{e.placar ?? "-"}</td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        className="w-28 rounded border form-input px-2 py-1"
                        value={entradaInput[e.id] ?? (e.valor_entrada != null ? String(e.valor_entrada) : "")}
                        placeholder="0,00"
                        onChange={(ev) => handleChange(e.id, "valor_entrada", ev.target.value)}
                      />
                    ) : (
                      formatCurrency(e.valor_entrada ?? 0)
                    )}
                  </td>
                  <td className={`px-3 py-2 font-medium ${e.status === 'green' || e.status === 'naoentrei_green' ? 'bg-b365-green/15' : (e.status === 'red' || e.status === 'naoentrei_red') ? 'bg-red-500/15' : ''}`}>
                    {isEditing ? (
                      <input
                        type="text"
                        disabled
                        className="w-28 cursor-not-allowed rounded border form-input px-2 py-1 text-neutral-400"
                        value={formatCurrency(Number(e.valor_ganhos ?? 0))}
                        readOnly
                      />
                    ) : (
                      <span className={`${(e.status === 'green' || e.status === 'naoentrei_green') ? 'text-b365-green font-semibold' : (e.status === 'red' || e.status === 'naoentrei_red') ? 'text-red-600 font-semibold' : ((e.valor_ganhos ?? 0) >= 0 ? 'text-b365-yellow' : 'text-red-400')}`}>{formatCurrency(e.valor_ganhos ?? 0)}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-medium text-red-400">{formatCurrency(perdido)}</td>
                  <td className={`px-3 py-2 font-medium ${finalVal > 0 ? 'bg-b365-green/15 text-b365-green font-semibold' : finalVal < 0 ? 'bg-red-500/15 text-red-600 font-semibold' : ''}`}>{formatCurrency(finalVal)}</td>
                  <td className="px-3 py-2">
            {(() => {
              const badge = (txt: string, tone: 'green'|'red'|'neutral') => (
                <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 ${tone==='green' ? 'bg-b365-green/15 text-b365-green' : tone==='red' ? 'bg-red-500/15 text-red-400' : 'bg-b365-yellow/15 text-b365-yellow'}`}>{txt}</span>
              );
              if (e.status === 'green') return badge('Entrei/Green', 'green');
              if (e.status === 'red') return badge('Entrei/Red', 'red');
              if (e.status === 'naoentrei_green') return badge('Não entrei/Green', 'green');
              if (e.status === 'naoentrei_red') return badge('Não entrei/Red', 'red');
              const minutosArr = Array.isArray(e.minutos) ? e.minutos : e.minutos == null ? [] : [Number(e.minutos)];
              const hasAttemptGreen = e.minuto_green != null && minutosArr.some((m) => Number(m) === Number(e.minuto_green));
              return hasAttemptGreen ? badge('Não entrei/Green', 'green') : badge('Não entrei', 'neutral');
            })()}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => startEdit(e.id)}
                      className="rounded-md border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-800/60"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Mobile card list */}
        <div className="md:hidden divide-y divide-neutral-800">
          {rows.map((e) => {
            const minutosArr = Array.isArray(e.minutos) ? e.minutos : e.minutos == null ? [] : [Number(e.minutos)];
            const idx = e.minuto_green != null ? minutosArr.findIndex((m) => Number(m) === Number(e.minuto_green)) : -1;
            const attempt = toAttemptLabel(idx >= 0 ? idx : null);
            const hasAttemptGreen = e.minuto_green != null && minutosArr.some((m) => Number(m) === Number(e.minuto_green));
            const oddNum = Number(e.odd ?? 0) || 0;
            const perdido = Number(e.valor_perdido ?? 0) || 0;
            const finalVal = (Number(e.valor_ganhos ?? 0) || 0) - perdido - (Number(e.valor_entrada ?? 0) || 0);
            const isGreen = (e.status === 'green' || e.status === 'naoentrei_green');
            const isRed = (e.status === 'red' || e.status === 'naoentrei_red');
            return (
              <div key={e.id} className="p-3 rounded-lg border border-neutral-800 bg-neutral-900/20">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium truncate">{e.bet_origin ?? '-'}</div>
                  <div>
                    {(() => {
                      const badge = (txt: string, tone: 'green'|'red'|'neutral') => (
                        <span className={`inline-flex items-center rounded px-2 py-0.5 ${tone==='green' ? 'bg-b365-green/15 text-b365-green' : tone==='red' ? 'bg-red-500/15 text-red-600' : 'bg-b365-yellow/15 text-b365-yellow'}`}>{txt}</span>
                      );
                      if (e.status === 'green') return badge('Entrei/Green', 'green');
                      if (e.status === 'red') return badge('Entrei/Red', 'red');
                      if (e.status === 'naoentrei_green') return badge('Não entrei/Green', 'green');
                      if (e.status === 'naoentrei_red') return badge('Não entrei/Red', 'red');
                      return hasAttemptGreen ? badge('Não entrei/Green', 'green') : badge('Não entrei', 'neutral');
                    })()}
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded border border-neutral-800 bg-neutral-900/40 p-2"><div className="text-xs text-neutral-400">Odd</div><div>{oddNum ? oddNum.toFixed(2) : e.odd ?? '-'}</div></div>
                  <div className="rounded border border-neutral-800 bg-neutral-900/40 p-2"><div className="text-xs text-neutral-400">Entrada</div><div>{formatCurrency(e.valor_entrada ?? 0)}</div></div>
                  <div className={`rounded border border-neutral-800 p-2 ${isGreen ? 'bg-b365-green/15' : isRed ? 'bg-red-500/15' : 'bg-neutral-900/40'}`}>
                    <div className="text-xs text-neutral-400">Ganhos</div>
                    <div className={`${isGreen ? 'text-b365-green font-semibold' : isRed ? 'text-red-600 font-semibold' : ''}`}>{formatCurrency(e.valor_ganhos ?? 0)}</div>
                  </div>
                  <div className="rounded border border-neutral-800 bg-neutral-900/40 p-2"><div className="text-xs text-neutral-400">Perdido</div><div className="text-red-400">{formatCurrency(perdido)}</div></div>
                  <div className={`rounded border border-neutral-800 p-2 col-span-2 ${finalVal > 0 ? 'bg-b365-green/15' : finalVal < 0 ? 'bg-red-500/15' : 'bg-neutral-900/40'}`}>
                    <div className="text-xs text-neutral-400">Final</div>
                    <div className={`${finalVal > 0 ? 'text-b365-green font-semibold' : finalVal < 0 ? 'text-red-600 font-semibold' : ''}`}>{formatCurrency(finalVal)}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
                  <div className="truncate">{formatCreatedAt(e.created_at)} - {`${e.campeonato ?? '-' } - ${e.hora ?? '-' }h - ${e.minuto_green ?? '-' } - ${attempt}`}</div>
                  <button onClick={() => startEdit(e.id)} className="ml-2 rounded-md border border-neutral-700 px-2 py-0.5 text-xs hover:bg-neutral-800/60">Editar</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <span>Página {page} de {totalPages}</span>
          <label className="flex items-center gap-2 text-neutral-400">
            <span>Itens por página</span>
            <select
              value={limit}
              onChange={(e) => {
                const newLimit = Number(e.target.value) || 50;
                const qs = new URLSearchParams();
                qs.set('page', '1');
                qs.set('limit', String(newLimit));
                if (status !== 'all') qs.set('status', status);
                if (startDate) qs.set('startDate', startDate);
                if (endDate) qs.set('endDate', endDate);
                if (betOrigin) qs.set('bet_origin', betOrigin);
                router.push(`/entradas/virtual?${qs.toString()}`);
              }}
              className="rounded border form-input px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={{ pathname: "/entradas/virtual", query: { page: Math.max(1, page - 1), limit, ...(status !== 'all' ? { status } : {}), ...(startDate ? { startDate } : {}), ...(endDate ? { endDate } : {}), ...(betOrigin ? { bet_origin: betOrigin } : {}) } }}
            className={`rounded-md border border-neutral-800 px-3 py-1 text-sm hover:bg-neutral-800/60 ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
          >
            Anterior
          </Link>
          <Link
            href={{ pathname: "/entradas/virtual", query: { page: Math.min(totalPages, page + 1), limit, ...(status !== 'all' ? { status } : {}), ...(startDate ? { startDate } : {}), ...(endDate ? { endDate } : {}), ...(betOrigin ? { bet_origin: betOrigin } : {}) } }}
            className={`rounded-md border border-neutral-800 px-3 py-1 text-sm hover:bg-neutral-800/60 ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
          >
            Próxima
          </Link>
        </div>
      </div>

      {modalOpen && modalRow ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={cancelEdit}>
          <div className="w-full max-w-lg rounded-lg border border-neutral-800 bg-neutral-950 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 text-lg font-semibold">Editar Entrada #{modalRow.id}</div>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
              <label className="text-sm">
                <div className="text-xs text-foreground">Odd</div>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  className="w-full rounded border form-input px-2 py-1"
                  value={modalRow.odd ?? ''}
                  onChange={(e) => updateModalField('odd', e.target.value)}
                />
              </label>
              <label className="text-sm">
                <div className="text-xs text-foreground">Placar</div>
                <input
                  type="text"
                  className="w-full rounded border form-input px-2 py-1"
                  value={modalRow.placar ?? ''}
                  onChange={(e) => updateModalField('placar' as any, e.target.value)}
                />
              </label>
              <label className="text-sm">
                <div className="text-xs text-foreground">Valor Entrada</div>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  className="w-full rounded border form-input px-2 py-1"
                  value={modalRow.valor_entrada ?? ''}
                  placeholder="0,00"
                  onChange={(e) => updateModalField('valor_entrada', e.target.value)}
                />
              </label>
              <label className="text-sm">
                <div className="text-xs text-foreground">Valor Perdido</div>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  className="w-full rounded border form-input px-2 py-1"
                  value={modalRow.valor_perdido ?? ''}
                  placeholder="0,00"
                  onChange={(e) => updateModalField('valor_perdido', e.target.value)}
                />
              </label>
              <label className="text-sm">
                <div className="text-xs text-foreground">Valor Ganhos</div>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  className="w-full rounded border form-input px-2 py-1"
                  value={modalRow.valor_ganhos ?? ''}
                  placeholder="0,00"
                  onChange={(e) => updateModalField('valor_ganhos', e.target.value)}
                />
              </label>
              <label className="text-sm">
                <div className="text-xs text-foreground">Status</div>
                <select
                  value={(modalRow.status as any) ?? 'false'}
                  onChange={(e) => updateModalField('status', e.target.value as any)}
                  className="w-full rounded border form-input px-2 py-1"
                >
                  <option value="false">Não entrei</option>
                  <option value="naoentrei_green">Não entrei/Green</option>
                  <option value="naoentrei_red">Não entrei/Red</option>
                  <option value="green">Entrei/Green</option>
                  <option value="red">Entrei/Red</option>
                </select>
              </label>
              <label className="text-sm">
                <div className="text-xs text-foreground">Minuto Green</div>
                {(() => {
                  const minutosArr = Array.isArray(modalRow.minutos) ? modalRow.minutos : modalRow.minutos == null ? [] : [Number(modalRow.minutos) as any];
                  const hasDefined = modalRow.minuto_green != null && modalRow.minuto_green !== '';
                  if (!hasDefined && minutosArr.length > 0) {
                    return (
                      <select
                        className="w-full rounded border form-input px-2 py-1"
                        value={''}
                        onChange={(e) => updateModalField('minuto_green', Number(e.target.value))}
                      >
                        <option value="" disabled>Selecionar minuto</option>
                        {minutosArr.map((m: any) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    );
                  }
                  return (
                    <input
                      type="number"
                      inputMode="numeric"
                      className="w-full rounded border form-input px-2 py-1"
                      value={modalRow.minuto_green ?? ''}
                      onChange={(e) => updateModalField('minuto_green', e.target.value)}
                    />
                  );
                })()}
              </label>
              <div className="text-sm">
                <div className="text-xs text-foreground">Tentativa Green</div>
                {(() => {
                  const minutosArr = Array.isArray(modalRow.minutos) ? modalRow.minutos : modalRow.minutos == null ? [] : [Number(modalRow.minutos) as any];
                  const idx = modalRow.minuto_green != null ? minutosArr.findIndex((m: any) => Number(m) === Number(modalRow.minuto_green)) : -1;
                  const label = idx >= 0 ? toAttemptLabel(idx) : '-';
                  return <div className="mt-1 font-medium">{label}</div>;
                })()}
              </div>
              <div className="text-sm">
                <div className="text-xs text-foreground">Valor Final (ganhos - perdido - entrada)</div>
                {(() => {
                  const vf = ((Number(modalRow.valor_ganhos ?? 0) || 0) - (Number(modalRow.valor_perdido ?? 0) || 0) - (Number(modalRow.valor_entrada ?? 0) || 0));
                  const cls = vf >= 0 ? 'text-b365-green' : 'text-red-400';
                  return <div className={`mt-1 font-medium ${cls}`}>{formatCurrency(vf)}</div>;
                })()}
              </div>
              <label className="text-sm">
                <div className="text-xs text-foreground">Bet Origem</div>
                <input
                  type="text"
                  className="w-full rounded border form-input px-2 py-1"
                  value={modalRow.bet_origin ?? ''}
                  onChange={(e) => updateModalField('bet_origin', e.target.value)}
                />
              </label>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={deleteModal}
                className="rounded-md border border-red-700/60 bg-red-600/10 px-3 py-1 text-sm text-red-300 hover:bg-red-600/20"
                disabled={savingId === modalRow.id}
              >
                {savingId === modalRow.id ? 'Excluindo...' : 'Excluir'}
              </button>
              <div className="flex items-center gap-2">
                <button onClick={cancelEdit} className="rounded-md border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-800/60">Cancelar</button>
                <button
                  onClick={saveModal}
                  className="rounded-md border border-neutral-700 bg-b365-green/20 px-3 py-1 text-sm hover:bg-b365-green/30"
                  disabled={savingId === modalRow.id}
                >
                  {savingId === modalRow.id ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {filtersOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4" onClick={() => setFiltersOpen(false)}>
          <div className="w-full max-w-xl rounded-lg border border-neutral-800 bg-neutral-950 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 text-lg font-semibold">Filtros</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm">
                <div className="text-xs text-foreground">De</div>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded border form-input px-2 py-1" />
              </label>
              <label className="text-sm">
                <div className="text-xs text-foreground">Até</div>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded border form-input px-2 py-1" />
              </label>
              <label className="text-sm sm:col-span-2">
                <div className="text-xs text-foreground">Bet Origin</div>
                <input type="text" value={betOrigin} onChange={(e) => setBetOrigin(e.target.value)} placeholder="Ex.: MR TIPS" className="w-full rounded border form-input px-2 py-1" />
              </label>
              <label className="text-sm sm:col-span-2">
                <div className="text-xs text-foreground">Status</div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded border form-input px-2 py-1"
                >
                  <option value="all">Todos</option>
                  <option value="false">Não entrei</option>
                  <option value="naoentrei_green">Não entrei/Green</option>
                  <option value="naoentrei_red">Não entrei/Red</option>
                  <option value="green">Entrei/Green</option>
                  <option value="red">Entrei/Red</option>
                </select>
              </label>
            </div>
            {/* Removidos os cards de totais dentro do modal para mobile */}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setStatus("all");
                  setBetOrigin("");
                  setFiltersOpen(false);
                  router.push(`/entradas/virtual?page=1&limit=${limit}`);
                }}
                className="rounded-md border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-800/60"
              >
                Limpar
              </button>
              <button
                onClick={() => {
                  const qs = new URLSearchParams();
                  qs.set('page', '1');
                  qs.set('limit', String(limit));
                  if (status !== 'all') qs.set('status', status);
                  if (startDate) qs.set('startDate', startDate);
                  if (endDate) qs.set('endDate', endDate);
                  if (betOrigin) qs.set('bet_origin', betOrigin);
                  setFiltersOpen(false);
                  const query = qs.toString();
                  router.push(`/entradas/virtual${query ? `?${query}` : ''}`);
                }}
                className="rounded-md border border-neutral-700 bg-b365-green/20 px-3 py-1 text-sm hover:bg-b365-green/30"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {expiredOpen ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-lg border border-neutral-800 bg-background text-foreground p-5 shadow-xl">
            <div className="text-lg font-semibold mb-2">Sessão expirada</div>
            <p className="text-sm text-neutral-400 mb-4">Sua sessão expirou. Faça login novamente para continuar.</p>
            <div className="flex justify-end">
              <button onClick={() => { window.location.href = '/login'; }} className="rounded-md border border-neutral-700 bg-b365-green/20 px-3 py-1.5 text-sm hover:bg-b365-green/30">OK</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

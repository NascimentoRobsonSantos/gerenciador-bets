"use client";

import { useEffect, useMemo, useState } from "react";
import { Entry } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";
import { useRouter } from "next/navigation";

function toAttemptLabel(idxZeroBased: number | null) {
  if (idxZeroBased == null || idxZeroBased < 0) return "-";
  const n = idxZeroBased + 1;
  return n === 1 ? "1ª" : n === 2 ? "2ª" : n === 3 ? "3ª" : n === 4 ? "4ª" : `${n}ª`;
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
  initialStatus?: "all" | "green" | "red" | "null";
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
  const [status, setStatus] = useState<"all" | "green" | "red" | "null">(initialStatus);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRow, setModalRow] = useState<Entry | null>(null);
  const [modalTouchedGanhos, setModalTouchedGanhos] = useState(false);
  const [modalLucroInput, setModalLucroInput] = useState<string>("");
  const [betOrigin, setBetOrigin] = useState<string>(initialBetOrigin ?? "");

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
    const lucroCalc = ((Number(row.valor_ganhos ?? 0) || 0) - (Number(row.valor_entrada ?? 0) || 0));
    setModalLucroInput(String(lucroCalc || ""));
    setModalOpen(true);
  }

  function cancelEdit() {
    setModalOpen(false);
    setModalRow(null);
    setModalLucroInput("");
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
      if (!modalTouchedGanhos && !((Number(next.valor_ganhos ?? 0) || 0) > 0)) {
        const oddNum = Number(next.odd ?? 0) || 0;
        const baseEntrada = Number(entradaNum ?? 0) || 0;
        next.valor_ganhos = Math.round(baseEntrada * oddNum * 100) / 100;
      }
      // Atualiza lucro mostrado = ganhos - entrada - perdido
      const lucroCalc = ((Number(next.valor_ganhos ?? 0) || 0) - (Number(next.valor_entrada ?? 0) || 0) - (Number(next.valor_perdido ?? 0) || 0));
      setModalLucroInput(String(Number.isFinite(lucroCalc) ? lucroCalc : ""));
    } else if (field === 'odd') {
      const oddNum = String(value).trim() === '' ? null : Number(value);
      next.odd = oddNum;
      if (!modalTouchedGanhos && !((Number(next.valor_ganhos ?? 0) || 0) > 0)) {
        const entradaNum = Number(next.valor_entrada ?? 0) || 0;
        next.valor_ganhos = Math.round(entradaNum * (Number(oddNum || 0)) * 100) / 100;
      }
      const lucroCalc = ((Number(next.valor_ganhos ?? 0) || 0) - (Number(next.valor_entrada ?? 0) || 0) - (Number(next.valor_perdido ?? 0) || 0));
      setModalLucroInput(String(Number.isFinite(lucroCalc) ? lucroCalc : ""));
    } else if (field === 'valor_ganhos') {
      setModalTouchedGanhos(true);
      next.valor_ganhos = String(value).trim() === '' ? null : Number(value);
      const lucroCalc = ((Number(next.valor_ganhos ?? 0) || 0) - (Number(next.valor_entrada ?? 0) || 0) - (Number(next.valor_perdido ?? 0) || 0));
      setModalLucroInput(String(Number.isFinite(lucroCalc) ? lucroCalc : ""));
    } else if (field === 'valor_perdido') {
      next.valor_perdido = String(value).trim() === '' ? null : Number(value);
      const lucroCalc = ((Number(next.valor_ganhos ?? 0) || 0) - (Number(next.valor_entrada ?? 0) || 0) - (Number(next.valor_perdido ?? 0) || 0));
      setModalLucroInput(String(Number.isFinite(lucroCalc) ? lucroCalc : ""));
    } else {
      (next as any)[field] = value;
    }
    setModalRow(next);
  }

  function updateModalLucro(value: string) {
    if (!modalRow) return;
    setModalLucroInput(value);
    // For status red, lucro deve ser negativo. Se positivo, inverto o sinal.
    let lucro = Number(value);
    if (!Number.isFinite(lucro)) return;
    if (modalRow.status === 'red' && lucro > 0) lucro = -lucro;
    const entrada = Number(modalRow.valor_entrada ?? 0) || 0;
    const perdido = Number(modalRow.valor_perdido ?? 0) || 0;
    // lucro = ganhos - entrada - perdido => ganhos = entrada + perdido + lucro
    const novosGanhos = Math.round((entrada + perdido + lucro) * 100) / 100;
    setModalTouchedGanhos(true);
    setModalRow({ ...modalRow, valor_ganhos: novosGanhos });
  }

  // As filtragens são server-side: usar rows direto para totais e render
  const totals = useMemo(() => {
    const count = rows.length;
    const totalEntrada = rows.reduce((acc, r) => acc + (Number(r.valor_entrada ?? 0) || 0), 0);
    const totalGanhos = rows.reduce((acc, r) => acc + (Number(r.valor_ganhos ?? 0) || 0), 0);
    const totalPerdido = rows.reduce((acc, r) => acc + (Number(r.valor_perdido ?? 0) || 0), 0);
    const totalFinal = rows.reduce((acc, r) => acc + (((Number(r.valor_ganhos ?? 0) || 0) - (Number(r.valor_perdido ?? 0) || 0))), 0);
    const totalLucro = rows.reduce((acc, r) => acc + ((Number(totalFinal) ? 0 : 0)), 0);
    // totalLucro = (ganhos - perdido) - entrada
    const totalLucroCalc = rows.reduce((acc, r) => acc + ((((Number(r.valor_ganhos ?? 0) || 0) - (Number(r.valor_perdido ?? 0) || 0)) - (Number(r.valor_entrada ?? 0) || 0))), 0);
    return { count, totalEntrada, totalGanhos, totalPerdido, totalFinal, totalLucro: totalLucroCalc };
  }, [rows]);

  async function saveRow(id: number) {
    setSavingId(id);
    setErrorMsg(null);
    const row = rows.find((r) => r.id === id);
    if (!row) return;

    // Ajusta payload: valor_ganhos deve ser igual ao valor_lucro
    const entrada = Number(row.valor_entrada ?? 0) || 0;
    const ganhos = Number(row.valor_ganhos ?? 0) || 0;
    const perdido = Number(row.valor_perdido ?? 0) || 0;
    const valor_final = Math.round(((ganhos - perdido) + Number.EPSILON) * 100) / 100;
    const payload = { ...row, valor_final, updated_at: new Date().toISOString() };

    try {
      const res = await fetch("/api/entries/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
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
    // Ajusta payload: valor_ganhos deve ser igual ao valor_lucro
    const entrada = Number(modalRow.valor_entrada ?? 0) || 0;
    const ganhos = Number(modalRow.valor_ganhos ?? 0) || 0;
    const perdido = Number(modalRow.valor_perdido ?? 0) || 0;
    const valor_final = Math.round(((ganhos - perdido) + Number.EPSILON) * 100) / 100;
    const payload = { ...modalRow, valor_final, updated_at: new Date().toISOString() };
    try {
      const res = await fetch("/api/entries/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
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

      {/* Filters + Totals */}
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
            <div className="text-xs text-neutral-400">Bet Origin</div>
            <input
              type="text"
              value={betOrigin}
              onChange={(e) => setBetOrigin(e.target.value)}
              placeholder="Ex.: MR TIPS"
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
                qs.set('page', '1');
                qs.set('limit', String(limit));
                if (val !== 'all') qs.set('status', val);
                if (startDate) qs.set('startDate', startDate);
                if (endDate) qs.set('endDate', endDate);
                if (betOrigin) qs.set('bet_origin', betOrigin);
                const query = qs.toString();
                router.push(`/entradas/virtual${query ? `?${query}` : ''}`);
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
                qs.set('page', '1');
                qs.set('limit', String(limit));
                if (status !== 'all') qs.set('status', status);
                if (startDate) qs.set('startDate', startDate);
                if (endDate) qs.set('endDate', endDate);
                if (betOrigin) qs.set('bet_origin', betOrigin);
                const query = qs.toString();
                router.push(`/entradas/virtual${query ? `?${query}` : ''}`);
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
                router.push(`/entradas/virtual?page=1&limit=${limit}`);
              }}
              className="rounded-md border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-800/60"
            >
              Limpar filtros
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 text-sm">
          <div className="rounded border border-neutral-800 bg-neutral-900/40 px-3 py-2">
            <div className="text-xs text-neutral-400">Entradas (página/filtradas)</div>
            <div className="font-medium">{totals.count}</div>
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
            <div className="font-medium">{formatCurrency(totals.totalFinal)}</div>
          </div>
          <div className="rounded border border-neutral-800 bg-neutral-900/40 px-3 py-2">
            <div className="text-xs text-neutral-400">Total Lucro</div>
            <div className="font-medium">{formatCurrency(totals.totalLucro)}</div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-900/60">
            <tr className="text-left">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Grupo</th>
              <th className="px-3 py-2">Campeonato</th>
              <th className="px-3 py-2">Hora</th>
              <th className="px-3 py-2">Minutos</th>
              <th className="px-3 py-2">Tentativa</th>
              <th className="px-3 py-2">Tipo</th>
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
              const finalVal = (Number(e.valor_ganhos ?? 0) || 0) - perdido;
              const lucro = finalVal - (Number(e.valor_entrada ?? 0) || 0);
              return (
                <tr key={e.id} className="border-t border-neutral-800/70 hover:bg-neutral-900/40">
                  <td className="px-3 py-2">{e.id}</td>
                  <td className="px-3 py-2">{e.bet_origin}</td>
                  <td className="px-3 py-2">{e.campeonato ?? "-"}</td>
                  <td className="px-3 py-2">{e.hora ?? "-"}</td>
                  <td className="px-3 py-2">{minutosArr.length ? minutosArr.join(", ") : "-"}</td>
                  <td className="px-3 py-2">{attempt}</td>
                  <td className="px-3 py-2">{e.tipo_entrada ?? "-"}</td>
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
                  <td className={`px-3 py-2 font-medium ${e.status === 'green' ? 'bg-b365-green/15' : e.status === 'red' ? 'bg-red-500/15' : ''}`}>
                    {isEditing ? (
                      <input
                        type="text"
                        disabled
                        className="w-28 cursor-not-allowed rounded border form-input px-2 py-1 text-neutral-400"
                        value={formatCurrency(Number(e.valor_ganhos ?? 0))}
                        readOnly
                      />
                    ) : (
                      <span className={`${e.status === 'green' ? 'text-b365-green font-semibold' : e.status === 'red' ? 'text-red-600 font-semibold' : ((e.valor_ganhos ?? 0) >= 0 ? 'text-b365-yellow' : 'text-red-400')}`}>{formatCurrency(e.valor_ganhos ?? 0)}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-medium text-red-400">{formatCurrency(perdido)}</td>
                  <td className={`px-3 py-2 font-medium ${e.status === 'green' ? 'bg-b365-green/15 text-b365-green font-semibold' : e.status === 'red' ? 'bg-red-500/15 text-red-600 font-semibold' : (finalVal >= 0 ? 'text-b365-yellow' : 'text-red-400')}`}>{formatCurrency(finalVal)}</td>
                  <td className="px-3 py-2">
                    {(() => {
                      if (e.status === 'green') {
                        return <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 bg-b365-green/15 text-b365-green">Green</span>;
                      }
                      if (e.status === 'red') {
                        return <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 bg-red-500/15 text-red-400">Red</span>;
                      }
                      // status null => Não entrei/Green ou Não entrei/Red
                      const minutosArr = Array.isArray(e.minutos) ? e.minutos : e.minutos == null ? [] : [Number(e.minutos)];
                      const hasAttemptGreen = e.minuto_green != null && minutosArr.some((m) => Number(m) === Number(e.minuto_green));
                      if (hasAttemptGreen) {
                        return <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 bg-b365-green/15 text-b365-green">Não entrei/Green</span>;
                      }
                      return <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 bg-red-500/15 text-red-400">Não entrei/Red</span>;
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
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <span>Página {page} de {totalPages}</span>
          <label className="flex items-center gap-2 text-neutral-400">
            <span>Itens por página</span>
            <select
              value={limit}
              onChange={(e) => {
                const newLimit = Number(e.target.value) || 20;
                // Ao mudar o limite, volta para a primeira página
                router.push(`/entradas/virtual?page=1&limit=${newLimit}`);
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
            href={{ pathname: "/entradas/virtual", query: { page: Math.max(1, page - 1), limit } }}
            className={`rounded-md border border-neutral-800 px-3 py-1 text-sm hover:bg-neutral-800/60 ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
          >
            Anterior
          </Link>
          <Link
            href={{ pathname: "/entradas/virtual", query: { page: Math.min(totalPages, page + 1), limit } }}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm">
                <div className="text-xs text-foreground">Odd</div>
                <input
                  type="number"
                  step="0.01"
                  className="w-full rounded border form-input px-2 py-1"
                  value={modalRow.odd ?? ''}
                  onChange={(e) => updateModalField('odd', e.target.value)}
                />
              </label>
              <label className="text-sm">
                <div className="text-xs text-foreground">Valor Entrada</div>
                <input
                  type="number"
                  step="0.01"
                  className="w-full rounded border form-input px-2 py-1"
                  value={modalRow.valor_entrada ?? ''}
                  onChange={(e) => updateModalField('valor_entrada', e.target.value)}
                />
              </label>
              <label className="text-sm">
                <div className="text-xs text-foreground">Valor Ganhos</div>
                <input
                  type="number"
                  step="0.01"
                  className="w-full rounded border form-input px-2 py-1"
                  value={modalRow.valor_ganhos ?? ''}
                  onChange={(e) => updateModalField('valor_ganhos', e.target.value)}
                />
              </label>
              <label className="text-sm">
                <div className="text-xs text-foreground">Bet Origin</div>
                <input
                  type="text"
                  className="w-full rounded border form-input px-2 py-1"
                  value={modalRow.bet_origin ?? ''}
                  onChange={(e) => updateModalField('bet_origin', e.target.value)}
                />
              </label>
              <label className="text-sm">
                <div className="text-xs text-foreground">Status</div>
                <select
                  value={modalRow.status ?? 'null'}
                  onChange={(e) => updateModalField('status', e.target.value as any)}
                  className="w-full rounded border form-input px-2 py-1"
                >
                  <option value="null">Não entrei</option>
                  <option value="green">Green</option>
                  <option value="red">Red</option>
                </select>
              </label>
              {modalRow.status === 'red' ? (
                <label className="text-sm">
                  <div className="text-xs text-foreground">Valor Lucro (prejuízo)</div>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full rounded border form-input px-2 py-1 text-red-300"
                    value={modalLucroInput}
                    onChange={(e) => updateModalLucro(e.target.value)}
                  />
                  <div className="mt-1 text-xs text-foreground/70">Use número negativo para prejuízo (ex.: -10). Se digitar positivo, será convertido para negativo.</div>
                </label>
              ) : (
                <div className="text-sm">
                  <div className="text-xs text-foreground">Valor Lucro</div>
                  {(() => {
                    const lucro = ((Number(modalRow.valor_ganhos ?? 0) || 0) - (Number(modalRow.valor_entrada ?? 0) || 0) - (Number(modalRow.valor_perdido ?? 0) || 0));
                    const cls = lucro >= 0 ? 'text-b365-green' : 'text-red-400';
                    return <div className={`mt-1 font-medium ${cls}`}>{formatCurrency(lucro)}</div>;
                  })()}
                </div>
              )}
              <label className="text-sm">
                <div className="text-xs text-foreground">Valor Perdido</div>
                <input
                  type="number"
                  step="0.01"
                  className="w-full rounded border form-input px-2 py-1"
                  value={modalRow.valor_perdido ?? ''}
                  onChange={(e) => updateModalField('valor_perdido', e.target.value)}
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
    </div>
  );
}

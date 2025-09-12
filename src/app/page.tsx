import { getEntries } from "@/lib/entries";
import SummaryCard from "@/components/SummaryCard";
import ChartDailyGains from "@/components/ChartDailyGains";
import ChartPie from "@/components/ChartPie";
import DashboardFilters from "@/components/DashboardFilters";
import ChartBetOriginAttempts from "@/components/ChartBetOriginAttempts";
import DashboardFiltersButton from "@/components/DashboardFiltersButton";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ [k: string]: string | string[] | undefined }> }) {
  const sp = await searchParams;
  const status = (Array.isArray(sp.status) ? sp.status[0] : sp.status) as 'green'|'red'|'false'|undefined;
  const today = new Date();
  const todayStr = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())).toISOString().slice(0, 10);
  const startDate = ((Array.isArray(sp.startDate) ? sp.startDate[0] : sp.startDate) as string | undefined) || todayStr;
  const endDate = ((Array.isArray(sp.endDate) ? sp.endDate[0] : sp.endDate) as string | undefined) || todayStr;
  const bet_origin = (Array.isArray(sp.bet_origin) ? sp.bet_origin[0] : sp.bet_origin) as string | undefined;
  const { entries, error } = await getEntries({ page: 1, limit: 500, status: (status ?? 'all') as any, startDate, endDate, bet_origin });

  const total = entries.length;
  const greens = entries.filter((e) => e.status === 'green').length;
  const reds = entries.filter((e) => e.status === 'red').length;
  const totalFinal = entries.reduce((acc, e) => acc + (((Number(e.valor_ganhos ?? 0) || 0) - (Number((e as any).valor_perdido ?? 0) || 0))), 0);
  const lucroTotal = entries.reduce((acc, e) => acc + (((Number(e.valor_ganhos ?? 0) || 0) - (Number((e as any).valor_perdido ?? 0) || 0) - (Number(e.valor_entrada ?? 0) || 0))), 0);
  const totalPerdido = entries.reduce((acc, e) => acc + (Number((e as any).valor_perdido ?? 0) || 0), 0);
  const totalEntrada = entries.reduce((acc, e) => acc + (Number(e.valor_entrada ?? 0) || 0), 0);
  const totalGanhos = entries.reduce((acc, e) => acc + (Number(e.valor_ganhos ?? 0) || 0), 0);

  // Trata "não entrei" de forma robusta (null ou string "null")
  const hasAttemptGreen = (e: any) => {
    const arr = Array.isArray(e.minutos) ? e.minutos : e.minutos == null ? [] : [Number(e.minutos)];
    return e.minuto_green != null && arr.some((m: any) => Number(m) === Number(e.minuto_green));
  };
  const isNaoEntrou = (e: any) => (e.status == null || e.status === 'null' || e.status == false);
  const naoEntrou = entries.filter((e) => isNaoEntrou(e));
  const naoEntrouGreen = naoEntrou.filter((e) => hasAttemptGreen(e)).length;
  const naoEntrouRed = naoEntrou.filter((e) => !hasAttemptGreen(e)).length;

  // ganhos por dia
  const porDiaMap = new Map<string, number>();
  for (const e of entries) {
    const dt = e.created_at ? new Date(e.created_at) : null;
    if (!dt) continue;
    const key = dt.toISOString().slice(0, 10);
    const lucro = ((Number(e.valor_ganhos ?? 0) || 0) - (Number(e.valor_entrada ?? 0) || 0)) - (Number((e as any).valor_perdido ?? 0) || 0);
    porDiaMap.set(key, (porDiaMap.get(key) ?? 0) + lucro);
  }
  const porDia = Array.from(porDiaMap.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const pieData = [
    { name: 'Entrou/Green', value: greens },
    { name: 'Entrou/Red', value: reds },
    { name: 'Não entrou/Green', value: naoEntrouGreen },
    { name: 'Não entrou/Red', value: naoEntrouRed },
  ];

  // Bet origin x attempts x result
  type Row = { origin: string; g1: number; r1: number; g2: number; r2: number; g3: number; r3: number; g4: number; r4: number; total: number };
  const map = new Map<string, Row>();
  // Totais de tentativas (independente da origem) — baseado em minuto_green
  let t1 = 0, t2 = 0, t3 = 0, t4 = 0;
  for (const e of entries) {
    const origin = e.bet_origin || 'Sem origem';
    const arr = Array.isArray((e as any).minutos) ? (e as any).minutos as number[] : (e as any).minutos == null ? [] : [Number((e as any).minutos)];
    const idx = e.minuto_green != null ? arr.findIndex((m) => Number(m) === Number(e.minuto_green)) : -1; // 0..3
    if (idx < 0) continue; // sem tentativa definida
    const attempt = Math.min(Math.max(idx + 1, 1), 4);
    // Alinha com os cards principais: conta Red apenas quando status === 'red'
    // Todas as demais situações (green ou não entrou) contam como Green no gráfico
    const isGreen = e.status !== 'red';
    const key = origin;
    if (!map.has(key)) map.set(key, { origin, g1:0,r1:0,g2:0,r2:0,g3:0,r3:0,g4:0,r4:0, total:0 });
    const row = map.get(key)!;
    const field = `${attempt}${isGreen ? 'g' : 'r'}` as any; // not used directly
    if (attempt===1) (isGreen ? row.g1++ : row.r1++);
    else if (attempt===2) (isGreen ? row.g2++ : row.r2++);
    else if (attempt===3) (isGreen ? row.g3++ : row.r3++);
    else (isGreen ? row.g4++ : row.r4++);
    row.total++;
    // Totais de tentativa (somamos quando há minuto_green definido)
    if (attempt===1) t1++; else if (attempt===2) t2++; else if (attempt===3) t3++; else t4++;
  }
  const attemptsData = Array.from(map.values())
    .sort((a,b)=>b.total-a.total)
    .slice(0,12);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl md:text-3xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-3 text-sm text-neutral-400">
          {error ? <span className="text-red-400">{error}</span> : null}
          <DashboardFiltersButton />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard title="Não entrei/Green" value={naoEntrouGreen} accent="green" />
        <SummaryCard title="Não entrei/Red" value={naoEntrouRed} accent="red" />
      </div>

      {/* Filters */}
      <DashboardFilters initialStatus={(status ?? 'all') as any} initialStartDate={startDate} initialEndDate={endDate} initialBetOrigin={bet_origin} />

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard title="Entradas" value={total} />
        <SummaryCard title="Greens" value={greens} accent="green" />
        <SummaryCard title="Reds" value={reds} accent="red" />
        <SummaryCard title="Lucro Líquido" value={lucroTotal} isCurrency profitMode />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard title="1ª Tentativa" value={t1} />
        <SummaryCard title="2ª Tentativa" value={t2} />
        <SummaryCard title="3ª Tentativa" value={t3} />
        <SummaryCard title="4ª Tentativa" value={t4} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard title="Total Entrada" value={totalEntrada} isCurrency />
        <SummaryCard title="Total Ganhos" value={totalGanhos} isCurrency />
        <SummaryCard title="Total Perdido" value={totalPerdido} isCurrency />
        <SummaryCard title="Total Final" value={totalFinal} isCurrency profitMode />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
          <h2 className="mb-3 font-medium">Distribuição (pizza)</h2>
          <ChartPie data={pieData} />
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
          <h2 className="mb-3 font-medium">Ganhos por dia</h2>
          <ChartDailyGains data={porDia} />
        </div>
      </div>

      <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
        <h2 className="mb-3 font-medium">Tentativas por origem (Green/Red)</h2>
        <ChartBetOriginAttempts data={attemptsData as any} />
      </div>

    </div>
  );
}
export const dynamic = 'force-dynamic';
export const revalidate = 0;

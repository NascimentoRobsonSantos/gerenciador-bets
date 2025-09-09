import { getEntries } from "@/lib/entries";
import SummaryCard from "@/components/SummaryCard";
import ChartDailyGains from "@/components/ChartDailyGains";
import ChartPie from "@/components/ChartPie";
import DashboardFilters from "@/components/DashboardFilters";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ [k: string]: string | string[] | undefined }> }) {
  const sp = await searchParams;
  const status = (Array.isArray(sp.status) ? sp.status[0] : sp.status) as 'green'|'red'|'null'|undefined;
  const startDate = (Array.isArray(sp.startDate) ? sp.startDate[0] : sp.startDate) as string | undefined;
  const endDate = (Array.isArray(sp.endDate) ? sp.endDate[0] : sp.endDate) as string | undefined;
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

  const hasAttemptGreen = (e: any) => {
    const arr = Array.isArray(e.minutos) ? e.minutos : e.minutos == null ? [] : [Number(e.minutos)];
    return e.minuto_green != null && arr.some((m: any) => Number(m) === Number(e.minuto_green));
  };
  const naoEntrou = entries.filter((e) => e.status == null);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold">Dashboard</h1>
        {error ? (
          <span className="text-sm text-red-400">{error}</span>
        ) : null}
      </div>

      {/* Filters */}
      <DashboardFilters initialStatus={(status ?? 'all') as any} initialStartDate={startDate} initialEndDate={endDate} initialBetOrigin={bet_origin} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Entradas" value={total} />
        <SummaryCard title="Greens" value={greens} accent="green" />
        <SummaryCard title="Reds" value={reds} accent="red" />
        <SummaryCard title="Lucro do Período" value={lucroTotal} isCurrency accent="brand" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <SummaryCard title="Total Entrada" value={totalEntrada} isCurrency />
        <SummaryCard title="Total Ganhos" value={totalGanhos} isCurrency />
        <SummaryCard title="Total Perdido" value={totalPerdido} isCurrency />
        <SummaryCard title="Total Final" value={totalFinal} isCurrency />
        <SummaryCard title="Não Entrou" value={naoEntrou.length} />
        <SummaryCard title="Não Entrou/Green" value={naoEntrouGreen} />
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

    </div>
  );
}
export const dynamic = 'force-dynamic';
export const revalidate = 0;

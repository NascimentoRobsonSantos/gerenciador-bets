import { getEntries } from "@/lib/entries";
import EntriesTableClient from "@/components/EntriesTableClient";
import EntriesFiltersButton from "@/components/EntriesFiltersButton";

export default async function EntradasVirtualPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1) || 1;
  const limit = Number(sp.limit ?? 50) || 50;
  const rawStatus = (Array.isArray(sp.status) ? sp.status[0] : sp.status) as
    | 'green'
    | 'red'
    | 'null'
    | undefined;
  const status = rawStatus ?? 'all';
  const startDate = (Array.isArray(sp.startDate) ? sp.startDate[0] : sp.startDate) as string | undefined;
  const endDate = (Array.isArray(sp.endDate) ? sp.endDate[0] : sp.endDate) as string | undefined;
  const bet_origin = (Array.isArray(sp.bet_origin) ? sp.bet_origin[0] : sp.bet_origin) as string | undefined;
  const { entries, totalItems, error } = await getEntries({ type: "virtual", page, limit, status: status as any, startDate, endDate, bet_origin });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl md:text-3xl font-semibold">Entradas · Virtual</h1>
        <div className="flex items-center gap-3 text-sm text-neutral-400">
          {totalItems ?? 0} itens {error ? <span className="text-red-400">· {error}</span> : null}
          <EntriesFiltersButton />
        </div>
      </div>
      <EntriesTableClient
        initialEntries={entries}
        page={page}
        limit={limit}
        totalItems={totalItems ?? 0}
        initialStatus={status as any}
        initialStartDate={startDate}
        initialEndDate={endDate}
        initialBetOrigin={bet_origin}
      />
    </div>
  );
}
export const dynamic = 'force-dynamic';
export const revalidate = 0;

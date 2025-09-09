import { Entry } from "./types";

type Options = {
  type?: string;
  page?: number;
  limit?: number;
  status?: 'green' | 'red' | 'null' | 'all';
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  bet_origin?: string;
};

type ApiEnvelope = { totalItems: number; data: Entry[] };

export async function getEntries(opts: Options = {}): Promise<{
  entries: Entry[];
  totalItems: number;
  page: number;
  limit: number;
  error?: string;
}> {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.max(1, Math.min(100, opts.limit ?? 10));

  const params = new URLSearchParams();
  if (opts.type) params.set("type", opts.type);
  if (opts.status && opts.status !== 'all') params.set("status", String(opts.status));
  if (opts.startDate) params.set("startDate", opts.startDate);
  if (opts.endDate) params.set("endDate", opts.endDate);
  if (opts.bet_origin) params.set("bet_origin", opts.bet_origin);
  params.set("page", String(page));
  params.set("limit", String(limit));

  const url = `https://webhook.storeprodigital.site/webhook/entries?${params.toString()}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return { entries: [], totalItems: 0, page, limit, error: `Falha ao buscar entradas (${res.status})` };
    }
    const raw = await res.json();

    // Aceita diferentes formatos: [ { totalItems, data } ] ou { totalItems, data } ou apenas { data }
    let totalItems = 0;
    let entries: Entry[] = [];

    if (Array.isArray(raw)) {
      const first = raw[0] as ApiEnvelope | undefined;
      totalItems = first?.totalItems ?? 0;
      entries = first?.data ?? [];
    } else if (raw && typeof raw === "object") {
      totalItems = (raw as any).totalItems ?? 0;
      entries = (raw as any).data ?? [];
    }

    return { entries, totalItems, page, limit };
  } catch (e) {
    return { entries: [], totalItems: 0, page, limit, error: "Não foi possível conectar ao endpoint de entradas." };
  }
}

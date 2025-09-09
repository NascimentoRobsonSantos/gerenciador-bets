import { formatCurrency } from "@/lib/format";

export default function SummaryCard({
  title,
  value,
  isCurrency = false,
  accent,
}: {
  title: string;
  value: number;
  isCurrency?: boolean;
  accent?: "green" | "red" | "brand";
}) {
  const color =
    accent === "green"
      ? "text-b365-green"
      : accent === "red"
      ? "text-red-400"
      : accent === "brand"
      ? "text-b365-yellow"
      : "text-neutral-100";

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="text-sm text-neutral-400">{title}</div>
      <div className={`mt-1 text-2xl font-semibold ${color}`}>
        {isCurrency ? formatCurrency(value) : value}
      </div>
    </div>
  );
}


import { formatCurrency } from "@/lib/format";

export default function SummaryCard({
  title,
  value,
  isCurrency = false,
  accent,
  profitMode = false,
}: {
  title: string;
  value: number;
  isCurrency?: boolean;
  accent?: "green" | "red" | "brand";
  profitMode?: boolean; // se true, usa verde para positivo e vermelho para negativo
}) {
  let color = "text-foreground";
  if (profitMode) {
    color = value > 0 ? "text-b365-green" : value < 0 ? "text-red-400" : "text-foreground";
  } else if (accent === "green") color = "text-b365-green";
  else if (accent === "red") color = "text-red-400";
  else if (accent === "brand") color = "text-b365-yellow";

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3 sm:p-4 text-center sm:text-left">
      <div className="text-xs sm:text-sm text-neutral-400">{title}</div>
      <div className={`mt-1 sm:mt-1 text-lg sm:text-2xl font-semibold ${color}`}>
        {isCurrency ? formatCurrency(value) : value}
      </div>
    </div>
  );
}

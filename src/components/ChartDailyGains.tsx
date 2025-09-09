"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/format";

export default function ChartDailyGains({
  data,
}: {
  data: { date: string; value: number }[];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="date" stroke="#888" tick={{ fill: '#aaa', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#333' }} />
          <YAxis stroke="#888" tick={{ fill: '#aaa', fontSize: 12 }} tickFormatter={(v) => formatCurrency(v)} tickLine={false} axisLine={{ stroke: '#333' }} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{ background: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: 8, color: "#f5f5f5" }}
            formatter={(value: any) => [formatCurrency(value as number), "Ganhos"]}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          <Bar dataKey="value" fill="var(--b365-yellow)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


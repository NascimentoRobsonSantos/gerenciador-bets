"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

// data: [{ date: '2024-09-01', '0-0': 2, '1-0': 1, ... }]
// series: ['0-0', '1-0', ...] -> somente os placares selecionados (ex.: top 3)
export default function ChartScoreByDate({
  data,
  series,
}: {
  data: Array<Record<string, any> & { date: string }>;
  series: string[];
}) {
  const COLORS = ["#16a34a", "#22c55e", "#84cc16", "#f59e0b", "#0ea5e9", "#8b5cf6", "#ef4444", "#f97316"]; // palette simples

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="date" tick={{ fill: '#aaa', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#333' }} />
          <YAxis tick={{ fill: '#aaa', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#333' }} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{ background: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: 8, color: "#f5f5f5" }}
          />
          <Legend />
          {series.map((s, idx) => (
            <Bar key={s} dataKey={s} stackId="a" name={s} fill={COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


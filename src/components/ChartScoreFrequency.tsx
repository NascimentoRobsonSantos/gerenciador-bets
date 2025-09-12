"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export type ScoreFreq = { placar: string; count: number };

export default function ChartScoreFrequency({ data }: { data: ScoreFreq[] }) {
  // Espera receber já ordenado do menor para maior
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
          <XAxis type="number" tick={{ fill: '#aaa', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#333' }} />
          <YAxis
            type="category"
            dataKey="placar"
            width={80}
            tick={{ fill: '#aaa', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#333' }}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{ background: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: 8, color: "#f5f5f5" }}
            formatter={(v: any) => [v as number, 'Quantidade']}
          />
          <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 4, 4]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


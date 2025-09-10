"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

type Row = {
  origin: string;
  g1: number; r1: number;
  g2: number; r2: number;
  g3: number; r3: number;
  g4: number; r4: number;
  total?: number;
};

const COLORS: Record<keyof Omit<Row, 'origin' | 'total'>, string> = {
  g1: '#16a34a', r1: '#ef4444',
  g2: '#22c55e', r2: '#f97316',
  g3: '#10b981', r3: '#f43f5e',
  g4: '#84cc16', r4: '#dc2626',
};

export default function ChartBetOriginAttempts({ data }: { data: Row[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="origin" tick={{ fill: '#aaa', fontSize: 12 }} tickLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
          <YAxis tick={{ fill: '#aaa', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#333' }} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{ background: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: 8, color: "#f5f5f5" }}
          />
          <Legend />
          <Bar dataKey="g1" stackId="a" name="1ª Green" fill={COLORS.g1} />
          <Bar dataKey="r1" stackId="a" name="1ª Red" fill={COLORS.r1} />
          <Bar dataKey="g2" stackId="a" name="2ª Green" fill={COLORS.g2} />
          <Bar dataKey="r2" stackId="a" name="2ª Red" fill={COLORS.r2} />
          <Bar dataKey="g3" stackId="a" name="3ª Green" fill={COLORS.g3} />
          <Bar dataKey="r3" stackId="a" name="3ª Red" fill={COLORS.r3} />
          <Bar dataKey="g4" stackId="a" name="4ª Green" fill={COLORS.g4} />
          <Bar dataKey="r4" stackId="a" name="4ª Red" fill={COLORS.r4} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#16a34a", "#ef4444", "#f59e0b", "#0ea5e9", "#8b5cf6", "#22c55e"];

export default function ChartPie({ data, labelKey = "name", valueKey = "value" }: { data: any[]; labelKey?: string; valueKey?: string }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey={valueKey} nameKey={labelKey} outerRadius={100} label>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: 8, color: "#f5f5f5" }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}


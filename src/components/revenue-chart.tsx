"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/format";

export function RevenueChart({ data }: { data: Array<{ period: string; value: number }> }) {
  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#176BFF" stopOpacity={0.28} /><stop offset="95%" stopColor="#176BFF" stopOpacity={0.02} /></linearGradient></defs>
          <CartesianGrid stroke="#E7EDF5" vertical={false} />
          <XAxis dataKey="period" tick={{ fontSize: 10, fill: "#66758C" }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000000)}jt`} tick={{ fontSize: 10, fill: "#66758C" }} axisLine={false} tickLine={false} width={42} />
          <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Pendapatan"]} contentStyle={{ border: "1px solid #DDE5F0", borderRadius: 10, fontSize: 11 }} />
          <Area type="monotone" dataKey="value" stroke="#176BFF" strokeWidth={2.4} fill="url(#revenueFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

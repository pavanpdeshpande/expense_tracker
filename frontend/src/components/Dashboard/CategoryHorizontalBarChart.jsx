import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';

const PALETTE = ['#8B5CF6', '#F59E0B', '#3B82F6', '#EC4899', '#10B981', '#F97316', '#6366F1'];

export default function CategoryHorizontalBarChart({ data }) {
  const { formatCurrency } = useFinance();

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No category expenses recorded
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-0.5">
          <p className="font-bold text-slate-800 dark:text-white">{item.name}</p>
          <p className="text-slate-600 dark:text-slate-300">
            Total: <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(item.amount)}</span>
          </p>
          <p className="text-emerald-600 dark:text-emerald-400 font-semibold">{item.percentage}% of expenses</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
        >
          <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000) + 'k' : v}`} />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            width={110}
            tickFormatter={(name) => name.length > 14 ? name.substring(0, 14) + '...' : name}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="amount" radius={[0, 6, 6, 0]} maxBarSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

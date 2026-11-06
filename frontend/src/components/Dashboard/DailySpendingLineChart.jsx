import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';

export default function DailySpendingLineChart({ data }) {
  const { formatCurrency } = useFinance();

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No daily spending recorded
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-0.5">
          <p className="font-semibold text-slate-500 dark:text-slate-400">{item.full_date || item.date}</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            Spent: {formatCurrency(item.amount)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000) + 'k' : v}`} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="amount"
            name="Daily Expense"
            stroke="#6366F1"
            strokeWidth={3}
            dot={{ r: 3, fill: '#6366F1' }}
            activeDot={{ r: 6, fill: '#4F46E5' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

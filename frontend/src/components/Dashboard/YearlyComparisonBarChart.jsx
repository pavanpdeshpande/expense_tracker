import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';

export default function YearlyComparisonBarChart({ data }) {
  const { formatCurrency } = useFinance();

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No yearly comparison data recorded
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-1">
          <p className="font-bold text-slate-800 dark:text-white">Year {label}</p>
          <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
            Income: {formatCurrency(payload[0]?.value)}
          </p>
          <p className="text-rose-600 dark:text-rose-400 font-semibold">
            Expenses: {formatCurrency(payload[1]?.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000) + 'k' : v}`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
          />
          <Bar dataKey="income" name="Yearly Income" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={36} />
          <Bar dataKey="expense" name="Yearly Expense" fill="#F43F5E" radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

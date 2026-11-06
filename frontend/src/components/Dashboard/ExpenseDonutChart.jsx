import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';

const COLORS = [
  '#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6',
  '#F97316', '#6366F1', '#14B8A6', '#84CC16', '#64748B'
];

export default function ExpenseDonutChart({ data }) {
  const { formatCurrency } = useFinance();

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No expense transactions in this period
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-1">
          <p className="font-bold text-slate-800 dark:text-white">{item.name}</p>
          <p className="text-slate-600 dark:text-slate-300 font-medium">
            Amount: <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(item.amount)}</span>
          </p>
          <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
            Share: {item.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72 flex flex-col justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<CustomTooltip />} />
          <Pie
            data={data}
            dataKey="amount"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={4}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

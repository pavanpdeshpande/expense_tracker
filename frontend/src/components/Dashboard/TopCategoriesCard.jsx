import React from 'react';
import { useFinance } from '../../context/FinanceContext';

const COLORS = ['bg-purple-500', 'bg-amber-500', 'bg-blue-500', 'bg-pink-500', 'bg-emerald-500'];

export default function TopCategoriesCard({ categories }) {
  const { formatCurrency } = useFinance();

  if (!categories || categories.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No spending categories in this period
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {categories.map((c, idx) => (
        <div key={idx} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${COLORS[idx % COLORS.length]}`} />
              <span className="truncate max-w-[150px]">{c.category}</span>
              <span className="text-[10px] text-slate-400 font-normal">({c.count} tx)</span>
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {formatCurrency(c.amount)}
              <span className="text-[11px] text-slate-400 font-medium ml-1.5">({c.percentage}%)</span>
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${COLORS[idx % COLORS.length]} transition-all duration-500`}
              style={{ width: `${Math.min(100, c.percentage)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

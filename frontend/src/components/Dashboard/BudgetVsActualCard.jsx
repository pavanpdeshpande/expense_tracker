import React from 'react';
import { AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export default function BudgetVsActualCard({ budgets }) {
  const { formatCurrency } = useFinance();

  if (!budgets || budgets.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-xs text-slate-400 text-center">
        <p className="mb-2">No monthly budgets configured yet.</p>
        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
          Set budgets in the "Budget Management" tab.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {budgets.map((b) => {
        const isExceeded = b.status === 'exceeded';
        const isWarning = b.status === 'warning';

        return (
          <div key={b.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                {b.category_name}
                {isExceeded && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-1.5 py-0.2 rounded-md">
                    <AlertOctagon className="w-3 h-3" /> Exceeded!
                  </span>
                )}
                {isWarning && !isExceeded && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 rounded-md">
                    <AlertTriangle className="w-3 h-3" /> &gt;80% Warning
                  </span>
                )}
              </span>

              <span className="font-bold text-slate-700 dark:text-slate-200">
                {b.percentage}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isExceeded
                    ? 'bg-rose-500'
                    : isWarning
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, b.percentage)}%` }}
              />
            </div>

            {/* Spent vs Budget */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>
                Spent: <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(b.spent)}</span>
              </span>
              <span>
                Budget: <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(b.budget)}</span>
              </span>
              <span>
                Remaining: <span className={`font-semibold ${b.remaining < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{formatCurrency(b.remaining)}</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

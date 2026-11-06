import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  HeartHandshake,
  PiggyBank,
  CalendarCheck
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export default function FinancialSummaryCards({ summary, loading }) {
  const { formatCurrency } = useFinance();

  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-32 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 animate-pulse p-4" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Income',
      amount: summary.income.amount,
      prev: summary.income.prev_month_amount,
      pct: summary.income.change_pct,
      trend: summary.income.trend,
      icon: TrendingUp,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
      isGoodWhenUp: true
    },
    {
      title: 'Total Expenses',
      amount: summary.expenses.amount,
      prev: summary.expenses.prev_month_amount,
      pct: summary.expenses.change_pct,
      trend: summary.expenses.trend,
      icon: TrendingDown,
      iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800',
      accentColor: 'text-rose-600 dark:text-rose-400',
      isGoodWhenUp: false
    },
    {
      title: 'Current Balance',
      amount: summary.balance.amount,
      prev: summary.balance.prev_month_amount,
      pct: summary.balance.change_pct,
      trend: summary.balance.trend,
      icon: Wallet,
      iconBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
      accentColor: summary.balance.amount >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400',
      isGoodWhenUp: true
    },
    {
      title: 'Monthly Savings',
      amount: summary.savings.amount,
      prev: summary.savings.prev_month_amount,
      pct: summary.savings.change_pct,
      trend: summary.savings.trend,
      icon: PiggyBank,
      iconBg: 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800',
      accentColor: 'text-teal-600 dark:text-teal-400',
      isGoodWhenUp: true
    },
    {
      title: 'Total Donations',
      amount: summary.donations.amount,
      prev: summary.donations.prev_month_amount,
      pct: summary.donations.change_pct,
      trend: summary.donations.trend,
      icon: HeartHandshake,
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
      accentColor: 'text-amber-600 dark:text-amber-400',
      isGoodWhenUp: true
    },
    {
      title: 'Avg Daily Spend',
      amount: summary.daily_avg_spend.amount,
      prev: summary.daily_avg_spend.prev_month_amount,
      pct: summary.daily_avg_spend.change_pct,
      trend: summary.daily_avg_spend.trend,
      icon: CalendarCheck,
      iconBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800',
      accentColor: 'text-purple-600 dark:text-purple-400',
      isGoodWhenUp: false
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        const isUp = c.pct > 0;
        const isNeutral = c.pct === 0;
        // Determine whether increase is considered positive or negative
        const isPositiveChange = c.isGoodWhenUp ? isUp : !isUp;

        return (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {c.title}
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${c.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(c.amount)}
            </div>

            {/* Comparison line */}
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">
                Prev: <span className="font-medium text-slate-600 dark:text-slate-300">{formatCurrency(c.prev)}</span>
              </span>

              <span
                className={`flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded-md ${
                  isNeutral
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    : isPositiveChange
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                }`}
              >
                {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>{Math.abs(c.pct)}%</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

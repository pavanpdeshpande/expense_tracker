import React, { useState, useEffect } from 'react';
import { PiggyBank, TrendingUp, TrendingDown, Calendar, Percent, ShieldCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { savingsApi } from '../../api/client';
import MonthlySavingsAreaChart from '../Dashboard/MonthlySavingsAreaChart';

export default function SavingsView() {
  const { formatCurrency, refreshTrigger } = useFinance();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    let isMounted = true;
    async function loadSavings() {
      setLoading(true);
      try {
        const res = await savingsApi.getOverview(selectedYear);
        if (isMounted) setData(res.data);
      } catch (err) {
        console.error('Failed to load savings overview', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSavings();
    return () => { isMounted = false; };
  }, [selectedYear, refreshTrigger]);

  if (loading || !data) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        Loading financial overview...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/5 dark:from-teal-950/40 dark:via-emerald-950/20 dark:to-slate-900 rounded-3xl border border-teal-200 dark:border-teal-900/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/20 shrink-0">
            <PiggyBank className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
              Savings & Wealth Overview
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Net savings formula: <code className="font-mono bg-white/60 dark:bg-slate-800 px-1 py-0.5 rounded">Savings = Total Income - Total Expenses</code>
            </p>
          </div>
        </div>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-3 py-2 bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
        >
          {[2024, 2025, 2026, 2027].map(yr => (
            <option key={yr} value={yr}>Year {yr}</option>
          ))}
        </select>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Current Month Savings
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(data.current_month_savings)}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Rate: <span className="font-bold text-slate-800 dark:text-slate-200">{data.current_month_savings_rate}%</span> of income
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Full Year Savings ({selectedYear})
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(data.yearly_savings)}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
            Average Rate: <span className="font-bold text-emerald-600">{data.yearly_savings_rate}%</span>
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Income Growth (YoY)
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1">
            {data.income_growth >= 0 ? <ArrowUpRight className="w-5 h-5 text-emerald-500" /> : <ArrowDownRight className="w-5 h-5 text-rose-500" />}
            <span>{Math.abs(data.income_growth)}%</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Compared to previous year</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Expense Growth (YoY)
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1">
            {data.expense_growth > 0 ? <ArrowUpRight className="w-5 h-5 text-rose-500" /> : <ArrowDownRight className="w-5 h-5 text-emerald-500" />}
            <span>{Math.abs(data.expense_growth)}%</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Outflow trajectory</span>
        </div>
      </div>

      {/* Secondary Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Highest Spending Month
          </span>
          <div className="text-lg font-bold text-slate-800 dark:text-white">
            {data.highest_spending_month.month}
          </div>
          <span className="text-xs font-semibold text-rose-500 mt-0.5 block">
            {formatCurrency(data.highest_spending_month.expense)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Lowest Spending Month
          </span>
          <div className="text-lg font-bold text-slate-800 dark:text-white">
            {data.lowest_spending_month.month}
          </div>
          <span className="text-xs font-semibold text-emerald-500 mt-0.5 block">
            {formatCurrency(data.lowest_spending_month.expense)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Average Monthly Expenditure
          </span>
          <div className="text-lg font-bold text-slate-800 dark:text-white">
            {formatCurrency(data.avg_monthly_expenditure)}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">Across active months in {selectedYear}</span>
        </div>
      </div>

      {/* Savings Trend Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">
          Monthly Savings Trajectory ({selectedYear})
        </h3>
        <MonthlySavingsAreaChart data={data.monthly_breakdown} />
      </div>

      {/* Month-by-Month Savings Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">
          Monthly Performance Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-400">
                <th className="py-2.5 px-3">Month</th>
                <th className="py-2.5 px-3">Total Income</th>
                <th className="py-2.5 px-3">Total Expenses</th>
                <th className="py-2.5 px-3">Net Savings</th>
                <th className="py-2.5 px-3 text-right">Savings Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {data.monthly_breakdown.map(m => (
                <tr key={m.month_num} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-bold text-slate-700 dark:text-slate-300">{m.month}</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-semibold">{formatCurrency(m.income)}</td>
                  <td className="py-2.5 px-3 text-rose-600 font-semibold">{formatCurrency(m.expense)}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{formatCurrency(m.savings)}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      m.savings_rate >= 25 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {m.savings_rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

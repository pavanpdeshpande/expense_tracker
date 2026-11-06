import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, DollarSign, Wallet, Landmark, Layers } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { transactionsApi } from '../../api/client';
import TransactionTable from '../Transactions/TransactionTable';

export default function IncomeView() {
  const { formatCurrency, openAddModal, refreshTrigger, filter, customDates } = useFinance();
  const [stats, setStats] = useState({
    total: 0,
    count: 0,
    sourcesBreakdown: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadIncomeStats() {
      setLoading(true);
      try {
        const res = await transactionsApi.list({
          type: 'income',
          page_size: 200,
        });

        if (isMounted) {
          const items = res.data.items || [];
          const total = res.data.total_amount || 0;
          const count = res.data.total || 0;

          const sourceMap = {};
          items.forEach(tx => {
            const src = tx.subcategory_name || tx.merchant || 'Other Income';
            if (!sourceMap[src]) sourceMap[src] = { name: src, amount: 0, count: 0 };
            sourceMap[src].amount += tx.amount;
            sourceMap[src].count += 1;
          });

          const sources = Object.values(sourceMap).sort((a, b) => b.amount - a.amount);
          setStats({ total, count, sourcesBreakdown: sources });
        }
      } catch (err) {
        console.error('Failed to load income data', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadIncomeStats();
    return () => { isMounted = false; };
  }, [refreshTrigger, filter, customDates]);

  return (
    <div className="space-y-6">
      {/* Income Header */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900 rounded-3xl border border-emerald-200 dark:border-emerald-900/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 shrink-0">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
              Income & Earnings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Salary, freelancing, dividends, bonus, and passive income sources
            </p>
          </div>
        </div>

        <button
          onClick={() => openAddModal({ category: 'Income', type: 'income' })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Income Record</span>
        </button>
      </div>

      {/* Income Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Total Income Recorded
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(stats.total)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">From {stats.count} income deposits</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Primary Income Stream
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white truncate">
            {stats.sourcesBreakdown[0]?.name || 'N/A'}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {stats.sourcesBreakdown[0] ? formatCurrency(stats.sourcesBreakdown[0].amount) : 'No entries'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Income Streams Count
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.sourcesBreakdown.length}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Distinct earning channels</span>
        </div>
      </div>

      {/* Source Breakdown */}
      {stats.sourcesBreakdown.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-500" />
            Income Breakdown by Source
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.sourcesBreakdown.map((src, idx) => {
              const pct = stats.total > 0 ? Math.round((src.amount / stats.total) * 100) : 0;
              return (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl space-y-1.5 border border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {src.name} <span className="text-[10px] text-slate-400">({src.count} entries)</span>
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(src.amount)} <span className="text-slate-400 text-[11px]">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Income Transactions Table */}
      <TransactionTable
        fixedType="income"
        title="Income History"
        itemsPerPage={10}
      />
    </div>
  );
}

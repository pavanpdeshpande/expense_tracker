import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, Layers, CreditCard, Calendar } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { transactionsApi } from '../../api/client';
import TransactionTable from '../Transactions/TransactionTable';

export default function CategorySpecificView({ categoryName, icon: Icon, description }) {
  const { categories, formatCurrency, openAddModal, refreshTrigger, filter, customDates } = useFinance();
  const [stats, setStats] = useState({
    total: 0,
    count: 0,
    avg: 0,
    subcategoriesBreakdown: []
  });
  const [loading, setLoading] = useState(true);

  // Find category object
  const categoryObj = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());

  useEffect(() => {
    let isMounted = true;
    async function loadCategoryStats() {
      setLoading(true);
      try {
        const res = await transactionsApi.list({
          category_name: categoryName,
          page_size: 200,
        });

        if (isMounted) {
          const items = res.data.items || [];
          const total = res.data.total_amount || 0;
          const count = res.data.total || 0;
          const avg = count > 0 ? total / count : 0;

          // Compute subcategory distribution
          const subMap = {};
          items.forEach(tx => {
            const sub = tx.subcategory_name || 'Other';
            if (!subMap[sub]) subMap[sub] = { name: sub, amount: 0, count: 0 };
            subMap[sub].amount += tx.amount;
            subMap[sub].count += 1;
          });

          const breakdown = Object.values(subMap).sort((a, b) => b.amount - a.amount);
          setStats({
            total,
            count,
            avg,
            subcategoriesBreakdown: breakdown
          });
        }
      } catch (err) {
        console.error('Failed to load category stats', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCategoryStats();
    return () => { isMounted = false; };
  }, [categoryName, refreshTrigger, filter, customDates]);

  return (
    <div className="space-y-6">
      {/* Category Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            {Icon && <Icon className="w-7 h-7" />}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
              {categoryName}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {description || `Track and manage all expenses for ${categoryName}`}
            </p>
          </div>
        </div>

        <button
          onClick={() => openAddModal({ category: categoryName })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add {categoryName} Expense</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Total Expenditure
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(stats.total)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Across {stats.count} recorded transactions
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Average Spend / Transaction
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(stats.avg)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Per transaction expenditure
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Subcategories Active
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.subcategoriesBreakdown.length}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Different subcategory tags
          </span>
        </div>
      </div>

      {/* Subcategories Breakdown Progress Bars */}
      {stats.subcategoriesBreakdown.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-500" />
            Subcategory Breakdown
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.subcategoriesBreakdown.map((sub, idx) => {
              const pct = stats.total > 0 ? Math.round((sub.amount / stats.total) * 100) : 0;
              return (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl space-y-1.5 border border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {sub.name} <span className="text-[10px] text-slate-400 font-normal">({sub.count} tx)</span>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(sub.amount)} <span className="text-slate-400 text-[11px]">({pct}%)</span>
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

      {/* Filtered Transaction Table */}
      <TransactionTable
        fixedCategory={categoryName}
        title={`${categoryName} Transactions`}
        itemsPerPage={12}
      />
    </div>
  );
}

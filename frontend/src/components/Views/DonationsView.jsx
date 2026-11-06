import React, { useState, useEffect } from 'react';
import { HeartHandshake, Plus, Award, Building, Sparkles, PieChart, Calendar } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { donationsApi } from '../../api/client';
import TransactionTable from '../Transactions/TransactionTable';

export default function DonationsView() {
  const { formatCurrency, openAddModal, refreshTrigger } = useFinance();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    let isMounted = true;
    async function loadDonations() {
      setLoading(true);
      try {
        const res = await donationsApi.getSummary(selectedYear);
        if (isMounted) setData(res.data);
      } catch (err) {
        console.error('Failed to load donations', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDonations();
    return () => { isMounted = false; };
  }, [selectedYear, refreshTrigger]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900 rounded-3xl border border-amber-200 dark:border-amber-900/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
              Donations & Charity Tracker
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track your temple offerings, annadanam, NGO causes, and philanthropic support
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Year selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            {[2024, 2025, 2026, 2027].map(yr => (
              <option key={yr} value={yr}>Year {yr}</option>
            ))}
          </select>

          <button
            onClick={() => openAddModal({ category: 'Donations & Charity', type: 'expense' })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Donation</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Current Month Donations
          </span>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {formatCurrency(data?.current_month_total || 0)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Giving for this month</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Total Donations ({selectedYear})
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(data?.yearly_total || 0)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Across {data?.yearly_count || 0} donations</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Active Charitable Causes
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {data?.category_breakdown?.length || 0}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Causes and organizations</span>
        </div>
      </div>

      {/* Cause Breakdown and Top Organizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cause / Category Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-500" />
            Donation Categories Breakdown
          </h3>

          <div className="space-y-3">
            {data?.category_breakdown?.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {cat.category} <span className="text-[10px] text-slate-400">({cat.count} contributions)</span>
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {formatCurrency(cat.amount)} <span className="text-slate-400 font-normal">({cat.percentage}%)</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, cat.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Recipient Organizations / Temples */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-orange-500" />
            Top Beneficiaries & Temples
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data?.top_recipients?.map((org, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800 dark:text-white">
                    {org.organization}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {org.count} donation{org.count > 1 ? 's' : ''} recorded
                  </div>
                </div>
                <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {formatCurrency(org.amount)}
                </div>
              </div>
            ))}
            {(!data?.top_recipients || data.top_recipients.length === 0) && (
              <p className="text-xs text-slate-400 py-6 text-center">No recipient organizations logged yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Donations Table */}
      <TransactionTable
        fixedIsDonation={true}
        title="Donation Records"
        itemsPerPage={10}
      />
    </div>
  );
}

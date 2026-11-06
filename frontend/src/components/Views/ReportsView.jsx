import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Layers,
  Store,
  CreditCard,
  TrendingUp,
  Percent
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { reportsApi, dataApi } from '../../api/client';

export default function ReportsView() {
  const { formatCurrency, refreshTrigger } = useFinance();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(''); // '' for whole year, or 1-12
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadReport() {
      setLoading(true);
      try {
        const mParam = month ? parseInt(month) : undefined;
        const res = await reportsApi.getAnalytics(year, mParam);
        if (isMounted) setReport(res.data);
      } catch (err) {
        console.error('Failed to load report analytics', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadReport();
    return () => { isMounted = false; };
  }, [year, month, refreshTrigger]);

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-500" />
            Financial Reports & Multi-Dimensional Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Category-wise, merchant-wise, payment method analysis, MoM and YoY comparisons
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Year selector */}
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>Year {y}</option>
            ))}
          </select>

          {/* Month selector */}
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            <option value="">All 12 Months (Full Year)</option>
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((mName, idx) => (
              <option key={idx + 1} value={idx + 1}>{mName}</option>
            ))}
          </select>

          {/* Export Actions */}
          <a
            href={dataApi.exportCsvUrl({})}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </a>

          <a
            href={dataApi.exportExcelUrl({})}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </a>

          <a
            href={dataApi.exportPdfUrl()}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </a>
        </div>
      </div>

      {/* Summary KPI Strip */}
      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
              Period Income
            </span>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(report.summary.income)}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">{report.period_label}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
              Period Expense
            </span>
            <div className="text-xl font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(report.summary.expense)}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">{report.period_label}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
              Net Savings
            </span>
            <div className="text-xl font-black text-teal-600 dark:text-teal-400">
              {formatCurrency(report.summary.savings)}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">Surplus balance</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
              Savings Rate
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {report.summary.savings_rate}%
            </div>
            <span className="text-xs text-slate-400 mt-1 block">Of period inflow</span>
          </div>
        </div>
      )}

      {/* Row: Category-wise & Merchant-wise Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Report Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-500" />
            Category-wise Expenditure Breakdown
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-400">
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Transactions</th>
                  <th className="py-2.5 px-3 text-right">Total Outflow</th>
                  <th className="py-2.5 px-3 text-right">Share (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {report?.category_report?.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-white">{c.category}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">{c.count}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(c.total)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-purple-600 dark:text-purple-400">{c.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Merchant-wise Spending (Top 10) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-500" />
            Top Merchant / Payee Destinations
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-400">
                  <th className="py-2.5 px-3">Merchant / Payee</th>
                  <th className="py-2.5 px-3 text-right">Count</th>
                  <th className="py-2.5 px-3 text-right">Total Spent</th>
                  <th className="py-2.5 px-3 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {report?.merchant_report?.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-white">{m.merchant}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">{m.count}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(m.total)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-600 dark:text-blue-400">{m.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row: Payment Method Analysis & Year-over-Year Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Method Analysis */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-500" />
            Payment Method Analysis
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-400">
                  <th className="py-2.5 px-3">Payment Method</th>
                  <th className="py-2.5 px-3 text-right">Transactions</th>
                  <th className="py-2.5 px-3 text-right">Volume</th>
                  <th className="py-2.5 px-3 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {report?.payment_report?.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-white">{p.payment_method}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">{p.count}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(p.total)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{p.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Year-over-Year (YoY) Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-500" />
            Year-over-Year (YoY) Historical Summary
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-400">
                  <th className="py-2.5 px-3">Year</th>
                  <th className="py-2.5 px-3 text-right">Income</th>
                  <th className="py-2.5 px-3 text-right">Expense</th>
                  <th className="py-2.5 px-3 text-right">Net Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {report?.yoy_data?.map((y, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-white">{y.year}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-600 font-semibold">{formatCurrency(y.income)}</td>
                    <td className="py-2.5 px-3 text-right text-rose-600 font-semibold">{formatCurrency(y.expense)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-teal-600 dark:text-teal-400">{formatCurrency(y.savings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

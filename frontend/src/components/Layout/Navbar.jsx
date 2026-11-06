import React, { useState } from 'react';
import {
  Plus,
  Moon,
  Sun,
  RefreshCw,
  Calendar as CalendarIcon,
  Filter,
  Download,
  Database
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { NAV_ITEMS } from './Sidebar';

export default function Navbar({ activeTab, collapsed, onOpenImportExport }) {
  const { filter, setFilter, customDates, setCustomDates, triggerRefresh, openAddModal } = useFinance();
  const { theme, toggleTheme, isDark } = useTheme();
  const [showCustomModal, setShowCustomModal] = useState(false);

  const currentTabObj = NAV_ITEMS.find(n => n.id === activeTab) || { label: 'Dashboard' };

  const handleFilterChange = (e) => {
    const val = e.target.value;
    if (val === 'custom') {
      setShowCustomModal(true);
    } else {
      setFilter(val);
    }
  };

  const handleApplyCustomDates = (e) => {
    e.preventDefault();
    if (customDates.startDate && customDates.endDate) {
      setFilter('custom');
      setShowCustomModal(false);
      triggerRefresh();
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300 flex items-center justify-between px-6 ${
        collapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          {currentTabObj.label}
        </h1>
        {currentTabObj.category && (
          <span className="hidden sm:inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Category Tracker
          </span>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Date Period Filter */}
        <div className="relative flex items-center">
          <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <select
            value={filter}
            onChange={handleFilterChange}
            className="pl-9 pr-8 py-1.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-colors"
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="last_3_months">Last 3 Months</option>
            <option value="last_6_months">Last 6 Months</option>
            <option value="this_year">This Year</option>
            <option value="custom">Custom Range...</option>
          </select>
        </div>

        {/* Refresh button */}
        <button
          onClick={triggerRefresh}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Add Transaction Global CTA */}
        <button
          onClick={() => openAddModal()}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Custom Date Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 w-full max-w-sm shadow-xl">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Custom Date Range</h3>
            <form onSubmit={handleApplyCustomDates} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={customDates.startDate}
                  onChange={(e) => setCustomDates(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={customDates.endDate}
                  onChange={(e) => setCustomDates(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm"
                >
                  Apply Filter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

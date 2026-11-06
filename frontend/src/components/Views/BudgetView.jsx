import React, { useState, useEffect } from 'react';
import { Target, Plus, AlertTriangle, AlertOctagon, CheckCircle2, Trash2, Edit } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { budgetsApi } from '../../api/client';

export default function BudgetView() {
  const { categories, formatCurrency, showToast, refreshTrigger } = useFinance();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formCategory, setFormCategory] = useState(''); // '' for overall
  const [formAmount, setFormAmount] = useState('');

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const res = await budgetsApi.list(selectedMonth);
      setBudgets(res.data);
    } catch (err) {
      console.error('Failed to load budgets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, [selectedMonth, refreshTrigger]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    const amt = parseFloat(formAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('Please enter a valid budget amount', 'error');
      return;
    }

    try {
      await budgetsApi.set({
        month: selectedMonth,
        category_id: formCategory ? parseInt(formCategory) : null,
        amount: amt
      });
      showToast('Budget saved successfully');
      setIsModalOpen(false);
      setFormCategory('');
      setFormAmount('');
      loadBudgets();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to save budget', 'error');
    }
  };

  const handleDeleteBudget = async (id) => {
    try {
      await budgetsApi.delete(id);
      showToast('Budget deleted');
      loadBudgets();
    } catch (err) {
      showToast('Failed to delete budget', 'error');
    }
  };

  const overallBudget = budgets.find(b => b.category_id === null);
  const categoryBudgets = budgets.filter(b => b.category_id !== null);

  return (
    <div className="space-y-6">
      {/* Header & Month Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-emerald-500" />
            Budget Management & Thresholds
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Set spending limits and receive automated warnings when spending reaches 80% or exceeds 100%
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
          />

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* Overall Monthly Budget Hero Card */}
      {overallBudget ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Overall Monthly Budget
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {formatCurrency(overallBudget.amount)}
              </div>
            </div>

            <div className="text-right">
              {overallBudget.status === 'exceeded' && (
                <span className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-2.5 py-1 rounded-xl">
                  <AlertOctagon className="w-4 h-4" /> Budget Exceeded!
                </span>
              )}
              {overallBudget.status === 'warning' && (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-1 rounded-xl">
                  <AlertTriangle className="w-4 h-4" /> &gt;80% Limit Warning
                </span>
              )}
              {overallBudget.status === 'ok' && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" /> On Track
                </span>
              )}
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mt-1">
                {overallBudget.percentage}% utilized
              </span>
            </div>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallBudget.status === 'exceeded'
                  ? 'bg-rose-500'
                  : overallBudget.status === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, overallBudget.percentage)}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Spent</span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5 block">
                {formatCurrency(overallBudget.spent)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Remaining Limit</span>
              <span className={`text-sm font-extrabold mt-0.5 block ${overallBudget.remaining < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {formatCurrency(overallBudget.remaining)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Actions</span>
                <span className="text-xs text-slate-500">Modify or Remove</span>
              </div>
              <button
                onClick={() => handleDeleteBudget(overallBudget.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                title="Remove Budget"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
          <Target className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">No Overall Monthly Budget Defined</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Set a monthly spending ceiling for {selectedMonth} to automatically monitor your cash flow.
          </p>
          <button
            onClick={() => {
              setFormCategory('');
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow"
          >
            Set Overall Budget for {selectedMonth}
          </button>
        </div>
      )}

      {/* Category Budgets Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">
          Category Budgets ({categoryBudgets.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryBudgets.map(b => {
            const isExceeded = b.status === 'exceeded';
            const isWarning = b.status === 'warning';

            return (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800 dark:text-white truncate">
                    {b.category_name}
                  </span>
                  <button
                    onClick={() => handleDeleteBudget(b.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Utilization</span>
                    <span className={`font-bold ${isExceeded ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-slate-700 dark:text-slate-200'}`}>
                      {b.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, b.percentage)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Spent</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(b.spent)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block">Budget</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(b.amount)}</span>
                  </div>
                </div>

                <div className="text-[11px] flex items-center justify-between pt-1">
                  <span className="text-slate-400">Remaining</span>
                  <span className={`font-extrabold ${b.remaining < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {formatCurrency(b.remaining)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Set Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
              Set Budget for {selectedMonth}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Specify a category or set the overall monthly budget
            </p>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Target Scope
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Overall Monthly Budget --</option>
                  {categories.filter(c => c.type === 'expense').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Budget Amount (₹)
                </label>
                <input
                  type="number"
                  step="100"
                  required
                  placeholder="e.g. 50000"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

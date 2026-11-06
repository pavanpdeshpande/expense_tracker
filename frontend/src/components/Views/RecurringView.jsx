import React, { useState, useEffect } from 'react';
import { Repeat, Plus, Play, Trash2, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { recurringApi } from '../../api/client';

export default function RecurringView() {
  const { categories, formatCurrency, showToast, triggerRefresh } = useFinance();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'expense',
    amount: '',
    category_name: 'Bills & Utilities',
    subcategory_name: 'Electricity',
    payment_method: 'UPI',
    merchant: '',
    frequency: 'monthly',
    day_of_month: 1,
    start_date: new Date().toISOString().split('T')[0]
  });

  const loadRules = async () => {
    setLoading(true);
    try {
      const res = await recurringApi.list();
      setRules(res.data);
    } catch (err) {
      console.error('Failed to load recurring rules', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    try {
      await recurringApi.create({
        ...formData,
        amount: amt,
        day_of_month: parseInt(formData.day_of_month)
      });
      showToast('Recurring transaction rule created');
      setIsModalOpen(false);
      loadRules();
    } catch (err) {
      showToast('Failed to create recurring rule', 'error');
    }
  };

  const handleToggle = async (id) => {
    try {
      await recurringApi.toggle(id);
      loadRules();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await recurringApi.delete(id);
      showToast('Rule removed');
      loadRules();
    } catch (err) {
      showToast('Failed to delete rule', 'error');
    }
  };

  const handleProcessDue = async () => {
    try {
      const res = await recurringApi.processDue();
      showToast(res.data.message);
      triggerRefresh();
      loadRules();
    } catch (err) {
      showToast('Failed to process recurring transactions', 'error');
    }
  };

  const selectedCategoryObj = categories.find(c => c.name === formData.category_name);
  const subcategories = selectedCategoryObj?.subcategories || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Repeat className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
              Recurring Transactions & Subscriptions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automate monthly bills, rent, internet plans, and SIP investments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleProcessDue}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            title="Check and post any pending due bills to ledger"
          >
            <Play className="w-3.5 h-3.5 text-emerald-500" />
            <span>Process Due Today</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Recurring Bill</span>
          </button>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">
          Active Recurring Rules ({rules.length})
        </h3>

        {rules.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No recurring rules established yet. Click "New Recurring Bill" to set up auto bills.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-400">
                  <th className="py-2.5 px-3">Bill Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Frequency</th>
                  <th className="py-2.5 px-3">Billing Day</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Last Processed</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {rules.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-white">
                      {r.title}
                      {r.merchant && <div className="text-[10px] text-slate-400">{r.merchant}</div>}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {r.category_name} &bull; {r.subcategory_name || 'General'}
                    </td>
                    <td className="py-3 px-3 capitalize text-slate-500 font-medium">
                      {r.frequency}
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-bold">
                      Day {r.day_of_month} of month
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(r.amount)}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {r.last_processed || 'Pending'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleToggle(r.id)}
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          r.is_active
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-500 dark:bg-slate-800'
                        }`}
                      >
                        {r.is_active ? 'Active' : 'Paused'}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              Create Recurring Bill Rule
            </h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apartment Rent, ACT Broadband, Netflix"
                  value={formData.title}
                  onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Billing Day (1-31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={formData.day_of_month}
                    onChange={(e) => setFormData(p => ({ ...p, day_of_month: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  value={formData.category_name}
                  onChange={(e) => setFormData(p => ({ ...p, category_name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Merchant / Payee</label>
                <input
                  type="text"
                  placeholder="e.g. Airtel, Landlord, BESCOM"
                  value={formData.merchant}
                  onChange={(e) => setFormData(p => ({ ...p, merchant: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md"
                >
                  Save Recurring Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

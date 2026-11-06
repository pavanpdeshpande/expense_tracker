import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { transactionsApi } from '../../api/client';

const PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Google Pay',
  'PhonePe',
  'Paytm',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other'
];

const DONATION_CATEGORIES = [
  'Temple donations',
  'Religious activities',
  'Charity',
  'Annadanam',
  'Education support',
  'Medical support',
  'NGO',
  'Other donations'
];

export default function AddTransactionModal() {
  const {
    isAddModalOpen,
    closeAddModal,
    modalDefaults,
    editingTransaction,
    categories,
    triggerRefresh,
    showToast
  } = useFinance();

  const [formData, setFormData] = useState({
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    category_name: 'Personal Expenses',
    subcategory_name: '',
    amount: '',
    payment_method: 'UPI',
    merchant: '',
    description: '',
    notes: '',
    is_donation: false,
    donation_category: 'Temple donations',
    donation_purpose: '',
    account: 'Primary Account',
  });

  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync state when modal opens or editingTransaction changes
  useEffect(() => {
    if (!isAddModalOpen) {
      setDuplicateWarning(null);
      setError(null);
      return;
    }

    if (editingTransaction) {
      setFormData({
        type: editingTransaction.type || 'expense',
        date: editingTransaction.date || new Date().toISOString().split('T')[0],
        category_name: editingTransaction.category_name || 'Personal Expenses',
        subcategory_name: editingTransaction.subcategory_name || '',
        amount: editingTransaction.amount || '',
        payment_method: editingTransaction.payment_method || 'UPI',
        merchant: editingTransaction.merchant || '',
        description: editingTransaction.description || '',
        notes: editingTransaction.notes || '',
        is_donation: editingTransaction.is_donation || false,
        donation_category: editingTransaction.donation_category || 'Temple donations',
        donation_purpose: editingTransaction.donation_purpose || '',
        account: editingTransaction.account || 'Primary Account',
      });
    } else {
      // Default creation
      const initialCat = modalDefaults?.category || (modalDefaults?.type === 'income' ? 'Income' : 'Personal Expenses');
      const initialType = modalDefaults?.type || (initialCat === 'Income' ? 'income' : 'expense');
      
      setFormData({
        type: initialType,
        date: new Date().toISOString().split('T')[0],
        category_name: initialCat,
        subcategory_name: modalDefaults?.subcategory || '',
        amount: '',
        payment_method: 'UPI',
        merchant: '',
        description: '',
        notes: '',
        is_donation: initialCat === 'Donations & Charity',
        donation_category: 'Temple donations',
        donation_purpose: '',
        account: 'Primary Account',
      });
    }
  }, [isAddModalOpen, editingTransaction, modalDefaults]);

  // Available subcategories for selected category
  const selectedCategoryObj = categories.find(c => c.name.toLowerCase() === formData.category_name.toLowerCase());
  const availableSubcategories = selectedCategoryObj?.subcategories || [];

  // Update subcategory default when category changes
  const handleCategoryChange = (catName) => {
    const isDon = catName === 'Donations & Charity';
    const isInc = catName === 'Income';
    const catObj = categories.find(c => c.name === catName);
    const firstSub = catObj?.subcategories?.[0]?.name || '';

    setFormData(prev => ({
      ...prev,
      category_name: catName,
      subcategory_name: firstSub,
      type: isInc ? 'income' : (prev.type === 'income' ? 'expense' : prev.type),
      is_donation: isDon
    }));
  };

  // Check duplicate transaction when amount or description changes
  useEffect(() => {
    if (editingTransaction || !formData.amount || parseFloat(formData.amount) <= 0 || !formData.date) {
      setDuplicateWarning(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await transactionsApi.checkDuplicate({
          date: formData.date,
          amount: parseFloat(formData.amount),
          description: formData.description || undefined,
          merchant: formData.merchant || undefined
        });
        if (res.data.is_duplicate) {
          setDuplicateWarning(res.data.matches[0]);
        } else {
          setDuplicateWarning(null);
        }
      } catch (e) {
        // ignore check errors
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.amount, formData.date, formData.merchant, formData.description, editingTransaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }

    if (!formData.description.trim()) {
      setError('Please provide a description.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        amount: amt,
        category_id: selectedCategoryObj?.id || null,
        is_donation: formData.category_name === 'Donations & Charity' || formData.is_donation
      };

      if (editingTransaction) {
        await transactionsApi.update(editingTransaction.id, payload);
        showToast('Transaction updated successfully');
      } else {
        await transactionsApi.create(payload);
        showToast('Transaction added successfully');
      }

      triggerRefresh();
      closeAddModal();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAddModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {editingTransaction ? 'Update existing transaction details' : 'Record an expense, income, or donation'}
            </p>
          </div>
          <button
            onClick={closeAddModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Duplicate Detected Warning Banner */}
          {duplicateWarning && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <div>
                <span className="font-semibold">Possible duplicate detected: </span>
                An existing {duplicateWarning.type} of ₹{duplicateWarning.amount.toFixed(2)} for "{duplicateWarning.description}" on {duplicateWarning.date} already exists. You can still proceed if this is an intentional separate entry.
              </div>
            </div>
          )}

          {/* Transaction Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    type: 'expense',
                    category_name: prev.category_name === 'Income' ? 'Personal Expenses' : prev.category_name
                  }));
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  formData.type === 'expense'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Expense (Outflow)
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    type: 'income',
                    category_name: 'Income',
                    subcategory_name: 'Salary'
                  }));
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  formData.type === 'income'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Income (Inflow)
              </button>
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Main Category & Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Main Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category_name}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name} {cat.type === 'income' ? '(Income)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Subcategory
              </label>
              <select
                value={formData.subcategory_name}
                onChange={(e) => setFormData(prev => ({ ...prev, subcategory_name: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- None / General --</option>
                {availableSubcategories.map(sub => (
                  <option key={sub.id} value={sub.name}>{sub.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description & Merchant / Paid To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Description / Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Grocery supplies, Swiggy order, Salary"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {formData.type === 'income' ? 'Source / Payer' : 'Merchant / Paid To'}
              </label>
              <input
                type="text"
                placeholder={formData.type === 'income' ? 'e.g. Employer, Client' : 'e.g. Amazon, DMart, IndianOil'}
                value={formData.merchant}
                onChange={(e) => setFormData(prev => ({ ...prev, merchant: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Payment Method & Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Payment Method <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Account / Wallet
              </label>
              <input
                type="text"
                placeholder="e.g. HDFC Salary, SBI, Cash Wallet"
                value={formData.account}
                onChange={(e) => setFormData(prev => ({ ...prev, account: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Conditional Donation Fields */}
          {(formData.category_name === 'Donations & Charity' || formData.is_donation) && (
            <div className="p-3.5 bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-orange-800 dark:text-orange-300 block">
                Donation & Charity Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-orange-700 dark:text-orange-400 mb-1">
                    Donation Category
                  </label>
                  <select
                    value={formData.donation_category}
                    onChange={(e) => setFormData(prev => ({ ...prev, donation_category: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-orange-300 dark:border-orange-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                  >
                    {DONATION_CATEGORIES.map(dc => (
                      <option key={dc} value={dc}>{dc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-orange-700 dark:text-orange-400 mb-1">
                    Purpose / Cause
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Free Meals, Temple Renovation, Child Books"
                    value={formData.donation_purpose}
                    onChange={(e) => setFormData(prev => ({ ...prev, donation_purpose: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-orange-300 dark:border-orange-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Any additional remarks or reference tags..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={closeAddModal}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingTransaction ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

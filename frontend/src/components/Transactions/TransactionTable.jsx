import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  ArrowUpDown,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { transactionsApi, dataApi } from '../../api/client';

export default function TransactionTable({
  fixedCategory = null,
  fixedType = null,
  fixedIsDonation = null,
  title = "Transactions",
  showHeader = true,
  itemsPerPage = 10,
}) {
  const {
    refreshTrigger,
    openEditModal,
    formatCurrency,
    showToast,
    categories,
    filter,
    customDates
  } = useFinance();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // Table filters & sort state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(fixedCategory || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [selectedType, setSelectedType] = useState(fixedType || 'all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Delete confirmation
  const [deletingId, setDeletingId] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: itemsPerPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (search.trim()) params.search = search.trim();
      if (fixedCategory) params.category_name = fixedCategory;
      else if (selectedCategory !== 'all') params.category_name = selectedCategory;

      if (selectedSubcategory !== 'all') params.subcategory_name = selectedSubcategory;
      if (selectedMethod !== 'all') params.payment_method = selectedMethod;
      if (fixedType) params.type = fixedType;
      else if (selectedType !== 'all') params.type = selectedType;

      if (fixedIsDonation !== null) params.is_donation = fixedIsDonation;

      const res = await transactionsApi.list(params);
      setTransactions(res.data.items);
      setTotalCount(res.data.total);
      setTotalPages(res.data.total_pages);
      setTotalAmount(res.data.total_amount);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    itemsPerPage,
    search,
    fixedCategory,
    selectedCategory,
    selectedSubcategory,
    selectedMethod,
    fixedType,
    selectedType,
    fixedIsDonation,
    sortBy,
    sortOrder,
    refreshTrigger
  ]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = async (id) => {
    try {
      await transactionsApi.delete(id);
      showToast('Transaction deleted successfully');
      setDeletingId(null);
      fetchTransactions();
    } catch (err) {
      showToast('Failed to delete transaction', 'error');
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setPage(1);
  };

  // Find subcategories for category filter
  const currentCategoryObj = categories.find(c => c.name === (fixedCategory || selectedCategory));
  const subcategoriesList = currentCategoryObj?.subcategories || [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top Filter and Actions Bar */}
      {showHeader && (
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {title}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {totalCount} total
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Total filtered amount: <span className="font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(totalAmount)}</span>
              </p>
            </div>

            {/* Quick Export Links */}
            <div className="flex items-center gap-2">
              <a
                href={dataApi.exportCsvUrl({
                  category_name: fixedCategory || (selectedCategory !== 'all' ? selectedCategory : undefined),
                  type: fixedType || (selectedType !== 'all' ? selectedType : undefined)
                })}
                download
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Export Filtered CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </a>

              <a
                href={dataApi.exportExcelUrl({
                  category_name: fixedCategory || (selectedCategory !== 'all' ? selectedCategory : undefined),
                  type: fixedType || (selectedType !== 'all' ? selectedType : undefined)
                })}
                download
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                title="Export Filtered Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel</span>
              </a>

              <a
                href={dataApi.exportPdfUrl()}
                download
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Export PDF Statement"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF</span>
              </a>
            </div>
          </div>

          {/* Filter Controls Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search description, payee, notes..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Category Filter (if not fixed) */}
            {!fixedCategory && (
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory('all');
                  setPage(1);
                }}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            )}

            {/* Subcategory Filter */}
            {subcategoriesList.length > 0 && (
              <select
                value={selectedSubcategory}
                onChange={(e) => {
                  setSelectedSubcategory(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Subcategories</option>
                {subcategoriesList.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            )}

            {/* Payment Method Filter */}
            <select
              value={selectedMethod}
              onChange={(e) => {
                setSelectedMethod(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Payment Methods</option>
              {['Cash', 'UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Debit Card', 'Credit Card', 'Bank Transfer', 'Other'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Type Filter (if not fixed) */}
            {!fixedType && (
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Types</option>
                <option value="expense">Expense Only</option>
                <option value="income">Income Only</option>
              </select>
            )}
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3 px-4 cursor-pointer hover:text-slate-700" onClick={() => handleSort('date')}>
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer hover:text-slate-700" onClick={() => handleSort('description')}>
                <div className="flex items-center gap-1">
                  <span>Description / Payee</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Subcategory</th>
              <th className="py-3 px-4">Method</th>
              <th className="py-3 px-4 text-right cursor-pointer hover:text-slate-700" onClick={() => handleSort('amount')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Amount</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">Type</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {loading ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-slate-400">
                  <div className="inline-block w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Loading transactions...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="font-medium text-slate-500 dark:text-slate-400">No transactions found</p>
                  <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
                </td>
              </tr>
            ) : (
              transactions.map(tx => {
                const isInc = tx.type === 'income';
                const isDon = tx.is_donation || tx.category_name === 'Donations & Charity';

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Date */}
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-600 dark:text-slate-300">
                      {tx.date}
                    </td>

                    {/* Description & Payee */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-white">
                        {tx.description}
                      </div>
                      {tx.merchant && (
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">
                          {tx.merchant}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {tx.category_name}
                      </span>
                    </td>

                    {/* Subcategory */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                        {tx.subcategory_name || '—'}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {tx.payment_method}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 whitespace-nowrap text-right font-bold text-sm">
                      <span
                        className={
                          isInc
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isDon
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }
                      >
                        {isInc ? '+' : '-'} {formatCurrency(tx.amount)}
                      </span>
                    </td>

                    {/* Type Badge */}
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      {isInc ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Income
                        </span>
                      ) : isDon ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Donation
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          Expense
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(tx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(tx.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing page <span className="font-semibold text-slate-800 dark:text-slate-200">{page}</span> of{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">{totalPages}</span> ({totalCount} entries)
        </div>

        <div className="flex items-center gap-1.5">
          <button
            disabled={page <= 1}
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2">Delete Transaction?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Are you sure you want to permanently remove this transaction? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

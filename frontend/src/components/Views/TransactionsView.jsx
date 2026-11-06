import React, { useState } from 'react';
import { History, Plus, Upload, Download } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import TransactionTable from '../Transactions/TransactionTable';
import ImportExportModal from '../Transactions/ImportExportModal';

export default function TransactionsView() {
  const { openAddModal } = useFinance();
  const [showImportExport, setShowImportExport] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <History className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
              Transaction History & Audit
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive ledger of all inflows, outflows, donations, and transfers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportExport(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Upload className="w-4 h-4 text-emerald-500" />
            <span>Import / Export</span>
          </button>

          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Main Full-Featured Table */}
      <TransactionTable
        title="All Master Transactions"
        itemsPerPage={15}
      />

      {/* Import / Export Modal */}
      <ImportExportModal
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
      />
    </div>
  );
}

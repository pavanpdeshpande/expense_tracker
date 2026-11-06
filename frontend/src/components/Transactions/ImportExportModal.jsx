import React, { useState } from 'react';
import { X, Upload, Download, FileSpreadsheet, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { dataApi } from '../../api/client';
import { useFinance } from '../../context/FinanceContext';

export default function ImportExportModal({ isOpen, onClose }) {
  const { triggerRefresh, showToast } = useFinance();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a CSV or Excel file.');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await dataApi.importFile(formData);
      setResult(res.data);
      showToast(`Imported ${res.data.imported_count} transactions successfully!`);
      triggerRefresh();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to import file. Please check columns.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Import & Export Transactions</h2>
            <p className="text-xs text-slate-400">Bulk import or backup your records</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Section */}
        <div className="my-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Quick Export Data</h3>
          <div className="grid grid-cols-3 gap-3">
            <a
              href={dataApi.exportCsvUrl({})}
              download
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/40 text-center transition-all group"
            >
              <Download className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-emerald-500 mb-1" />
              <span className="text-xs font-bold text-slate-800 dark:text-white">CSV Export</span>
              <span className="text-[10px] text-slate-400">Plain text</span>
            </a>

            <a
              href={dataApi.exportExcelUrl({})}
              download
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/40 text-center transition-all group"
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1" />
              <span className="text-xs font-bold text-slate-800 dark:text-white">Excel XLSX</span>
              <span className="text-[10px] text-slate-400">Formatted</span>
            </a>

            <a
              href={dataApi.exportPdfUrl({})}
              download
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/40 text-center transition-all group"
            >
              <FileText className="w-5 h-5 text-rose-600 dark:text-rose-400 mb-1" />
              <span className="text-xs font-bold text-slate-800 dark:text-white">PDF Report</span>
              <span className="text-[10px] text-slate-400">Document</span>
            </a>
          </div>
        </div>

        {/* Import Section */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Bulk Import File</h3>
          <p className="text-xs text-slate-400 mb-3">
            Upload CSV or Excel file. Columns recognized: Date, Type, Category, Subcategory, Amount, Payment Method, Description, Merchant.
          </p>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={(e) => setFile(e.target.files[0])}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-950 dark:file:text-emerald-300 hover:file:bg-emerald-100 cursor-pointer"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Imported {result.imported_count} transactions successfully!</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={uploading || !file}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <Upload className="w-3.5 h-3.5" />
                {uploading ? 'Importing...' : 'Upload & Import'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

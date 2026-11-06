import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Plus,
  ShieldAlert,
  ShieldCheck,
  FolderPlus,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { backupApi, sampleDataApi, categoriesApi } from '../../api/client';

export default function SettingsBackupView() {
  const { categories, refreshCategories, showToast, triggerRefresh } = useFinance();
  
  // Backup & Restore states
  const [restoreFile, setRestoreFile] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Category creation states
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('expense');
  const [newCatSubcategories, setNewCatSubcategories] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  // Subcategory creation state
  const [targetCatId, setTargetCatId] = useState('');
  const [newSubcatName, setNewSubcatName] = useState('');

  const handleRestore = async (e) => {
    e.preventDefault();
    if (!restoreFile) {
      showToast('Please select a .db backup file to restore', 'error');
      return;
    }

    if (!window.confirm("WARNING: Restoring will overwrite current database records with the selected backup. Proceed?")) {
      return;
    }

    setRestoring(true);
    const formData = new FormData();
    formData.append('file', restoreFile);

    try {
      await backupApi.restore(formData);
      showToast('Database successfully restored from backup!');
      triggerRefresh();
      refreshCategories();
      setRestoreFile(null);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to restore database', 'error');
    } finally {
      setRestoring(false);
    }
  };

  const handleGenerateSampleData = async () => {
    setSampleLoading(true);
    try {
      const res = await sampleDataApi.generate();
      showToast(res.data.message);
      triggerRefresh();
    } catch (err) {
      showToast('Failed to generate sample data', 'error');
    } finally {
      setSampleLoading(false);
    }
  };

  const handleRemoveSampleData = async () => {
    if (!window.confirm("Are you sure you want to remove sample data? This will clear all transactions and budgets.")) return;
    setSampleLoading(true);
    try {
      const res = await sampleDataApi.remove();
      showToast(res.data.message);
      triggerRefresh();
    } catch (err) {
      showToast('Failed to remove sample data', 'error');
    } finally {
      setSampleLoading(false);
    }
  };

  const handleClearAllData = async () => {
    setClearing(true);
    try {
      await backupApi.clearData();
      showToast('All transaction and budget data cleared');
      setShowClearConfirm(false);
      triggerRefresh();
    } catch (err) {
      showToast('Failed to clear data', 'error');
    } finally {
      setClearing(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setCreatingCat(true);
    try {
      const subs = newCatSubcategories.split(',').map(s => s.trim()).filter(Boolean);
      await categoriesApi.create({
        name: newCatName.trim(),
        type: newCatType,
        subcategories: subs
      });
      showToast('Custom category created');
      setNewCatName('');
      setNewCatSubcategories('');
      refreshCategories();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to create category', 'error');
    } finally {
      setCreatingCat(false);
    }
  };

  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    if (!targetCatId || !newSubcatName.trim()) return;

    try {
      await categoriesApi.addSubcategory(targetCatId, {
        name: newSubcatName.trim(),
        category_id: parseInt(targetCatId)
      });
      showToast('Subcategory added');
      setNewSubcatName('');
      refreshCategories();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to add subcategory', 'error');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this custom category?")) return;
    try {
      await categoriesApi.delete(id);
      showToast('Category deleted');
      refreshCategories();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Cannot delete category', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-500" />
            Database Backup, Restore & System Settings
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            100% Local data sovereignty &bull; SQLite WAL engine &bull; No cloud accounts
          </p>
        </div>
      </div>

      {/* Backup and Restore Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Backup Download Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Export Full Database Backup</h3>
              <p className="text-xs text-slate-400">Download complete SQLite .db archive with all records</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Exports the raw SQLite database including all transactions, categories, budgets, and recurring rules into a standalone portable binary file.
          </p>

          <a
            href={backupApi.downloadUrl}
            download
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download SQLite Backup (.db)</span>
          </a>
        </div>

        {/* Restore from Backup Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Restore from Backup</h3>
              <p className="text-xs text-slate-400">Upload and replace with historical .db file</p>
            </div>
          </div>

          <form onSubmit={handleRestore} className="space-y-3">
            <input
              type="file"
              accept=".db"
              onChange={(e) => setRestoreFile(e.target.files[0])}
              className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-950 dark:file:text-indigo-300 hover:file:bg-indigo-100 cursor-pointer"
            />
            <button
              type="submit"
              disabled={restoring || !restoreFile}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md disabled:opacity-40 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>{restoring ? 'Restoring...' : 'Restore Database'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Sample Data & Reset Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Demo Data & Database Reset
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white">Generate Demo Dataset</h4>
            <p className="text-[11px] text-slate-400">
              Populates realistic Indian Rupee transactions spanning 6 months with categories, budgets, and donations.
            </p>
            <button
              disabled={sampleLoading}
              onClick={handleGenerateSampleData}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold shadow-sm transition-all"
            >
              {sampleLoading ? 'Generating...' : 'Generate Demo Data'}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white">Remove Demo Data</h4>
            <p className="text-[11px] text-slate-400">
              Clears all generated sample transactions and budgets while preserving all categories and schema.
            </p>
            <button
              disabled={sampleLoading}
              onClick={handleRemoveSampleData}
              className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-bold shadow-sm transition-all"
            >
              Remove Demo Data
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-2">
            <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400">Clear All Transactions</h4>
            <p className="text-[11px] text-slate-400">
              Wipes all transactions and budgets cleanly for a fresh personal tracking ledger.
            </p>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm transition-all"
            >
              Clear Ledger Data
            </button>
          </div>
        </div>
      </div>

      {/* Custom Category Management */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-emerald-500" />
            Custom Categories & Subcategories
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Extend default categories with your own custom tags and subcategories
          </p>
        </div>

        {/* Forms Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Category Form */}
          <form onSubmit={handleCreateCategory} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-white">Add New Main Category</h4>
            <div>
              <label className="block text-slate-500 mb-1">Category Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Pet Care, Gym & Fitness"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Type</label>
              <select
                value={newCatType}
                onChange={(e) => setNewCatType(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Initial Subcategories (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. Dog Food, Vet Visit, Toys"
                value={newCatSubcategories}
                onChange={(e) => setNewCatSubcategories(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <button
              type="submit"
              disabled={creatingCat}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm"
            >
              Create Category
            </button>
          </form>

          {/* Add Subcategory Form */}
          <form onSubmit={handleAddSubcategory} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-white">Add Subcategory to Existing Category</h4>
            <div>
              <label className="block text-slate-500 mb-1">Target Category</label>
              <select
                required
                value={targetCatId}
                onChange={(e) => setTargetCatId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              >
                <option value="">-- Choose Category --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-500 mb-1">New Subcategory Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Organic Dairy"
                value={newSubcatName}
                onChange={(e) => setNewSubcatName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-sm"
            >
              Add Subcategory
            </button>
          </form>
        </div>

        {/* Existing Categories Overview List */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
            Existing Active Categories ({categories.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map(cat => (
              <div key={cat.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800 dark:text-white">
                  <span>{cat.name}</span>
                  {!cat.is_system && (
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                      title="Delete Custom Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  {cat.subcategories?.length || 0} subcategories &bull; <span className="capitalize">{cat.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Clear Data */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="w-8 h-8" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Reset Database?</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              This will permanently delete all transactions, budgets, and recurring items from your local database. Your categories will remain intact.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={clearing}
                onClick={handleClearAllData}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md"
              >
                {clearing ? 'Clearing...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { categoriesApi } from '../api/client';

const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filter, setFilter] = useState('this_month');
  const [customDates, setCustomDates] = useState({ startDate: '', endDate: '' });
  
  // Add/Edit modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalDefaults, setModalDefaults] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Simple Notification Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadCategories = useCallback(async () => {
    try {
      const res = await categoriesApi.list();
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const openAddModal = (defaults = null) => {
    setEditingTransaction(null);
    setModalDefaults(defaults);
    setIsAddModalOpen(true);
  };

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setModalDefaults(null);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setEditingTransaction(null);
    setModalDefaults(null);
  };

  // Indian Rupee Currency Formatter
  const formatCurrency = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <FinanceContext.Provider
      value={{
        categories,
        refreshCategories: loadCategories,
        refreshTrigger,
        triggerRefresh,
        filter,
        setFilter,
        customDates,
        setCustomDates,
        isAddModalOpen,
        openAddModal,
        openEditModal,
        closeAddModal,
        modalDefaults,
        editingTransaction,
        formatCurrency,
        showToast,
        toast,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);

import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';
import AddTransactionModal from './components/Transactions/AddTransactionModal';
import ImportExportModal from './components/Transactions/ImportExportModal';

// Views
import DashboardView from './components/Views/DashboardView';
import CategorySpecificView from './components/Views/CategorySpecificView';
import DonationsView from './components/Views/DonationsView';
import IncomeView from './components/Views/IncomeView';
import BudgetView from './components/Views/BudgetView';
import SavingsView from './components/Views/SavingsView';
import TransactionsView from './components/Views/TransactionsView';
import ReportsView from './components/Views/ReportsView';
import CalendarView from './components/Views/CalendarView';
import RecurringView from './components/Views/RecurringView';
import SettingsBackupView from './components/Views/SettingsBackupView';

import {
  User,
  Utensils,
  Car,
  ShoppingBag,
  ShoppingCart,
  Receipt,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const { toast } = useFinance();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'personal':
        return (
          <CategorySpecificView
            categoryName="Personal Expenses"
            icon={User}
            description="Manage clothing, mobile recharge, personal care, medical, and entertainment"
          />
        );
      case 'food':
        return (
          <CategorySpecificView
            categoryName="Food & Dining"
            icon={Utensils}
            description="Track restaurants, cafes, Swiggy, Zomato, snacks, and dining out"
          />
        );
      case 'travel':
        return (
          <CategorySpecificView
            categoryName="Travel & Transportation"
            icon={Car}
            description="Track petrol/diesel, Uber/Ola, FASTag toll, flights, train, and vehicle service"
          />
        );
      case 'shopping':
        return (
          <CategorySpecificView
            categoryName="Shopping"
            icon={ShoppingBag}
            description="Track electronics, Amazon, Flipkart, apparel, appliances, and accessories"
          />
        );
      case 'groceries':
        return (
          <CategorySpecificView
            categoryName="Groceries & Household"
            icon={ShoppingCart}
            description="Track vegetables, milk, daily staples, DMart, Blinkit, and kitchen essentials"
          />
        );
      case 'donations':
        return <DonationsView />;
      case 'bills':
        return (
          <CategorySpecificView
            categoryName="Bills & Utilities"
            icon={Receipt}
            description="Track electricity, broadband, rent, loan EMI, gas, and recurring utilities"
          />
        );
      case 'income':
        return <IncomeView />;
      case 'budgets':
        return <BudgetView />;
      case 'savings':
        return <SavingsView />;
      case 'transactions':
        return <TransactionsView />;
      case 'reports':
        return <ReportsView />;
      case 'calendar':
        return <CalendarView />;
      case 'settings':
        return <SettingsBackupView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          collapsed={sidebarCollapsed}
          onOpenImportExport={() => setShowImportExport(true)}
        />

        {/* View Container */}
        <main className="flex-1 mt-16 p-6 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Add/Edit Transaction Modal */}
      <AddTransactionModal />

      {/* Global Import/Export Modal */}
      <ImportExportModal
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
      />

      {/* Notification Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white">
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-500" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <FinanceProvider>
        <MainApp />
      </FinanceProvider>
    </ThemeProvider>
  );
}

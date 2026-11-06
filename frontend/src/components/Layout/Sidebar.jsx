import React from 'react';
import {
  LayoutDashboard,
  User,
  Utensils,
  Car,
  ShoppingBag,
  ShoppingCart,
  HeartHandshake,
  Receipt,
  TrendingUp,
  BarChart3,
  Target,
  PiggyBank,
  History,
  Calendar,
  Settings,
  Wallet,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'core' },
  { id: 'personal', label: 'Personal Expenses', icon: User, category: 'Personal Expenses', group: 'categories' },
  { id: 'food', label: 'Food & Dining', icon: Utensils, category: 'Food & Dining', group: 'categories' },
  { id: 'travel', label: 'Travel & Transport', icon: Car, category: 'Travel & Transportation', group: 'categories' },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag, category: 'Shopping', group: 'categories' },
  { id: 'groceries', label: 'Groceries & Household', icon: ShoppingCart, category: 'Groceries & Household', group: 'categories' },
  { id: 'donations', label: 'Donations & Charity', icon: HeartHandshake, category: 'Donations & Charity', group: 'categories' },
  { id: 'bills', label: 'Bills & Utilities', icon: Receipt, category: 'Bills & Utilities', group: 'categories' },
  { id: 'income', label: 'Income Sources', icon: TrendingUp, category: 'Income', group: 'categories' },
  
  { id: 'budgets', label: 'Budget Management', icon: Target, group: 'planning' },
  { id: 'savings', label: 'Savings & Overview', icon: PiggyBank, group: 'planning' },
  { id: 'transactions', label: 'Transaction History', icon: History, group: 'data' },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, group: 'data' },
  { id: 'calendar', label: 'Calendar View', icon: Calendar, group: 'data' },
  { id: 'settings', label: 'Settings & Backup', icon: Settings, group: 'system' },
];

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }) {
  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen transition-all duration-300 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 dark:text-white leading-tight tracking-tight text-base">
                FinTrack <span className="text-emerald-500 text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 ml-1">Local</span>
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Personal Finance</span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="w-full flex justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {/* Main Dashboard */}
        <NavItem
          item={NAV_ITEMS[0]}
          isActive={activeTab === 'dashboard'}
          collapsed={collapsed}
          onClick={() => setActiveTab('dashboard')}
        />

        {/* Section: Category Tabs */}
        {!collapsed && (
          <div className="pt-3 pb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Categories & Tracking
          </div>
        )}
        {NAV_ITEMS.filter(i => i.group === 'categories').map(item => (
          <NavItem
            key={item.id}
            item={item}
            isActive={activeTab === item.id}
            collapsed={collapsed}
            onClick={() => setActiveTab(item.id)}
          />
        ))}

        {/* Section: Planning & Overview */}
        {!collapsed && (
          <div className="pt-3 pb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Planning & Overview
          </div>
        )}
        {NAV_ITEMS.filter(i => i.group === 'planning').map(item => (
          <NavItem
            key={item.id}
            item={item}
            isActive={activeTab === item.id}
            collapsed={collapsed}
            onClick={() => setActiveTab(item.id)}
          />
        ))}

        {/* Section: Analytics & Records */}
        {!collapsed && (
          <div className="pt-3 pb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Records & Analytics
          </div>
        )}
        {NAV_ITEMS.filter(i => i.group === 'data').map(item => (
          <NavItem
            key={item.id}
            item={item}
            isActive={activeTab === item.id}
            collapsed={collapsed}
            onClick={() => setActiveTab(item.id)}
          />
        ))}

        {/* Section: System & Settings */}
        {!collapsed && (
          <div className="pt-3 pb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            System
          </div>
        )}
        {NAV_ITEMS.filter(i => i.group === 'system').map(item => (
          <NavItem
            key={item.id}
            item={item}
            isActive={activeTab === item.id}
            collapsed={collapsed}
            onClick={() => setActiveTab(item.id)}
          />
        ))}
      </div>

      {/* Footer / Status */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        {!collapsed ? (
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              SQLite Local DB
            </span>
            <span className="font-mono text-[11px] text-slate-400">v1.0</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Local DB Active"></span>
          </div>
        )}
      </div>
    </aside>
  );
}

function NavItem({ item, isActive, collapsed, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
        isActive
          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-semibold'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
      } ${collapsed ? 'justify-center px-0' : ''}`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </button>
  );
}

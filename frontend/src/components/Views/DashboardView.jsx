import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { dashboardApi } from '../../api/client';
import FinancialSummaryCards from '../Dashboard/FinancialSummaryCards';
import SmartInsightsBanner from '../Dashboard/SmartInsightsBanner';
import IncomeExpenseBarChart from '../Dashboard/IncomeExpenseBarChart';
import ExpenseDonutChart from '../Dashboard/ExpenseDonutChart';
import DailySpendingLineChart from '../Dashboard/DailySpendingLineChart';
import CategoryHorizontalBarChart from '../Dashboard/CategoryHorizontalBarChart';
import MonthlySavingsAreaChart from '../Dashboard/MonthlySavingsAreaChart';
import YearlyComparisonBarChart from '../Dashboard/YearlyComparisonBarChart';
import TopCategoriesCard from '../Dashboard/TopCategoriesCard';
import BudgetVsActualCard from '../Dashboard/BudgetVsActualCard';
import TransactionTable from '../Transactions/TransactionTable';
import { BarChart3, PieChart, TrendingUp, Target, Activity, Calendar } from 'lucide-react';

export default function DashboardView() {
  const { filter, customDates, refreshTrigger } = useFinance();
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [sumRes, chartRes, insRes] = await Promise.all([
          dashboardApi.getSummary(filter, customDates.startDate, customDates.endDate),
          dashboardApi.getCharts(filter, customDates.startDate, customDates.endDate),
          dashboardApi.getInsights()
        ]);
        if (isMounted) {
          setSummary(sumRes.data);
          setCharts(chartRes.data);
          setInsights(insRes.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [filter, customDates.startDate, customDates.endDate, refreshTrigger]);

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <FinancialSummaryCards summary={summary} loading={loading} />

      {/* Smart Insights & Spike Alerts */}
      <SmartInsightsBanner insights={insights} />

      {/* Charts Grid: Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Income vs Expense */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                Monthly Income vs Expense
              </h3>
              <p className="text-xs text-slate-400">12-month financial comparison</p>
            </div>
          </div>
          <IncomeExpenseBarChart data={charts?.monthly_income_vs_expense} />
        </div>

        {/* Chart 2: Expense Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-amber-500" />
                Expense Distribution
              </h3>
              <p className="text-xs text-slate-400">Category share for {summary?.filter_label || 'Current Period'}</p>
            </div>
          </div>
          <ExpenseDonutChart data={charts?.expense_distribution} />
        </div>
      </div>

      {/* Charts Grid: Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Daily Spending Trend */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                Daily Spending Trend
              </h3>
              <p className="text-xs text-slate-400">Daily expenses over {summary?.filter_label}</p>
            </div>
          </div>
          <DailySpendingLineChart data={charts?.daily_spending_trend} />
        </div>

        {/* Chart 4: Category-wise Expenses (Horizontal Bar) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-500" />
                Category-wise Expenses
              </h3>
              <p className="text-xs text-slate-400">Ranked by total outflow</p>
            </div>
          </div>
          <CategoryHorizontalBarChart data={charts?.category_expenses} />
        </div>
      </div>

      {/* Charts Grid: Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 5: Monthly Savings Trend */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-500" />
                Monthly Savings Trend
              </h3>
              <p className="text-xs text-slate-400">Net savings accumulation over time</p>
            </div>
          </div>
          <MonthlySavingsAreaChart data={charts?.monthly_savings_trend} />
        </div>

        {/* Chart 6: Yearly Expense Comparison */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Yearly Comparison
              </h3>
              <p className="text-xs text-slate-400">Annual income vs expenditure</p>
            </div>
          </div>
          <YearlyComparisonBarChart data={charts?.yearly_comparison} />
        </div>
      </div>

      {/* Charts Grid: Row 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 7: Top 5 Spending Categories */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-500" />
                Top 5 Spending Categories
              </h3>
              <p className="text-xs text-slate-400">Biggest expenditure contributors</p>
            </div>
          </div>
          <TopCategoriesCard categories={charts?.top_categories} />
        </div>

        {/* Chart 8: Budget vs Actual Spending */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                Budget vs Actual Spending
              </h3>
              <p className="text-xs text-slate-400">Current month limit utilization</p>
            </div>
          </div>
          <BudgetVsActualCard budgets={charts?.budget_vs_actual} />
        </div>
      </div>

      {/* Recent Transactions Table */}
      <TransactionTable
        title="Recent Transactions"
        itemsPerPage={8}
      />
    </div>
  );
}

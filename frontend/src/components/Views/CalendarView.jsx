import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { transactionsApi } from '../../api/client';

export default function CalendarView() {
  const { formatCurrency, refreshTrigger } = useFinance();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyData, setDailyData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedDayTxs, setSelectedDayTxs] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Compute days in month and start weekday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayWeekday = new Date(year, month, 1).getDay(); // 0 is Sunday

  useEffect(() => {
    let isMounted = true;
    async function loadMonthTransactions() {
      setLoading(true);
      try {
        const startStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const endStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

        const res = await transactionsApi.list({
          start_date: startStr,
          end_date: endStr,
          page_size: 200,
        });

        if (isMounted) {
          const map = {};
          (res.data.items || []).forEach(tx => {
            const dayKey = tx.date; // YYYY-MM-DD
            if (!map[dayKey]) map[dayKey] = { total: 0, items: [] };
            if (tx.type === 'expense') {
              map[dayKey].total += tx.amount;
            }
            map[dayKey].items.push(tx);
          });
          setDailyData(map);
        }
      } catch (err) {
        console.error('Failed to load calendar data', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadMonthTransactions();
    return () => { isMounted = false; };
  }, [year, month, daysInMonth, refreshTrigger]);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              {monthName} {year}
            </h2>
            <p className="text-xs text-slate-400">Click any date to inspect transactions</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayWeekday }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24 rounded-2xl bg-slate-50/40 dark:bg-slate-900/30 opacity-30" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const info = dailyData[dayStr];
            const hasSpend = info && info.total > 0;
            const isToday =
              new Date().toISOString().split('T')[0] === dayStr;

            return (
              <div
                key={dayStr}
                onClick={() => {
                  if (info && info.items.length > 0) {
                    setSelectedDayTxs({ date: dayStr, ...info });
                  }
                }}
                className={`h-24 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isToday
                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-sm'
                    : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      isToday
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {info && info.items.length > 0 && (
                    <span className="text-[10px] font-semibold text-slate-400">
                      {info.items.length} tx
                    </span>
                  )}
                </div>

                {hasSpend ? (
                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-rose-500 block truncate">
                      -{formatCurrency(info.total)}
                    </span>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-300 dark:text-slate-700 text-right">
                    —
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Drill-down Modal */}
      {selectedDayTxs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  Transactions on {selectedDayTxs.date}
                </h3>
                <span className="text-xs text-rose-500 font-semibold">
                  Total Outflow: {formatCurrency(selectedDayTxs.total)}
                </span>
              </div>
              <button
                onClick={() => setSelectedDayTxs(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {selectedDayTxs.items.map(tx => (
                <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-white">
                      {tx.description}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {tx.category_name} &bull; {tx.payment_method} {tx.merchant ? `&bull; ${tx.merchant}` : ''}
                    </div>
                  </div>

                  <span
                    className={`font-extrabold text-sm ${
                      tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

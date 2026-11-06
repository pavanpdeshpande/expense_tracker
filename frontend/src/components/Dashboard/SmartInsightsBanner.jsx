import React from 'react';
import { Sparkles, AlertTriangle, AlertOctagon, TrendingUp, Info } from 'lucide-react';

export default function SmartInsightsBanner({ insights }) {
  if (!insights || insights.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'danger':
        return <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-indigo-500 shrink-0" />;
    }
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'danger':
        return 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200';
      case 'positive':
        return 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200';
      default:
        return 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/60 text-indigo-800 dark:text-indigo-200';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Sparkles className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">
          Smart Local Insights & Alerts
        </h3>
        <span className="text-[11px] text-slate-400 font-medium">Computed privately on your machine</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {insights.map((ins, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-2xl border flex items-start gap-3 text-xs ${getBadgeStyle(ins.type)}`}
          >
            {getIcon(ins.type)}
            <div>
              <h4 className="font-bold leading-tight mb-0.5">{ins.title}</h4>
              <p className="opacity-90 leading-relaxed text-[11px]">{ins.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

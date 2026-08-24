import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'red' | 'emerald' | 'amber' | 'blue' | 'indigo' | 'purple';
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'red',
  trend,
  onClick
}) => {
  const colorMap = {
    red: {
      bg: 'bg-blood-50',
      text: 'text-blood-600',
      border: 'border-blood-100',
      iconBg: 'bg-blood-100'
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-100'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
      iconBg: 'bg-amber-100'
    },
    blue: {
      bg: 'bg-sky-50',
      text: 'text-sky-600',
      border: 'border-sky-100',
      iconBg: 'bg-sky-100'
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
      iconBg: 'bg-indigo-100'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100',
      iconBg: 'bg-purple-100'
    }
  };

  const scheme = colorMap[color];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-lg ${scheme.iconBg} ${scheme.text}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</span>
        {trend && (
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
              trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-500 leading-relaxed">{subtitle}</p>}
    </div>
  );
};

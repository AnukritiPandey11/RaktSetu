import React from 'react';
import { BloodGroup, ComponentType, UnitStatus, UrgencyLevel, RequestStatus, SuggestionStatus, RiskLevel } from '../../types';

interface StatusBadgeProps {
  type?: 'status' | 'urgency' | 'risk' | 'blood' | 'component' | 'suggestion';
  value: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type = 'status', value, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs font-medium' : 'px-3 py-1 text-sm font-semibold';

  // Specific styles based on value & type
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  // Blood group badges
  if (type === 'blood' || ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(value)) {
    return (
      <span className={`inline-flex items-center gap-1 font-bold rounded-md bg-blood-50 text-blood-700 border border-blood-200 shadow-sm ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-blood-600"></span>
        {value}
      </span>
    );
  }

  // Component badges
  if (type === 'component' || ['Whole Blood', 'Plasma', 'Platelets', 'RBC'].includes(value)) {
    const compColors: Record<string, string> = {
      'Whole Blood': 'bg-red-50 text-red-700 border-red-200',
      'RBC': 'bg-rose-50 text-rose-700 border-rose-200',
      'Platelets': 'bg-amber-50 text-amber-800 border-amber-200',
      'Plasma': 'bg-amber-50 text-yellow-800 border-yellow-200'
    };
    return (
      <span className={`inline-flex items-center rounded-md border font-medium ${compColors[value] || 'bg-slate-100 text-slate-700'} ${sizeClasses}`}>
        {value}
      </span>
    );
  }

  // Urgency / Risk Badges
  if (type === 'urgency' || type === 'risk') {
    switch (value) {
      case 'Critical':
        colorClasses = 'bg-red-100 text-red-800 border-red-300 animate-pulse';
        break;
      case 'High':
        colorClasses = 'bg-orange-100 text-orange-800 border-orange-300';
        break;
      case 'Medium':
        colorClasses = 'bg-amber-100 text-amber-800 border-amber-300';
        break;
      case 'Low':
        colorClasses = 'bg-emerald-100 text-emerald-800 border-emerald-300';
        break;
    }
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border font-semibold ${colorClasses} ${sizeClasses}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${value === 'Critical' ? 'bg-red-600' : value === 'High' ? 'bg-orange-500' : value === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
        {value} {type === 'risk' ? 'Risk' : ''}
      </span>
    );
  }

  // Status badges
  switch (value) {
    case 'Available':
    case 'Approved':
    case 'Fulfilled':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'Pending':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'Reserved':
    case 'In Transit':
      colorClasses = 'bg-sky-50 text-sky-700 border-sky-200';
      break;
    case 'Transferred':
      colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      break;
    case 'Rejected':
    case 'Expired':
    case 'Cancelled':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
    default:
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  return (
    <span className={`inline-flex items-center rounded-md border font-medium ${colorClasses} ${sizeClasses}`}>
      {value}
    </span>
  );
};

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { BloodBank, BloodGroup } from '../../types';
import { DemandForecastResult, DayForecast } from '../../services/ai/types';
import { calculateDemandForecast } from '../../services/ai/demandForecast';
import { dbRequests, dbHospitals } from '../../services/db';
import { Sparkles, TrendingUp, Calendar } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface DemandForecastChartProps {
  selectedBank: BloodBank;
  availableBanks?: BloodBank[];
  onSelectBank?: (bank: BloodBank) => void;
  showBankSelector?: boolean;
}

export const DemandForecastChart: React.FC<DemandForecastChartProps> = ({
  selectedBank,
  availableBanks,
  onSelectBank,
  showBankSelector = false
}) => {
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O+');

  const activeRequests = dbRequests.getAll();
  const hospitals = dbHospitals.getAll();

  const forecast: DemandForecastResult = calculateDemandForecast(
    selectedBank,
    selectedGroup,
    activeRequests,
    hospitals
  );

  const chartData = forecast.dailyForecast.map((d: DayForecast) => ({
    dayName: `${d.dayName} (D${d.dayIndex})`,
    demand: d.predictedDemand,
    date: d.date
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blood-50 text-blood-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              7-Day Demand Forecast
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blood-100 text-blood-800 font-bold">
                AI Engine Active
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Facility: <strong>{selectedBank.name}</strong> • Projected draw: <strong>{forecast.total7DayDemand} units</strong> over 7 days
          </p>
        </div>

        {/* Blood Bank Selector (if allowed) */}
        {showBankSelector && availableBanks && onSelectBank && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">Center:</label>
            <select
              value={selectedBank.id}
              onChange={e => {
                const found = availableBanks.find(b => b.id === e.target.value);
                if (found) onSelectBank(found);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blood-500"
            >
              {availableBanks.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Blood Group Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Group:</span>
        {(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as BloodGroup[]).map(bg => (
          <button
            key={bg}
            onClick={() => setSelectedGroup(bg)}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
              selectedGroup === bg
                ? 'bg-blood-600 text-white border-blood-500 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {bg}
          </button>
        ))}
      </div>

      {/* Chart Canvas */}
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="dayName" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '12px',
                border: 'none'
              }}
              formatter={(val: any) => [`${val} Units`, 'Projected Demand']}
            />
            <Bar dataKey="demand" fill="#e11d48" radius={[6, 6, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Explanation & AI Confidence Footer */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-600 bg-slate-50/60 p-3 rounded-xl">
        <div className="flex items-start gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blood-600 shrink-0 mt-0.5" />
          <span>{forecast.reason}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 font-semibold text-slate-700">
          <span>AI Model Confidence:</span>
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
            {forecast.confidenceScore}%
          </span>
        </div>
      </div>
    </div>
  );
};

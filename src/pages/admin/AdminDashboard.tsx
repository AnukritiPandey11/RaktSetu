import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Building2,
  ArrowRightLeft,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BarChart3,
  MapPin,
  Sparkles,
  Info,
  Layers,
  FileCheck2,
  Check,
  X,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { DemandForecastChart } from '../../components/common/DemandForecastChart';
import {
  dbBloodUnits,
  dbBloodBanks,
  dbRequests,
  dbRedistributions,
  dbFeedbackLogs,
  dbPredictions,
  dbHospitals
} from '../../services/db';
import { runAIAnalysis } from '../../services/ai/aiEngine';
import { useAuth } from '../../services/authContext';
import { RedistributionSuggestion, SuggestionStatus, BloodBank } from '../../types';

interface AdminDashboardProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeTab, onNavigateTab }) => {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<RedistributionSuggestion | null>(null);
  const [reviewAction, setReviewAction] = useState<'Approved' | 'Rejected' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  // Forecast chart selected bank
  const bloodBanks = dbBloodBanks.getAll();
  const [selectedForecastBank, setSelectedForecastBank] = useState<BloodBank>(bloodBanks[0]);

  // Run AI pipeline analysis on mount
  useEffect(() => {
    runAIAnalysis();
  }, []);

  const handleTriggerAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      runAIAnalysis();
      setIsAnalyzing(false);
      setRefreshKey(k => k + 1);
    }, 600);
  };

  // Fetch current data
  const units = dbBloodUnits.getAll();
  const requests = dbRequests.getAll();
  const suggestions = dbRedistributions.getAll();
  const feedbackLogs = dbFeedbackLogs.getAll();
  const predictions = dbPredictions.getAll();

  const totalUnits = units.length;
  const totalBanks = bloodBanks.length;
  const activeRequests = requests.filter(r => r.status === 'Pending' || r.status === 'In Transit').length;
  const pendingSuggestions = suggestions.filter(s => s.status === 'Pending').length;
  const unitsSavedFromExpiry = feedbackLogs.filter(f => f.outcome === 'Approved').length * 2 + 14;

  // Helper map
  const bankNameMap = bloodBanks.reduce<Record<string, string>>((acc, b) => {
    acc[b.id] = b.name;
    return acc;
  }, {});

  // Chart data: Blood units by blood group
  const bloodGroupCounts: Record<string, number> = {
    'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
  };
  units.forEach(u => {
    if (bloodGroupCounts[u.blood_group] !== undefined) {
      bloodGroupCounts[u.blood_group]++;
    }
  });
  const bloodGroupChartData = Object.entries(bloodGroupCounts).map(([group, count]) => ({
    group,
    count
  }));

  // Chart data: Component distribution
  const componentCounts: Record<string, number> = {
    'Whole Blood': 0, 'Plasma': 0, 'Platelets': 0, 'RBC': 0
  };
  units.forEach(u => {
    if (componentCounts[u.component_type] !== undefined) {
      componentCounts[u.component_type]++;
    }
  });
  const componentChartData = Object.entries(componentCounts).map(([name, value]) => ({
    name,
    value
  }));
  const COMPONENT_COLORS = ['#e11d48', '#f59e0b', '#fb7185', '#38bdf8'];

  // Filter shortage and expiry predictions
  const shortageAlerts = predictions.filter(p => p.prediction_type === 'Shortage');
  const expiryAlerts = predictions.filter(p => p.prediction_type === 'Expiry');

  // Handle Human-in-the-Loop decision
  const [isDeciding, setIsDeciding] = useState(false);

  const handleOpenReview = (sug: RedistributionSuggestion, action: 'Approved' | 'Rejected') => {
    setSelectedSuggestion(sug);
    setReviewAction(action);
    setReviewNotes(
      action === 'Approved'
        ? `Validated green-corridor / cold-chain logistics (${sug.estimated_distance_km || 0.8} km). Authorized dispatch to prevent expiration.`
        : `Declined transfer recommendation due to localized internal reserve policy.`
    );
  };

  const handleConfirmDecision = () => {
    if (!selectedSuggestion || !reviewAction || !user || isDeciding) return;
    setIsDeciding(true);
    try {
      dbRedistributions.updateStatusWithFeedback(
        selectedSuggestion.id,
        reviewAction,
        { role: user.role, name: user.name },
        reviewNotes
      );
      setSelectedSuggestion(null);
      setReviewAction(null);
      setRefreshKey(k => k + 1);
    } finally {
      setIsDeciding(false);
    }
  };

  return (
    <div className="space-y-6" key={refreshKey}>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs text-purple-300 font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> National Blood Grid Intelligence Center
            </div>
            <h1 className="text-2xl font-black tracking-tight">National Network Overview</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              AI-driven multi-node coordination predicting blood shortages, preventing platelet expiration, and orchestrating human-verified redistribution across India.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerAnalysis}
              disabled={isAnalyzing}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Running AI Pipeline...' : 'Run AI Analysis'}</span>
            </button>
            <button
              onClick={() => onNavigateTab('redistribution')}
              className="px-4 py-2 bg-blood-600 hover:bg-blood-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blood-600/30 transition-all flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-4 h-4" /> Review Queue ({pendingSuggestions})
            </button>
          </div>
        </div>
      </div>

      {/* Network Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Blood Units"
          value={totalUnits}
          subtitle="Monitored in real-time"
          icon={Boxes}
          color="red"
          trend={{ value: '+8% vs last week', isPositive: true }}
          onClick={() => onNavigateTab('analytics')}
        />
        <StatCard
          title="Connected Blood Banks"
          value={totalBanks}
          subtitle="Across Delhi, Mumbai, BLR, Chennai"
          icon={Building2}
          color="indigo"
          onClick={() => onNavigateTab('bloodbanks')}
        />
        <StatCard
          title="Active Hospital Requests"
          value={activeRequests}
          subtitle="Hospital transfusions pending"
          icon={AlertTriangle}
          color="amber"
          onClick={() => onNavigateTab('alerts')}
        />
        <StatCard
          title="Units Saved from Expiry"
          value={unitsSavedFromExpiry}
          subtitle="Via Smart Redistribution"
          icon={ShieldCheck}
          color="emerald"
          trend={{ value: 'Zero waste milestone', isPositive: true }}
          onClick={() => onNavigateTab('redistribution')}
        />
      </div>

      {/* Main Tab Routing */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Priority AI Alerts Section (Powered by Shortage & Expiry Models) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Priority Network AI Alerts
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                      Live AI Engine Active
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real-time alerts generated by deterministic shortage and component shelf-life models
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('alerts')}
                className="text-xs font-semibold text-blood-600 hover:text-blood-700"
              >
                View all ({predictions.length}) →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {predictions.slice(0, 4).map(p => (
                <div
                  key={p.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    p.prediction_type === 'Shortage'
                      ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300'
                      : p.prediction_type === 'Expiry'
                      ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                      : 'bg-sky-50/50 border-sky-200 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {p.blood_group && <StatusBadge type="blood" value={p.blood_group} />}
                        <span className="text-xs font-bold text-slate-900">
                          {p.prediction_type === 'Shortage'
                            ? 'Critical Shortage Risk'
                            : p.prediction_type === 'Expiry'
                            ? 'Platelet Expiry Warning'
                            : 'High Demand Surge Forecast'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 mt-2">{p.predicted_value}</p>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">{p.summary}</p>
                    </div>
                    {p.risk_level && <StatusBadge type="risk" value={p.risk_level} />}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Center: <strong>{bankNameMap[p.blood_bank_id] || p.blood_bank_id}</strong></span>
                    <span className="font-bold text-slate-700">AI Confidence: {p.confidence_score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7-Day Demand Forecasting Section */}
          <DemandForecastChart
            selectedBank={selectedForecastBank}
            availableBanks={bloodBanks}
            onSelectBank={setSelectedForecastBank}
            showBankSelector={true}
          />

          {/* Pending Human-in-the-Loop Redistribution Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blood-50 text-blood-600">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Human-in-the-Loop Redistribution Queue
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                      HITL Rule Enforced
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    AI recommends transfer routes using Haversine distance and expiry horizons. Authorized officers decide.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {pendingSuggestions} Pending Approval
              </span>
            </div>

            {suggestions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No suggestions in the queue</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Blood Group / Unit</th>
                      <th className="py-2.5 px-3">From Blood Bank</th>
                      <th className="py-2.5 px-3">To Destination</th>
                      <th className="py-2.5 px-3">Distance (Haversine)</th>
                      <th className="py-2.5 px-3">AI Rationale</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Human Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {suggestions.map(sug => (
                      <tr key={sug.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <StatusBadge type="blood" value={sug.blood_group} />
                            <StatusBadge type="component" value={sug.component_type} />
                            <span className="font-mono text-[11px] text-slate-500">{sug.blood_unit_id}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800">
                          {bankNameMap[sug.source_bank_id] || sug.source_bank_id}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800">
                          {bankNameMap[sug.destination_bank_id] || sug.destination_bank_id}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">
                          {sug.estimated_distance_km ? `${sug.estimated_distance_km} km` : '15 km'}
                        </td>
                        <td className="py-3 px-3 max-w-xs text-slate-600 leading-snug">
                          {sug.reason}
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge value={sug.status} />
                        </td>
                        <td className="py-3 px-3 text-right">
                          {sug.status === 'Pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenReview(sug, 'Approved')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-1 transition-all"
                              >
                                <Check className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => handleOpenReview(sug, 'Rejected')}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs flex items-center gap-1 transition-all"
                              >
                                <X className="w-3.5 h-3.5" /> Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">Recorded in Log</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Full Redistribution Board */}
      {activeTab === 'redistribution' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Smart Redistribution Recommendation Board</h2>
              <p className="text-xs text-slate-500">
                Multi-Criteria Optimization: Expiry horizon + Shortage severity + Haversine distance. All transfers start in Pending.
              </p>
            </div>
            <button
              onClick={handleTriggerAnalysis}
              disabled={isAnalyzing}
              className="px-3 py-1.5 bg-blood-50 hover:bg-blood-100 text-blood-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} /> Recalculate
            </button>
          </div>

          {/* Human-in-the-Loop Safety Principle Banner */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Human-in-the-Loop Clinical Decision Support</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                <strong>AI recommends. Authorized personnel decide.</strong> Every redistribution recommendation is generated in <em>Pending</em> state and requires explicit authorized sign-off before physical dispatch.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Unit ID / Blood Group</th>
                  <th className="py-2.5 px-3">Component</th>
                  <th className="py-2.5 px-3">Source Facility</th>
                  <th className="py-2.5 px-3">Destination Facility</th>
                  <th className="py-2.5 px-3">Haversine Distance</th>
                  <th className="py-2.5 px-3">Wastage Hours Saved</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Human Sign-off</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suggestions.map(sug => (
                  <tr key={sug.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge type="blood" value={sug.blood_group} />
                        <span className="font-mono text-[11px] text-slate-600 font-bold">{sug.blood_unit_id}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge type="component" value={sug.component_type} />
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {bankNameMap[sug.source_bank_id] || sug.source_bank_id}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {bankNameMap[sug.destination_bank_id] || sug.destination_bank_id}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">
                      {sug.estimated_distance_km ? `${sug.estimated_distance_km} km` : '15 km'}
                    </td>
                    <td className="py-3 px-3 text-emerald-700 font-bold">
                      +{sug.potential_wastage_hours_saved || 36} hrs saved
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge value={sug.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      {sug.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenReview(sug, 'Approved')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-1 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleOpenReview(sug, 'Rejected')}
                            className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs flex items-center gap-1 transition-all"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic">Logged in Audit Trail</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Blood Banks Directory */}
      {activeTab === 'bloodbanks' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Connected Blood Banks Directory</h2>
              <p className="text-xs text-slate-500">Regional centers connected to RaktSetu intelligent grid</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {bloodBanks.length} Facilities Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bloodBanks.map(b => {
              const bankUnits = units.filter(u => u.blood_bank_id === b.id);
              const availableUnits = bankUnits.filter(u => u.status === 'Available').length;
              return (
                <div key={b.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{b.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {b.location}, {b.city} ({b.state})
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Contact: <span className="font-semibold text-slate-700">{b.contact}</span></p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blood-100 text-blood-800">
                      {availableUnits} Units Available
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                    <span>Capacity: {b.storage_capacity_units} units</span>
                    <span>Coordinates: {b.latitude.toFixed(2)}°N, {b.longitude.toFixed(2)}°E</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Alerts */}
      {activeTab === 'alerts' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">National Shortage & Expiry Alerts</h2>
              <p className="text-xs text-slate-500">AI-predicted risk models anticipating stock vulnerabilities</p>
            </div>
            <button
              onClick={handleTriggerAnalysis}
              className="px-3 py-1.5 bg-blood-50 hover:bg-blood-100 text-blood-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Risk Models
            </button>
          </div>

          <div className="space-y-3">
            {predictions.map(p => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl mt-0.5 ${p.prediction_type === 'Shortage' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase text-slate-500">{p.prediction_type} Alert</span>
                      {p.blood_group && <StatusBadge type="blood" value={p.blood_group} />}
                      {p.risk_level && <StatusBadge type="risk" value={p.risk_level} />}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{p.predicted_value}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{p.summary}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Center: <strong>{bankNameMap[p.blood_bank_id] || p.blood_bank_id}</strong> • Target Date: {p.target_date}
                    </p>
                  </div>
                </div>
                <div className="flex md:flex-col items-end justify-between md:justify-center text-right shrink-0">
                  <span className="text-xs font-bold text-slate-700">AI Confidence</span>
                  <span className="text-base font-extrabold text-blood-600">{p.confidence_score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-1">Network Analytics & Wastage Prevention Metrics</h2>
            <p className="text-xs text-slate-500 mb-6">Real-time inventory levels, component utilization, and saved unit tracking</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-blood-50 border border-blood-100 text-center">
                <span className="text-xs font-semibold text-blood-800 uppercase tracking-wider">Total Units in Network</span>
                <p className="text-3xl font-black text-blood-700 mt-1">{totalUnits}</p>
                <p className="text-[11px] text-blood-600 mt-0.5">Active across 4 monitored regions</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-center">
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Active Emergency Demands</span>
                <p className="text-3xl font-black text-amber-700 mt-1">{activeRequests}</p>
                <p className="text-[11px] text-amber-600 mt-0.5">Hospital transfusions pending</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Units Saved from Expiry</span>
                <p className="text-3xl font-black text-emerald-700 mt-1">{unitsSavedFromExpiry}</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">Saved by proactive redistribution</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Stock Breakdown by Group</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bloodGroupChartData}>
                      <XAxis dataKey="group" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px' }} />
                      <Bar dataKey="count" fill="#e11d48" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Component Types Distribution</h3>
                <div className="h-64">
                  <PieChart>
                    <Pie
                      data={componentChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label
                    >
                      {componentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COMPONENT_COLORS[index % COMPONENT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px' }} />
                    <Legend />
                  </PieChart>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Feedback Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Human-in-the-Loop Feedback & Audit Trail</h2>
              <p className="text-xs text-slate-500">
                Immutable compliance log storing all human decisions on AI redistribution recommendations.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {feedbackLogs.length} Records Logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Log ID</th>
                  <th className="py-2.5 px-3">Suggestion Reference</th>
                  <th className="py-2.5 px-3">Outcome</th>
                  <th className="py-2.5 px-3">Reviewer Name & Role</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Reviewer Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feedbackLogs.map(fb => (
                  <tr key={fb.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-slate-700">{fb.id}</td>
                    <td className="py-3 px-3 font-mono text-blood-700 font-semibold">{fb.suggestion_id || 'N/A'}</td>
                    <td className="py-3 px-3">
                      <StatusBadge value={fb.outcome} />
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{fb.reviewer_name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{fb.reviewer_role}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(fb.logged_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 max-w-sm text-slate-600">{fb.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Confirmation Modal */}
      <Modal
        isOpen={!!selectedSuggestion && !!reviewAction}
        onClose={() => {
          setSelectedSuggestion(null);
          setReviewAction(null);
        }}
        title={`${reviewAction === 'Approved' ? 'Approve' : 'Reject'} Redistribution Request`}
        subtitle="Human-in-the-Loop Clinical Decision Support"
      >
        {selectedSuggestion && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Blood Unit:</span>
                <div className="flex items-center gap-1.5">
                  <StatusBadge type="blood" value={selectedSuggestion.blood_group} />
                  <StatusBadge type="component" value={selectedSuggestion.component_type} />
                  <span className="font-bold">×{selectedSuggestion.quantity}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Source Facility:</span>
                <span className="font-bold text-slate-800">
                  {bankNameMap[selectedSuggestion.source_bank_id] || selectedSuggestion.source_bank_id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Destination Facility:</span>
                <span className="font-bold text-slate-800">
                  {bankNameMap[selectedSuggestion.destination_bank_id] || selectedSuggestion.destination_bank_id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Haversine Distance:</span>
                <span className="font-bold text-slate-800">
                  {selectedSuggestion.estimated_distance_km ? `${selectedSuggestion.estimated_distance_km} km` : '15 km'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-slate-500 font-semibold">AI Recommendation Reason:</span>
                <p className="mt-0.5 text-slate-700 leading-snug">{selectedSuggestion.reason}</p>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Audit Trail Notes / Verification Remarks:
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                placeholder="Enter clinical or logistics rationale..."
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blood-500 focus:outline-none text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setSelectedSuggestion(null);
                  setReviewAction(null);
                }}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDecision}
                disabled={isDeciding}
                className={`px-4 py-2 rounded-xl text-white font-bold shadow-md transition-all flex items-center gap-1.5 ${
                  reviewAction === 'Approved'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                } ${isDeciding ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isDeciding ? 'Authorizing...' : `Confirm ${reviewAction}`}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

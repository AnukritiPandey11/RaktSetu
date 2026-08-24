import React, { useState, useEffect } from 'react';
import {
  Boxes,
  PlusCircle,
  TrendingUp,
  ArrowRightLeft,
  AlertTriangle,
  Clock,
  Filter,
  Check,
  X,
  Edit2,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { DemandForecastChart } from '../../components/common/DemandForecastChart';
import {
  dbBloodUnits,
  dbBloodBanks,
  dbRedistributions,
  dbPredictions,
  dbFeedbackLogs,
  dbRequests
} from '../../services/db';
import { runAIAnalysis } from '../../services/ai/aiEngine';
import { calculateExpiryPrediction } from '../../services/ai/expiryPrediction';
import { useAuth } from '../../services/authContext';
import {
  BloodUnit,
  BloodGroup,
  ComponentType,
  UnitStatus,
  RedistributionSuggestion
} from '../../types';

interface BloodBankDashboardProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
}

export const BloodBankDashboard: React.FC<BloodBankDashboardProps> = ({ activeTab, onNavigateTab }) => {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  // Filter states
  const [filterGroup, setFilterGroup] = useState<string>('ALL');
  const [filterComponent, setFilterComponent] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Add/Edit modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<BloodUnit | null>(null);

  // Form state
  const [formBloodGroup, setFormBloodGroup] = useState<BloodGroup>('O+');
  const [formComponent, setFormComponent] = useState<ComponentType>('Whole Blood');
  const [formVolume, setFormVolume] = useState<number>(350);
  const [formCollectionDate, setFormCollectionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formExpiryDate, setFormExpiryDate] = useState<string>('');
  const [formStatus, setFormStatus] = useState<UnitStatus>('Available');
  const [formBarcode, setFormBarcode] = useState<string>('');

  // Human-in-the-loop redistribution review
  const [selectedSuggestion, setSelectedSuggestion] = useState<RedistributionSuggestion | null>(null);
  const [reviewAction, setReviewAction] = useState<'Approved' | 'Rejected' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const currentBankId = user?.entity_id || 'bb-1';
  const allBanks = dbBloodBanks.getAll();
  const currentBank = dbBloodBanks.getById(currentBankId) || allBanks[0];
  const bankNameMap = allBanks.reduce<Record<string, string>>((acc, b) => {
    acc[b.id] = b.name;
    return acc;
  }, {});

  const allUnits = dbBloodUnits.getAll();
  const activeRequests = dbRequests.getAll();
  const myUnits = allUnits.filter(u => u.blood_bank_id === currentBank.id);
  const availableUnits = myUnits.filter(u => u.status === 'Available');

  // Trigger AI analysis on mount
  useEffect(() => {
    runAIAnalysis();
  }, []);

  // Redirection suggestions involving this bank
  const mySuggestions = dbRedistributions.getByBankId(currentBank.id);
  const incomingSuggestions = mySuggestions.filter(s => s.destination_bank_id === currentBank.id);
  const outgoingSuggestions = mySuggestions.filter(s => s.source_bank_id === currentBank.id);

  // Live Predictions for this bank
  const predictions = dbPredictions.getByBankId(currentBank.id);

  // Helper to calculate days remaining until expiry
  const getDaysRemaining = (expiryDateStr: string) => {
    const today = new Date('2026-08-24T00:00:00'); // Consistent baseline
    const expiry = new Date(expiryDateStr);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Filtered unit list
  const filteredUnits = myUnits.filter(u => {
    if (filterGroup !== 'ALL' && u.blood_group !== filterGroup) return false;
    if (filterComponent !== 'ALL' && u.component_type !== filterComponent) return false;
    if (filterStatus !== 'ALL' && u.status !== filterStatus) return false;
    return true;
  });

  // Calculate default expiry date when component changes
  const calculateDefaultExpiry = (comp: ComponentType, collDate: string) => {
    const d = new Date(collDate);
    if (comp === 'Platelets') d.setDate(d.getDate() + 5);
    else if (comp === 'Whole Blood') d.setDate(d.getDate() + 35);
    else if (comp === 'RBC') d.setDate(d.getDate() + 42);
    else if (comp === 'Plasma') d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  };

  const handleOpenAddModal = (unit?: BloodUnit) => {
    if (unit) {
      setEditingUnit(unit);
      setFormBloodGroup(unit.blood_group);
      setFormComponent(unit.component_type);
      setFormVolume(unit.volume_ml || 350);
      setFormCollectionDate(unit.collection_date);
      setFormExpiryDate(unit.expiry_date);
      setFormStatus(unit.status);
      setFormBarcode(unit.bag_barcode || '');
    } else {
      setEditingUnit(null);
      const today = new Date().toISOString().split('T')[0];
      setFormBloodGroup('O+');
      setFormComponent('Platelets');
      setFormVolume(250);
      setFormCollectionDate(today);
      setFormExpiryDate(calculateDefaultExpiry('Platelets', today));
      setFormStatus('Available');
      setFormBarcode(`RS-${currentBank.city.toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
    setIsAddModalOpen(true);
  };

  const [formError, setFormError] = useState<string | null>(null);
  const [isDeciding, setIsDeciding] = useState(false);

  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (formVolume < 50 || formVolume > 600) {
      setFormError('Unit volume must be between 50 mL and 600 mL.');
      return;
    }

    if (formExpiryDate && formExpiryDate < formCollectionDate) {
      setFormError('Expiry date cannot be earlier than collection date.');
      return;
    }

    if (editingUnit) {
      const updated: BloodUnit = {
        ...editingUnit,
        blood_group: formBloodGroup,
        component_type: formComponent,
        volume_ml: Number(formVolume),
        collection_date: formCollectionDate,
        expiry_date: formExpiryDate,
        status: formStatus,
        bag_barcode: formBarcode
      };
      dbBloodUnits.update(updated);
    } else {
      const newUnit: BloodUnit = {
        id: `unit-${Date.now()}`,
        blood_bank_id: currentBank.id,
        blood_group: formBloodGroup,
        component_type: formComponent,
        volume_ml: Number(formVolume),
        collection_date: formCollectionDate,
        expiry_date: formExpiryDate || calculateDefaultExpiry(formComponent, formCollectionDate),
        status: formStatus,
        bag_barcode: formBarcode || `RS-${currentBank.city.toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`
      };
      dbBloodUnits.add(newUnit);
    }

    // Re-run AI analysis after modifying inventory
    runAIAnalysis();

    setIsAddModalOpen(false);
    setEditingUnit(null);
    setRefreshKey(k => k + 1);
  };

  const handleOpenReview = (sug: RedistributionSuggestion, action: 'Approved' | 'Rejected') => {
    setSelectedSuggestion(sug);
    setReviewAction(action);
    setReviewNotes(
      action === 'Approved'
        ? `Authorized by ${currentBank.name} dispatch authority. Green-corridor / cold-chain protocol activated.`
        : `Declined by ${currentBank.name} due to internal reserve allocation.`
    );
  };

  const handleConfirmDecision = () => {
    if (!selectedSuggestion || !reviewAction || !user || isDeciding) return;
    setIsDeciding(true);
    try {
      dbRedistributions.updateStatusWithFeedback(
        selectedSuggestion.id,
        reviewAction,
        { role: user.role, name: `${user.name} (${currentBank.name})` },
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
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-xs text-rose-300 font-semibold mb-2">
              <Building2 className="w-3.5 h-3.5" /> Licensed Regional Blood Centre
            </div>
            <h1 className="text-2xl font-black tracking-tight">{currentBank.name}</h1>
            <p className="text-xs text-slate-300 mt-1">
              Location: {currentBank.location}, {currentBank.city} • Hotline: {currentBank.contact}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2 bg-blood-600 hover:bg-blood-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blood-600/30 transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Add Blood Stock
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Stock Units"
          value={availableUnits.length}
          subtitle={`Total logged: ${myUnits.length}`}
          icon={Boxes}
          color="red"
          onClick={() => onNavigateTab('inventory')}
        />
        <StatCard
          title="Predicted Risk Alerts"
          value={predictions.length}
          subtitle="AI Shortage & Expiry Models"
          icon={TrendingUp}
          color="amber"
          onClick={() => onNavigateTab('predicted-risks')}
        />
        <StatCard
          title="Pending Incoming Transfers"
          value={incomingSuggestions.filter(s => s.status === 'Pending').length}
          subtitle="Inbound surplus blood"
          icon={ArrowRightLeft}
          color="indigo"
          onClick={() => onNavigateTab('redistribution')}
        />
        <StatCard
          title="Storage Utilization"
          value={`${Math.round((myUnits.length / (currentBank.storage_capacity_units || 2000)) * 100)}%`}
          subtitle={`Capacity: ${currentBank.storage_capacity_units} units`}
          icon={Layers}
          color="emerald"
          onClick={() => onNavigateTab('inventory')}
        />
      </div>

      {/* Dashboard Overview Tab */}
      {(activeTab === 'overview' || activeTab === 'inventory') && (
        <div className="space-y-6">
          {/* Predicted Risks Section (Connected to Live Shortage & Expiry Models) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Predicted Risks for {currentBank.city} Cluster
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                      Live AI Engine
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Deterministic evaluations for impending unit expiration and localized group deficits
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-medium">Real-time inference</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predictions.map(p => (
                <div
                  key={p.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    p.prediction_type === 'Expiry'
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {p.blood_group && <StatusBadge type="blood" value={p.blood_group} />}
                        <span className="text-xs font-bold text-slate-900">
                          {p.prediction_type === 'Expiry' ? 'Platelet Expiry Risk' : 'Projected Shortage Deficit'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 mt-2">{p.predicted_value}</p>
                      <p className="text-[11px] text-slate-600 mt-1">{p.summary}</p>
                    </div>
                    {p.risk_level && <StatusBadge type="risk" value={p.risk_level} />}
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Target Date: {p.target_date}</span>
                    <span className="font-bold text-slate-700">Model Confidence: {p.confidence_score}%</span>
                  </div>
                </div>
              ))}

              {predictions.length === 0 && (
                <div className="col-span-2 p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                  No critical risks flagged for this facility currently.
                </div>
              )}
            </div>
          </div>

          {/* 7-Day Demand Forecast Chart for this Blood Bank */}
          <DemandForecastChart selectedBank={currentBank} showBankSelector={false} />

          {/* Blood Stock Inventory Table with Live Expiry Risk Badges */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Live Blood Inventory Management</h2>
                <p className="text-xs text-slate-500">Traceability with AI-computed expiry risk scoring per unit</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenAddModal()}
                  className="px-3 py-1.5 bg-blood-600 hover:bg-blood-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> + New Unit
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Blood Group</label>
                <select
                  value={filterGroup}
                  onChange={e => setFilterGroup(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blood-500"
                >
                  <option value="ALL">All Blood Groups</option>
                  {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Component</label>
                <select
                  value={filterComponent}
                  onChange={e => setFilterComponent(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blood-500"
                >
                  <option value="ALL">All Components</option>
                  <option value="Whole Blood">Whole Blood</option>
                  <option value="Platelets">Platelets</option>
                  <option value="RBC">RBC</option>
                  <option value="Plasma">Plasma</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blood-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Transferred">Transferred</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>

            {/* Inventory List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Barcode / ID</th>
                    <th className="py-2.5 px-3">Blood Group</th>
                    <th className="py-2.5 px-3">Component</th>
                    <th className="py-2.5 px-3">Collection Date</th>
                    <th className="py-2.5 px-3">Expiry Date</th>
                    <th className="py-2.5 px-3">AI Expiry Risk</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUnits.map(unit => {
                    const daysRemaining = getDaysRemaining(unit.expiry_date);
                    const expiryAnalysis = calculateExpiryPrediction(unit, currentBank, activeRequests);

                    return (
                      <tr
                        key={unit.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          expiryAnalysis.riskLevel === 'High' && unit.status === 'Available' ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-slate-700">
                          {unit.bag_barcode || unit.id}
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge type="blood" value={unit.blood_group} />
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge type="component" value={unit.component_type} />
                        </td>
                        <td className="py-3 px-3 text-slate-500">{unit.collection_date}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-700">{unit.expiry_date}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                daysRemaining <= 2
                                  ? 'bg-rose-100 text-rose-700 animate-pulse'
                                  : daysRemaining <= 5
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {daysRemaining > 0 ? `${daysRemaining}d left` : 'Expired'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge type="risk" value={expiryAnalysis.riskLevel} />
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge value={unit.status} />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleOpenAddModal(unit)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                            title="Edit Unit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUnits.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                        No blood units found matching current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Stock Management Form */}
      {activeTab === 'manage-stock' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm max-w-2xl mx-auto space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Add or Update Blood Unit</h2>
            <p className="text-xs text-slate-500">Record newly collected donations or update unit storage status</p>
          </div>

          <form onSubmit={handleSaveUnit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={formBloodGroup}
                  onChange={e => setFormBloodGroup(e.target.value as BloodGroup)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blood-500 focus:outline-none"
                >
                  {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Component Type</label>
                <select
                  value={formComponent}
                  onChange={e => {
                    const comp = e.target.value as ComponentType;
                    setFormComponent(comp);
                    setFormExpiryDate(calculateDefaultExpiry(comp, formCollectionDate));
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blood-500 focus:outline-none"
                >
                  <option value="Whole Blood">Whole Blood (35 Days)</option>
                  <option value="Platelets">Platelets (5 Days - Fragile)</option>
                  <option value="RBC">RBC / Packed Cells (42 Days)</option>
                  <option value="Plasma">Fresh Frozen Plasma (365 Days)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Volume (mL)</label>
                <input
                  type="number"
                  value={formVolume}
                  onChange={e => setFormVolume(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blood-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bag Barcode / ID</label>
                <input
                  type="text"
                  value={formBarcode}
                  onChange={e => setFormBarcode(e.target.value)}
                  placeholder="RS-DEL-9901"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blood-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Collection Date</label>
                <input
                  type="date"
                  value={formCollectionDate}
                  onChange={e => {
                    setFormCollectionDate(e.target.value);
                    setFormExpiryDate(calculateDefaultExpiry(formComponent, e.target.value));
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blood-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={formExpiryDate}
                  onChange={e => setFormExpiryDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blood-500 focus:outline-none font-semibold text-blood-700"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Storage Status</label>
              <select
                value={formStatus}
                onChange={e => setFormStatus(e.target.value as UnitStatus)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blood-500 focus:outline-none"
              >
                <option value="Available">Available (Ready for Dispense/Redistribution)</option>
                <option value="Reserved">Reserved (Assigned to Patient)</option>
                <option value="Transferred">Transferred (In Inter-bank Transit)</option>
                <option value="Expired">Expired (Quarantined)</option>
              </select>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3 bg-blood-600 hover:bg-blood-500 text-white font-bold rounded-xl shadow-md transition-all text-sm"
              >
                Save Stock Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Redistribution Section (Incoming & Outgoing Suggestions) */}
      {activeTab === 'redistribution' && (
        <div className="space-y-6">
          {/* Incoming suggestions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Incoming Redistribution Suggestions</h2>
                <p className="text-xs text-slate-500">Transfers routed to this blood bank to address local deficits</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {incomingSuggestions.length} Total
              </span>
            </div>

            {incomingSuggestions.length === 0 ? (
              <p className="text-xs text-slate-400 p-6 text-center border rounded-xl border-dashed">
                No incoming transfer suggestions for this facility at present.
              </p>
            ) : (
              <div className="space-y-3">
                {incomingSuggestions.map(sug => (
                  <div key={sug.id} className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <StatusBadge type="blood" value={sug.blood_group} />
                        <StatusBadge type="component" value={sug.component_type} />
                        <span className="font-bold text-xs text-slate-900">×{sug.quantity} Units</span>
                        <StatusBadge value={sug.status} />
                      </div>
                      <p className="text-xs text-slate-700 mt-2">
                        From: <strong>{bankNameMap[sug.source_bank_id] || sug.source_bank_id}</strong> (Distance: {sug.estimated_distance_km ? `${sug.estimated_distance_km} km` : '15 km'})
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{sug.reason}</p>
                    </div>

                    {sug.status === 'Pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenReview(sug, 'Approved')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                        >
                          <Check className="w-3.5 h-3.5" /> Accept Inbound
                        </button>
                        <button
                          onClick={() => handleOpenReview(sug, 'Rejected')}
                          className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg font-bold text-xs flex items-center gap-1 transition-all"
                        >
                          <X className="w-3.5 h-3.5" /> Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing suggestions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Outgoing Redistribution Suggestions</h2>
                <p className="text-xs text-slate-500">Transfers proposed to dispatch surplus or expiring stock to other centers</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {outgoingSuggestions.length} Total
              </span>
            </div>

            {outgoingSuggestions.length === 0 ? (
              <p className="text-xs text-slate-400 p-6 text-center border rounded-xl border-dashed">
                No outgoing transfer suggestions currently active.
              </p>
            ) : (
              <div className="space-y-3">
                {outgoingSuggestions.map(sug => (
                  <div key={sug.id} className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <StatusBadge type="blood" value={sug.blood_group} />
                        <StatusBadge type="component" value={sug.component_type} />
                        <span className="font-bold text-xs text-slate-900">×{sug.quantity} Units</span>
                        <StatusBadge value={sug.status} />
                      </div>
                      <p className="text-xs text-slate-700 mt-2">
                        Destination: <strong>{bankNameMap[sug.destination_bank_id] || sug.destination_bank_id}</strong> (Distance: {sug.estimated_distance_km ? `${sug.estimated_distance_km} km` : '15 km'})
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{sug.reason}</p>
                    </div>

                    {sug.status === 'Pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenReview(sug, 'Approved')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                        >
                          <Check className="w-3.5 h-3.5" /> Authorize Dispatch
                        </button>
                        <button
                          onClick={() => handleOpenReview(sug, 'Rejected')}
                          className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg font-bold text-xs flex items-center gap-1 transition-all"
                        >
                          <X className="w-3.5 h-3.5" /> Reject Dispatch
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Predicted Risks dedicated */}
      {activeTab === 'predicted-risks' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Predicted Risks (Live AI Engine)</h2>
            <p className="text-xs text-slate-500">
              Anticipated shortages and expiration horizons for {currentBank.name}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {predictions.map(p => (
              <div
                key={p.id}
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {p.blood_group && <StatusBadge type="blood" value={p.blood_group} />}
                    <span className="font-bold text-sm text-slate-900">{p.prediction_type} Horizon</span>
                  </div>
                  {p.risk_level && <StatusBadge type="risk" value={p.risk_level} />}
                </div>

                <p className="text-sm font-semibold text-slate-800">{p.predicted_value}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{p.summary}</p>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                  <span>Target Date: {p.target_date}</span>
                  <span className="font-bold text-blood-700">Confidence: {p.confidence_score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Unit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingUnit ? 'Edit Blood Stock Unit' : 'Add New Blood Unit to Inventory'}
        subtitle={`Facility: ${currentBank.name}`}
      >
        <form onSubmit={handleSaveUnit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
              <select
                value={formBloodGroup}
                onChange={e => setFormBloodGroup(e.target.value as BloodGroup)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blood-500 focus:outline-none text-xs"
              >
                {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Component</label>
              <select
                value={formComponent}
                onChange={e => {
                  const comp = e.target.value as ComponentType;
                  setFormComponent(comp);
                  setFormExpiryDate(calculateDefaultExpiry(comp, formCollectionDate));
                }}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blood-500 focus:outline-none text-xs"
              >
                <option value="Platelets">Platelets (5 Days)</option>
                <option value="Whole Blood">Whole Blood (35 Days)</option>
                <option value="RBC">RBC (42 Days)</option>
                <option value="Plasma">Plasma (365 Days)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Volume (mL)</label>
              <input
                type="number"
                value={formVolume}
                onChange={e => setFormVolume(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blood-500 focus:outline-none text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Barcode / Bag ID</label>
              <input
                type="text"
                value={formBarcode}
                onChange={e => setFormBarcode(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blood-500 focus:outline-none text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Collection Date</label>
              <input
                type="date"
                value={formCollectionDate}
                onChange={e => {
                  setFormCollectionDate(e.target.value);
                  setFormExpiryDate(calculateDefaultExpiry(formComponent, e.target.value));
                }}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blood-500 focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Expiry Date</label>
              <input
                type="date"
                value={formExpiryDate}
                onChange={e => setFormExpiryDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blood-500 focus:outline-none text-xs font-semibold text-blood-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Status</label>
            <select
              value={formStatus}
              onChange={e => setFormStatus(e.target.value as UnitStatus)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blood-500 focus:outline-none text-xs"
            >
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="Transferred">Transferred</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {formError}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blood-600 hover:bg-blood-500 text-white font-bold rounded-xl shadow-md transition-all"
            >
              {editingUnit ? 'Update Unit' : 'Save Unit to Stock'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Human-in-the-Loop Review Modal */}
      <Modal
        isOpen={!!selectedSuggestion && !!reviewAction}
        onClose={() => {
          setSelectedSuggestion(null);
          setReviewAction(null);
        }}
        title={`${reviewAction} Redistribution Suggestion`}
        subtitle={`Facility Decision: ${currentBank.name}`}
      >
        {selectedSuggestion && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Blood Group & Component:</span>
                <div className="flex items-center gap-1.5">
                  <StatusBadge type="blood" value={selectedSuggestion.blood_group} />
                  <StatusBadge type="component" value={selectedSuggestion.component_type} />
                  <span className="font-bold">×{selectedSuggestion.quantity}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-slate-500 font-semibold">AI Recommended Reason:</span>
                <p className="mt-0.5 text-slate-700">{selectedSuggestion.reason}</p>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Officer Notes / Feedback:</label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
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
                  reviewAction === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
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

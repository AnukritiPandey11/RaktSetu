import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  PlusCircle,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Send,
  Building2,
  Boxes,
  ShieldCheck,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  dbRequests,
  dbHospitals,
  dbBloodBanks,
  dbBloodUnits,
  dbNotifications,
  dbPredictions
} from '../../services/db';
import { runAIAnalysis } from '../../services/ai/aiEngine';
import { calculateHaversineDistanceKm } from '../../services/ai/redistributionEngine';
import { useAuth } from '../../services/authContext';
import {
  BloodRequest,
  BloodGroup,
  ComponentType,
  UrgencyLevel
} from '../../types';

interface HospitalDashboardProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({ activeTab, onNavigateTab }) => {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  // Form State
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [componentType, setFormComponentType] = useState<ComponentType>('Whole Blood');
  const [quantity, setQuantity] = useState<number>(2);
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>('Critical');
  const [patientCase, setPatientCase] = useState<string>('Emergency Trauma Surgery - ICU Bed #2');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const currentHospId = user?.entity_id || 'hosp-1';
  const allHospitals = dbHospitals.getAll();
  const currentHospital = dbHospitals.getById(currentHospId) || allHospitals[0];
  const allBanks = dbBloodBanks.getAll();
  const allUnits = dbBloodUnits.getAll();

  useEffect(() => {
    runAIAnalysis();
  }, []);

  const myRequests = dbRequests.getByHospitalId(currentHospital.id);
  const pendingRequests = myRequests.filter(r => r.status === 'Pending' || r.status === 'In Transit');
  const fulfilledRequests = myRequests.filter(r => r.status === 'Fulfilled' || r.status === 'Approved');

  // Approximate reference coordinates for hospital centers
  const hospitalCoords: Record<string, { lat: number; lon: number }> = {
    'hosp-1': { lat: 28.5685, lon: 77.2075 }, // Safdarjung Hospital Delhi
    'hosp-2': { lat: 19.0022, lon: 72.8423 }, // KEM Hospital Mumbai
    'hosp-3': { lat: 12.9592, lon: 77.6534 }, // Manipal Bengaluru
    'hosp-4': { lat: 13.0067, lon: 80.2570 }  // Fortis Malar Chennai
  };

  const myCoords = hospitalCoords[currentHospital.id] || { lat: 28.5685, lon: 77.2075 };

  // Calculate live dynamic availability for the requested blood group
  const nearbyPredictions = allBanks.map(bank => {
    const matchingUnits = allUnits.filter(
      u => u.blood_bank_id === bank.id && u.blood_group === bloodGroup && u.status === 'Available'
    );
    const distanceKm = calculateHaversineDistanceKm(
      myCoords.lat,
      myCoords.lon,
      bank.latitude,
      bank.longitude
    );

    // Transit time estimation (~35 km/h urban emergency transit)
    const estimatedTimeMins = Math.max(5, Math.round(distanceKm * 2.2));

    let transitReadiness = 'Standby Hub';
    let confidence = 82;

    if (matchingUnits.length >= quantity) {
      transitReadiness = distanceKm <= 5 ? 'Immediate Dispatch Ready (Priority Corridor)' : 'Cold-Chain Express Available';
      confidence = 94;
    } else if (matchingUnits.length > 0) {
      transitReadiness = 'Partial Stock Available';
      confidence = 88;
    } else {
      transitReadiness = 'Zero Matching Reserves';
      confidence = 96;
    }

    return {
      bankId: bank.id,
      name: bank.name,
      city: bank.city,
      distanceKm,
      estimatedTimeMins,
      matchingUnitsAvailable: matchingUnits.length,
      transitReadiness,
      confidence
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const qty = Number(quantity);
    if (isNaN(qty) || qty < 1 || qty > 50) {
      setFormError('Please enter a valid unit quantity between 1 and 50 units.');
      return;
    }

    if (!patientCase || patientCase.trim().length < 3) {
      setFormError('Please provide clinical / patient remarks for triage verification.');
      return;
    }

    const newReq: BloodRequest = {
      id: `req-${Date.now()}`,
      hospital_id: currentHospital.id,
      blood_group: bloodGroup,
      component_type: componentType,
      quantity: qty,
      urgency_level: urgencyLevel,
      status: 'Pending',
      patient_case: patientCase.trim(),
      created_at: new Date().toISOString()
    };

    dbRequests.add(newReq);

    // Re-run AI analysis immediately to update shortage forecasts and trigger smart redistribution
    runAIAnalysis();

    // Broadcast in-app notification
    dbNotifications.add({
      id: `notif-${Date.now()}`,
      target_role: 'all',
      title: `${urgencyLevel} Request: ${quantity} units ${bloodGroup} (${componentType})`,
      message: `${currentHospital.name} raised emergency requisition for ${quantity}x ${bloodGroup}. AI shortage models updated.`,
      type: urgencyLevel === 'Critical' ? 'alert' : 'warning',
      timestamp: new Date().toISOString(),
      read: false,
      link_tab: 'requests'
    });

    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="space-y-6" key={refreshKey}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/30 text-xs text-sky-300 font-semibold mb-2">
              <HeartPulse className="w-3.5 h-3.5" /> Emergency Transfusion Department
            </div>
            <h1 className="text-2xl font-black tracking-tight">{currentHospital.name}</h1>
            <p className="text-xs text-slate-300 mt-1">
              Category: {currentHospital.emergency_level} • Location: {currentHospital.location}, {currentHospital.city}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('request-form')}
              className="px-4 py-2 bg-blood-600 hover:bg-blood-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blood-600/30 transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Request Blood Now
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Requisitions"
          value={pendingRequests.length}
          subtitle="Priority queue active"
          icon={Clock}
          color="amber"
          onClick={() => onNavigateTab('request-history')}
        />
        <StatCard
          title="Fulfilled Transfusions"
          value={fulfilledRequests.length}
          subtitle="Delivered & transfused"
          icon={CheckCircle2}
          color="emerald"
          onClick={() => onNavigateTab('request-history')}
        />
        <StatCard
          title="Nearby Linked Banks"
          value={allBanks.length}
          subtitle="Monitored by Haversine engine"
          icon={Building2}
          color="blue"
          onClick={() => onNavigateTab('predicted-availability')}
        />
        <StatCard
          title="Trauma Priority Level"
          value="Level 1"
          subtitle="Instant dispatch clearance"
          icon={ShieldCheck}
          color="indigo"
        />
      </div>

      {/* Success Notification */}
      {showSuccessToast && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-bold text-slate-900">Emergency Requisition Submitted to National Grid!</p>
              <p className="text-slate-600 mt-0.5">
                AI Shortage & Smart Redistribution engine has processed this requisition and notified regional blood centres.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSuccessToast(false)}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Overview & Request Form Tab */}
      {(activeTab === 'overview' || activeTab === 'request-form') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Blood Request Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-blood-600" /> Submit Emergency Blood Requisition
              </h2>
              <p className="text-xs text-slate-500">
                Directly transmits requirement to regional blood banks with AI-assisted shortage escalation
              </p>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Required Blood Group</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map(bg => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setBloodGroup(bg)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        bloodGroup === bg
                          ? 'bg-blood-600 text-white border-blood-500 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Component Type</label>
                  <select
                    value={componentType}
                    onChange={e => setFormComponentType(e.target.value as ComponentType)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blood-500 focus:outline-none"
                  >
                    <option value="Whole Blood">Whole Blood</option>
                    <option value="Platelets">Platelets</option>
                    <option value="RBC">RBC (Packed Red Cells)</option>
                    <option value="Plasma">Fresh Frozen Plasma</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Units Required (Quantity)</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blood-500 focus:outline-none font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Urgency Level</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Low', 'Medium', 'High', 'Critical'] as UrgencyLevel[]).map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setUrgencyLevel(lvl)}
                      className={`py-2 px-3 rounded-xl border font-bold text-center transition-all ${
                        urgencyLevel === lvl
                          ? lvl === 'Critical'
                            ? 'bg-rose-600 text-white border-rose-500 shadow-sm animate-pulse'
                            : lvl === 'High'
                            ? 'bg-orange-500 text-white border-orange-400 shadow-sm'
                            : lvl === 'Medium'
                            ? 'bg-amber-500 text-white border-amber-400 shadow-sm'
                            : 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient / Clinical Case Remarks</label>
                <input
                  type="text"
                  value={patientCase}
                  onChange={e => setPatientCase(e.target.value)}
                  placeholder="e.g. ICU Bed #4 Emergency Trauma or Cardiac Bypass"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blood-500 focus:outline-none"
                />
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-blood-600 hover:bg-blood-500 text-white font-bold rounded-xl shadow-md shadow-blood-600/30 flex items-center justify-center gap-2 transition-all text-sm"
                >
                  <Send className="w-4 h-4" /> Broadcast Blood Requisition to Grid
                </button>
              </div>
            </form>
          </div>

          {/* Predicted Availability Section (5 cols) - Powered by Live AI Engine & Haversine Distance */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-sky-600" /> Predicted Availability
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  Haversine AI Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Nearby blood centers ranked by distance and matching {bloodGroup} stock
              </p>
            </div>

            <div className="space-y-3">
              {nearbyPredictions.map(item => (
                <div
                  key={item.bankId}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{item.distanceKm} km away ({item.city})</span> • <span>~{item.estimatedTimeMins} mins ETA</span>
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        item.matchingUnitsAvailable >= quantity
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.matchingUnitsAvailable > 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {item.matchingUnitsAvailable} {bloodGroup} Available
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-semibold text-slate-700">{item.transitReadiness}</span>
                    <span className="font-bold text-sky-700">AI Confidence: {item.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-100 text-[11px] text-sky-800 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <p>
                Distances calculated using real-world Haversine geographic geodesics. High shortage triggers automatic redistribution suggestions across centers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Request History Section */}
      {(activeTab === 'overview' || activeTab === 'request-history') && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Hospital Request History</h2>
              <p className="text-xs text-slate-500">Log of all emergency and elective blood requisitions</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {myRequests.length} Total Logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Req ID</th>
                  <th className="py-2.5 px-3">Blood Group / Component</th>
                  <th className="py-2.5 px-3">Quantity</th>
                  <th className="py-2.5 px-3">Urgency</th>
                  <th className="py-2.5 px-3">Patient Case / Ward</th>
                  <th className="py-2.5 px-3">Date Requested</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-700">{req.id}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge type="blood" value={req.blood_group} />
                        <StatusBadge type="component" value={req.component_type} />
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">{req.quantity} units</td>
                    <td className="py-3 px-3">
                      <StatusBadge type="urgency" value={req.urgency_level} />
                    </td>
                    <td className="py-3 px-3 max-w-xs text-slate-600 truncate">{req.patient_case || 'N/A'}</td>
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(req.created_at).toLocaleDateString()} {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge value={req.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Predicted Availability dedicated */}
      {activeTab === 'predicted-availability' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Predicted Regional Availability (Live AI Engine)</h2>
            <p className="text-xs text-slate-500">Estimated stock reserves and transit ETA from surrounding blood banks</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allBanks.map(b => {
              const bankUnits = allUnits.filter(u => u.blood_bank_id === b.id && u.status === 'Available');
              const dist = calculateHaversineDistanceKm(myCoords.lat, myCoords.lon, b.latitude, b.longitude);
              return (
                <div key={b.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-bold text-slate-900">{b.name}</h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                      {dist} km
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {b.city}, {b.state}
                  </p>
                  <p className="text-xs text-slate-600 font-medium">Contact: {b.contact}</p>

                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-xs font-bold text-slate-700">Available Stock:</span>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map(bg => {
                        const count = bankUnits.filter(u => u.blood_group === bg).length;
                        return (
                          <span
                            key={bg}
                            className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                              count > 0 ? 'bg-white text-blood-700 border-blood-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                            }`}
                          >
                            {bg}: {count}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

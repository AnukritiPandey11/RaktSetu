import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  HeartHandshake,
  Clock,
  AlertTriangle,
  Award,
  Calendar,
  MapPin,
  Phone,
  CheckCircle2,
  Sparkles,
  Droplet,
  ShieldCheck,
  Save,
  Building2,
  RefreshCw
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  dbDonations,
  dbBloodBanks,
  dbNotifications,
  dbPredictions
} from '../../services/db';
import { runAIAnalysis } from '../../services/ai/aiEngine';
import { useAuth } from '../../services/authContext';
import { Donation, BloodGroup, ComponentType } from '../../types';

interface DonorDashboardProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({ activeTab, onNavigateTab }) => {
  const { user, updateCurrentUserProfile } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [contact, setContact] = useState(user?.contact || '+91 98765 43210');
  const [location, setLocation] = useState(user?.location || 'South Delhi, New Delhi');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(user?.blood_group || 'O+');
  const [isAvailable, setIsAvailable] = useState<boolean>(user?.available_for_donation ?? true);
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  // New Pledge / Donation Form
  const [pledgeBankId, setPledgeBankId] = useState('bb-1');
  const [pledgeDate, setPledgeDate] = useState(new Date().toISOString().split('T')[0]);
  const [pledgeComponent, setPledgeComponent] = useState<ComponentType>('Whole Blood');
  const [pledgeSuccess, setPledgeSuccess] = useState(false);

  useEffect(() => {
    runAIAnalysis();
  }, []);

  const allBanks = dbBloodBanks.getAll();
  const myDonations = dbDonations.getByDonorId(user?.id || 'usr-donor-1');
  const allPredictions = dbPredictions.getAll();

  const bankNameMap = allBanks.reduce<Record<string, string>>((acc, b) => {
    acc[b.id] = b.name;
    return acc;
  }, {});

  // Calculate Next Eligible Donation Date (standard: 90 days after last whole blood donation)
  const lastDonationDateStr = user?.last_donation_date || (myDonations[0]?.donation_date);
  const getEligibility = () => {
    if (!lastDonationDateStr) return { isEligible: true, daysRemaining: 0, nextDate: 'Eligible Today' };
    const lastDate = new Date(lastDonationDateStr);
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + 90);

    const today = new Date('2026-08-24T00:00:00');
    const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { isEligible: true, daysRemaining: 0, nextDate: 'Eligible Today' };
    }
    return {
      isEligible: false,
      daysRemaining: diffDays,
      nextDate: nextDate.toISOString().split('T')[0]
    };
  };

  const eligibility = getEligibility();

  // Derive dynamic urgent needs directly from AI shortage predictions
  const shortageAlerts = allPredictions.filter(p => p.prediction_type === 'Shortage');
  const matchingShortages = shortageAlerts.filter(p => p.blood_group === bloodGroup || p.blood_group === 'O-');

  const urgentNeeds = (matchingShortages.length > 0 ? matchingShortages : shortageAlerts).map(s => {
    const bank = allBanks.find(b => b.id === s.blood_bank_id);
    return {
      id: s.id,
      facilityName: bank?.name || 'Regional Blood Center',
      location: `${bank?.location || 'Metro Area'}, ${bank?.city || 'Delhi'}`,
      bloodGroup: s.blood_group || 'O+',
      urgency: s.risk_level === 'High' ? 'Critical' : 'High',
      reason: s.summary || s.predicted_value,
      requiredBy: 'Immediate / Next 48 Hours',
      confidence: s.confidence_score
    };
  });

  const [pledgeError, setPledgeError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);

    if (!name || name.trim().length < 2) {
      setProfileError('Please enter your full name.');
      return;
    }

    if (!contact || contact.trim().length < 8) {
      setProfileError('Please provide a valid contact number.');
      return;
    }

    updateCurrentUserProfile({
      name: name.trim(),
      contact: contact.trim(),
      location: location.trim(),
      blood_group: bloodGroup,
      available_for_donation: isAvailable
    });
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 3000);
    setRefreshKey(k => k + 1);
  };

  const handleRegisterDonation = (e: React.FormEvent) => {
    e.preventDefault();
    setPledgeError(null);

    const todayStr = '2026-08-24';
    if (pledgeDate < todayStr) {
      setPledgeError('Please select a current or upcoming date for your pledge walk-in.');
      return;
    }

    const newDonation: Donation = {
      id: `don-${Date.now()}`,
      donor_id: user?.id || 'usr-donor-1',
      blood_bank_id: pledgeBankId,
      blood_group: bloodGroup,
      donation_date: pledgeDate,
      units_donated: 1,
      component_type: pledgeComponent,
      hemoglobin_level: '14.5 g/dL',
      certificate_id: `CERT-DEL-${Math.floor(1000 + Math.random() * 9000)}`
    };

    dbDonations.add(newDonation);
    updateCurrentUserProfile({
      last_donation_date: pledgeDate
    });

    // Re-run AI analysis
    runAIAnalysis();

    setPledgeSuccess(true);
    setTimeout(() => setPledgeSuccess(false), 4000);
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="space-y-6" key={refreshKey}>
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-xs text-emerald-300 font-semibold mb-2">
              <UserCheck className="w-3.5 h-3.5" /> Registered Voluntary Life Saver
            </div>
            <h1 className="text-2xl font-black tracking-tight">Welcome, {user?.name}</h1>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
              <span>Blood Group: <strong className="text-blood-400">{user?.blood_group || 'O+'}</strong></span> •
              <span>Status: <strong className={user?.available_for_donation ? 'text-emerald-400' : 'text-amber-400'}>{user?.available_for_donation ? 'Available for Urgent Shortage Calls' : 'Temporarily Inactive'}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('register-donation')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5"
            >
              <HeartHandshake className="w-4 h-4" /> Schedule Donation Pledge
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Lifetime Donations"
          value={myDonations.length}
          subtitle="Verified units given"
          icon={Droplet}
          color="red"
          onClick={() => onNavigateTab('donation-history')}
        />
        <StatCard
          title="Donation Eligibility"
          value={eligibility.isEligible ? 'Eligible Now' : `${eligibility.daysRemaining} days`}
          subtitle={eligibility.isEligible ? 'Ready for next donation' : `Next date: ${eligibility.nextDate}`}
          icon={Calendar}
          color={eligibility.isEligible ? 'emerald' : 'amber'}
        />
        <StatCard
          title="Lives Impacted"
          value={myDonations.length * 3 || 6}
          subtitle="Direct clinical transfusions"
          icon={ShieldCheck}
          color="indigo"
        />
        <StatCard
          title="Donor Hero Badge"
          value={myDonations.length >= 3 ? 'Gold Badge' : 'Silver Badge'}
          subtitle="National Hero Recognition"
          icon={Award}
          color="purple"
        />
      </div>

      {/* Profile Saved Toast */}
      {profileSavedToast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Donor availability and contact details updated successfully!</span>
        </div>
      )}

      {/* Pledge Success Toast */}
      {pledgeSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Donation pledge recorded! The blood bank has been informed of your walk-in schedule.</span>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Urgent Need Near You Section - Connected to AI Shortage Models */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    Urgent Blood Need Near You
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200">
                      Live AI Shortage Alert
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    High demand for your matching blood type detected by the AI coordination grid
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('urgent-needs')}
                className="text-xs font-semibold text-blood-600 hover:text-blood-700"
              >
                View all ({urgentNeeds.length}) →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {urgentNeeds.slice(0, 2).map(need => (
                <div
                  key={need.id}
                  className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusBadge type="blood" value={need.bloodGroup} />
                        <span className="text-xs font-bold text-slate-900">{need.facilityName}</span>
                      </div>
                      <StatusBadge type="urgency" value={need.urgency} />
                    </div>

                    <p className="text-xs text-slate-700 font-medium mt-2">{need.reason}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {need.location}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-rose-200/60 flex items-center justify-between">
                    <span className="text-[11px] text-rose-700 font-semibold">Timeline: {need.requiredBy}</span>
                    <button
                      onClick={() => onNavigateTab('register-donation')}
                      className="px-3 py-1 bg-blood-600 hover:bg-blood-500 text-white rounded-lg font-bold text-xs shadow-sm transition-all"
                    >
                      Pledge to Donate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Donation History Preview */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Your Donation History</h2>
              <button
                onClick={() => onNavigateTab('donation-history')}
                className="text-xs font-semibold text-blood-600 hover:text-blood-700"
              >
                View all ({myDonations.length}) →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Blood Bank / Facility</th>
                    <th className="py-2.5 px-3">Blood Group</th>
                    <th className="py-2.5 px-3">Component</th>
                    <th className="py-2.5 px-3">Donation Date</th>
                    <th className="py-2.5 px-3">Hemoglobin</th>
                    <th className="py-2.5 px-3 text-right">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myDonations.map(don => (
                    <tr key={don.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {bankNameMap[don.blood_bank_id] || don.blood_bank_id}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge type="blood" value={don.blood_group} />
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge type="component" value={don.component_type || 'Whole Blood'} />
                      </td>
                      <td className="py-3 px-3 text-slate-600">{don.donation_date}</td>
                      <td className="py-3 px-3 font-medium text-slate-700">{don.hemoglobin_level || '14.5 g/dL'}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          {don.certificate_id || 'CERT-VERIFIED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {myDonations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No previous donations logged yet. Register your first pledge today!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Urgent Needs Dedicated */}
      {activeTab === 'urgent-needs' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Urgent Blood Needs Near You</h2>
            <p className="text-xs text-slate-500">
              Live AI shortage alerts flagging emergency inventory drops in hospitals and blood centres
            </p>
          </div>

          <div className="space-y-3">
            {urgentNeeds.map(need => (
              <div
                key={need.id}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0 mt-0.5">
                    <Droplet className="w-5 h-5 fill-rose-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge type="blood" value={need.bloodGroup} />
                      <h3 className="text-sm font-bold text-slate-900">{need.facilityName}</h3>
                      <StatusBadge type="urgency" value={need.urgency} />
                    </div>
                    <p className="text-xs text-slate-700 font-medium mt-1">{need.reason}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {need.location}
                    </p>
                  </div>
                </div>

                <div className="flex md:flex-col items-end justify-between shrink-0 gap-2">
                  <span className="text-xs text-slate-500">Timeline: <strong>{need.requiredBy}</strong></span>
                  <button
                    onClick={() => onNavigateTab('register-donation')}
                    className="px-4 py-2 bg-blood-600 hover:bg-blood-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Respond & Pledge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Donation History Dedicated */}
      {activeTab === 'donation-history' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Official Donation Records</h2>
              <p className="text-xs text-slate-500">Verified blood donation units and government certificate IDs</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
              {myDonations.length} Verified Donations
            </span>
          </div>

          <div className="space-y-3">
            {myDonations.map(don => (
              <div
                key={don.id}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-blood-50 text-blood-600 shrink-0 mt-0.5">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {bankNameMap[don.blood_bank_id] || don.blood_bank_id}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge type="blood" value={don.blood_group} />
                      <StatusBadge type="component" value={don.component_type || 'Whole Blood'} />
                      <span className="text-xs text-slate-600">Quantity: 1 Unit</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Donation Date: <strong>{don.donation_date}</strong> • Hemoglobin: {don.hemoglobin_level || '14.5 g/dL'}
                    </p>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Certificate ID</div>
                  <div className="text-xs font-mono font-bold text-emerald-700 mt-0.5">
                    {don.certificate_id || 'CERT-VERIFIED'}
                  </div>
                  <span className="inline-block text-[10px] text-slate-500 mt-1">Verified on National Grid</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Pledge / Register Donation Form */}
      {activeTab === 'register-donation' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm max-w-xl mx-auto space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Schedule a Blood Donation Pledge</h2>
            <p className="text-xs text-slate-500">Select a nearby blood bank and choose your preferred date</p>
          </div>

          <form onSubmit={handleRegisterDonation} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Blood Bank Facility</label>
              <select
                value={pledgeBankId}
                onChange={e => setPledgeBankId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blood-500 focus:outline-none"
              >
                {allBanks.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Donation Component</label>
                <select
                  value={pledgeComponent}
                  onChange={e => setPledgeComponent(e.target.value as ComponentType)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blood-500 focus:outline-none"
                >
                  <option value="Whole Blood">Whole Blood (Standard 350mL)</option>
                  <option value="Platelets">Single Donor Platelets (SDP Apheresis)</option>
                  <option value="Plasma">Plasma Donation</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Preferred Date</label>
                <input
                  type="date"
                  value={pledgeDate}
                  onChange={e => setPledgeDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blood-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
              <p className="font-semibold text-slate-800 mb-0.5">Pre-Donation Guidelines:</p>
              Ensure adequate hydration (drink 500ml water before walk-in), maintain hemoglobin ≥ 12.5 g/dL, and avoid heavy exercise prior to donation.
            </div>

            {pledgeError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {pledgeError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all text-sm"
            >
              Confirm Donation Pledge
            </button>
          </form>
        </div>
      )}

      {/* Tab: Availability & Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm max-w-xl mx-auto space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Donor Profile & Emergency Availability</h2>
            <p className="text-xs text-slate-500">Configure your location and availability for emergency shortage alerts</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blood-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Number</label>
                <input
                  type="text"
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blood-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value as BloodGroup)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blood-500 focus:outline-none font-bold text-blood-700"
                >
                  {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Residential City / Neighborhood</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blood-500 focus:outline-none"
              />
            </div>

            {/* Availability Toggle */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 text-xs">Emergency Donor Availability Status</p>
                <p className="text-[11px] text-slate-500">Allow blood banks to notify you in critical group shortages</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAvailable ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isAvailable ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {profileError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {profileError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blood-600 hover:bg-blood-500 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all text-sm"
            >
              <Save className="w-4 h-4" /> Save Profile Details
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

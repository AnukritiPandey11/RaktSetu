import React from 'react';
import {
  Shield,
  Building2,
  HeartPulse,
  UserCheck,
  ArrowRight,
  TrendingDown,
  Clock,
  ArrowRightLeft,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ChevronRight,
  Activity,
  Layers,
  FileCheck2,
  Boxes,
  Lock,
  Compass
} from 'lucide-react';
import { UserRole } from '../types';

interface LandingPageProps {
  onOpenLogin: (preselectedRole?: UserRole) => void;
  onOpenSignup: () => void;
  onDirectRoleLogin: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onOpenSignup,
  onDirectRoleLogin
}) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#160D0D] text-[#F5F0E8] font-sans selection:bg-[#B5121B] selection:text-white antialiased">
      {/* ========================================================================= */}
      {/* 1. TOP INSTITUTIONAL NAVIGATION HEADER                                    */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-[#160D0D]/95 border-b border-[#3D1A1A] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand & Official Logo */}
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg overflow-hidden border border-[#5C1515] bg-[#4A0303] shadow-md shrink-0 flex items-center justify-center">
              <img
                src="/raktsetu-logo.jpeg"
                alt="RaktSetu Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-[#F5F0E8] uppercase">
                  RaktSetu
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-[#7A0505] text-[#F5F0E8] border border-[#B5121B]/40">
                  AI Grid
                </span>
              </div>
              <p className="text-[11px] text-[#A89088] font-medium tracking-wide hidden sm:block">
                National Blood Grid Coordination & Clinical Decision Layer
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => onOpenLogin()}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-[#D8C8B8] hover:text-white hover:bg-[#2A0C0C] rounded-lg transition-colors border border-transparent hover:border-[#4A1515]"
            >
              Sign In
            </button>
            <button
              onClick={onOpenSignup}
              className="px-5 py-2 text-xs sm:text-sm font-bold bg-[#B5121B] hover:bg-[#7A0505] text-[#F5F0E8] rounded-lg shadow-sm transition-all border border-[#B5121B] hover:border-[#D9252F] flex items-center gap-1.5"
            >
              <span>Register Facility</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION — DRAMATIC CRIMSON EDITORIAL HERO                          */}
      {/* ========================================================================= */}
      <section className="relative bg-gradient-to-b from-[#4A0303] via-[#360505] to-[#160D0D] pt-20 pb-28 sm:pt-28 sm:pb-36 overflow-hidden border-b border-[#3D1A1A]">
        {/* Subtle Vascular / Network Pathway SVG Background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Main converging vascular pathways */}
            <path d="M-100,100 C300,200 500,450 720,450 C940,450 1140,200 1540,100" stroke="#B5121B" strokeWidth="1.5" strokeDasharray="6 6" />
            <path d="M-100,800 C300,700 500,450 720,450 C940,450 1140,700 1540,800" stroke="#B5121B" strokeWidth="1.5" strokeDasharray="6 6" />
            <path d="M720,0 L720,900" stroke="#7A0505" strokeWidth="1" strokeDasharray="4 4" />
            <path d="M0,450 L1440,450" stroke="#7A0505" strokeWidth="1" strokeDasharray="4 4" />
            
            {/* Network Nodes */}
            <circle cx="720" cy="450" r="12" fill="#B5121B" fillOpacity="0.4" stroke="#F5F0E8" strokeWidth="2" />
            <circle cx="720" cy="450" r="4" fill="#F5F0E8" />
            <circle cx="350" cy="280" r="6" fill="#7A0505" stroke="#B5121B" strokeWidth="1.5" />
            <circle cx="1090" cy="280" r="6" fill="#7A0505" stroke="#B5121B" strokeWidth="1.5" />
            <circle cx="350" cy="620" r="6" fill="#7A0505" stroke="#B5121B" strokeWidth="1.5" />
            <circle cx="1090" cy="620" r="6" fill="#7A0505" stroke="#B5121B" strokeWidth="1.5" />

            {/* Connecting arcs */}
            <path d="M350,280 Q535,365 720,450" stroke="#D8C8B8" strokeWidth="1" strokeOpacity="0.3" />
            <path d="M1090,280 Q905,365 720,450" stroke="#D8C8B8" strokeWidth="1" strokeOpacity="0.3" />
            <path d="M350,620 Q535,535 720,450" stroke="#D8C8B8" strokeWidth="1" strokeOpacity="0.3" />
            <path d="M1090,620 Q905,535 720,450" stroke="#D8C8B8" strokeWidth="1" strokeOpacity="0.3" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Primary Editorial Headline */}
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-medium sm:font-semibold text-[#F5F0E8] tracking-tight leading-[1.08] max-w-4xl mx-auto">
            The Bridge Between<br />
            <span className="text-[#E5B5A5]">Blood & Need.</span>
          </h1>

          {/* Supporting Copy */}
          <p className="mt-8 text-base sm:text-lg text-[#D8C8B8] max-w-3xl mx-auto leading-relaxed font-normal">
            An intelligent coordination layer connecting India's blood banks, hospitals, and voluntary donors —
            preventing avoidable component expiry and responding decisively to critical regional shortages.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onDirectRoleLogin('admin')}
              className="w-full sm:w-auto px-8 py-4 bg-[#B5121B] hover:bg-[#7A0505] text-[#F5F0E8] font-bold rounded-lg shadow-lg shadow-[#4A0303]/50 transition-all border border-[#B5121B] hover:border-[#D9252F] flex items-center justify-center gap-3 text-sm uppercase tracking-wider"
            >
              <span>Explore RaktSetu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="w-full sm:w-auto px-8 py-4 bg-[#2A0808] hover:bg-[#3D1010] text-[#F5F0E8] font-semibold rounded-lg border border-[#5C1A1A] transition-all text-sm uppercase tracking-wider"
            >
              See How It Works
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION 2 — THE NETWORK: ONE NETWORK. FOUR CRITICAL ROLES.              */}
      {/* ========================================================================= */}
      <section id="roles-section" className="py-20 bg-[#4A0303] border-b border-[#5C1515] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#E5A090]">
              Coordinated Architecture
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#F5F0E8] tracking-tight uppercase mt-2 leading-tight">
              One Network.<br />Four Critical Roles.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#D8C8B8] leading-relaxed">
              Every participant operates through a specialized clinical console, unified by real-time inventory visibility and deterministic shortage intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Role 1: National Admin */}
            <div className="bg-[#2A0505] border border-[#5C1515] p-6 rounded-xl flex flex-col justify-between hover:border-[#B5121B] transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#4A0303] text-[#F5F0E8] border border-[#7A0505] flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#E5A090]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#160D0D] text-[#D8C8B8] border border-[#3D1515]">
                    National Grid
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#F5F0E8] uppercase tracking-wide">
                  Admin
                </h3>
                <p className="text-xs text-[#B89890] mt-1">Grid Oversight & Policy Enforcement</p>

                <p className="mt-4 text-xs text-[#D8C8B8] leading-relaxed">
                  Monitors state-level inventory health, reviews AI redistribution feasibility recommendations,
                  and executes human-authorized transfers with immutable audit logs.
                </p>
              </div>

              <button
                onClick={() => onDirectRoleLogin('admin')}
                className="mt-6 w-full py-2.5 px-4 rounded bg-[#3D0A0A] hover:bg-[#B5121B] text-[#F5F0E8] text-xs font-bold uppercase tracking-wider border border-[#5C1515] hover:border-[#B5121B] transition-all flex items-center justify-between"
              >
                <span>Enter Admin Console</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Role 2: Blood Bank */}
            <div className="bg-[#2A0505] border border-[#5C1515] p-6 rounded-xl flex flex-col justify-between hover:border-[#B5121B] transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#4A0303] text-[#F5F0E8] border border-[#7A0505] flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#E5A090]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#160D0D] text-[#D8C8B8] border border-[#3D1515]">
                    AIIMS Delhi Lab
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#F5F0E8] uppercase tracking-wide">
                  Blood Bank
                </h3>
                <p className="text-xs text-[#B89890] mt-1">Component Lab & Stock Custody</p>

                <p className="mt-4 text-xs text-[#D8C8B8] leading-relaxed">
                  Maintains live blood component stock, monitors 5-day platelet expiration velocity,
                  and dispatches surplus units to high-deficit hospital clusters.
                </p>
              </div>

              <button
                onClick={() => onDirectRoleLogin('blood_bank')}
                className="mt-6 w-full py-2.5 px-4 rounded bg-[#3D0A0A] hover:bg-[#B5121B] text-[#F5F0E8] text-xs font-bold uppercase tracking-wider border border-[#5C1515] hover:border-[#B5121B] transition-all flex items-center justify-between"
              >
                <span>Enter Blood Bank</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Role 3: Hospital */}
            <div className="bg-[#2A0505] border border-[#5C1515] p-6 rounded-xl flex flex-col justify-between hover:border-[#B5121B] transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#4A0303] text-[#F5F0E8] border border-[#7A0505] flex items-center justify-center">
                    <HeartPulse className="w-5 h-5 text-[#E5A090]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#160D0D] text-[#D8C8B8] border border-[#3D1515]">
                    Safdarjung Trauma
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#F5F0E8] uppercase tracking-wide">
                  Hospital
                </h3>
                <p className="text-xs text-[#B89890] mt-1">Clinical Transfusion Desk</p>

                <p className="mt-4 text-xs text-[#D8C8B8] leading-relaxed">
                  Submits priority emergency and scheduled patient requisitions, tracks nearby regional
                  availability via Haversine distances, and receives verified transfer dispatches.
                </p>
              </div>

              <button
                onClick={() => onDirectRoleLogin('hospital')}
                className="mt-6 w-full py-2.5 px-4 rounded bg-[#3D0A0A] hover:bg-[#B5121B] text-[#F5F0E8] text-xs font-bold uppercase tracking-wider border border-[#5C1515] hover:border-[#B5121B] transition-all flex items-center justify-between"
              >
                <span>Enter Hospital</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Role 4: Donor */}
            <div className="bg-[#2A0505] border border-[#5C1515] p-6 rounded-xl flex flex-col justify-between hover:border-[#B5121B] transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#4A0303] text-[#F5F0E8] border border-[#7A0505] flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-[#E5A090]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#160D0D] text-[#D8C8B8] border border-[#3D1515]">
                    Rahul Sharma (O+)
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#F5F0E8] uppercase tracking-wide">
                  Donor
                </h3>
                <p className="text-xs text-[#B89890] mt-1">Voluntary Citizen Network</p>

                <p className="mt-4 text-xs text-[#D8C8B8] leading-relaxed">
                  Receives urgent localized shortage alerts matching their blood group, schedules walk-in
                  donation appointments, and accesses verifiable donation records.
                </p>
              </div>

              <button
                onClick={() => onDirectRoleLogin('donor')}
                className="mt-6 w-full py-2.5 px-4 rounded bg-[#3D0A0A] hover:bg-[#B5121B] text-[#F5F0E8] text-xs font-bold uppercase tracking-wider border border-[#5C1515] hover:border-[#B5121B] transition-all flex items-center justify-between"
              >
                <span>Enter Donor Portal</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION 3 — THE PROBLEM: WHEN EVERY UNIT COUNTS (WARM LIGHT IVORY)      */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#F5F0E8] text-[#160D0D] border-b border-[#E5DDD0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#7A0505]">
              The Healthcare Challenge
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#160D0D] tracking-tight uppercase mt-2 leading-tight">
              When Every Unit Counts.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#523E3E] leading-relaxed">
              India collects millions of blood units annually, yet acute hospital shortages and preventable component expiry occur concurrently due to systemic fragmentation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Problem 1 */}
            <div className="bg-white p-7 rounded-xl border border-[#E0D5C5] shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#FAF0F0] text-[#7A0505] flex items-center justify-center mb-4 border border-[#F0D5D5]">
                <Clock className="w-5 h-5 text-[#B5121B]" />
              </div>
              <h3 className="font-bold text-[#160D0D] text-base uppercase tracking-wide">
                Fragile Shelf-Life Windows
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-[#523E3E] leading-relaxed">
                Platelets expire within only <strong>5 days</strong> of collection. Without predictive demand modeling, units sit idle in one facility while patients in neighboring hospitals face life-threatening delays.
              </p>
            </div>

            {/* Problem 2 */}
            <div className="bg-white p-7 rounded-xl border border-[#E0D5C5] shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#FAF0F0] text-[#7A0505] flex items-center justify-center mb-4 border border-[#F0D5D5]">
                <MapPin className="w-5 h-5 text-[#B5121B]" />
              </div>
              <h3 className="font-bold text-[#160D0D] text-base uppercase tracking-wide">
                Fragmented Geographic Silos
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-[#523E3E] leading-relaxed">
                Over <strong>4,200 licensed blood centres</strong> operate in isolation. Facilities lack real-time inter-hospital requisition channels, leading to ad-hoc phone calls during critical trauma emergencies.
              </p>
            </div>

            {/* Problem 3 */}
            <div className="bg-white p-7 rounded-xl border border-[#E0D5C5] shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#FAF0F0] text-[#7A0505] flex items-center justify-center mb-4 border border-[#F0D5D5]">
                <AlertTriangle className="w-5 h-5 text-[#B5121B]" />
              </div>
              <h3 className="font-bold text-[#160D0D] text-base uppercase tracking-wide">
                Delayed Redistribution Decisions
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-[#523E3E] leading-relaxed">
                Manual inter-centre transfers risk transporting units with insufficient remaining viability. RaktSetu introduces <strong>strict geodesic feasibility gating</strong> to guarantee units arrive safely with usable clinical life.
              </p>
            </div>
          </div>

          {/* Statistical Anchor Bar */}
          <div className="mt-12 p-8 rounded-2xl bg-[#ECE4D8] border border-[#DDD3C3] grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-[#7A0505]">4,200+</div>
              <div className="text-xs font-bold text-[#160D0D] mt-1 uppercase tracking-wide">Licensed Blood Banks</div>
              <div className="text-[11px] text-[#6E5A5A] mt-0.5">National Grid Target</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-[#B5121B]">~6.5 Lakh</div>
              <div className="text-xs font-bold text-[#160D0D] mt-1 uppercase tracking-wide">Units Expired Annually</div>
              <div className="text-[11px] text-[#6E5A5A] mt-0.5">National Wastage Baseline</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-[#7A0505]">84%</div>
              <div className="text-xs font-bold text-[#160D0D] mt-1 uppercase tracking-wide">Wastage Reduction</div>
              <div className="text-[11px] text-[#6E5A5A] mt-0.5">Targeted via Predictive AI</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-[#160D0D]">100%</div>
              <div className="text-xs font-bold text-[#160D0D] mt-1 uppercase tracking-wide">Human Authority</div>
              <div className="text-[11px] text-[#6E5A5A] mt-0.5">Immutable Audit Trails</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SECTION 4 — HOW RAKTSETU WORKS: THE COORDINATION PROTOCOL               */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 bg-[#360505] border-b border-[#4A1010] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#E5A090]">
              Operational Lifecycle
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#F5F0E8] tracking-tight uppercase mt-2 leading-tight">
              How RaktSetu Works.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#D8C8B8] leading-relaxed">
              An end-to-end clinical workflow where artificial intelligence anticipates risk, but licensed healthcare personnel make the final decision.
            </p>
          </div>

          {/* Sequential Coordination Flow */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 text-center">
            {/* Step 1 */}
            <div className="bg-[#220404] p-5 rounded-xl border border-[#4A1010] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#E5A090] uppercase tracking-widest block mb-2">
                  01. INGESTION
                </span>
                <h4 className="text-xs font-bold text-[#F5F0E8] uppercase">Blood Availability</h4>
                <p className="text-[11px] text-[#B89890] mt-2 leading-relaxed">
                  Real-time stock ingestion across regional component labs (A+, O-, Platelets, RBC).
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#220404] p-5 rounded-xl border border-[#4A1010] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#E5A090] uppercase tracking-widest block mb-2">
                  02. FORECAST
                </span>
                <h4 className="text-xs font-bold text-[#F5F0E8] uppercase">AI Prediction</h4>
                <p className="text-[11px] text-[#B89890] mt-2 leading-relaxed">
                  7-day consumption curves projected from trauma cases and elective schedules.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#220404] p-5 rounded-xl border border-[#4A1010] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#E5A090] uppercase tracking-widest block mb-2">
                  03. DETECTION
                </span>
                <h4 className="text-xs font-bold text-[#F5F0E8] uppercase">Risk Detection</h4>
                <p className="text-[11px] text-[#B89890] mt-2 leading-relaxed">
                  Immediate alerts for impending stockouts or units nearing 5-day expiration.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-[#220404] p-5 rounded-xl border border-[#4A1010] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#E5A090] uppercase tracking-widest block mb-2">
                  04. ROUTING
                </span>
                <h4 className="text-xs font-bold text-[#F5F0E8] uppercase">Redistribution</h4>
                <p className="text-[11px] text-[#B89890] mt-2 leading-relaxed">
                  Haversine route calculated with strict shelf-life and distance feasibility gating.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-[#4A0303] p-5 rounded-xl border border-[#B5121B] flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#F5F0E8] uppercase tracking-widest block mb-2">
                  05. AUTHORITY
                </span>
                <h4 className="text-xs font-bold text-[#F5F0E8] uppercase">Human Approval</h4>
                <p className="text-[11px] text-[#F5E0D5] mt-2 leading-relaxed font-semibold">
                  Authorized Medical Officer reviews clinical parameters and confirms transfer.
                </p>
              </div>
            </div>

            {/* Step 6 */}
            <div className="bg-[#220404] p-5 rounded-xl border border-[#4A1010] flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#E5A090] uppercase tracking-widest block mb-2">
                  06. VERIFICATION
                </span>
                <h4 className="text-xs font-bold text-[#F5F0E8] uppercase">Audit Trail</h4>
                <p className="text-[11px] text-[#B89890] mt-2 leading-relaxed">
                  Transfer locked, batch quantities updated, and immutable audit log committed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SECTION 5 — PRODUCT PREVIEW: CLINICAL INTELLIGENCE IN ACTION            */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#160D0D] border-b border-[#3D1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#E5A090]">
              Operational Modules
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#F5F0E8] tracking-tight uppercase mt-2 leading-tight">
              Clinical Intelligence in Action.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#D8C8B8] leading-relaxed">
              Explore the core engines powering RaktSetu's clinical decision support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Module 1 */}
            <div className="bg-[#240606] border border-[#4A1010] p-6 rounded-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#3D1010] mb-4">
                <span className="text-xs font-bold text-[#F5F0E8] uppercase">Demand & Shortage Alerts</span>
                <Activity className="w-4 h-4 text-[#B5121B]" />
              </div>
              <p className="text-xs text-[#D8C8B8] leading-relaxed">
                Identifies groups dropping below safe thresholds (e.g. <strong>Safdarjung ICU: 2 units remaining</strong>, shortage score 0.85/1.0).
              </p>
              <div className="mt-4 p-3 rounded bg-[#160D0D] border border-[#380A0A] text-[11px] text-[#B89890]">
                <span className="text-[#E5A090] font-bold">Preview:</span> 7-Day Demand Forecast by blood group with seasonal trauma weighting.
              </div>
            </div>

            {/* Module 2 */}
            <div className="bg-[#240606] border border-[#4A1010] p-6 rounded-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#3D1010] mb-4">
                <span className="text-xs font-bold text-[#F5F0E8] uppercase">Smart Redistribution Engine</span>
                <ArrowRightLeft className="w-4 h-4 text-[#E5A090]" />
              </div>
              <p className="text-xs text-[#D8C8B8] leading-relaxed">
                Haversine geodesic matching: <strong>AIIMS Delhi Lab (14 units surplus)</strong> paired with <strong>Safdarjung (0.8 km, 15m transit)</strong>.
              </p>
              <div className="mt-4 p-3 rounded bg-[#160D0D] border border-[#380A0A] text-[11px] text-[#B89890]">
                <span className="text-[#E5A090] font-bold">Safety Gate:</span> Transport time plus safety buffer strictly enforced.
              </div>
            </div>

            {/* Module 3 */}
            <div className="bg-[#240606] border border-[#4A1010] p-6 rounded-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#3D1010] mb-4">
                <span className="text-xs font-bold text-[#F5F0E8] uppercase">Human-in-the-Loop Audit Log</span>
                <FileCheck2 className="w-4 h-4 text-[#B5121B]" />
              </div>
              <p className="text-xs text-[#D8C8B8] leading-relaxed">
                Immutable event records capture every officer decision, approval rationale, and component volume transferred.
              </p>
              <div className="mt-4 p-3 rounded bg-[#160D0D] border border-[#380A0A] text-[11px] text-[#B89890]">
                <span className="text-[#E5A090] font-bold">Compliance:</span> NBTC and CDSCO protocol ready.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. SECTION 6 — THE BRIDGE: BLOOD BANK → RAKTSETU → HOSPITAL               */}
      {/* ========================================================================= */}
      <section className="py-24 bg-gradient-to-b from-[#2A0505] to-[#160D0D] border-b border-[#3D1A1A] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#E5A090]">
              The Core Architecture
            </span>
            <h2 className="text-3xl sm:text-6xl font-black text-[#F5F0E8] tracking-tight uppercase mt-2">
              The Bridge.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#D8C8B8] leading-relaxed">
              RaktSetu does not replace clinical decision-makers. It bridges isolated data, predicts systemic risk,
              and ensures the right blood unit reaches the right patient at the right time.
            </p>
          </div>

          {/* Architectural Pathway Diagram */}
          <div className="max-w-4xl mx-auto bg-[#1A0505] p-8 sm:p-12 rounded-2xl border border-[#5C1515] shadow-2xl relative">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center text-center">
              {/* Point A */}
              <div className="p-6 rounded-xl bg-[#2A0505] border border-[#5C1515]">
                <Building2 className="w-8 h-8 text-[#E5A090] mx-auto mb-3" />
                <h4 className="font-extrabold text-[#F5F0E8] text-sm uppercase tracking-wider">Blood Bank</h4>
                <p className="text-[11px] text-[#A88880] mt-1">Surplus Inventory & Expiry Horizon</p>
                <div className="mt-3 text-[10px] font-mono text-[#D8C8B8] bg-[#160D0D] py-1 px-2 rounded border border-[#380A0A]">
                  AIIMS Central Lab (A+ Surplus)
                </div>
              </div>

              {/* Central Bridge */}
              <div className="p-6 rounded-xl bg-[#7A0505] border border-[#B5121B] shadow-xl relative">
                <div className="w-10 h-10 rounded-full bg-[#F5F0E8] text-[#7A0505] font-black flex items-center justify-center mx-auto mb-3 text-xs shadow-md">
                  SETU
                </div>
                <h4 className="font-extrabold text-[#F5F0E8] text-sm uppercase tracking-wider">RaktSetu AI</h4>
                <p className="text-[11px] text-[#F5E0D5] mt-1">Predictive Geodesic Routing</p>
                <div className="mt-3 text-[10px] font-mono text-[#F5F0E8] bg-[#4A0303] py-1 px-2 rounded border border-[#B5121B]">
                  0.8 km • 15m Transit • 48h Viability
                </div>
              </div>

              {/* Point B */}
              <div className="p-6 rounded-xl bg-[#2A0505] border border-[#5C1515]">
                <HeartPulse className="w-8 h-8 text-[#E5A090] mx-auto mb-3" />
                <h4 className="font-extrabold text-[#F5F0E8] text-sm uppercase tracking-wider">Hospital</h4>
                <p className="text-[11px] text-[#A88880] mt-1">Acute Requisition & Trauma Demand</p>
                <div className="mt-3 text-[10px] font-mono text-[#D8C8B8] bg-[#160D0D] py-1 px-2 rounded border border-[#380A0A]">
                  Safdarjung ICU (Urgent Need)
                </div>
              </div>
            </div>

            {/* Decision Parameters Bar */}
            <div className="mt-8 pt-6 border-t border-[#3D1010] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
              <div>
                <span className="text-[#A88880] block text-[10px] uppercase font-bold">Geodesic Distance</span>
                <span className="text-[#F5F0E8] font-bold">Haversine Calculated</span>
              </div>
              <div>
                <span className="text-[#A88880] block text-[10px] uppercase font-bold">Component Viability</span>
                <span className="text-[#F5F0E8] font-bold">Shelf-Life Enforced</span>
              </div>
              <div>
                <span className="text-[#A88880] block text-[10px] uppercase font-bold">Recommendation</span>
                <span className="text-[#F5F0E8] font-bold">Deterministic Scoring</span>
              </div>
              <div>
                <span className="text-[#A88880] block text-[10px] uppercase font-bold">Execution</span>
                <span className="text-[#E5A090] font-bold">100% Human Sign-off</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FINAL CTA — DRAMATIC MINIMAL STATEMENT                                  */}
      {/* ========================================================================= */}
      <section className="py-24 bg-[#160D0D] border-b border-[#3D1A1A] text-center relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-6xl font-black text-[#F5F0E8] tracking-tight uppercase leading-tight">
            Every unit has a window.<br />
            <span className="text-[#E5A090]">RaktSetu helps it reach where it matters.</span>
          </h2>

          <div className="mt-10">
            <button
              onClick={() => onOpenLogin()}
              className="px-10 py-5 bg-[#B5121B] hover:bg-[#7A0505] text-[#F5F0E8] font-black rounded-lg shadow-2xl shadow-[#4A0303] transition-all border border-[#B5121B] hover:border-[#D9252F] text-base uppercase tracking-widest inline-flex items-center gap-3"
            >
              <span>Enter RaktSetu</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. INSTITUTIONAL FOOTER & REGULATORY NOTE                                  */}
      {/* ========================================================================= */}
      <footer className="bg-[#0F0606] py-12 text-xs text-[#8A7068]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-6 border-b border-[#2A0C0C]">
            <div className="flex items-center gap-3 font-bold text-[#D8C8B8]">
              <Shield className="w-4 h-4 text-[#B5121B]" />
              <span className="uppercase tracking-wider">RaktSetu AI — National Blood Grid Protocol</span>
            </div>
            <span className="text-[#8A7068] font-medium tracking-wide">Smart India Hackathon 2026 Prototype</span>
          </div>

          <p className="leading-relaxed max-w-5xl text-[11px] text-[#7A6058]">
            <strong>Clinical & Regulatory Notice:</strong> RaktSetu AI operates strictly as an intelligent coordination and decision-support layer. It does not replace physical medical cross-matching, laboratory screening, or licensed transport custody. All redistribution recommendations require explicit validation and approval by certified blood bank medical officers in accordance with National Blood Transfusion Council (NBTC) and CDSCO guidelines.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#6A5048] pt-2">
            <p>© 2026 RaktSetu AI. Designed for India's Healthcare Transformation.</p>
            <p>Controlled demonstration dataset seeded for SIH evaluation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
